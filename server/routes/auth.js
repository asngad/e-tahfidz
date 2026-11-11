const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username dan password wajib diisi'
            });
        }

        const [users] = await pool.execute(
            `SELECT id, name, username, email, password, role, is_active
             FROM users WHERE username = ? LIMIT 1`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Akun tidak aktif'
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        await pool.execute(
            'INSERT INTO activity_logs (user_id, aktivitas) VALUES (?, ?)',
            [user.id, 'Login aplikasi']
        );

        delete user.password;

        res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server'
        });
    }
});

// PROFIL PENGGUNA
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const [users] = await pool.execute(
            `SELECT id, name, username, email, role, is_active
             FROM users WHERE id = ?`,
            [req.user.id]
        );

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: 'Pengguna tidak ditemukan'
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
