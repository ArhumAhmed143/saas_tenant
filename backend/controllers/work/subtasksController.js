const pool = require('../../config/db');

// ============================================
// GET ALL SUBTASKS (Sirf is Tenant ke)
// ============================================
const getSubtasks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.* 
             FROM subtasks s
             LEFT JOIN tasks t ON s.task_id = t.id
             WHERE t.tenant_id = $1
             ORDER BY s.created_at DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ GET Subtasks Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// CREATE SUBTASK
// ============================================
const createSubtask = async (req, res) => {
    try {
        const { taskId, title } = req.body;

        if (!taskId || !title) {
            return res.status(400).json({ message: 'Task ID and title are required' });
        }

        const taskCheck = await pool.query(
            'SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2',
            [taskId, req.tenantId]
        );

        if (taskCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found in your tenant' });
        }

        const result = await pool.query(
            `INSERT INTO subtasks (task_id, title) 
             VALUES ($1, $2) 
             RETURNING *`,
            [taskId, title]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('❌ Create Subtask Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// TOGGLE SUBTASK COMPLETION
// ============================================
const toggleSubtask = async (req, res) => {
    try {
        const { isCompleted } = req.body;

        const result = await pool.query(
            `UPDATE subtasks s
             SET is_completed = $1
             FROM tasks t
             WHERE s.id = $2 AND s.task_id = t.id AND t.tenant_id = $3
             RETURNING s.*`,
            [isCompleted, req.params.id, req.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subtask not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('❌ Update Subtask Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSubtasks,
    createSubtask,
    toggleSubtask
};
