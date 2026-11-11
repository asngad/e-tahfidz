require('dotenv').config();

const bcrypt = require('bcryptjs');
const { pool } = require('./config/database');

async function createAdmin() {
    try {
        const username = 'admin';
        const password = 'Admin123!';

        const [existing] = await pool.execute(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            console.log('Akun admin sudah tersedia!');
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            `INSERT INTO users
            (name, username, email, password, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                'Administrator',
                username,
                'admin@etahfidz.local',
                hashedPassword,
                'admin',
                true
            ]
        );

        console.log('================================');
        console.log(' ADMIN BERHASIL DIBUAT');
        console.log('================================');
        console.log('ID       :', result.insertId);
        console.log('Username : admin');
        console.log('Password : Admin123!');
        console.log('================================');

    } catch (error) {
        console.error('GAGAL MEMBUAT ADMIN:', error.message);
    } finally {
        await pool.end();
    }
}

void createAdmin();
