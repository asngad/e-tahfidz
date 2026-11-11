require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await testConnection();

        app.listen(PORT, () => {
            console.log('================================');
            console.log(' E-TAHFIDZ DARUL KAMAL API');
            console.log('================================');
            console.log(`Server: http://localhost:${PORT}`);
            console.log(`API: http://localhost:${PORT}/api`);
            console.log('Status: AKTIF');
            console.log('================================');
        });
    } catch (error) {
        console.error('Server gagal dijalankan:', error.message);
        process.exit(1);
    }
}

startServer();

module.exports = { startServer };
