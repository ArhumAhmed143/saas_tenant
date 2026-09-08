require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Checking Connection Details:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Password:', process.env.DB_PASSWORD ? '✅ Password set hai (hidden)' : '❌ Password missing!');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.connect()
    .then(client => {
        console.log('✅ SUCCESS! Database connected!');
        client.release();
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILED! Error:', err.message);
        process.exit(1);
    });