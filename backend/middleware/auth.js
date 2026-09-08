const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userCheck = await pool.query(
            'SELECT id, tenant_id, role FROM users WHERE id = $1 AND is_active = true',
            [decoded.userId]
        );

        if (userCheck.rows.length === 0) {
            return res.status(401).json({ message: 'User not found or inactive' });
        }

        const user = userCheck.rows[0];
        req.userId = user.id;
        req.tenantId = user.tenant_id;
        req.role = user.role;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = auth;