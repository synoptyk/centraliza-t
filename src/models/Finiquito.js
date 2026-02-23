const mongoose = require('mongoose');

const finiquitoSchema = new mongoose.Schema({
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant',
        required: true,
        index: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Causal de Desvinculación (Art. 159-161 Código del Trabajo Chile)
    causal: {
        type: String,
        enum: [
            'Art. 159 N°1 - Mutuo acuerdo',
            'Art. 159 N°2 - Renuncia del trabajador',
            'Art. 159 N°4 - Vencimiento del plazo',
            'Art. 159 N°5 - Conclusión del trabajo o servicio',
            'Art. 160 N°1 - Falta de probidad / Conducta indebida',
            'Art. 160 N°3 - No concurrencia sin causa justificada',
            'Art. 160 N°7 - Incumplimiento grave de obligaciones',
            'Art. 161 - Necesidades de la empresa',
            'Art. 161 bis - Desahucio (trabajador de confianza)',
            'Art. 163 bis - Quiebra del empleador'
        ],
        required: true
    },
    method: {
        type: String,
        enum: ['DT', 'Notaría'],
        default: 'Notaría'
    },

    // Financial Breakdown
    desglose: {
        diasTrabajados: { type: Number, default: 0 },
        sueldoProporcional: { type: Number, default: 0 },
        vacacionesPendientes: { type: Number, default: 0 }, // days
        vacacionesValor: { type: Number, default: 0 }, // $
        gratificacionProporcional: { type: Number, default: 0 },
        indemnizacionAvisoPrevio: { type: Number, default: 0 },
        indemnizacionAniosServicio: { type: Number, default: 0 },
        aniosServicioCalculados: { type: Number, default: 0 },
        bonosExtra: { type: Number, default: 0 },
        descuentos: { type: Number, default: 0 },
        totalBruto: { type: Number, default: 0 },
        totalNeto: { type: Number, default: 0 }
    },

    // Dates
    contractStartDate: Date,
    contractEndDate: Date,     // Last working day
    processedDate: {
        type: Date,
        default: Date.now
    },
    notarizedDate: Date,       // Date signed at notary/inspector

    // Documents
    documentUrl: String,
    documentPublicId: String,

    // Status
    status: {
        type: String,
        enum: ['En Preparación', 'Pendiente Firma', 'Firmado', 'Ratificado DT', 'Anulado'],
        default: 'En Preparación'
    },

    // Observations & Audit
    observations: String,
    history: [{
        action: String,
        changedBy: String,
        timestamp: { type: Date, default: Date.now },
        details: String
    }]
}, { timestamps: true });

// Compound index for company-wide finiquito queries
finiquitoSchema.index({ companyId: 1, processedDate: -1 });
finiquitoSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Finiquito', finiquitoSchema);
