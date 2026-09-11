const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();

// ============================================
// ENVIRONMENT VARIABLES (Production Ready)
// ============================================
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ============================================
// SIRF GOOGLE OAUTH STRATEGY
// ============================================
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BACKEND_URL}/auth/google/callback`,
    scope: ['profile', 'email']
},
async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName || 'Google User';

        if (!email) {
            return done(null, false, { message: 'No email found' });
        }

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length > 0) {
            return done(null, userCheck.rows[0]);
        }

        const tenantName = `${name}'s Company`;
        const slug = `company-${Date.now()}`;

        await pool.query('BEGIN');
        const tenantRes = await pool.query(
            'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id',
            [tenantName, slug]
        );
        const tenantId = tenantRes.rows[0].id;

        const userRes = await pool.query(
            `INSERT INTO users (tenant_id, name, email, password_hash, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [tenantId, name, email, 'social_login', 'Admin']
        );
        await pool.query('COMMIT');

        return done(null, userRes.rows[0]);

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Google Strategy Error:', error);
        return done(error, null);
    }
}));

// ============================================
// PASSPORT SERIALIZATION
// ============================================
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0] || null);
    } catch (error) {
        done(error, null);
    }
});

// ============================================
// SIRF GOOGLE ROUTES
// ============================================
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
        session: true
    }),
    (req, res) => {
        const user = req.user;
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

        res.redirect(
            `${FRONTEND_URL}/auth-callback?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${user.email}&role=${user.role}&tenantId=${user.tenant_id}`
        );
    }
);

module.exports = router;