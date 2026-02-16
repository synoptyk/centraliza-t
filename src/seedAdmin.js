require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedSuperAdmin = async () => {
    try {
        await connectDB();

        const email = 'ceo_reclutando@synoptyk.cl';
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = await User.create({
            name: 'CEO Reclutando',
            email: email,
            password: 'BarrientosJobsMosk',
            role: 'Ceo_Reclutando',
            isActive: true
        });

        console.log('✅ SuperAdmin created successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error.message);
        process.exit(1);
    }
};

seedSuperAdmin();
