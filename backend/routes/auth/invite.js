const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../../config/db');
const auth = require('../../middleware/auth');
const router = express.Router();

// ============================================
// SEND INVITE (Sirf Admin/Manager)
// ============================================
router.post('/', auth, async (req, res) => {
    try {
        const { email, role } = req.body;

        if (!email || !role) {
            return res.status(400).json({ message: 'Email and role are required' });
        }

        if (!['Admin', 'Manager', 'Employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (req.role !== 'Admin' && req.role !== 'Manager') {
            return res.status(403).json({ message: 'Only Admin or Manager can invite members' });
        }

        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1 AND tenant_id = $2',
            [email, req.tenantId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ 
                message: `Yeh email already aap ki company mein member hai` 
            });
        }

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

        const token = crypto.randomBytes(32).toString('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const result = await pool.query(
            `INSERT INTO invites (tenant_id, invited_by, email, role, token, expires_at) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [req.tenantId, req.userId, email, role, token, expiresAt]
        );

        const tenantRes = await pool.query('SELECT name FROM tenants WHERE id = $1', [req.tenantId]);
        const tenantName = tenantRes.rows[0]?.name || 'Company';

        const senderRes = await pool.query('SELECT name FROM users WHERE id = $1', [req.userId]);
        const senderName = senderRes.rows[0]?.name || 'A team member';

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/register?invite=${token}`;

        await pool.query(
            `INSERT INTO activities (tenant_id, user_id, action, entity_type) 
             VALUES ($1, $2, $3, $4)`,
            [req.tenantId, req.userId, `Invited ${email} as ${role}`, 'Invite']
        );

        // ========== GMAIL SMTP EMAIL ==========
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            const info = await transporter.sendMail({
                from: `"${tenantName}" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: `📨 Invitation to join ${tenantName}`,
                html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚀 You're Invited!</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
    <p style="font-size: 16px; color: #0f172a; line-height: 1.6;">
      Hello,
    </p>
    <p style="font-size: 16px; color: #0f172a; line-height: 1.6;">
      <strong>${senderName}</strong> has invited you to join <strong style="color: #4f46e5;">${tenantName}</strong> as a <strong style="color: #4f46e5;">${role}</strong>.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteLink}" style="display: inline-block; padding: 14px 40px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        ✨ Create Your Account
      </a>
    </div>
    
    <p style="font-size: 14px; color: #64748b;">
      Already have an account? <a href="${frontendUrl}/login" style="color: #4f46e5;">Sign in here</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
      Yeh link 7 din mein expire ho jayegi. Sent from ${tenantName} via SaaS Platform
    </p>
  </div>
</div>
                `
            });

            console.log('========================================');
            console.log('📧 INVITE EMAIL SENT via Gmail SMTP');
            console.log('   To:', email);
            console.log('   Role:', role);
            console.log('   Company:', tenantName);
            console.log('   Message ID:', info.messageId);
            console.log('   Invite Link:', inviteLink);
            console.log('========================================');

        } catch (emailError) {
            console.error('❌ Gmail SMTP Error:', emailError.message);
            console.log('🔗 Invite Link (debug):', inviteLink);
        }

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