// server/controllers/orderController.js
const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    const rows = await Order.getAll();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.getById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: err.message });
  }
};

exports.getOrdersByCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const rows = await Order.getByCustomer(customerId);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customer_id, priority, items } = req.body;

    if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'customer_id and items are required' });
    }

    // 1) create order using SP
    const out = await Order.create(customer_id, priority || 'Medium');
    if (!out || !out.order_id) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }
    const orderId = out.order_id;

    // 2) add items (calls add_order_item SP - transactional logic inside DB)
    for (const it of items) {
      await Order.addItem(orderId, it.product_id, it.quantity);
    }

    // 3) fetch full order and return
    const created = await Order.getById(orderId);
    res.status(201).json({ success: true, message: 'Order created', data: created });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  }
};

exports.addItemToOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { product_id, quantity } = req.body;
    await Order.addItem(id, product_id, quantity);
    const updated = await Order.getById(id);
    res.json({ success: true, message: 'Item added', data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add item', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const updated = await Order.updateStatus(id, status);
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update status', error: err.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: err.message });
  }
};
