/**
 * Input Validators — Centraliza-T
 * Reusable validation helpers for controllers.
 * Uses native validation (no external deps) for portability.
 */

// --- Primitives ---

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isRut = (v) => typeof v === 'string' && /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(v);
const isMongoId = (v) => typeof v === 'string' && /^[a-fA-F0-9]{24}$/.test(v);
const isPositiveNumber = (v) => typeof v === 'number' && v > 0;
const isDate = (v) => !isNaN(Date.parse(v));
const isOneOf = (v, options) => options.includes(v);

// --- Schema Validator Engine ---

/**
 * Validates a request body against a schema definition.
 * @param {Object} schema - { fieldName: { required, type, validator, message } }
 * @returns Express middleware
 *
 * Types: 'string', 'email', 'rut', 'mongoId', 'number', 'date', 'enum'
 * For 'enum' type, provide options: ['val1', 'val2']
 */
const validate = (schema) => {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rules] of Object.entries(schema)) {
            const value = req.body[field];

            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push({ field, message: rules.message || `${field} es requerido.` });
                continue;
            }

            // Skip optional fields that are empty
            if (value === undefined || value === null || value === '') continue;

            // Type checks
            switch (rules.type) {
                case 'string':
                    if (!isNonEmptyString(value))
                        errors.push({ field, message: `${field} debe ser texto válido.` });
                    break;
                case 'email':
                    if (!isEmail(value))
                        errors.push({ field, message: `${field} debe ser un correo electrónico válido.` });
                    break;
                case 'rut':
                    if (!isRut(value))
                        errors.push({ field, message: `${field} debe ser un RUT válido (ej: 12.345.678-9).` });
                    break;
                case 'mongoId':
                    if (!isMongoId(value))
                        errors.push({ field, message: `${field} tiene un identificador inválido.` });
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value))
                        errors.push({ field, message: `${field} debe ser un número válido.` });
                    if (rules.min !== undefined && value < rules.min)
                        errors.push({ field, message: `${field} debe ser al menos ${rules.min}.` });
                    if (rules.max !== undefined && value > rules.max)
                        errors.push({ field, message: `${field} no puede ser mayor a ${rules.max}.` });
                    break;
                case 'date':
                    if (!isDate(value))
                        errors.push({ field, message: `${field} debe ser una fecha válida.` });
                    break;
                case 'enum':
                    if (!isOneOf(value, rules.options || []))
                        errors.push({ field, message: `${field} debe ser uno de: ${(rules.options || []).join(', ')}.` });
                    break;
                default:
                    break;
            }

            // Custom validator
            if (rules.validator && !rules.validator(value)) {
                errors.push({ field, message: rules.message || `${field} no pasó la validación personalizada.` });
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                message: 'Error de validación en los datos enviados.',
                errors
            });
        }

        next();
    };
};

// --- Pre-built schemas ---

const loginSchema = {
    email: { required: true, type: 'email', message: 'Correo electrónico requerido y válido.' },
    password: { required: true, type: 'string', message: 'Contraseña requerida.' }
};

const registerCompanySchema = {
    companyName: { required: true, type: 'string', message: 'Nombre de empresa es requerido.' },
    companyRut: { required: true, type: 'rut', message: 'RUT de empresa es requerido y debe tener formato válido.' },
    adminName: { required: true, type: 'string', message: 'Nombre del administrador es requerido.' },
    adminEmail: { required: true, type: 'email', message: 'Email del administrador es requerido y válido.' },
    adminPassword: { required: true, type: 'string', message: 'Contraseña del administrador es requerida.' }
};

const createProjectSchema = {
    clientB2BName: { required: true, type: 'string' },
    clientB2BRut: { required: true, type: 'string' },
    mainMandante: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    durationMonths: { required: true, type: 'number', min: 1 },
    startDate: { required: true, type: 'date' }
};

const createApplicantSchema = {
    fullName: { required: true, type: 'string' },
    email: { required: true, type: 'email' },
    phone: { required: true, type: 'string' },
    rut: { required: true, type: 'rut' },
    projectId: { required: true, type: 'mongoId' },
    position: { required: true, type: 'string' }
};

const createVacationSchema = {
    applicantId: { required: true, type: 'mongoId' },
    startDate: { required: true, type: 'date' },
    endDate: { required: true, type: 'date' }
};

const createDisciplinarySchema = {
    applicantId: { required: true, type: 'mongoId' },
    type: { required: true, type: 'enum', options: ['Amonestación Verbal', 'Amonestación Escrita', 'Multa', 'Suspensión', 'Desvinculación'] },
    reason: { required: true, type: 'string' }
};

const createCommendationSchema = {
    applicantId: { required: true, type: 'mongoId' },
    title: { required: true, type: 'string' },
    category: { required: true, type: 'enum', options: ['Productividad', 'Valores', 'Seguridad', 'Innovación', 'Compañerismo', 'Otro'] },
    reason: { required: true, type: 'string' }
};

module.exports = {
    validate,
    isNonEmptyString,
    isEmail,
    isRut,
    isMongoId,
    isPositiveNumber,
    isDate,
    isOneOf,
    // Pre-built schemas
    loginSchema,
    registerCompanySchema,
    createProjectSchema,
    createApplicantSchema,
    createVacationSchema,
    createDisciplinarySchema,
    createCommendationSchema
};
