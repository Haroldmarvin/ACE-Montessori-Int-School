const express = require('express');
const router = express.Router();
const { submitApplication, getApplications } = require('../controllers/admissionsController');

// Public route for parents to apply
router.post('/apply', submitApplication);

// Private route (we will add Auth later) for admin to view applications
router.get('/all', getApplications);

// Add this to your routes/admissions.js file
router.delete('/:id', async (req, res) => {
    try {
        const Admission = require('../models/Admission');
        await Admission.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Application deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;