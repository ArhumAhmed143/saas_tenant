const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware: Only Platform Owner
const platformOwnerOnly = (req, res, next) => {
    if (req.role !== 'PlatformOwner') {
        return res.status(403).json({ message: 'Access denied. Platform Owners only.' });
    }
    next();
};

// ============================================
// GET ALL TENANTS
// ============================================
router.get('/tenants', auth, platformOwnerOnly, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tenants ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Platform tenants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// GET SINGLE TENANT DETAILS
// ============================================
router.get('/tenants/:id', auth, platformOwnerOnly, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tenants WHERE id = $1', [req.params.id]);
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
// UPDATE TENANT
// ============================================
router.put('/tenants/:id', auth, platformOwnerOnly, async (req, res) => {
    try {
        const { 
            name, industry, website, phone, address, 
            city, country, description, plan, is_active 
        } = req.body;

        const result = await pool.query(
            `UPDATE tenants SET 
                name = COALESCE($1, name),
                industry = COALESCE($2, industry),
                website = COALESCE($3, website),
                phone = COALESCE($4, phone),
                address = COALESCE($5, address),
                city = COALESCE($6, city),
                country = COALESCE($7, country),
                description = COALESCE($8, description),
                plan = COALESCE($9, plan),
                is_active = COALESCE($10, is_active)
             WHERE id = $11
             RETURNING *`,
            [name, industry, website, phone, address, city, country, description, plan, is_active, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update tenant error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ============================================
// DELETE TENANT (Complete company + all data)
// ============================================
router.delete('/tenants/:id', auth, platformOwnerOnly, async (req, res) => {
    try {
        const tenantId = req.params.id;

        // Check if tenant exists
        const check = await pool.query('SELECT name FROM tenants WHERE id = $1', [tenantId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const tenantName = check.rows[0].name;

        // Delete tenant (CASCADE will delete all related data)
        await pool.query('DELETE FROM tenants WHERE id = $1', [tenantId]);

        console.log(`🗑️ Platform Owner deleted tenant: ${tenantName} (ID: ${tenantId})`);

        res.json({ 
            success: true, 
            message: `Company "${tenantName}" and all its data deleted successfully` 
        });

    } catch (error) {
        console.error('Delete tenant error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ============================================
// GET ALL USERS (Across tenants)
// ============================================
router.get('/users', auth, platformOwnerOnly, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, tenant_id, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Platform users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// DELETE USER (Platform Owner can delete any user)
// ============================================
router.delete('/users/:id', auth, platformOwnerOnly, async (req, res) => {
    try {
        const userId = req.params.id;

        const check = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userName = check.rows[0].name;

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        console.log(`🗑️ Platform Owner deleted user: ${userName} (ID: ${userId})`);

        res.json({ 
            success: true, 
            message: `User "${userName}" deleted successfully` 
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ============================================
// 🆕 GET PLATFORM-WIDE ACTIVITIES (All Tenants)
// ============================================
router.get('/activities', auth, platformOwnerOnly, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                a.id, 
                a.action, 
                a.created_at,
                a.tenant_id,
                u.name as user_name,
                u.email as user_email,
                t.name as tenant_name
             FROM activities a
             LEFT JOIN users u ON a.user_id = u.id
             LEFT JOIN tenants t ON a.tenant_id = t.id
             ORDER BY a.created_at DESC
             LIMIT 50`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Platform activities error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;