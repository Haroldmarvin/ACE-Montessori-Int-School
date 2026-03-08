const Admission = require('../models/Admission');

// @desc    Submit a new admission application
// @route   POST /api/admissions/apply
exports.submitApplication = async (req, res) => {
    try {
        const newApplication = new Admission(req.body);
        await newApplication.save();
        res.status(201).json({ success: true, message: "Application submitted successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all applications (For Admin Dashboard)
exports.getApplications = async (req, res) => {
    try {
        const applications = await Admission.find().sort({ createdAt: -1 });
        res.status(200).json(applications);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};