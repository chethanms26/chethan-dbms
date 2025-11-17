// server/models/Dashboard.js
const db = require('../config/database');

class Dashboard {

  static async execute(sql, params = []) {
    const [rows] = await db.execute(sql, params);
    return rows;
  }

  // -----------------------------
  // 1) Overall Stats
  // -----------------------------
  static async getOverallStats() {
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
    const rows = await this.execute(sql);
    return rows[0];
  }

  // -----------------------------
  // 2) Recent Orders
  // -----------------------------
  static async getRecentOrders(limit = 10) {
    const sql = `
      SELECT 
        o.order_id,
        o.order_date AS date,
        o.total_amount,
        o.status,
        o.priority,
        c.name AS customer_name
      FROM \`order\` o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      ORDER BY o.order_date DESC
      LIMIT ${Number(limit)}
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 3) Top Products (highest price)
  // -----------------------------
  static async getTopProducts(limit = 10) {
    const sql = `
      SELECT product_id, name, category, unit_price
      FROM product
      ORDER BY unit_price DESC
      LIMIT ${Number(limit)}
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 4) Top Customers (most orders)
  // -----------------------------
  static async getTopCustomers(limit = 10) {
    const sql = `
      SELECT c.customer_id, c.name, c.email,
             COUNT(o.order_id) AS total_orders
      FROM customer c
      LEFT JOIN \`order\` o ON c.customer_id = o.customer_id
      GROUP BY c.customer_id
      ORDER BY total_orders DESC
      LIMIT ${Number(limit)}
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 5) Revenue by Category
  // -----------------------------
  static async getRevenueByCategory() {
    const sql = `
      SELECT p.category,
             SUM(ol.quantity * ol.price) AS total_revenue
      FROM order_line ol
      JOIN product p ON ol.product_id = p.product_id
      JOIN \`order\` o ON ol.order_id = o.order_id
      WHERE o.status != 'Cancelled'
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 6) Order Status Distribution
  // -----------------------------
  static async getOrderStatusDistribution() {
    const sql = `
      SELECT status, COUNT(*) AS count
      FROM \`order\`
      GROUP BY status
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 7) Daily Revenue (last X days)
  // -----------------------------
  static async getDailyRevenue(days = 30) {
    const sql = `
      SELECT DATE(order_date) AS date,
             SUM(total_amount) AS daily_revenue
      FROM \`order\`
      WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL ${Number(days)} DAY)
        AND status != 'Cancelled'
      GROUP BY DATE(order_date)
      ORDER BY date DESC
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 8) Warehouse Utilization
  // -----------------------------
  static async getWarehouseUtilization() {
    const sql = `
      SELECT w.warehouse_id, w.name, w.location, w.capacity,
             COALESCE(SUM(i.quantity),0) AS total_items
      FROM warehouse w
      LEFT JOIN inventory i ON w.warehouse_id = i.warehouse_id
      GROUP BY w.warehouse_id
    `;
    return this.execute(sql);
  }

  // -----------------------------
  // 9) Inventory Alerts
  // -----------------------------
  static async getInventoryAlerts() {
    const sql = `
      SELECT 
        ia.alert_id,
        ia.product_id,
        p.name AS product_name,
        ia.warehouse_id,
        ia.quantity,
        ia.reorder_level,
        ia.alert_date
      FROM inventory_alert_log ia
      JOIN product p ON ia.product_id = p.product_id
      ORDER BY ia.alert_date DESC
      LIMIT 20
    `;
    return this.execute(sql);
  }
}

module.exports = Dashboard;
