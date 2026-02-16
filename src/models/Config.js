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
    admins: [contactSchema]
}, { timestamps: true });

const Config = mongoose.model('Config', configSchema);

module.exports = Config;
