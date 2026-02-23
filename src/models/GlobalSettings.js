const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'UNIQUE_CONFIG_DOCUMENT', unique: true }, // Simple singleton approach

    // Legal & Financial Constraints (Chile)
    sueldoMinimo: { type: Number, default: 539000 },
    topeImponibleAFP: { type: Number, default: 84.3 }, // in UF
    topeImponibleAFC: { type: Number, default: 126.6 }, // in UF

    // Employer Rates
    sisRate: { type: Number, default: 1.49 }, // Seguro de Invalidez y Sobrevivencia %
    mutualBaseRate: { type: Number, default: 0.90 }, // Mutual accident base rate %

    // Fallback/Override Values (in case MIndicador API is down or User wants fixed rates for a period)
    manualUfValue: { type: Number, default: null }, // e.g. 38500
    manualUtmValue: { type: Number, default: null }, // e.g. 65000

    // AFP Rates Table
    afpRates: {
        type: Map,
        of: Number,
        default: {
            'Capital': 11.44,
            'Cuprum': 11.44,
            'Habitat': 11.27,
            'PlanVital': 11.16,
            'Provida': 11.45,
            'Modelo': 10.58,
            'UNO': 10.69
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
