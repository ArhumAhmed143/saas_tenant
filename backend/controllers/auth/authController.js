const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../../config/db');

// ============================================
// REGISTER (Company OR Invited Member)
// ============================================
const register = async (req, res) => {
    try {
        const { name, email, password, organizationName, inviteToken } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // ========== CHECK IF INVITE TOKEN EXISTS ==========
        if (inviteToken) {
            const inviteRes = await pool.query(
                `SELECT * FROM invites 
                 WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`,
                [inviteToken]
            );

            if (inviteRes.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid or expired invite token' });
            }

            const invite = inviteRes.rows[0];

            if (invite.email.toLowerCase() !== email.toLowerCase()) {
                return res.status(400).json({ message: 'Email does not match the invite' });
            }

            const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (existingUser.rows.length > 0) {
                return res.status(400).json({ message: 'Email already registered' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const userRes = await pool.query(
                `INSERT INTO users (tenant_id, name, email, password_hash, role) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id, name, email, role, tenant_id`,
                [invite.tenant_id, name, email, hashedPassword, invite.role]
            );

            await pool.query(
                'UPDATE invites SET status = $1 WHERE id = $2',
                ['accepted', invite.id]
            );

            await pool.query(
                `INSERT INTO activities (tenant_id, user_id, action, entity_type) 
                 VALUES ($1, $2, $3, $4)`,
                [invite.tenant_id, userRes.rows[0].id, `${name} joined as ${invite.role}`, 'User']
            );

            console.log(`✅ ${email} joined as ${invite.role}`);

            return res.status(201).json({
                success: true,
                message: `Welcome! You joined as ${invite.role}`,
                user: userRes.rows[0],
                tenantId: invite.tenant_id
            });
        }

        // ========== NORMAL REGISTRATION (Company create) ==========
        if (!organizationName) {
            return res.status(400).json({ message: 'Organization name is required' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const slug = organizationName.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        const existingTenant = await pool.query('SELECT * FROM tenants WHERE slug = $1', [slug]);
        if (existingTenant.rows.length > 0) {
            return res.status(400).json({ message: 'Organization name already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('BEGIN');
        const tenantRes = await pool.query(
            'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id',
            [organizationName, slug]
        );
        const tenantId = tenantRes.rows[0].id;

        const userRes = await pool.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, role`,
            [tenantId, name, email, hashedPassword, 'Admin']
        );

        await pool.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Account created successfully!',
            user: userRes.rows[0],
            tenantId: tenantId
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Register Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================
// PLATFORM OWNER REGISTRATION (No Tenant)
// ============================================
const registerPlatformOwner = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userRes = await pool.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, name, email, role, tenant_id`,
            [null, name, email, hashedPassword, 'PlatformOwner']
        );

        console.log(`👑 New Platform Owner registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Platform Owner account created successfully!',
            user: userRes.rows[0],
            tenantId: null
        });

    } catch (error) {
        console.error('Platform Owner Register Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const userRes = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND is_active = true',
            [email]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = userRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const accessToken = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        await pool.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

        res.json({
            success: true,
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================
// REFRESH TOKEN
// ============================================
const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(401).json({ message: 'Refresh token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const userRes = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND refresh_token = $2 AND is_active = true',
            [decoded.userId, token]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = userRes.rows[0];
        const newAccessToken = jwt.sign(
            { userId: user.id, tenantId: user.tenant_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ accessToken: newAccessToken });

    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;
        if (token) {
            await pool.query('UPDATE users SET refresh_token = NULL WHERE refresh_token = $1', [token]);
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ============================================
// FORGOT PASSWORD
// ============================================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        console.log('📧 Forgot password request for:', email);

        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
        }

        const user = userRes.rows[0];

        const resetToken = jwt.sign(
            { userId: user.id },
            process.env.JWT_RESET_SECRET,
            { expiresIn: '1h' }
        );

        await pool.query(
            'UPDATE users SET reset_token = $1, reset_token_expiry = NOW() + INTERVAL \'1 hour\' WHERE id = $2',
            [resetToken, user.id]
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

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
                from: `"SaaS Platform" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Password Reset Request',
                html: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
  </div>
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
    <p style="font-size: 16px; color: #0f172a; line-height: 1.6;">
      Hello <strong>${user.name || 'User'}</strong>,
    </p>
    <p style="font-size: 16px; color: #0f172a; line-height: 1.6;">
      Aap ne password reset request ki hai. Neeche button click karke naya password set karein.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="display: inline-block; padding: 14px 40px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        🔑 Reset Password
      </a>
    </div>
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="font-size: 12px; color: #94a3b8; text-align: center;">
      Yeh link 1 ghante mein expire ho jayega. Agar aap ne request nahi ki, toh ignore karein.
    </p>
  </div>
</div>
                `
            });

            console.log('========================================');
            console.log('📧 PASSWORD RESET EMAIL SENT via Gmail SMTP');
            console.log('   To:', email);
            console.log('   Message ID:', info.messageId);
            console.log('   Reset Link:', resetLink);
            console.log('========================================');

        } catch (emailError) {
            console.error('❌ Gmail SMTP Error:', emailError.message);
            console.log('🔗 Reset Link (debug):', resetLink);
        }

        res.json({ 
            success: true, 
            message: '✅ Reset link sent to your email inbox!'
        });

    } catch (error) {
        console.error('❌ Forgot Password Error:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

// ============================================
// RESET PASSWORD
// ============================================
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const userId = decoded.userId;

        const userRes = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND reset_token = $2 AND reset_token_expiry > NOW()',
            [userId, token]
        );

        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await pool.query(
            'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
            [hashedPassword, userId]
        );

        res.json({ success: true, message: '✅ Password reset successfully. You can now login with your new password.' });

    } catch (error) {
        console.error('❌ Reset Password Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    register,
    registerPlatformOwner,
    login,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};
