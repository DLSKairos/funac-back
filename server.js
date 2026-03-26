require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const { generalLimiter } = require('./src/middlewares/rateLimiter');
const errorHandler = require('./src/middlewares/errorHandler');

// Rutas publicas
const authRoutes = require('./src/routes/auth.routes');
const homeRoutes = require('./src/routes/home.routes');
const volunteersRoutes = require('./src/routes/volunteers.routes');
const contactRoutes = require('./src/routes/contact.routes');
const donationsRoutes = require('./src/routes/donations.routes');
const pagesRoutes = require('./src/routes/pages.routes');
const settingsRoutes = require('./src/routes/settings.routes');

// Rutas admin
const adminDashboardRoutes = require('./src/routes/admin/dashboard.routes');
const adminContentRoutes = require('./src/routes/admin/content.routes');
const adminVolunteersRoutes = require('./src/routes/admin/volunteers.routes');
const adminDonationsRoutes = require('./src/routes/admin/donations.routes');
const adminSettingsRoutes = require('./src/routes/admin/settings.routes');
const adminPagesRoutes = require('./src/routes/admin/pages.routes');
const adminLogsRoutes = require('./src/routes/admin/logs.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ---- CORS ----
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
if (process.env.ADMIN_URL && process.env.ADMIN_URL !== process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.ADMIN_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej: Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origen no permitido: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ---- SEGURIDAD ----
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ---- BODY PARSING ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---- RATE LIMITING GLOBAL ----
app.use(generalLimiter);

// ---- ARCHIVOS ESTATICOS ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- HEALTH CHECK ----
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---- RUTAS API PUBLICAS ----
app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/settings', settingsRoutes);

// ---- RUTAS API ADMIN ----
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin', adminContentRoutes);
app.use('/api/admin/volunteers', adminVolunteersRoutes);
app.use('/api/admin/donations', adminDonationsRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/pages', adminPagesRoutes);
app.use('/api/admin/config', adminSettingsRoutes);
app.use('/api/admin/logs', adminLogsRoutes);

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

// ---- MANEJO GLOBAL DE ERRORES ----
app.use(errorHandler);

// ---- INICIO DEL SERVIDOR ----
app.listen(PORT, () => {
  console.log(`Servidor FUNAC corriendo en puerto ${PORT} [${NODE_ENV}]`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
