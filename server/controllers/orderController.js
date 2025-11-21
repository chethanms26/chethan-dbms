// server/controllers/orderController.js

const Order = require('../models/Order');

// --------------------------------------------------
// GET ALL ORDERS
// --------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const rows = await Order.getAll();
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
};

// --------------------------------------------------
// GET ORDER BY ID
// --------------------------------------------------
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

// --------------------------------------------------
// GET ORDERS BY CUSTOMER
// --------------------------------------------------
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

// --------------------------------------------------
// CREATE ORDER
// --------------------------------------------------
exports.createOrder = async (req, res) => {
  try {
    console.log("Create order payload:", req.body);

    const { customer_id, priority, items } = req.body;

    if (!customer_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'customer_id and items are required' });
    }

    // 1. Create order
    const out = await Order.create(customer_id, priority || "Medium");

    if (!out || !out.order_id) {
      console.error("Invalid order_id response:", out);
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    const orderId = out.order_id;

    // 2. Add items
    for (const item of items) {
      if (!item.product_id || !item.quantity) {
        return res.status(400).json({ success: false, message: 'Invalid item payload' });
      }
      await Order.addItem(orderId, item.product_id, item.quantity);
    }

    // 3. Fetch full order
    const created = await Order.getById(orderId);
    res.status(201).json({ success: true, message: 'Order created', data: created });

  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: 'Failed to create order', error: err.message });
  }
};

// --------------------------------------------------
// ADD ITEM TO ORDER
// --------------------------------------------------
exports.addItemToOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { product_id, quantity } = req.body;

    await Order.addItem(orderId, product_id, quantity);

    const updated = await Order.getById(orderId);
    res.json({ success: true, message: 'Item added', data: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to add item', error: err.message });
  }
};

// --------------------------------------------------
// UPDATE ORDER STATUS
// --------------------------------------------------
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

// --------------------------------------------------
// GET STATISTICS
// --------------------------------------------------
exports.getStatistics = async (req, res) => {
  try {
    const stats = await Order.getStatistics();
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats', error: err.message });
  }
};
