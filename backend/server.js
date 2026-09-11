const express = require('express');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== 1. MIDDLEWARE FIRST ==========
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// ========== 2. IMPORT ALL ROUTES ==========
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const sprintRoutes = require('./routes/sprints');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const socialRoutes = require('./routes/social');
const departmentRoutes = require('./routes/departments');
const teamRoutes = require('./routes/teams');
const epicRoutes = require('./routes/epics');
const burndownRoutes = require('./routes/burndown');
const tenantRoutes = require('./routes/tenants');
const platformRoutes = require('./routes/platform');
const notificationRoutes = require('./routes/notifications');
const inviteRoutes = require('./routes/invite');          // 🆕 INVITE
const commentRoutes = require('./routes/comments');        // 🆕 COMMENTS (agar bani hai)
const subtaskRoutes = require('./routes/subtasks');        // 🆕 SUBTASKS (agar bani hai)

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
app.use('/api/tenants', tenantRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/invite', inviteRoutes);                      // 🆕 INVITE ROUTE
app.use('/api/comments', commentRoutes);                   // 🆕 COMMENTS
app.use('/api/subtasks', subtaskRoutes);                   // 🆕 SUBTASKS
app.use('/auth', socialRoutes);

// ========== 4. ROOT ROUTE ==========
app.get('/', (req, res) => {
    res.send('🚀 SaaS Backend is running!');
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
        servers: [{ url: `http://localhost:${PORT}` }],
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
    apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ========== 6. SERVER START ==========
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
});