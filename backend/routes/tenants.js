const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// ============================================
// GET SINGLE TENANT
// ============================================
router.get('/:id', auth, async (req, res) => {
    try {
        // ✅ FIX: Handle null/invalid id
        const id = req.params.id;
        if (!id || id === 'null' || id === 'undefined' || isNaN(parseInt(id))) {
            return res.status(400).json({ 
                message: 'No tenant associated with this user',
                tenantId: null 
            });
        }

        const result = await pool.query(
            'SELECT id, name, slug, created_at FROM tenants WHERE id = $1',
            [parseInt(id)]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get tenant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// UPDATE TENANT NAME
// ============================================
router.put('/:id', auth, async (req, res) => {
    try {
        const { name } = req.body;
        const id = req.params.id;

        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }

        if (!id || id === 'null' || isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid tenant ID' });
        }

        if (req.role !== 'Admin' && req.role !== 'PlatformOwner') {
            return res.status(403).json({ message: 'Only Admin can update company profile' });
        }

        const result = await pool.query(
            'UPDATE tenants SET name = $1 WHERE id = $2 RETURNING id, name, slug',
            [name, parseInt(id)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;