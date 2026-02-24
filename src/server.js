const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startNotificationWorker } = require('./utils/notificationWorker');
const { startIndicatorSyncWorker, runManualSync } = require('./utils/indicatorSyncService');
const { runVacationAccrualSync } = require('./utils/vacationWorker');
const { globalLimiter, authLimiter } = require('./middleware/rateLimiter');

dotenv.config();

// connectDB and worker start moved to server startup chain

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Trust Proxy for Render/Vercel (Necessary for Rate Limiting)
app.set('trust proxy', 1);

// Configuración de orígenes permitidos (Producción)
const allowedOrigins = [
    'https://centraliza-t.synoptyk.cl',
    'https://centraliza-t.vercel.app',
    'https://centraliza-t.onrender.com',
    'https://centralizat.cl',
    process.env.FRONTEND_URL,
    'http://localhost:3000' // Mantener para debugging local controlado
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como apps móviles o curl)
        if (!origin) return callback(null, true);

        // Validar contra lista fija o subdominios oficiales
        const isOfficial = allowedOrigins.some(ao => origin === ao.replace(/\/$/, '')) ||
            origin.endsWith('.synoptyk.cl') ||
            origin.endsWith('.vercel.app');

        if (isOfficial) {
            callback(null, true);
        } else {
            console.warn('CORS Blocked Origin:', origin);
            callback(new Error('Acceso no permitido por política CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

// Socket.IO con CORS
const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith('synoptyk.cl') || origin.endsWith('vercel.app')) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS for Sockets'));
            }
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// ... Socket.IO Logic ... (mantener lógica existente)
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);
    });

    socket.on('send_message', (data) => {
        socket.to(data.room).emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Debugging Routes
app.use((req, res, next) => {
    console.log(`--- [DEBUG] ${req.method} ${req.url} ---`);
    next();
});

// Rate Limiting
app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.get('/api/ping', (req, res) => res.json({ message: 'pong', time: new Date() }));
app.use('/api/applicants', require('./routes/applicantRoutes'));
app.use('/api/curriculum', require('./routes/curriculumRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/professionals', require('./routes/professionalRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/config', require('./routes/configRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/vacations', require('./routes/vacationRoutes'));
app.use('/api/records', require('./routes/recordRoutes'));
app.use('/api/exports', require('./routes/exportRoutes'));
app.use('/api/finiquitos', require('./routes/finiquitoRoutes'));

// Diagnostic Route for Email
const sendEmail = require('./utils/sendEmail');
app.post('/api/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        console.log(`--- SMTP DIAGNOSTIC: Testing with ${email} ---`);
        await sendEmail({
            email,
            subject: 'Prueba de Conexión SMTP - CENTRALIZA-T',
            message: 'Si recibes este correo, la configuración SMTP es correcta.',
            html: '<h1>Prueba Exitosa</h1><p>El sistema de correos está funcionando con Zoho.</p>'
        });
        res.json({ success: true, message: 'Email enviado con éxito' });
    } catch (error) {
        console.error('--- SMTP DIAGNOSTIC FAIL:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar email',
            error: error.message,
            code: error.code
        });
    }
});

// Auto-Seeding SuperAdmin and Migration
const User = require('./models/User');
const seedAdmin = async () => {
    try {
        const email = process.env.SEED_ADMIN_EMAIL || 'ceo@synoptyk.cl';
        const password = process.env.SEED_ADMIN_PASSWORD || 'BarrientosJobsMosk';
        const name = process.env.SEED_ADMIN_NAME || 'SuperAdmin CEO';

        let admin = await User.findOne({ email });

        if (!admin) {
            await User.create({
                name,
                email,
                password,
                role: 'Ceo_Centralizat'
            });
            console.log('--- SEED: SuperAdmin created successfully with email: ' + email);
        } else {
            // Ensure powers are always correct for this specific email
            admin.role = 'Ceo_Centralizat';

            // Only update and hash if the password doesn't match
            const passwordMatch = await admin.matchPassword(password);
            if (!passwordMatch) {
                admin.password = password;
                await admin.save();
                console.log('--- SEED: SuperAdmin Credentials Synchronized ---');
            } else {
                await admin.save(); // Still save to update role or timestamps if needed
                console.log('--- SEED: God-Level Access verified for ' + email);
            }
        }
    } catch (error) {
        console.error('--- SEED ERROR:', error.message);
    }
};
// 177: seedAdmin call removed from here to move inside connectDB.then()

// Servir archivos estáticos del frontend React en producción
const path = require('path');
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '..', 'build')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API Centraliza-T active (development mode)');
    });
}

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

// Connect to Database first, then start server
connectDB().then(async () => {
    // START SERVICES ONLY AFTER SUCCESSFUL DB CONNECTION
    console.log('--- DATABASE CONNECTION VERIFIED ---');

    // Seed admin if needed
    await seedAdmin();

    // Start workers
    startNotificationWorker();
    startIndicatorSyncWorker(); // 🔴🟡🟢 Living Indicators Ecosystem

    // 🏖️ Vacation Accrual Sync — runs every 7 days
    // NOTE: 30 days in ms (2,592,000,000) overflows Node's 32-bit setInterval limit.
    // Running weekly is safe and still keeps balances accurate.
    runVacationAccrualSync().catch(e => console.error('Initial vacation sync error:', e.message));
    setInterval(() => {
        runVacationAccrualSync().catch(e => console.error('Vacation sync error:', e.message));
    }, 7 * 24 * 60 * 60 * 1000); // 7 days (604,800,000ms — within 32-bit limit)

    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}).catch((err) => {
    console.error('CRITICAL: Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
