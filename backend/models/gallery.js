const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    caption: { type: String },
    category: { type: String, enum: ['Classroom', 'Events', 'Sports', 'Other'], default: 'Classroom' }
}, { timestamps: true });

module.exports = mongoose.model('Gallery', GallerySchema);