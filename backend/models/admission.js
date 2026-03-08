const mongoose = require('mongoose');

const AdmissionSchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    parentName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    gradeApplyingFor: { type: String, required: true },
    message: { type: String },
    isReviewed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Admission', AdmissionSchema);