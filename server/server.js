// server/server.js
// FINAL VERSION: Registers ALL Routes including Authentication + Payment

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Database Connection ---
require('./config/database');  // ensures DB pool is tested

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://10.32.65.6:3000'
  ],
  credentials: true,
}));

// --- Import Routes ---
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const inventoryRoutes = require('./routes/inventory');
const dashboardRoutes = require('./routes/dashboard');
const warehouseRoutes = require('./routes/warehouses');
const companyRoutes = require('./routes/companies');
const supplierRoutes = require('./routes/suppliers');
const authRoutes = require('./routes/auth');

// ⭐ ADD THIS — PAYMENT ROUTES
const paymentRoutes = require('./routes/payments');

// --- Mount Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Business Core
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);

// Entities
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/companies', companyRoutes);

// ⭐ ADD THIS — PAYMENT ROUTE MOUNT
app.use('/api/payments', paymentRoutes);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'SCM Portal API is running'
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
