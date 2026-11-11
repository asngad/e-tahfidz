import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-untuk-unit-test';

// Route memakai instance pool CJS native (bukan instance Vite).
// Karena itu patch pool.execute lewat createRequire yang sama.
const requireNative = createRequire(import.meta.url);
const { pool } = requireNative('../config/database');

const { default: app } = await import('../app.js');
const jwt = requireNative('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, SECRET);
const ustadzToken = jwt.sign({ id: 2, username: 'ustadz', role: 'ustadz' }, SECRET);
const santriToken = jwt.sign({ id: 3, username: 'santri', role: 'santri' }, SECRET);

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const validBody = {
  santri_id: 10,
  surah_id: 1,
  ayat_mulai: 1,
  ayat_selesai: 10,
  tanggal_setoran: '2026-01-15',
  jenis_setoran: 'ziyadah',
  nilai_tajwid: 90,
  nilai_kelancaran: 85,
  nilai_makhraj: 88,
  catatan: 'Bagus',
};

beforeEach(() => {
  pool.execute = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API /api/setoran - autentikasi', () => {
  it('GET / tanpa token -> 401', async () => {
    const res = await request(app).get('/api/setoran');
    expect(res.status).toBe(401);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('GET / dengan token valid -> lolos middleware (query DB dipanggil)', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app)
      .get('/api/setoran')
      .set(authHeader(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(0);
    expect(pool.execute).toHaveBeenCalledTimes(1);
  });

  it('GET / sebagai santri -> query difilter ke santri tersebut', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app)
      .get('/api/setoran')
      .set(authHeader(santriToken));
    expect(res.status).toBe(200);
    const [sql, params] = pool.execute.mock.calls[0];
    expect(sql).toContain('WHERE us.id = ?');
    expect(params).toEqual([3]);
  });

  it('GET / saat DB error -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('koneksi gagal'));
    const res = await request(app)
      .get('/api/setoran')
      .set(authHeader(adminToken));
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('API /api/setoran POST - validasi', () => {
  it('role santri ditolak (403) oleh authorize', async () => {
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(santriToken))
      .send(validBody);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Anda tidak memiliki hak akses');
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('data belum lengkap -> 400', async () => {
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send({ santri_id: 10 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Data setoran belum lengkap');
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('rentang ayat tidak valid (selesai < mulai) -> 400', async () => {
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send({ ...validBody, ayat_mulai: 20, ayat_selesai: 5 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Rentang ayat tidak valid');
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('nilai di luar rentang 0-100 -> 400', async () => {
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send({ ...validBody, nilai_tajwid: 150 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Nilai harus berada antara 0 sampai 100');
  });

  it('nilai bukan angka -> 400', async () => {
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(ustadzToken))
      .send({ ...validBody, nilai_kelancaran: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Nilai harus berada antara 0 sampai 100');
  });

  it('data valid sebagai admin -> 201 dengan nilai_akhir rata-rata', async () => {
    pool.execute.mockResolvedValue([{ insertId: 99, affectedRows: 1 }]);
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send(validBody);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBe(99);
    // (90 + 85 + 88) / 3 = 87.666...
    expect(res.body.nilai_akhir).toBeCloseTo(87.666, 2);
    expect(pool.execute).toHaveBeenCalledTimes(1);
  });

  it('data valid sebagai ustadz -> 201', async () => {
    pool.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }]);
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(ustadzToken))
      .send(validBody);
    expect(res.status).toBe(201);
  });

  it('nilai default 0 saat field nilai tidak dikirim', async () => {
    pool.execute.mockResolvedValue([{ insertId: 5, affectedRows: 1 }]);
    const { nilai_tajwid, nilai_kelancaran, nilai_makhraj, ...tanpaNilai } = validBody;
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send(tanpaNilai);
    expect(res.status).toBe(201);
    expect(res.body.nilai_akhir).toBe(0);
  });

  it('DB error saat insert -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('foreign key gagal'));
    const res = await request(app)
      .post('/api/setoran')
      .set(authHeader(adminToken))
      .send(validBody);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('API /api/setoran/:id/status PATCH - verifikasi', () => {
  it('role santri ditolak (403)', async () => {
    const res = await request(app)
      .patch('/api/setoran/1/status')
      .set(authHeader(santriToken))
      .send({ status: 'diterima' });
    expect(res.status).toBe(403);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('status tidak valid -> 400', async () => {
    const res = await request(app)
      .patch('/api/setoran/1/status')
      .set(authHeader(adminToken))
      .send({ status: 'dibuang' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Status tidak valid');
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('setoran tidak ditemukan (affectedRows 0) -> 404', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 0 }]);
    const res = await request(app)
      .patch('/api/setoran/12345/status')
      .set(authHeader(adminToken))
      .send({ status: 'diterima', catatan: 'Sudah lancar' });
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Setoran tidak ditemukan');
  });

  it('status diterima valid -> 200', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app)
      .patch('/api/setoran/7/status')
      .set(authHeader(ustadzToken))
      .send({ status: 'diterima', catatan: 'Baik' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const [sql, params] = pool.execute.mock.calls[0];
    expect(sql).toContain('UPDATE setoran_hafalan');
    expect(params).toEqual(['diterima', 'Baik', '7']);
  });

  it('status revisi valid -> 200', async () => {
    pool.execute.mockResolvedValue([{ affectedRows: 1 }]);
    const res = await request(app)
      .patch('/api/setoran/7/status')
      .set(authHeader(adminToken))
      .send({ status: 'revisi' });
    expect(res.status).toBe(200);
  });

  it('DB error saat update status -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('koneksi terputus'));
    const res = await request(app)
      .patch('/api/setoran/7/status')
      .set(authHeader(adminToken))
      .send({ status: 'diterima' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('koneksi terputus');
  });
});
