const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // This uses the URI from your .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📁 Database Name: ${conn.connection.name}`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1); // Stop the server if the DB fails
    }
};

module.exports = connectDB;