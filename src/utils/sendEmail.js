const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zoho.com',
        port: process.env.SMTP_PORT || 465,
        secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false // Helps with some hosting environments
        }
    });

    const fromEmail = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const message = {
        from: `"${process.env.FROM_NAME || 'Centraliza-T'}" <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('--- NODEMAILER ERROR:', error);
        throw error;
    }
};

module.exports = sendEmail;
