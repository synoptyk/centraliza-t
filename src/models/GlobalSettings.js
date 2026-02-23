const mongoose = require('mongoose');

const globalSettingsSchema = new mongoose.Schema({
    id: { type: String, default: 'UNIQUE_CONFIG_DOCUMENT', unique: true },

    // ============================================================
    // 🟢 INDICADORES ANUALES (Actualizados cada 1 enero)
    //    Fuente: Superintendencia de Pensiones, DT, SII
    // ============================================================
    sueldoMinimo: { type: Number, default: 539000 },    // IMM Ley N°21.751 (2026)
    topeImponibleAFP: { type: Number, default: 89.9 },  // UF - Sup. de Pensiones 2026
    topeImponibleAFC: { type: Number, default: 135.1 }, // UF - AFC Chile 2026
    sisRate: { type: Number, default: 1.54 },           // SIS 2026 - licitación AFP
    mutualBaseRate: { type: Number, default: 0.90 },    // Mutual Tasa Base %

    // AFP Rates Table - Tasas totales (10% legal + comisión) Sup. de Pensiones
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
            'UNO': 10.46
        }
    },

    // ============================================================
    // 🟡 INDICADORES MENSUALES (Actualizados mensualmente)
    //    Fuente: Banco Central via mindicador.cl
    // ============================================================
    utmValue: { type: Number, default: 0 },      // Unidad Tributaria Mensual
    ipcValue: { type: Number, default: 0 },       // Índice de Precios al Consumidor (%)
    tpmValue: { type: Number, default: 0 },       // Tasa de Política Monetaria (%)
    imacecValue: { type: Number, default: 0 },    // IMACEC mensual (%)

    // ============================================================
    // 🔴 INDICADORES DIARIOS (Actualizados cada día hábil)
    //    Fuente: Banco Central via mindicador.cl
    // ============================================================
    ufValue: { type: Number, default: 0 },        // Unidad de Fomento
    dolarValue: { type: Number, default: 0 },     // Dólar Observado
    euroValue: { type: Number, default: 0 },      // Euro
    bitcoinValue: { type: Number, default: 0 },   // Bitcoin (CLP)
    libraCobre: { type: Number, default: 0 },     // Libra de Cobre (USD)

    // Override manual (cuando la API falla o el CEO quiere fijar un valor)
    manualUfValue: { type: Number, default: null },
    manualUtmValue: { type: Number, default: null },

    // ============================================================
    // 🕐 TIMESTAMPS DE SINCRONIZACIÓN MULTI-FRECUENCIA
    // ============================================================
    lastDailySync: { type: Date, default: null },        // Último sync diario
    lastMonthlySync: { type: Date, default: null },      // Último sync mensual
    lastAnnualCheck: { type: Date, default: null },      // Último check anual
    lastAnnualUpdate: { type: Date, default: null },     // Última actualización anual efectiva
    lastIndicatorsUpdate: { type: Date, default: null }, // Backward compat
    annualUpdateRequired: { type: Boolean, default: false }, // Alerta de nuevo año

}, { timestamps: true });

module.exports = mongoose.model('GlobalSettings', globalSettingsSchema);
