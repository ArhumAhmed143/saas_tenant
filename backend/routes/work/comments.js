const express = require('express');
const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const router = express.Router();

// ============================================
// GET ALL COMMENTS (Sirf is Tenant ke)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.name as user_name 
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             LEFT JOIN tasks t ON c.task_id = t.id
             WHERE t.tenant_id = $1
             ORDER BY c.created_at DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Comments Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// CREATE COMMENT
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { taskId, content } = req.body;

        if (!taskId || !content) {
            return res.status(400).json({ message: 'Task ID and content are required' });
        }

        // Verify task belongs to this tenant
        const taskCheck = await pool.query(
            'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
            [taskId, req.tenantId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found in your tenant' });
        }

        const result = await pool.query(
            `INSERT INTO comments (task_id, user_id, content) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [taskId, req.userId, content]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Create Comment Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;