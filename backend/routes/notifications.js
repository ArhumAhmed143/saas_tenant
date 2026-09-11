const express = require('express');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// ============================================
// GET NOTIFICATIONS (Role-Based)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const notifications = [];

        // ========== PLATFORM OWNER ==========
        if (req.role === 'PlatformOwner') {
            // New companies (last 7 days)
            const companiesRes = await pool.query(
                `SELECT id, name, created_at FROM tenants 
                 WHERE created_at >= NOW() - INTERVAL '7 days' 
                 ORDER BY created_at DESC LIMIT 5`
            );
            companiesRes.rows.forEach(c => {
                notifications.push({
                    id: `tenant-${c.id}`,
                    type: 'company',
                    icon: '🏢',
                    title: 'New company registered',
                    message: `"${c.name}" joined the platform`,
                    timestamp: c.created_at,
                    color: '#4f46e5'
                });
            });

            // New users (last 7 days)
            const usersRes = await pool.query(
                `SELECT id, name, created_at FROM users 
                 WHERE created_at >= NOW() - INTERVAL '7 days' 
                 ORDER BY created_at DESC LIMIT 5`
            );
            usersRes.rows.forEach(u => {
                notifications.push({
                    id: `user-${u.id}`,
                    type: 'user',
                    icon: '👤',
                    title: 'New user joined',
                    message: `${u.name} created an account`,
                    timestamp: u.created_at,
                    color: '#0ea5e9'
                });
            });

            // Platform activities
            const actRes = await pool.query(
                `SELECT a.id, a.action, a.created_at, u.name as user_name 
                 FROM activities a
                 LEFT JOIN users u ON a.user_id = u.id
                 WHERE a.tenant_id IS NULL
                 ORDER BY a.created_at DESC LIMIT 10`
            );
            actRes.rows.forEach(a => {
                notifications.push({
                    id: `act-${a.id}`,
                    type: 'activity',
                    icon: '📋',
                    title: a.user_name || 'Someone',
                    message: a.action,
                    timestamp: a.created_at,
                    color: '#22c55e'
                });
            });
        } 
        // ========== COMPANY USERS (Admin, Manager, Employee) ==========
        else {
            // Overdue tasks (based on role)
            let overdueQuery;
            let overdueParams;

            if (req.role === 'Employee') {
                overdueQuery = `SELECT t.id, t.title, t.created_at, t.status 
                                FROM tasks t
                                WHERE t.tenant_id = $1 
                                  AND t.assignee_id = $2
                                  AND t.status != 'Done'
                                  AND t.created_at < NOW() - INTERVAL '1 day'
                                ORDER BY t.created_at DESC LIMIT 10`;
                overdueParams = [req.tenantId, req.userId];
            } else {
                overdueQuery = `SELECT t.id, t.title, t.created_at, t.status, u.name as assignee_name
                                FROM tasks t
                                LEFT JOIN users u ON t.assignee_id = u.id
                                WHERE t.tenant_id = $1 
                                  AND t.status != 'Done'
                                  AND t.created_at < NOW() - INTERVAL '1 day'
                                ORDER BY t.created_at DESC LIMIT 10`;
                overdueParams = [req.tenantId];
            }

            const overdueRes = await pool.query(overdueQuery, overdueParams);
            overdueRes.rows.forEach(t => {
                notifications.push({
                    id: `overdue-${t.id}`,
                    type: 'overdue',
                    icon: '⏰',
                    title: 'Task overdue',
                    message: `${t.title}${t.assignee_name ? ` (${t.assignee_name})` : ''}`,
                    timestamp: t.created_at,
                    color: '#dc2626'
                });
            });

            // My Tasks (assigned to current user, recent)
            const myTasksRes = await pool.query(
                `SELECT t.id, t.title, t.priority, t.status, t.created_at 
                 FROM tasks t
                 WHERE t.tenant_id = $1 
                   AND t.assignee_id = $2
                   AND t.created_at >= NOW() - INTERVAL '7 days'
                 ORDER BY t.created_at DESC LIMIT 5`,
                [req.tenantId, req.userId]
            );
            myTasksRes.rows.forEach(t => {
                notifications.push({
                    id: `mytask-${t.id}`,
                    type: 'task',
                    icon: '📋',
                    title: 'Task assigned to you',
                    message: `"${t.title}" (${t.priority} priority)`,
                    timestamp: t.created_at,
                    color: '#0ea5e9'
                });
            });

            // Recent team activities (last 24 hours)
            const actRes = await pool.query(
                `SELECT a.id, a.action, a.created_at, u.name as user_name 
                 FROM activities a
                 LEFT JOIN users u ON a.user_id = u.id
                 WHERE a.tenant_id = $1 
                   AND a.created_at >= NOW() - INTERVAL '24 hours'
                 ORDER BY a.created_at DESC LIMIT 10`,
                [req.tenantId]
            );
            actRes.rows.forEach(a => {
                // Skip if it's my own action (already covered)
                notifications.push({
                    id: `act-${a.id}`,
                    type: 'activity',
                    icon: '📌',
                    title: a.user_name || 'Someone',
                    message: a.action,
                    timestamp: a.created_at,
                    color: '#22c55e'
                });
            });
        }

        // Sort by timestamp (newest first)
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(notifications.slice(0, 20));
    } catch (error) {
        console.error('Notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;