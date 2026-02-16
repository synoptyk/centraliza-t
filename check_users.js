const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const users = await User.find({});
        console.log('Total users:', users.length);
        users.forEach(u => {
            console.log(`Email: ${u.email}, Role: ${u.role}`);
        });
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
