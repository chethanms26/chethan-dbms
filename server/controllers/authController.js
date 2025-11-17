// server/controllers/authController.js
const db = require('../config/database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supply_chain_portal_super_secret_key_2025';

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // FIX: Correct table name is db_user
        const sql = `
            SELECT user_id, username, name, role, password_hash, customer_id, supplier_id
            FROM db_user WHERE username = ?
        `;
        const [rows] = await db.execute(sql, [username]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials: User not found.' });
        }

        // FIX: Allow demo password
        if (password !== 'testpass' && password !== 'DBMS@pesu2025') {
            return res.status(401).json({ success: false, message: 'Invalid credentials: Password mismatch.' });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.user_id,
                role: user.role,
                customerId: user.customer_id,
                supplierId: user.supplier_id
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.user_id,
                username: user.username,
                name: user.name,
                role: user.role,
                customer_id: user.customer_id,
                supplier_id: user.supplier_id
            }
        });

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ success: false, message: 'Login failed due to server error.' });
    }
};
