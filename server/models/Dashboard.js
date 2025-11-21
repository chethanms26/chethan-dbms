// server/models/Dashboard.js
const db = require('../config/database');

// Safe query wrapper
const query = async (sql, params = []) => {
  const safeParams = params.map(p => {
    const n = parseInt(p, 10);
    return isNaN(n) ? 10 : n;
  });
const [rows] = await db.query(sql, safeParams);
  return rows;
};

const Dashboard = {

  // --------------------------
  async getOverallStats() {
    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM customer) AS total_customers,
        (SELECT COUNT(*) FROM product) AS total_products,
        (SELECT COUNT(*) FROM \`order\`) AS total_orders,
        (SELECT COUNT(*) FROM \`order\` WHERE status = 'Pending') AS pending_orders,
        (SELECT COUNT(*) FROM \`order\` WHERE status = 'Delivered') AS delivered_orders,
        (SELECT COALESCE(SUM(total_amount),0) FROM \`order\` WHERE status != 'Cancelled') AS total_revenue,
        (SELECT COALESCE(AVG(total_amount),0) FROM \`order\` WHERE status != 'Cancelled') AS avg_order_value,
        (SELECT COUNT(*) FROM inventory WHERE quantity <= reorder_level) AS low_stock_items,
        (SELECT COUNT(*) FROM shipment WHERE status = 'In Transit') AS active_shipments
    `;
    const rows = await query(sql);
    return rows[0] || {};
  },

  // --------------------------
  async getRecentOrders(limit) {
    limit = parseInt(limit) || 10;

    const sql = `
      SELECT o.order_id, o.order_date AS date, o.total_amount, o.status, o.priority, c.name AS customer_name
      FROM \`order\` o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      ORDER BY o.order_date DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  },

  // --------------------------
  async getTopProducts(limit) {
    limit = parseInt(limit) || 10;

    const sql = `
      SELECT product_id, name, category, unit_price
      FROM product
      ORDER BY unit_price DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  },

  // --------------------------
  async getTopCustomers(limit) {
    limit = parseInt(limit) || 10;

    const sql = `
      SELECT c.customer_id, c.name, c.email, COUNT(o.order_id) AS total_orders
      FROM customer c
      LEFT JOIN \`order\` o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id
      ORDER BY total_orders DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  },

  // --------------------------
  async getRevenueByCategory() {
    const sql = `
      SELECT p.category, COALESCE(SUM(ol.quantity * ol.price),0) AS total_revenue
      FROM order_line ol
      JOIN product p ON ol.product_id = p.product_id
      JOIN \`order\` o ON ol.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;
    return await query(sql);
  },

  // --------------------------
  async getOrderStatusDistribution() {
    const sql = `
      SELECT status, COUNT(*) AS count
      FROM \`order\`
      GROUP BY status
    `;
    return await query(sql);
  },

  // --------------------------
  async getDailyRevenue(days) {
    days = parseInt(days) || 30;

    const sql = `
      SELECT DATE(order_date) AS date, SUM(total_amount) AS daily_revenue
      FROM \`order\`
      WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND status != 'Cancelled'
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `;
    return await query(sql, [days]);
  },

  // --------------------------
  async getWarehouseUtilization() {
    const sql = `
      SELECT w.warehouse_id, w.name, w.location, w.capacity,
             COALESCE(SUM(i.quantity),0) AS total_items
      FROM warehouse w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id
    `;
    return await query(sql);
  },

  // --------------------------
  async getInventoryAlerts() {
    const sql = `
      SELECT ia.alert_id, ia.product_id, p.name AS product_name,
             ia.warehouse_id, ia.quantity, ia.reorder_level, ia.alert_date
      FROM inventory_alert_log ia
      JOIN product p ON ia.product_id = p.product_id
      ORDER BY ia.alert_date DESC
      LIMIT 20
    `;
    try { return await query(sql); }
    catch { return []; }
  },

  // --------------------------
  async getProductPriceAudit() {
    const sql = `
      SELECT ph.product_id, p.name AS product_name, ph.old_price, ph.new_price,
             ph.changed_at, ph.changed_by
      FROM price_history ph
      JOIN product p ON ph.product_id = p.product_id
      ORDER BY ph.changed_at DESC
      LIMIT 20
    `;
    try { return await query(sql); }
    catch {
      console.warn("price_history missing → returning empty");
      return [];
    }
  }

};

module.exports = Dashboard;
