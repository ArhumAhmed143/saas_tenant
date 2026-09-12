const express = require('express');
const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const router = express.Router();

// ============================================
// GET all sprints (Tenant filtered via project)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, p.name as project_name 
             FROM sprints s
             JOIN projects p ON s.project_id = p.id
             WHERE p.tenant_id = $1
             ORDER BY s.start_date DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Sprints Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// POST create sprint (FIXED)
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { name, projectId, startDate, endDate } = req.body;

        // ✅ Debug log
        console.log('📥 Received sprint data:', { name, projectId, startDate, endDate });

        // Validation
        if (!name || !projectId || !startDate || !endDate) {
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { name, projectId, startDate, endDate }
            });
        }

        // ✅ Convert projectId to integer (string se integer)
        const projectIdInt = parseInt(projectId);
        if (isNaN(projectIdInt)) {
            return res.status(400).json({ message: 'Invalid project ID' });
        }

        // ✅ Check if project belongs to this tenant
        const projectCheck = await pool.query(
            'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
            [projectIdInt, req.tenantId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ 
                message: 'Project not found in this tenant',
                projectId: projectIdInt,
                tenantId: req.tenantId
            });
        }

        // ✅ Insert sprint (snake_case column names)
        const result = await pool.query(
            `INSERT INTO sprints (project_id, name, start_date, end_date) 
             VALUES ($1, $2, $3, $4) 
             RETURNING *`,
            [projectIdInt, name, startDate, endDate]
        );

        console.log('✅ Sprint created:', result.rows[0]);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('❌ Create Sprint Error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to create sprint',
            detail: error.detail || 'Unknown error'
        });
    }
});

module.exports = router;