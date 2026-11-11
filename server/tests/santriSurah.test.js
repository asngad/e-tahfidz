import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-untuk-unit-test';

// Route memakai instance pool CJS native; patch lewat createRequire yang sama.
const requireNative = createRequire(import.meta.url);
const { pool } = requireNative('../config/database');
const jwt = requireNative('jsonwebtoken');

const { default: app } = await import('../app.js');

const SECRET = process.env.JWT_SECRET;
const adminAuth = { Authorization: `Bearer ${jwt.sign({ id: 1, username: 'admin', role: 'admin' }, SECRET)}` };
const santriAuth = { Authorization: `Bearer ${jwt.sign({ id: 3, username: 'santri', role: 'santri' }, SECRET)}` };

beforeEach(() => {
  pool.execute = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GET /api/santri - daftar', () => {
  it('tanpa token -> 401', async () => {
    const res = await request(app).get('/api/santri');
    expect(res.status).toBe(401);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('token valid -> daftar santri beserta totalnya', async () => {
    pool.execute.mockResolvedValue([[{ id: 10, nama_lengkap: 'Budi Santoso' }]]);
    const res = await request(app).get('/api/santri').set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].nama_lengkap).toBe('Budi Santoso');
  });

  it('role santri punya akses membaca', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app).get('/api/santri').set(santriAuth);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it('DB error -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('query gagal'));
    const res = await request(app).get('/api/santri').set(adminAuth);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('query gagal');
  });
});

describe('GET /api/santri/:id - detail', () => {
  it('tanpa token -> 401', async () => {
    const res = await request(app).get('/api/santri/10');
    expect(res.status).toBe(401);
  });

  it('santri ditemukan -> 200 dengan data lengkap', async () => {
    pool.execute.mockResolvedValue([[{ id: 10, nama_lengkap: 'Budi Santoso', email: 'budi@x.id' }]]);
    const res = await request(app).get('/api/santri/10').set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.data.nama_lengkap).toBe('Budi Santoso');

    const [sql, params] = pool.execute.mock.calls[0];
    expect(sql).toContain('WHERE s.id = ?');
    expect(params).toEqual(['10']);
  });

  it('santri tidak ditemukan -> 404', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app).get('/api/santri/99999').set(adminAuth);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Data santri tidak ditemukan');
  });

  it('DB error -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('koneksi putus'));
    const res = await request(app).get('/api/santri/10').set(adminAuth);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('koneksi putus');
  });
});

describe('GET /api/surah - daftar surah', () => {
  it('tanpa token -> 401', async () => {
    const res = await request(app).get('/api/surah');
    expect(res.status).toBe(401);
    expect(pool.execute).not.toHaveBeenCalled();
  });

  it('token valid -> daftar surah', async () => {
    pool.execute.mockResolvedValue([[{ nomor_surah: 1, nama_surah: 'Al-Fatihah' }]]);
    const res = await request(app).get('/api/surah').set(adminAuth);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].nama_surah).toBe('Al-Fatihah');

    const [sql] = pool.execute.mock.calls[0];
    expect(sql).toContain('ORDER BY nomor_surah ASC');
  });

  it('DB error -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('db error'));
    const res = await request(app).get('/api/surah').set(adminAuth);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('db error');
  });
});
