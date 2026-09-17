const pool = require('../../config/db');

// ============================================
// GET SINGLE TENANT
// ============================================
const getTenant = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, slug, created_at FROM tenants WHERE id = $1',
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// UPDATE TENANT NAME
// ============================================
const updateTenant = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (req.role !== 'Admin' && req.role !== 'PlatformOwner') {
            return res.status(403).json({ message: 'Only Admin can update company profile' });
        }

        const result = await pool.query(
            'UPDATE tenants SET name = $1 WHERE id = $2 RETURNING id, name, slug',
            [name, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTenant,
    updateTenant
};
