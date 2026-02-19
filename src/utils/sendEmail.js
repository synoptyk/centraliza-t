const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Use strictly Environment Variables
    let smtpConfig = {
        host: process.env.SMTP_HOST || 'smtppro.zoho.com',
        port: process.env.SMTP_PORT || 465,
        user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
        fromName: process.env.FROM_NAME || 'Centraliza-T'
    };

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
        connectionTimeout: 30000, // 30 seconds
        greetingTimeout: 30000,   // 30 seconds
        socketTimeout: 40000      // 40 seconds
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
