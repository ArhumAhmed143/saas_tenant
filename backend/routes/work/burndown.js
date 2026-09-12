const express = require('express');
const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const router = express.Router();

// ============================================
// GET BURNDOWN DATA (LAST 5 DAYS)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                DATE(updated_at) as date,
                COUNT(*) as completed_count
             FROM tasks
             WHERE tenant_id = $1 
               AND status = 'Done'
               AND updated_at >= NOW() - INTERVAL '5 days'
             GROUP BY DATE(updated_at)
             ORDER BY date ASC`,
            [req.tenantId]
        );

        // Fill missing days with 0
        const data = [];
        const today = new Date();
        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            
            // ✅ Safe check - row.date null ho sakta hai
            const found = result.rows.find(row => {
                if (!row.date) return false;
                return row.date.toISOString().split('T')[0] === dateStr;
            });
            
            data.push({
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                completed: found ? parseInt(found.completed_count) : 0,
                date: dateStr
            });
        }

        res.json(data);
    } catch (error) {
        console.error('❌ Burndown Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;