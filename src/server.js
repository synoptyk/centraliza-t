const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { startNotificationWorker } = require('./utils/notificationWorker');

dotenv.config();

// connectDB and worker start moved to server startup chain

const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configuración de orígenes permitidos
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5005',
    'https://centraliza-t.synoptyk.cl',
    'https://centraliza-t.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como apps móviles o curl)
        if (!origin) return callback(null, true);

        // Check if origin is in allowedOrigins or matches synoptyk.cl or vercel.app
        const isAllowed = allowedOrigins.some(ao => origin.startsWith(ao.replace(/\/$/, '')));
        const isOfficialDomain = origin.endsWith('synoptyk.cl') || origin.endsWith('vercel.app') || origin.includes('centraliza-t');
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

        if (isAllowed || isOfficialDomain || isLocalhost) {
            callback(null, true);
        } else {
            console.log('Bloqueado por CORS:', origin);
            callback(new Error('No permitido por CORS'));
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

// Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/applicants', require('./routes/applicantRoutes'));
app.use('/api/curriculum', require('./routes/curriculumRoutes'));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/companies', require('./routes/companyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

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
        const email = 'ceo@synoptyk.cl'; // Dedicated SuperAdmin Email
        const password = 'BarrientosJobsMosk';
        const name = 'SuperAdmin CEO';

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
seedAdmin();

app.get('/', (req, res) => {
    res.send('API Centraliza-T active');
});

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Connect to Database first, then start server
connectDB().then(() => {
    startNotificationWorker();

    // Nodemailer SMTP removed. Email delivery utilizes Resend HTTP API natively.

    server.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}).catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
});
