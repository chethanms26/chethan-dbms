// server/config/database.js
// Final Version using MySQL2/Promise for better performance and syntax.

const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
// Create a connection pool for efficient database handling
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,           // remove || 'scm_app_user'
  password: process.env.DB_PASSWORD,   // remove || 'DBMS@pesu2025'
  database: process.env.DB_NAME,       // remove || 'scm_portal'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// Test connection and log status
pool.getConnection()
    .then(connection => {
        console.log('✅ Connected to MySQL database');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Failed to connect to MySQL database:', err.message);
        console.error('Check your .env file credentials and ensure MySQL service is running.');
        process.exit(1);
    });

module.exports = pool;

/* * REQUIRED .env FILE CONTENT:
* --------------------------
* DB_HOST=localhost
* DB_PORT=3306
* DB_USER=scm_app_user   <-- Use the non-root user you created!
* DB_PASSWORD=your_secure_password
* DB_NAME=scm_portal
*/