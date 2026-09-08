const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// GET all departments (Tenant filtered)
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM departments WHERE tenant_id = $1 ORDER BY name',
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Departments Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CREATE department
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const result = await pool.query(
            'INSERT INTO departments (tenant_id, name) VALUES ($1, $2) RETURNING *',
            [req.tenantId, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Create Department Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE department
router.delete('/:id', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM departments WHERE id = $1 AND tenant_id = $2 RETURNING id',
            [req.params.id, req.tenantId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error('❌ Delete Department Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;