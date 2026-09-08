const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all projects (Sirf is Tenant ke)
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM projects WHERE tenant_id = $1 ORDER BY created_at DESC',
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CREATE project
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const result = await pool.query(
            `INSERT INTO projects (tenant_id, name, description, status) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [req.tenantId, name, description, status || 'Planning']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE project
router.delete('/:id', auth, async (req, res) => {
    try {
        const projectId = req.params.id;
        const result = await pool.query(
            'DELETE FROM projects WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [projectId, req.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;