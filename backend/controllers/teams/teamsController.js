const pool = require('../../config/db');

// ============================================
// GET ALL TEAMS (Tenant filtered)
// ============================================
const getTeams = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, d.name as department_name 
             FROM teams t
             JOIN departments d ON t.department_id = d.id
             WHERE t.tenant_id = $1 
             ORDER BY t.name`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Teams Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// CREATE TEAM
// ============================================
const createTeam = async (req, res) => {
    try {
        const { name, departmentId } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Team name is required' });
        }

        const result = await pool.query(
            'INSERT INTO teams (tenant_id, department_id, name) VALUES ($1, $2, $3) RETURNING *',
            [req.tenantId, departmentId || null, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Create Team Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// DELETE TEAM
// ============================================
const deleteTeam = async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM teams WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [req.params.id, req.tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        console.error('❌ Delete Team Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTeams,
    createTeam,
    deleteTeam
};
