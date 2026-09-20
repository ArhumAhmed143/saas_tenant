const pool = require('../../config/db');

// ============================================
// GET SINGLE TENANT (Safe ID parse)
// ============================================
const getTenant = async (req, res) => {
    try {
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
};

// ============================================
// UPDATE TENANT NAME (Safe ID parse)
// ============================================
const updateTenant = async (req, res) => {
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
};

// ============================================
// DELETE TENANT (Admin of tenant or PlatformOwner)
// ============================================
const deleteTenant = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id || id === 'null' || isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid tenant ID' });
        }

        const tenantId = parseInt(id);

        if (req.role !== 'PlatformOwner' && (req.role !== 'Admin' || parseInt(req.tenantId) !== tenantId)) {
            return res.status(403).json({ message: 'Only an Admin of this organization or Platform Owner can delete it' });
        }

        const checkTenant = await pool.query('SELECT id, name FROM tenants WHERE id = $1', [tenantId]);
        if (checkTenant.rows.length === 0) {
            return res.status(404).json({ message: 'Organization not found' });
        }

        const tenantName = checkTenant.rows[0].name;

        await pool.query('BEGIN');

        // Explicit deletion of all associated data in dependency order
        // to guarantee no foreign key violations and avoid orphan records
        try {
            await pool.query(`
                DELETE FROM subtasks 
                WHERE task_id IN (SELECT id FROM tasks WHERE tenant_id = $1)
            `, [tenantId]);
        } catch (e) {
            console.log('Subtasks cleanup note:', e.message);
        }

        try {
            await pool.query(`
                DELETE FROM comments 
                WHERE task_id IN (SELECT id FROM tasks WHERE tenant_id = $1)
                   OR user_id IN (SELECT id FROM users WHERE tenant_id = $1)
            `, [tenantId]);
        } catch (e) {
            console.log('Comments cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM tasks WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Tasks cleanup note:', e.message);
        }

        try {
            await pool.query(`
                DELETE FROM sprints 
                WHERE project_id IN (SELECT id FROM projects WHERE tenant_id = $1)
            `, [tenantId]);
        } catch (e) {
            console.log('Sprints cleanup note:', e.message);
        }

        try {
            await pool.query(`
                DELETE FROM epics 
                WHERE project_id IN (SELECT id FROM projects WHERE tenant_id = $1)
            `, [tenantId]);
        } catch (e) {
            console.log('Epics cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM projects WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Projects cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM teams WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Teams cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM departments WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Departments cleanup note:', e.message);
        }

        try {
            await pool.query(`
                DELETE FROM activities 
                WHERE tenant_id = $1 
                   OR user_id IN (SELECT id FROM users WHERE tenant_id = $1)
            `, [tenantId]);
        } catch (e) {
            console.log('Activities cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM invites WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Invites cleanup note:', e.message);
        }

        try {
            await pool.query('DELETE FROM users WHERE tenant_id = $1', [tenantId]);
        } catch (e) {
            console.log('Users cleanup note:', e.message);
        }

        await pool.query('DELETE FROM tenants WHERE id = $1', [tenantId]);

        await pool.query('COMMIT');

        console.log(`🗑️ Organization "${tenantName}" (ID: ${tenantId}) and all associated data deleted by user ${req.userId}`);

        res.json({
            success: true,
            message: `Organization "${tenantName}" and all associated data have been permanently deleted.`
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Delete tenant error:', error);
        res.status(500).json({ message: error.message || 'Server error while deleting organization' });
    }
};

module.exports = {
    getTenant,
    updateTenant,
    deleteTenant,
    getTenantById: getTenant,
    updateTenantById: updateTenant,
    deleteTenantById: deleteTenant
};
