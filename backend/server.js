const inviteRoutes = require('./routes/invite');
const burndownRoutes = require('./routes/burndown');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 5000;

// ===== SESSION MIDDLEWARE =====
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// ===== PASSPORT INITIALIZE =====
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/invite', inviteRoutes);
app.use('/api/burndown', burndownRoutes);


// ===== CORS + JSON =====
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// ========== IMPORT ROUTES ==========
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const sprintRoutes = require('./routes/sprints');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const activityRoutes = require('./routes/activities');
const socialRoutes = require('./routes/social');
const departmentRoutes = require('./routes/departments'); // 🆕 DEPARTMENTS
const teamRoutes = require('./routes/teams'); // 🆕 TEAMS

// ========== USE ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/departments', departmentRoutes); // 🆕 DEPARTMENTS ROUTE
app.use('/api/teams', teamRoutes); // 🆕 TEAMS ROUTE
app.use('/auth', socialRoutes);

app.get('/', (req, res) => {
    res.send('🚀 SaaS Backend is running!');
});

// ===== SWAGGER SETUP =====
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

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
});