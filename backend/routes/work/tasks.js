const express = require('express');
const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const router = express.Router();

// ============================================
// GET ALL TASKS (Tenant filtered via projects)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, p.name as project_name 
             FROM tasks t
             JOIN projects p ON t.project_id = p.id
             WHERE p.tenant_id = $1
             ORDER BY t.created_at DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Tasks Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// CREATE TASK (POST)
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { projectId, assigneeId, title, description, priority, status, estimatedHours } = req.body;

        // Validation
        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and title are required' });
        }

        // Check if project belongs to this tenant
        const projectCheck = await pool.query(
            'SELECT id FROM projects WHERE id = $1 AND tenant_id = $2',
            [projectId, req.tenantId]
        );

        if (projectCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Project not found in this tenant' });
        }

        const result = await pool.query(
            `INSERT INTO tasks (tenant_id, project_id, assignee_id, title, description, priority, status, estimated_hours) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING *`,
            [
                req.tenantId,
                projectId,
                assigneeId || null,
                title,
                description || '',
                priority || 'Medium',
                status || 'To-Do',
                estimatedHours || 0
            ]
        );

        console.log('✅ Task created:', result.rows[0]);
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error('❌ Create Task Error:', error);
        res.status(500).json({ message: error.message || 'Failed to create task' });
    }
});

// ============================================
// UPDATE TASK STATUS (PATCH)
// ============================================
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Check if task belongs to this tenant
        const taskCheck = await pool.query(
            `SELECT t.id FROM tasks t
             JOIN projects p ON t.project_id = p.id
             WHERE t.id = $1 AND p.tenant_id = $2`,
            [taskId, req.tenantId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Task not found in this tenant' });
        }

        const result = await pool.query(
            `UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *`,
            [status, taskId]
        );

        res.json(result.rows[0]);

    } catch (error) {
        console.error('❌ Update Task Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;