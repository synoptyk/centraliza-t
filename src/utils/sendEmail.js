const { Resend } = require('resend');

// Initialize Resend with the provided API key (either from env or fallback for testing)
const resend = new Resend(process.env.RESEND_API_KEY || 're_YRQ7RQ3o_JN357m3Tt9kSiCLJZjnvbp1j');

const sendEmail = async (options) => {
    try {
        const fromEmail = options.from || process.env.FROM_EMAIL || 'soporte@synoptyk.cl';
        const fromName = options.fromName || process.env.FROM_NAME || 'Centraliza-T';

        console.log(`--- Resend API: Attempting to send email from ${fromEmail} to ${options.email} ---`);

        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [options.email],
            subject: options.subject,
            html: options.html, // Prioritize HTML if it exists
            text: options.message // Fallback text
        });

        if (error) {
            console.error('--- RESEND API ERROR:', error.message);
            throw new Error(`Resend API failed: ${error.message}`);
        }

        console.log('--- Message sent successfully via Resend:', data.id);
        return data;

    } catch (err) {
        console.error('--- UNEXPECTED EMAIL ERROR:', err.message);
        console.error('Stack:', err.stack);
        throw new Error(`Email sending failed: ${err.message}`);
    }
};

module.exports = sendEmail;
