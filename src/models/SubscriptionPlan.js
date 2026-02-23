const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    priceUF: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['Mensual', 'Anual'],
        default: 'Mensual'
    },
    limits: {
        adminUsers: { type: Number, default: 5 },
        monthlyApplicants: { type: Number, default: 100 },
        projects: { type: Number, default: 10 },
        storageGB: { type: Number, default: 5 }
    },
    features: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    isTrial: {
        type: Boolean,
        default: false
    },
    targetAudience: {
        type: String,
        enum: ['agency', 'full_hr', 'both'],
        default: 'both'
    }
}, { timestamps: true });

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
