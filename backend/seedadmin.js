// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists!");
            process.exit();
        }

        const newAdmin = new Admin({
            username: 'admin',
            password: 'AcePassword2025' // Change this to your preferred password
        });

        await newAdmin.save();
        console.log("✅ Admin Created Successfully!");
        console.log("Username: admin");
        console.log("Password: AcePassword2025");
        
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seed();