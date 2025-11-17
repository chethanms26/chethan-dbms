// server/routes/payments.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// add payment (generic)
router.post('/add', paymentController.createPayment);

// process payment (frontend expects /pay)
router.post('/pay', paymentController.processPayment);

// list payments
router.get('/all', paymentController.getPayments);

module.exports = router;
