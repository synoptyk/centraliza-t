const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // New Client & Project Info
    clientB2BName: { type: String, required: true },
    clientB2BRut: { type: String, required: true },
    mainMandante: { type: String, required: true },
    name: { type: String, required: true }, // Nombre de Proyecto
    durationMonths: { type: Number, required: true },
    startDate: { type: Date, required: true },

    // Locations
    regions: [{ type: String, required: true }], // Regiones de Chile
    locations: [{ type: String }], // Sedes o Dependencias

    // Detailed Requirements
    requirements: [{
        position: { type: String, required: true }, // Cargo
        area: {
            type: String,
            enum: ['MO Tecnica', 'MO Supervision', 'MO Jefatura', 'MO Estructura'],
            required: true
        },
        quantity: { type: Number, required: true },
        netSalary: { type: Number, required: true }, // Sueldo liquido
        assignedRegion: { type: String, required: true }, // Seleccionada de 'regions'
        academicRequirement: { type: String, required: true }, // Titulos
        yearsOfExperience: { type: Number, required: true },
        description: { type: String }, // Descripcion General / Observaciones
        // Distribución de vacantes por Sede (Frontend obliga a sumar = quantity)
        locationDistribution: [{
            location: { type: String },
            quantity: { type: Number }
        }]
    }],

    status: { type: String, enum: ['Abierto', 'Cerrado', 'En Proceso'], default: 'Abierto' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Optional for Global/SuperAdmin projects
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
