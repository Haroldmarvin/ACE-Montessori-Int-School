const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ace_montessori')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log("❌ DB Error:", err));

// --- Database Schemas ---
const AdmissionSchema = new mongoose.Schema({
    studentName: String, gradeApplyingFor: String, parentName: String,
    email: String, phone: String, message: String, date: { type: Date, default: Date.now }
});

const ContactSchema = new mongoose.Schema({
    name: String, email: String, subject: String, message: String,
    date: { type: Date, default: Date.now }
});

const GallerySchema = new mongoose.Schema({
    imageUrl: String, caption: String, category: String
});

const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Admission = mongoose.model('Admission', AdmissionSchema);
const Contact = mongoose.model('Contact', ContactSchema);
const Gallery = mongoose.model('Gallery', GallerySchema);
const Admin = mongoose.model('Admin', AdminSchema);

// --- Auth Middleware ---
const protect = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: "No token, authorization denied" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ace_secret_key');
        req.admin = decoded;
        next();
    } catch (e) { res.status(401).json({ msg: "Token invalid" }); }
};

// --- Image Upload Setup ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// --- ROUTES ---

// 1. Admin Login
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(400).json({ success: false, msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ success: false, msg: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'ace_secret_key', { expiresIn: '1d' });
    res.json({ success: true, token, username: admin.username });
});

// 2. Admissions (Public Submit & Admin Get)
app.post('/api/admissions/apply', async (req, res) => {
    const newApp = new Admission(req.body);
    await newApp.save();
    res.json({ success: true, msg: "Application Received" });
});

app.get('/api/admissions/all', async (req, res) => {
    const apps = await Admission.find();
    res.json(apps);
});

// 3. Contact Messages
app.post('/api/contact/send', async (req, res) => {
    const msg = new Contact(req.body);
    await msg.save();
    res.json({ success: true });
});

app.get('/api/contact/all', async (req, res) => {
    const msgs = await Contact.find();
    res.json(msgs);
});

// 4. Gallery Management
app.post('/api/gallery/upload', upload.single('image'), async (req, res) => {
    const newImg = new Gallery({
        imageUrl: `/${req.file.filename}`,
        caption: req.body.caption,
        category: req.body.category
    });
    await newImg.save();
    res.json({ success: true });
});

app.get('/api/gallery/all', async (req, res) => {
    const images = await Gallery.find();
    res.json(images);
});

// 5. Delete Operations (Protected)
app.delete('/api/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    if (type === 'admissions') await Admission.findByIdAndDelete(id);
    if (type === 'contact') await Contact.findByIdAndDelete(id);
    if (type === 'gallery') await Gallery.findByIdAndDelete(id);
    res.json({ success: true });
});

// --- Start Server ---
const PORT = 8080;
app.listen(PORT, () => console.log(`🚀 ACE Server running on http://localhost:${PORT}`));