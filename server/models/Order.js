// server/models/Order.js
const db = require('../config/database');

class Order {
  // execute multi-statement queries
  static async query(sql, params = []) {
    const [rows] = await db.query(sql, params);
    return rows;
  }

  // execute single statement select
  static async execute(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // Get all orders - ensure use of order_date column aliased to date
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

  // Get order by id - returns combined object and maps order_lines -> order_lines
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

    // Format return object matching frontend expectations
    const order = {
      ...orderRows[0],
      order_lines: lines || [],
      shipment: (ship && ship[0]) || null,
      payment: (pay && pay[0]) || null
    };

    return order;
  }

  // Create order using stored procedure (expects OUT parameter @order_id)
  static async create(customerId, priority = 'Medium') {
    const sql = `
      CALL place_order(?, ?, @out_order_id);
      SELECT @out_order_id AS order_id;
    `;
    const results = await db.query(sql, [customerId, priority]);
    // results: [ [resultSetsFromCALL], [selectResult] ] - MySQL2 returns array-of-arrays
    // The SELECT result should be in results[1]
    const selectResult = results[1];
    const idRow = Array.isArray(selectResult) && selectResult[0];
    return idRow || null;
  }

  // Add item using stored procedure add_order_item
  static async addItem(orderId, productId, quantity) {
    const sql = `CALL add_order_item(?, ?, ?)`;
    await db.execute(sql, [orderId, productId, quantity]);
    return { success: true };
  }

  // Update status
  static async updateStatus(id, status) {
    const sql = `UPDATE \`order\` SET status = ? WHERE order_id = ?`;
    await db.execute(sql, [status, id]);
    return this.getById(id);
  }

  // statistics
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
