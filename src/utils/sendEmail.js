const nodemailer = require('nodemailer');
const Config = require('../models/Config');

const sendEmail = async (options) => {
    // 1. Try to fetch Dynamic Config from DB
    let smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.zoho.com',
        port: process.env.SMTP_PORT || 465,
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
        fromName: process.env.FROM_NAME || 'Centraliza-T'
    };

    try {
        const dbConfig = await Config.findOne();
        if (dbConfig && dbConfig.smtp && dbConfig.smtp.email && dbConfig.smtp.password) {
            console.log('--- SMTP: Using Database Configuration ---');
            smtpConfig = {
                host: dbConfig.smtp.host,
                port: dbConfig.smtp.port,
                user: dbConfig.smtp.email,
                pass: dbConfig.smtp.password,
                fromName: dbConfig.smtp.fromName
            };
        } else {
            console.log('--- SMTP: Using Environment Variables (DB Config not found/empty) ---');
        }
    } catch (err) {
        console.error('--- SMTP CONFIG ERROR:', err.message);
        // Fallback to env vars is already set
    }

    if (!smtpConfig.user || !smtpConfig.pass) {
        console.error('--- SMTP ERROR: Missing Credentials ---');
        console.error('User:', smtpConfig.user ? 'Set' : 'Missing');
        console.error('Pass:', smtpConfig.pass ? 'Set' : 'Missing');
        throw new Error('SMTP Credentials not configured');
    }

    const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: Number(smtpConfig.port) === 465, // true for 465, false for 587
        auth: {
            user: smtpConfig.user,
            pass: smtpConfig.pass
        },
        tls: {
            rejectUnauthorized: false // Helps with some hosting environments
        },
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 20000      // 20 seconds
    });

    const message = {
        from: `"${smtpConfig.fromName}" <${smtpConfig.user}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        console.log(`--- Attempting to send email to ${options.email} via ${smtpConfig.host}:${smtpConfig.port} ---`);
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('--- NODEMAILER ERROR:', error.message);
        console.error('Stack:', error.stack);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = sendEmail;
