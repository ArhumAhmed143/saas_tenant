const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5000;

// ========== 1. MIDDLEWARE FIRST ==========
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://saas-tenant.onrender.com',              // 👈 backend ka URL
    'https://saas-tenant-frontend.onrender.com',     // 👈 frontend ka URL (NAYA)
    process.env.FRONTEND_URL                          // 👈 ya env se
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());



// ========== 2. IMPORT ALL ROUTES ==========
const authRoutes = require('./routes/auth/auth');
const inviteRoutes = require('./routes/auth/invite');
const platformRoutes = require('./routes/platform/platform');
const tenantsRoutes = require('./routes/tenant/tenants');
const tenantRoutes = require('./routes/tenant/tenant');
const userRoutes = require('./routes/tenant/users');
const departmentRoutes = require('./routes/tenant/departments');
const projectRoutes = require('./routes/work/projects');
const sprintRoutes = require('./routes/work/sprints');
const taskRoutes = require('./routes/work/tasks');
const subtaskRoutes = require('./routes/work/subtasks');
const epicRoutes = require('./routes/work/epics');
const commentRoutes = require('./routes/work/comments');
const burndownRoutes = require('./routes/work/burndown');
const teamRoutes = require('./routes/teams/teams');
const activityRoutes = require('./routes/activity/activities');
const notificationRoutes = require('./routes/activity/notifications');

// ========== 3. USE ALL ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/epics', epicRoutes);
app.use('/api/burndown', burndownRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/organizations', tenantsRoutes);
app.use('/api/organization', tenantRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/subtasks', subtaskRoutes);

// ========== 4. ROOT ROUTE ==========
app.get('/', (req, res) => {
    res.send('🚀 SaaS Backend is running!');
});

// ========== 4.1 HEALTH CHECK ROUTE (UptimeRobot ke liye) ==========
app.get('/health', async (req, res) => {
    try {
        const pool = require('./config/db');
        await pool.query('SELECT 1');
        res.status(200).json({
            status: 'ok',
            db: 'connected',
            time: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            db: 'disconnected',
            message: err.message
        });
    }
});
// ========== 5. SWAGGER SETUP ==========
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Multi-Tenant SaaS API',
            version: '1.0.0',
        },
        servers: [{ url: process.env.BACKEND_URL || `http://localhost:${PORT}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./routes/**/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ========== 6. SERVER START ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📚 Swagger Docs available at /api-docs`);
});