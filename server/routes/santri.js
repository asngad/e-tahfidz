const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// MENAMPILKAN DATA SANTRI
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                s.id,
                s.nis,
                s.nama_lengkap,
                s.jenis_kelamin,
                s.alamat,
                s.no_hp,
                s.status,
                u.email
            FROM santri s
            JOIN users u ON s.user_id = u.id
            ORDER BY s.nama_lengkap ASC
        `);

        res.json({
            success: true,
            total: rows.length,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// MENAMPILKAN DETAIL SANTRI
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT s.*, u.email, u.username
             FROM santri s
             JOIN users u ON s.user_id = u.id
             WHERE s.id = ?`,
            [req.params.id]
        );

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: 'Data santri tidak ditemukan'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
