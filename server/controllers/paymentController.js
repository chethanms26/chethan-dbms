// server/controllers/paymentController.js
const db = require('../config/database');

exports.createPayment = async (req, res) => {
  try {
    const { order_id, amount, method, status } = req.body;
    const q = `INSERT INTO payment (order_id, amount, method, status) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(q, [order_id, amount, method || 'UNKNOWN', status || 'Pending']);
    const paymentId = result.insertId;
    const [rows] = await db.execute(`SELECT * FROM payment WHERE payment_id = ?`, [paymentId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create payment', error: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM payment ORDER BY payment_date DESC`);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch payments', error: err.message });
  }
};

// Endpoint used by frontend "Pay Now" to perform the payment (simulated)
exports.processPayment = async (req, res) => {
  try {
    const { order_id, amount, method } = req.body;

    if (!order_id || !amount) {
      return res.status(400).json({ success: false, message: 'order_id and amount required' });
    }

    // Insert payment with status 'Success' to trigger DB trigger (which will mark order Paid)
    const insertQ = `INSERT INTO payment (order_id, amount, method, status) VALUES (?, ?, ?, ?)`;
    const [result] = await db.execute(insertQ, [order_id, amount, method || 'SIMULATED', 'Success']);
    const paymentId = result.insertId;

    // Return created payment row
    const [rows] = await db.execute(`SELECT * FROM payment WHERE payment_id = ?`, [paymentId]);

    res.json({ success: true, message: 'Payment recorded', data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Payment failed', error: err.message });
  }
};
