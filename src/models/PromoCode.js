const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    discountType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        default: 'Percentage'
    },
    discountValue: {
        type: Number,
        required: true
    },
    expiryDate: {
        type: Date
    },
    usageLimit: {
        type: Number,
        default: 100
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: String,
    applicablePlans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan'
    }]
}, { timestamps: true });

module.exports = mongoose.model('PromoCode', promoCodeSchema);
