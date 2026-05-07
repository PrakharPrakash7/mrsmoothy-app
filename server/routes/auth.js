const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// POST /api/auth/login - admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Username and password required' });
    }

    if (username !== ADMIN_USERNAME) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    let isValid = false;
    if (ADMIN_PASSWORD_HASH) {
      isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else {
      // Fallback for development: compare plain password from env
      isValid = password === (process.env.ADMIN_PASSWORD || 'admin123');
    }

    if (!isValid) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { role: 'admin', username },
      process.env.JWT_SECRET || 'mrsmoothy-secret',
      { expiresIn: '7d' }
    );

    res.json({ success: true, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
