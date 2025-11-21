// server/models/Order.js
const db = require('../config/database');

class Order {
  // execute multi-statement queries (returns whatever db.query returns)
  static async query(sql, params = []) {
    const [rows] = await db.query(sql, params);
    return rows;
  }

  // execute single statement select/exec
  static async execute(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  static async getAll() {
    const sql = `
      SELECT 
        o.order_id,
        o.order_date AS date,
        COALESCE(o.total_amount, 0) AS total_amount,
        o.status,
        o.priority,
        o.payment_status,
        o.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        s.tracking_number
      FROM \`order\` o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      LEFT JOIN shipment s ON o.order_id = s.order_id
      ORDER BY o.order_date DESC
    `;
    return this.execute(sql);
  }

  static async getById(id) {
    const orderSql = `
      SELECT 
        o.order_id,
        o.order_date,
        COALESCE(o.total_amount, 0) AS total_amount,
        o.status,
        o.priority,
        o.payment_status,
        o.customer_id,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone_number AS customer_phone,
        c.address AS customer_address
      FROM \`order\` o
      JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.order_id = ?
    `;

    const orderLinesSql = `
      SELECT 
        ol.orderline_id,
        ol.order_id,
        ol.product_id,
        ol.quantity,
        ol.price,
        p.name AS product_name,
        p.category,
        (ol.quantity * ol.price) AS line_total
      FROM order_line ol
      LEFT JOIN product p ON ol.product_id = p.product_id
      WHERE ol.order_id = ?
    `;

    const shipmentSql = `SELECT * FROM shipment WHERE order_id = ? LIMIT 1`;
    const paymentSql = `SELECT * FROM payment WHERE order_id = ? LIMIT 1`;

    const [orderRows] = await db.execute(orderSql, [id]);
    if (!orderRows || orderRows.length === 0) return null;

    const [lines] = await db.execute(orderLinesSql, [id]);
    const [ship] = await db.execute(shipmentSql, [id]);
    const [pay] = await db.execute(paymentSql, [id]);

    const order = {
      ...orderRows[0],
      order_lines: lines || [],
      shipment: (ship && ship[0]) || null,
      payment: (pay && pay[0]) || null
    };

    return order;
  }

  /**
   * Create an order.
   * Tries calling stored proc `place_order(customerId, priority, @out_order_id)`
   * If response shape isn't as expected, falls back to a direct INSERT and returns { order_id }.
   */
  static async create(customerId, priority = 'Medium') {
    try {
      // Attempt stored-proc call (multi-statement)
      const sql = `
        CALL place_order(?, ?, @out_order_id);
        SELECT @out_order_id AS order_id;
      `;
      const results = await db.query(sql, [customerId, priority]);

      // If results is an array-of-arrays (multi-statement), try to extract select result
      // MySQL2 commonly returns an array where the last element contains the SELECT result.
      if (Array.isArray(results)) {
        // find the element that contains the order_id
        for (const r of results) {
          if (Array.isArray(r) && r[0] && r[0].order_id != null) {
            return r[0]; // { order_id: 123 }
          }
          // sometimes SELECT returns [ { order_id: X } ] directly as results[1]
          if (r && r.order_id != null) {
            return r;
          }
        }
      }

      // If not found, attempt to inspect common shapes:
      if (results && results.length >= 2) {
        const possibleSelect = results[results.length - 1];
        if (Array.isArray(possibleSelect) && possibleSelect[0] && possibleSelect[0].order_id != null) {
          return possibleSelect[0];
        }
      }

      // Fallback: stored-proc didn't return expected value. Fall back to simple INSERT.
    } catch (err) {
      // swallow and fallback to INSERT (but log)
      console.warn('place_order proc call failed or returned unexpected shape — falling back to INSERT. Error:', err.message);
    }

    // FALLBACK INSERT (no stored-proc)
    const insertSql = `
      INSERT INTO \`order\` (customer_id, priority, status, order_date, total_amount)
      VALUES (?, ?, 'Pending', NOW(), 0)
    `;
    const [result] = await db.execute(insertSql, [customerId, priority]);
    if (result && result.insertId) {
      return { order_id: result.insertId };
    }
    return null;
  }

  /**
   * Add item to an order.
   * Uses stored-proc add_order_item if present; otherwise, does a direct insert into order_line and updates totals.
   */
  static async addItem(orderId, productId, quantity) {
  quantity = parseInt(quantity, 10);
  if (!orderId || !productId || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid orderId/productId/quantity for addItem');
  }

  // Fetch product data + stock quantity from INVENTORY table
  const sql = `
    SELECT 
      p.product_id,
      p.unit_price,
      COALESCE(SUM(i.quantity), 0) AS stock
    FROM product p
    LEFT JOIN inventory i ON p.product_id = i.product_id
    WHERE p.product_id = ?
    GROUP BY p.product_id
    LIMIT 1
  `;

  const [prodRows] = await db.execute(sql, [productId]);

  if (!prodRows || prodRows.length === 0) {
    throw new Error(`Product ${productId} not found`);
  }

  const product = prodRows[0];
  const unitPrice = Number(product.unit_price) || 0;

    // Try stored-proc first
    try {
      const spSql = `CALL add_order_item(?, ?, ?)`;
      await db.execute(spSql, [orderId, productId, quantity]);
      return { success: true };
    } catch (err) {
      // fallback to manual insert
      console.warn('add_order_item stored proc failed, falling back to manual insert. Error:', err.message);
    }

    // Manual insert into order_line
    const insertLine = `
      INSERT INTO order_line (order_id, product_id, quantity, price)
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(insertLine, [orderId, productId, quantity, unitPrice]);

    // Update order total (sum lines)
    const updateTotal = `
      UPDATE \`order\`
      SET total_amount = COALESCE((
        SELECT SUM(ol.quantity * ol.price) FROM order_line ol WHERE ol.order_id = ?
      ), 0)
      WHERE order_id = ?
    `;
    await db.execute(updateTotal, [orderId, orderId]);

    return { success: true };
  }

  static async updateStatus(id, status) {
    const sql = `UPDATE \`order\` SET status = ? WHERE order_id = ?`;
    await db.execute(sql, [status, id]);
    return this.getById(id);
  }

  static async getStatistics() {
    const sql = `
      SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN status = 'Processing' THEN 1 ELSE 0 END) AS processing_orders,
        SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) AS shipped_orders,
        SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_orders,
        COALESCE(SUM(CASE WHEN status != 'Cancelled' THEN total_amount ELSE 0 END),0) AS total_revenue
      FROM \`order\`
    `;
    const [rows] = await db.execute(sql);
    return rows[0];
  }
}

module.exports = Order;
