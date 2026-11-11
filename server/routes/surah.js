const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM surah ORDER BY nomor_surah ASC'
        );

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

module.exports = router;
