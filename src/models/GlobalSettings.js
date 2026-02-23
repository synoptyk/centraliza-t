const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'UNIQUE_CONFIG_DOCUMENT', unique: true }, // Simple singleton approach

    // Legal & Financial Constraints (Chile) - Vigentes 2026
    sueldoMinimo: { type: Number, default: 539000 },    // IMM Ley N°21.751
    topeImponibleAFP: { type: Number, default: 89.9 },  // UF - Sup. de Pensiones 2026
    topeImponibleAFC: { type: Number, default: 135.1 }, // UF - AFC Chile 2026

    // Employer Rates - Vigentes enero 2026
    sisRate: { type: Number, default: 1.54 },       // SIS 2026 - licitación AFP
    mutualBaseRate: { type: Number, default: 0.90 }, // Mutual Tasa Base %

    // Oficial Banco Central / SII Indicators (Cached from Mindicador API)
    ufValue: { type: Number, default: 0 },
    utmValue: { type: Number, default: 0 },
    dolarValue: { type: Number, default: 0 },
    lastIndicatorsUpdate: { type: Date, default: null }, // Last sync date

    // Fallback/Override Values (in case MIndicador API is down)
    manualUfValue: { type: Number, default: null },
    manualUtmValue: { type: Number, default: null },

    // AFP Rates Table - Tasas totales 2026 (10% + comisión) según Sup. de Pensiones
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
            'UNO': 10.46  // Actualizado: 0.46% comisión desde oct 2025
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
