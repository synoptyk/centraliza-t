const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        unique: true,
        index: true
    },
    planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubscriptionPlan',
        required: true
    },
    status: {
        type: String,
        enum: ['Trial', 'Active', 'Overdue', 'Cancelled', 'Pending'],
        default: 'Trial'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    nextBillingDate: {
        type: Date
    },
    autoRenew: {
        type: Boolean,
        default: true
    },
    paymentMethod: {
        type: String,
        enum: ['MercadoPago', 'Transbank', 'Transferencia', 'OC', 'None'],
        default: 'None'
    },
    paymentProofUrl: String,
    lastPaymentAmount: Number,
    lastPaymentDate: Date,
    transactionHistory: [{
        transactionId: String,
        amount: Number,
        date: { type: Date, default: Date.now },
        status: String,
        method: String
    }],
    discount: {
        type: Number, // Percentage 0-100
        default: 0
    },
    promoCode: String
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
