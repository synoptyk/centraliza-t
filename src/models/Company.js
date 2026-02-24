const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true }, // For professional URLs
    rut: { type: String, required: true, unique: true },
    address: String,
    phone: String,
    email: String,
    web: String,
    industry: String,
    legalRepresentative: String, // Kept for backward compatibility or as main name
    logo: String,
    status: { type: String, enum: ['Pending', 'Active', 'Blocked', 'Suspended'], default: 'Pending' },
    country: { type: String, default: 'CL' },

    // --- New Fields ---
    businessLine: String, // Giro Comercial
    serviceMode: {
        type: String,
        enum: ['RECRUITMENT_ONLY', 'FULL_HR_360'],
        default: 'FULL_HR_360'
    },

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
