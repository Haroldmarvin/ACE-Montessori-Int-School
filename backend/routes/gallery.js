const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');

// Configure Storage
const storage = multer.diskStorage({
    destination: './uploads/gallery',
    filename: (req, file, cb) => {
        cb(null, 'gallery-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST: Upload new image
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

        const newImage = new Gallery({
            // Save the path relative to the 'uploads' folder for the frontend
            imageUrl: `/gallery/${req.file.filename}`, 
            caption: req.body.caption,
            category: req.body.category
        });
        await newImage.save();
        res.status(201).json({ success: true, message: "Image uploaded!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET: Fetch all images
router.get('/all', async (req, res) => {
    try {
        const images = await Gallery.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE: Remove an image
router.delete('/:id', async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        // Build the absolute path to the file
        const filePath = path.join(__dirname, '../uploads', image.imageUrl);
        
        // Delete the physical file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Image deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;