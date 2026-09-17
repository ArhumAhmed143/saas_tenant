const pool = require('../../config/db');

// ============================================
// GET ALL ACTIVITIES (Sirf is Tenant ke)
// ============================================
const getActivities = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, u.name as user_name 
             FROM activities a
             JOIN users u ON a.user_id = u.id
             WHERE a.tenant_id = $1
             ORDER BY a.created_at DESC
             LIMIT 50`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Activities Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// CREATE ACTIVITY (POST)
// ============================================
const createActivity = async (req, res) => {
    try {
        const { action } = req.body;
        if (!action) {
            return res.status(400).json({ message: 'Action is required' });
        }

        const result = await pool.query(
            `INSERT INTO activities (tenant_id, user_id, action, created_at) 
             VALUES ($1, $2, $3, NOW()) 
             RETURNING *`,
            [req.tenantId, req.userId, action]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Create Activity Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getActivities,
    createActivity
};
