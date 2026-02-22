const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    photo: { type: String }, // URL to Cloudinary or similar
    rut: { type: String },
    position: { type: String }, // Cargo
    cellphone: { type: String },
    role: {
        type: String,
        enum: [
            'Ceo_Centralizat',
            'Admin_Centralizat',
            'Usuario_Centralizat',
            'Admin_Empresa',
            'Usuario_Empresa'
        ],
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true,
        required: function () {
            return this.role === 'Admin_Empresa' || this.role === 'Usuario_Empresa';
        }
    },
    // Granular Permissions for Sidebar Modules
    permissions: [{
        module: { type: String }, // e.g., 'dashboard', 'proyectos', 'ingreso'
        actions: {
            create: { type: Boolean, default: false },
            read: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        }
    }],
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Blocked', 'Suspended'],
        default: 'Pending'
    },
    country: { type: String, default: 'CL' },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
