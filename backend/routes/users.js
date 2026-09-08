const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// ============================================
// GET ALL USERS (Sirf is Tenant ke)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at 
             FROM users 
             WHERE tenant_id = $1 
             ORDER BY name`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Users Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;