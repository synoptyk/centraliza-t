const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail');

// @desc    Handle "Contact Executive" lead requests
// @route   POST /api/auth/contact-lead
// @access  Public
const handleContactLead = asyncHandler(async (req, res) => {
    const { companyName, fullName, email, phone } = req.body;

    if (!companyName || !fullName || !email || !phone) {
        res.status(400);
        throw new Error('Por favor, completa todos los campos del formulario.');
    }

    // 1. Send internal notification to Sales Team
    const salesEmailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #333;">
            <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">Nueva Solicitud de Demo / Contacto</h2>
            <p>Se ha recibido un nuevo lead desde la Landing Page de Centraliza-T:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 10px; font-weight: bold; width: 150px; border-bottom: 1px solid #f3f4f6;">Empresa:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${companyName}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Nombre:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${fullName}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Email:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Celular:</td>
                    <td style="padding: 10px; border-bottom: 1px solid #f3f4f6;">${phone}</td>
                </tr>
            </table>
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
                Este correo fue generado automáticamente por el Ecosistema Centraliza-T.
            </p>
        </div>
    `;

    await sendEmail({
        from: 'centraliza-t@synoptyk.cl',
        fromName: 'Centraliza-T',
        email: 'centraliza-t@synoptyk.cl',
        subject: `Nuevo Lead: ${companyName} - Solicitud de Ejecutivo`,
        html: salesEmailHtml
    });

    // 2. Send confirmation to the Client
    const clientEmailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #eee; border-radius: 20px; color: #1e293b; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; margin: 0; font-size: 24px; text-transform: uppercase;">Centraliza-t</h1>
                <p style="font-size: 12px; color: #64748b; margin-top: 5px;">Un desarrollo de Empresa Synoptyk</p>
            </div>
            
            <p>Hola <strong>${fullName}</strong>,</p>
            
            <p>Hemos recibido tu solicitud para contactar con un ejecutivo de nuestro ecosistema <strong>Centraliza-t</strong> de la empresa <strong>${companyName}</strong>.</p>
            
            <p>Queremos agradecerte por tu interés en nuestra plataforma. Un ejecutivo comercial se pondrá en contacto contigo a la brevedad para agendar una sesión personalizada y explicarte cómo podemos potenciar la gestión de tu empresa.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-weight: bold; color: #4f46e5;">Gracias por querer centralizar-t</p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                &copy; 2026 Empresa Synoptyk. Todos los derechos reservados.<br>
                Santiago, Chile.
            </p>
        </div>
    `;

    await sendEmail({
        from: 'centraliza-t@synoptyk.cl',
        fromName: 'Centraliza-T',
        email: email,
        subject: 'Hemos recibido tu solicitud - Centraliza-t',
        html: clientEmailHtml
    });

    res.status(200).json({
        success: true,
        message: 'Solicitud enviada con éxito'
    });
});

module.exports = { handleContactLead };
