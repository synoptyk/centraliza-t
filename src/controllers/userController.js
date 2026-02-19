const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (SuperAdmin or Admin_Empresa)
// @route   POST /api/users
const registerUser = asyncHandler(async (req, res) => {
    let { name, email, password, role, companyId, rut, position, cellphone, permissions } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        console.log(`Registration Failed: User ${email} already exists`);
        res.status(400);
        throw new Error('El usuario ya existe con ese correo electrónico');
    }

    // Auto-generate password if not provided
    let generatedPassword = '';
    if (!password) {
        generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-2).toUpperCase();
        password = generatedPassword;
    }

    let user;
    try {
        user = await User.create({
            name,
            email,
            password,
            role,
            companyId: companyId || null,
            rut,
            position,
            cellphone,
            permissions: permissions || []
        });
    } catch (dbError) {
        console.error('--- REGISTRATION DB ERROR:', dbError.message);
        res.status(400);
        throw new Error(`Error en la base de datos: ${dbError.message}`);
    }

    // Send Welcome Email in background
    const loginUrl = process.env.FRONTEND_URL || 'https://centralizat.cl';
    sendEmail({
        email: user.email,
        subject: 'Bienvenido al Ecosistema CENTRALIZA-T - Credenciales de Acceso',
        message: `Hola ${user.name}, bienvenido a CENTRALIZA-T. Sus credenciales son: Email: ${user.email}, Contraseña: ${password}. Ingrese en: ${loginUrl}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">CENTRALIZA-T</h1>
                    <p style="color: #e0e7ff; margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 4px;">Ecosystem v5.0</p>
                </div>
                
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Bienvenido(a), ${user.name}</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Su cuenta ha sido creada exitosamente en el Ecosistema Digital de Gestión.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold; letter-spacing: 1px;">Credenciales de Acceso</p>
                        <p style="margin: 5px 0;"><strong>Usuario:</strong> ${user.email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña:</strong> <span style="background-color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</span></p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                            Ingresar a la Plataforma
                        </a>
                    </div>
                </div>
            </div>
        `
    }).catch(err => console.error('--- Background Welcome Email Fail:', err.message));

    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        password: password // Return generated password for Frontend display
    });
});

// @desc    Get all users (Scoped or Global)
// @route   GET /api/users
const getUsers = asyncHandler(async (req, res) => {
    console.log('--- getUsers Controller: Start ---');
    console.log('Requesting user role:', req.user.role);
    console.log('Requesting user companyId:', req.user.companyId);

    let users;
    try {
        if (req.user.role === 'Ceo_Centralizat' || req.user.role === 'Admin_Centralizat') {
            console.log('Executing User.find({}).populate("companyId")...');
            users = await User.find({}).populate('companyId');
            console.log(`Found ${users.length} users (Global).`);
        } else {
            console.log(`Executing User.find({ companyId: ${req.user.companyId} })...`);
            users = await User.find({ companyId: req.user.companyId });
            console.log(`Found ${users.length} users (Scoped).`);
        }
    } catch (dbError) {
        console.error('--- getUsers DB Error:', dbError);
        throw dbError;
    }

    console.log('Sending response...');
    res.json(users);
    console.log('--- getUsers Controller: End ---');
});

// @desc    Update user
// @route   PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    try {
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.rut = req.body.rut || user.rut;
            user.position = req.body.position || user.position;
            user.cellphone = req.body.cellphone || user.cellphone;
            user.role = req.body.role || user.role;
            user.permissions = req.body.permissions || user.permissions;
            user.companyId = req.body.companyId === null ? null : (req.body.companyId || user.companyId);
            user.photo = req.body.photo || user.photo; // Kept this line as it was not explicitly removed by the instruction

            if (req.body.password) {
                console.log(`--- [DEBUG] Updating Password for User: ${user.email} ---`);
                user.password = req.body.password; // Mongoose middleware handles hashing
            }

            const updatedUser = await user.save();
            console.log(`--- [DEBUG] User Updated Successfully: ${updatedUser.email} ---`);
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                photo: updatedUser.photo, // Kept this line as it was not explicitly removed by the instruction
                role: updatedUser.role,
                companyId: updatedUser.companyId,
                permissions: updatedUser.permissions
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('--- updateUser ERROR:', error);
        res.status(error.status || 500);
        throw error;
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    try {
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        console.error('--- deleteUser ERROR:', error);
        res.status(error.status || 500);
        throw error;
    }
});

// @desc    Bulk register users
// @route   POST /api/users/bulk
const bulkRegisterUsers = asyncHandler(async (req, res) => {
    const users = req.body; // Array of user objects

    if (!Array.isArray(users)) {
        res.status(400);
        throw new Error('Invalid data format. Expected an array of users.');
    }

    const results = {
        created: 0,
        skipped: 0,
        errors: []
    };

    for (const userData of users) {
        try {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                results.skipped++;
                continue;
            }

            // If no password provided, auto-generate one
            if (!userData.password) {
                userData.password = Math.random().toString(36).slice(-8);
            }

            const newUser = await User.create(userData);

            // Optional: Send welcome email for each new user
            // We can do this in background to avoid blocking
            try {
                // sendWelcomeEmail(newUser, userData.password); 
                // For bulk, maybe we just notify success or send a batch email?
                // Let's stick to standard welcome email for now if needed.
            } catch (err) {
                console.error(`Error sending email to ${newUser.email}:`, err.message);
            }

            results.created++;
        } catch (error) {
            results.errors.push({ email: userData.email, error: error.message });
        }
    }

    res.status(201).json(results);
});

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    res.json({
        success: true,
        url: req.file.path, // Cloudinary URL
        secure_url: req.file.path
    });
});

// @desc    Resend credentials email (Manual Trigger)
// @route   POST /api/users/resend-credentials
const resendCredentials = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    console.log(`--- [DEBUG] Manual Resend Credentials Request for: ${email} ---`);

    if (!email || !password) {
        res.status(400);
        throw new Error('Email and password are required');
    }

    const loginUrl = process.env.FRONTEND_URL || 'https://centralizat.cl';

    try {
        await sendEmail({
            email: email,
            subject: 'Reenvío de Credenciales - Ecosistema CENTRALIZA-T',
            message: `Hola ${name}, aquí tiene sus credenciales nuevamente: Email: ${email}, Contraseña: ${password}. Ingrese en: ${loginUrl}`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">CENTRALIZA-T</h1>
                    <p style="color: #e0e7ff; margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 4px;">Reenvío de Accesos</p>
                </div>
                
                <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Hola, ${name}</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Se ha solicitado el reenvío de sus credenciales de acceso.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <p style="margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold; letter-spacing: 1px;">Credenciales de Acceso</p>
                        <p style="margin: 5px 0;"><strong>Usuario:</strong> ${email}</p>
                        <p style="margin: 5px 0;"><strong>Contraseña:</strong> <span style="background-color: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</span></p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginUrl}" style="background-color: #4f46e5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                            Ingresar a la Plataforma
                        </a>
                    </div>
                </div>
            </div>
            `
        });
        res.json({ message: 'Credenciales reenviadas exitosamente' });
    } catch (error) {
        console.error('Error resending credentials:', error);
        res.status(500); // 500 Internal Server Error for SMTP failures
        throw new Error(error.message);
    }
});

module.exports = { registerUser, getUsers, updateUser, deleteUser, bulkRegisterUsers, uploadAvatar, resendCredentials };
