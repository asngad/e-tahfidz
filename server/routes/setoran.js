const express = require('express');
const { pool } = require('../config/database');
const {
    authenticateToken,
    authorize
} = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// MELIHAT DATA SETORAN
router.get('/', async (req, res) => {
    try {
        let sql = `
            SELECT
                sh.*,
                s.nama_lengkap,
                su.nama_surah,
                u.nama_lengkap AS nama_ustadz
            FROM setoran_hafalan sh
            JOIN santri s ON sh.santri_id = s.id
            JOIN surah su ON sh.surah_id = su.id
            JOIN ustadz u ON sh.ustadz_id = u.id
        `;

        const params = [];

        if (req.user.role === 'santri') {
            sql += ` JOIN users us ON us.id = s.user_id
                     WHERE us.id = ?`;
            params.push(req.user.id);
        }

        sql += ' ORDER BY sh.tanggal_setoran DESC';

        const [rows] = await pool.execute(sql, params);

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

// MENAMBAHKAN SETORAN
router.post(
    '/',
    authorize('admin', 'ustadz'),
    async (req, res) => {
        try {
            const {
                santri_id,
                surah_id,
                ayat_mulai,
                ayat_selesai,
                tanggal_setoran,
                jenis_setoran,
                nilai_tajwid,
                nilai_kelancaran,
                nilai_makhraj,
                catatan
            } = req.body;

            if (
                !santri_id ||
                !surah_id ||
                !ayat_mulai ||
                !ayat_selesai ||
                !tanggal_setoran
            ) {
                return res.status(400).json({
                    success: false,
                    message: 'Data setoran belum lengkap'
                });
            }

            if (Number(ayat_selesai) < Number(ayat_mulai)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rentang ayat tidak valid'
                });
            }

            const tajwid = Number(nilai_tajwid || 0);
            const lancar = Number(nilai_kelancaran || 0);
            const makhraj = Number(nilai_makhraj || 0);

            if ([tajwid, lancar, makhraj].some(
                n => !Number.isFinite(n) || n < 0 || n > 100
            )) {
                return res.status(400).json({
                    success: false,
                    message: 'Nilai harus berada antara 0 sampai 100'
                });
            }

            const nilaiAkhir = (tajwid + lancar + makhraj) / 3;

            const [result] = await pool.execute(
                `INSERT INTO setoran_hafalan (
                    santri_id, ustadz_id, surah_id,
                    ayat_mulai, ayat_selesai, tanggal_setoran,
                    jenis_setoran, nilai_tajwid,
                    nilai_kelancaran, nilai_makhraj,
                    nilai_akhir, status, catatan
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'menunggu', ?)`,
                [
                    santri_id,
                    req.user.id,
                    surah_id,
                    ayat_mulai,
                    ayat_selesai,
                    tanggal_setoran,
                    jenis_setoran || 'ziyadah',
                    tajwid,
                    lancar,
                    makhraj,
                    nilaiAkhir,
                    catatan || null
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Setoran berhasil disimpan',
                id: result.insertId,
                nilai_akhir: nilaiAkhir
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

// VERIFIKASI SETORAN
router.patch(
    '/:id/status',
    authorize('admin', 'ustadz'),
    async (req, res) => {
        try {
            const { status, catatan } = req.body;

            if (!['diterima', 'revisi'].includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Status tidak valid'
                });
            }

            const [result] = await pool.execute(
                `UPDATE setoran_hafalan
                 SET status = ?, catatan = ?
                 WHERE id = ?`,
                [status, catatan || null, req.params.id]
            );

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: 'Setoran tidak ditemukan'
                });
            }

            res.json({
                success: true,
                message: 'Status setoran berhasil diperbarui'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
);

module.exports = router;
