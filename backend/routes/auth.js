const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Replace this with a real DB check in production
    if (username === "admin" && password === "ace123") {
        const token = jwt.sign({ role: 'admin' }, 'your_jwt_secret', { expiresIn: '1d' });
        return res.json({ success: true, token });
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
});

module.exports = router;