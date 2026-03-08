const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage'); // Using your existing model

// POST: Save a new message (Public route for Contact Us page)
router.post('/send', async (req, res) => {
    try {
        const newMessage = new ContactMessage(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// GET: Fetch all messages (For Admin Dashboard)
router.get('/all', async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE: Remove a message
router.delete('/:id', async (req, res) => {
    try {
        await ContactMessage.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Message deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;