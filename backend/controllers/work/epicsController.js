const pool = require('../../config/db');

// ============================================
// GET ALL EPICS (Tenant filtered via projects)
// ============================================
const getEpics = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT e.*, p.name as project_name 
             FROM epics e
             JOIN projects p ON e.project_id = p.id
             WHERE p.tenant_id = $1
             ORDER BY e.created_at DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Epics Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getEpics
};
