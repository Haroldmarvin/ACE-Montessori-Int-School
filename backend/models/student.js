const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    gradeLevel: { 
        type: String, 
        required: true, 
        enum: ['Creche', 'Nursery', 'Kindergarten', 'Primary'] 
    },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String },
    image: { type: String }, // Path to the uploaded image
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Enrolled', 'Inactive'] 
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);