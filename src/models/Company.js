const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    address: String,
    phone: String,
    email: String,
    web: String,
    industry: String,
    legalRepresentative: String, // Kept for backward compatibility or as main name
    logo: String,
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },

    // --- New Fields ---
    businessLine: String, // Giro Comercial

    // Legal Representatives (Array)
    legalRepresentatives: [{
        rut: String,
        name: String,
        email: String,
        phone: String
    }],

    // Commercial Contacts (Array)
    commercialContacts: [{
        name: String,
        phone: String,
        email: String
    }],

    // Contract Details
    contractStartDate: Date,
    contractDurationMonths: Number,
    contractEndDate: Date, // Calculated
    contractedUsersLimit: { type: Number, default: 5 }, // Editable by CEO only
    userValueUF: Number,
    monthlyTotalUF: Number,

    modules: [{
        name: String,
        actions: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
