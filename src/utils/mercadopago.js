const { MercadoPagoConfig } = require('mercadopago');

if (!process.env.MP_ACCESS_TOKEN) {
    console.warn('⚠️ MP_ACCESS_TOKEN no configurado en .env');
}

// Inicialización del cliente con el Token de Acceso
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN',
    options: {
        timeout: 5000
    }
});

module.exports = client;
