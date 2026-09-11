const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    },
    // ✅ Neon ke liye optimal settings
    max: 5,                          // Max 5 connections
    idleTimeoutMillis: 30000,        // 30 sec idle timeout
    connectionTimeoutMillis: 10000,  // 10 sec connection timeout
    keepAlive: true,                 // ✅ Keep connections alive
    keepAliveInitialDelayMillis: 10000,
});

// ✅ Handle unexpected errors (Neon sleep mode)
pool.on('error', (err) => {
    console.error('⚠️ Pool error (will recover):', err.message);
});

// ✅ Test connection with retry
const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await pool.query('SELECT NOW()');
            console.log('✅ Neon Database Connected');
            return true;
        } catch (err) {
            console.log(`⚠️ Connection attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) {
                console.error('❌ All connection attempts failed');
                return false;
            }
            // Wait 2 sec before retry
            await new Promise(r => setTimeout(r, 2000));
        }
    }
};

// Initial connection test
testConnection();

// ✅ Helper: Safe query with auto-retry
const safeQuery = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (err) {
        // Agar connection issue hai toh ek baar retry karo
        if (err.code === 'ECONNRESET' || err.code === 'ECONNREFUSED') {
            console.log('🔄 Reconnecting to Neon...');
            await new Promise(r => setTimeout(r, 1000));
            return await pool.query(text, params);
        }
        throw err;
    }
};

module.exports = pool;
module.exports.safeQuery = safeQuery;