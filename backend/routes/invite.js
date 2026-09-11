const express = require('express');
const crypto = require('crypto');
const pool = require('../config/db');
const auth = require('../middleware/auth');
const router = express.Router();

// ============================================
// SEND INVITE (Sirf Admin/Manager)
// Yeh naya invite create karta hai + token generate karta hai
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { email, role } = req.body;

        // Validate
        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        if (!['Admin', 'Manager', 'Employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Sirf Admin/Manager invite kar sakte hain
        if (req.role !== 'Admin' && req.role !== 'Manager') {
            return res.status(403).json({ message: 'Only Admin or Manager can invite members' });
        }

        // Check karo ke yeh email already is tenant mein hai ya nahi
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
            [email, req.tenantId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                message: `Yeh email already aap ki company mein member hai` 
            });
        }

        // Check karo ke koi pending invite already exist karta hai ya nahi
        const existingInvite = await pool.query(
            `SELECT id FROM invites 
             WHERE email = $1 AND tenant_id = $2 
             AND status = 'pending' AND expires_at > NOW()`,
            [email, req.tenantId]
        );

        if (existingInvite.rows.length > 0) {
            return res.status(400).json({ 
                message: 'Is email ka invite already pending hai' 
            });
        }

        // Unique token generate karo
        const token = crypto.randomBytes(32).toString('hex');

        // 7 din baad expire hoga
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // Insert invite
        const result = await pool.query(
            `INSERT INTO invites (tenant_id, invited_by, email, role, token, expires_at) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [req.tenantId, req.userId, email, role, token, expiresAt]
        );

        // Tenant name nikalo
        const tenantRes = await pool.query('SELECT name FROM tenants WHERE id = $1', [req.tenantId]);
        const tenantName = tenantRes.rows[0]?.name || 'Company';

        // Invite link banao
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/register?invite=${token}`;

        // Activity log
        await pool.query(
            `INSERT INTO activities (tenant_id, user_id, action, entity_type) 
             VALUES ($1, $2, $3, $4)`,
            [req.tenantId, req.userId, `Invited ${email} as ${role}`, 'Invite']
        );

        console.log('========================================');
        console.log('📨 INVITE CREATED');
        console.log('   Email:', email);
        console.log('   Role:', role);
        console.log('   Company:', tenantName);
        console.log('   🔗 Invite Link:');
        console.log('   ' + inviteLink);
        console.log('========================================');

        res.status(201).json({
            success: true,
            message: `Invite sent to ${email} as ${role}`,
            inviteLink: inviteLink,
            invite: result.rows[0]
        });

    } catch (error) {
        console.error('❌ Invite Error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// ============================================
// GET INVITE DETAILS (Public - Register page ke liye)
// ============================================
router.get('/details/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const result = await pool.query(
            `SELECT i.*, t.name as tenant_name 
             FROM invites i
             JOIN tenants t ON i.tenant_id = t.id
             WHERE i.token = $1 
             AND i.status = 'pending' 
             AND i.expires_at > NOW()`,
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                message: 'Invite invalid ya expire ho gaya hai' 
            });
        }

        const invite = result.rows[0];

        res.json({
            email: invite.email,
            role: invite.role,
            tenantName: invite.tenant_name,
            tenantId: invite.tenant_id,
            expiresAt: invite.expires_at
        });

    } catch (error) {
        console.error('❌ Get Invite Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// GET PENDING INVITES (Sirf apne tenant ke)
// ============================================
router.get('/', auth, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT i.*, u.name as invited_by_name 
             FROM invites i
             LEFT JOIN users u ON i.invited_by = u.id
             WHERE i.tenant_id = $1 
             ORDER BY i.created_at DESC`,
            [req.tenantId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Get Invites Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// CANCEL INVITE (Sirf Admin)
// ============================================
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admin can cancel invites' });
        }

        const result = await pool.query(
            `DELETE FROM invites 
             WHERE id = $1 AND tenant_id = $2 
             RETURNING *`,
            [req.params.id, req.tenantId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        res.json({ message: 'Invite cancelled successfully' });
    } catch (error) {
        console.error('❌ Delete Invite Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;