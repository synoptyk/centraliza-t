const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

const configSchema = new mongoose.Schema({
    managers: [contactSchema],
    admins: [contactSchema],
    // SMTP Configuration (Dynamic)
    smtp: {
        host: { type: String, default: 'smtp.zoho.com' },
        port: { type: Number, default: 465 },
        email: { type: String, default: '' },
        password: { type: String, default: '' },
        fromName: { type: String, default: 'Soporte Centraliza-T' }
    }
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
