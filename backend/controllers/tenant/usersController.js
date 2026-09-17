const pool = require('../../config/db');

// ============================================
// GET ALL USERS (Sirf is Tenant ke)
// ============================================
const getUsers = async (req, res) => {
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
};

// ============================================
// UPDATE USER ROLE (Sirf Admin)
// ============================================
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const userId = req.params.id;

        if (!role) {
            return res.status(400).json({ message: 'Role is required' });
        }

        if (req.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can change roles' });
        }

        // Check user belongs to same tenant
        const check = await pool.query(
            'SELECT id FROM users WHERE id = $1 AND tenant_id = $2',
            [userId, req.tenantId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'User not found in your tenant' });
        }

        // Prevent Admin from changing own role
        if (parseInt(userId) === req.userId) {
            return res.status(400).json({ message: 'You cannot change your own role' });
        }

        const result = await pool.query(
            'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
            [role, userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Update Role Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// DELETE USER (Sirf Admin)
// ============================================
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        if (req.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can remove members' });
        }

        // Prevent Admin from removing self
        if (parseInt(userId) === req.userId) {
            return res.status(400).json({ message: 'You cannot remove yourself' });
        }

        // Check user belongs to same tenant
        const check = await pool.query(
            'SELECT id, name FROM users WHERE id = $1 AND tenant_id = $2',
            [userId, req.tenantId]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'User not found in your tenant' });
        }

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ message: `${check.rows[0].name} removed successfully` });
    } catch (error) {
        console.error('❌ Delete User Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    updateUserRole,
    deleteUser
};
