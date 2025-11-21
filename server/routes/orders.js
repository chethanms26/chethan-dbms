const express = require('express');
const router = express.Router();

const { 
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  createOrder,
  updateOrderStatus,
  addItemToOrder,
  getStatistics
} = require('../controllers/orderController');

// GET
router.get('/', getAllOrders);
router.get('/statistics', getStatistics);
router.get('/customer/:customerId', getOrdersByCustomer);
router.get('/:id', getOrderById);

// POST
router.post('/', createOrder);
router.post('/:id/add-item', addItemToOrder);

// PUT
router.put('/:id/status', updateOrderStatus);

module.exports = router;
