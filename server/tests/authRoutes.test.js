import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { createRequire } from 'node:module';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-untuk-unit-test';

// Route memakai instance pool CJS native; patch lewat createRequire yang sama.
const requireNative = createRequire(import.meta.url);
const { pool } = requireNative('../config/database');
const bcrypt = requireNative('bcryptjs');
const jwt = requireNative('jsonwebtoken');

const { default: app } = await import('../app.js');

const SECRET = process.env.JWT_SECRET;
const authHeader = (token) => ({ Authorization: `Bearer ${token}` });
const tokenFor = (payload) => jwt.sign(payload, SECRET);

const activeUser = {
  id: 1,
  name: 'Administrator',
  username: 'admin',
  email: 'admin@darul.kamal',
  password: bcrypt.hashSync('rahasia', 4),
  role: 'admin',
  is_active: 1,
};

beforeEach(() => {
  pool.execute = vi.fn();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('POST /api/auth/login', () => {
  it('username tidak ditemukan -> 401', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'tidak-ada', password: 'apa-saja' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Username atau password salah');
    expect(pool.execute).toHaveBeenCalledTimes(1);
  });

  it('akun nonaktif -> 403', async () => {
    pool.execute.mockResolvedValue([[{ ...activeUser, is_active: 0 }]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'rahasia' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Akun tidak aktif');
  });

  it('password salah -> 401', async () => {
    pool.execute.mockResolvedValue([[activeUser]]);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'salah' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Username atau password salah');
    expect(pool.execute).toHaveBeenCalledTimes(1);
  });

  it('login sukses -> 200 dengan token, tanpa field password, dan log aktivitas tercatat', async () => {
    pool.execute
      .mockResolvedValueOnce([[activeUser]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'rahasia' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.username).toBe('admin');

    // query kedua = insert activity_logs
    expect(pool.execute).toHaveBeenCalledTimes(2);
    const [logSql, logParams] = pool.execute.mock.calls[1];
    expect(logSql).toContain('INSERT INTO activity_logs');
    expect(logParams).toEqual([1, 'Login aplikasi']);

    // token yang diterima valid dan sesuai isi
    const decoded = jwt.verify(res.body.token, SECRET);
    expect(decoded).toMatchObject({ id: 1, username: 'admin', role: 'admin' });
  });

  it('DB error saat login -> 500', async () => {
    pool.execute.mockRejectedValue(new Error('db mati'));
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'rahasia' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Terjadi kesalahan server');
  });
});

describe('GET /api/auth/me', () => {
  it('pengguna ditemukan -> 200 dengan data profil', async () => {
    pool.execute.mockResolvedValue([[{ id: 1, name: 'Administrator', username: 'admin', role: 'admin' }]]);
    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(tokenFor({ id: 1, username: 'admin', role: 'admin' })));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.username).toBe('admin');
  });

  it('pengguna tidak ditemukan -> 404', async () => {
    pool.execute.mockResolvedValue([[]]);
    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(tokenFor({ id: 404, username: 'hilang', role: 'santri' })));

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Pengguna tidak ditemukan');
  });

  it('DB error -> 500 dengan pesan error', async () => {
    pool.execute.mockRejectedValue(new Error('error db'));
    const res = await request(app)
      .get('/api/auth/me')
      .set(authHeader(tokenFor({ id: 1, username: 'admin', role: 'admin' })));

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('error db');
  });
});
