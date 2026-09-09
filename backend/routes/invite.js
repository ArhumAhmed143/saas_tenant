const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// ============================================
// SEND INVITATION (CONSOLE LOG - TEMPORARY)
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { email, role } = req.body;
        const tenantId = req.tenantId;
        const senderName = req.userName || 'Admin';

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Get tenant name
        const tenantRes = await pool.query('SELECT name FROM tenants WHERE id = $1', [tenantId]);
        const tenantName = tenantRes.rows[0]?.name || 'our organization';

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND tenant_id = $2',
            [email, tenantId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                message: `${email} is already a member of ${tenantName}` 
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // ✅ TEMPORARY FIX: Email bhejne ki bajay console par print karo
        console.log('========================================');
        console.log('📧 INVITATION DETAILS:');
        console.log('To:', email);
        console.log('Role:', role);
        console.log('Tenant:', tenantName);
        console.log('Sender:', senderName);
        console.log('Register Link:', `${frontendUrl}/register`);
        console.log('========================================');

        // ❌ Email wali line ko comment karo (abhi ke liye)
        // await transporter.sendMail({ ... });

        // Log activity
        await pool.query(
            `INSERT INTO activities (tenant_id, user_id, action, entity_type, created_at) 
             VALUES ($1, $2, $3, $4, NOW())`,
            [tenantId, req.userId, `Invited ${email} as ${role}`, 'User']
        );

        res.json({ 
            success: true, 
            message: `✅ Invitation recorded! Check console for details.` 
        });

    } catch (error) {
        console.error('❌ Invite Error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to send invitation' 
        });
    }
});

module.exports = router;