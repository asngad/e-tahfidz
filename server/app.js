const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const santriRoutes = require('./routes/santri');
const surahRoutes = require('./routes/surah');
const setoranRoutes = require('./routes/setoran');

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        success: true,
        application: 'E-Tahfidz Darul Kamal API',
        version: '1.0.0',
        status: 'running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/santri', santriRoutes);
app.use('/api/surah', surahRoutes);
app.use('/api/setoran', setoranRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

module.exports = app;
