const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
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
    title: { type: String, required: true }, // Ej: "Contrato de Trabajo - Juan Pérez"
    type: {
        type: String,
        enum: ['Contrato Inicial', 'Anexo Teletrabajo', 'Anexo Renta', 'Finiquito', 'Otro'],
        default: 'Contrato Inicial'
    },
    content: { type: String, required: true }, // Contenido HTML/RichText
    version: { type: Number, default: 1 },
    status: {
        type: String,
        enum: ['Borrador', 'Enviado', 'Firmado', 'Archivado'],
        default: 'Borrador'
    },
    metadata: {
        generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hiringDetails: {
            salary: Number,
            position: String,
            startDate: Date
        }
    },
    pdfUrl: { type: String }, // URL del PDF generado (Cloudinary/S3)
    signedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Contract', contractSchema);
