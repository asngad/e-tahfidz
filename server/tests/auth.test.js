import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-untuk-unit-test';

const { default: app } = await import('../app.js');
const { authenticateToken, authorize } = await import('../middleware/auth.js');

const SECRET = process.env.JWT_SECRET;

const makeReqResNext = (headers = {}) => {
  const req = { headers, user: undefined, params: {} };
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  const next = vi.fn();
  return { req, res, next };
};

describe('middleware authenticateToken', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('menolak request tanpa header Authorization (401)', () => {
    const { req, res, next } = makeReqResNext();
    authenticateToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token autentikasi tidak ditemukan');
    expect(next).not.toHaveBeenCalled();
  });

  it('menolak header yang bukan format Bearer (401)', () => {
    const { req, res, next } = makeReqResNext({ authorization: 'Basic abc' });
    authenticateToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('menolak token yang tidak valid (403)', () => {
    const { req, res, next } = makeReqResNext({
      authorization: 'Bearer token-ngaco',
    });
    authenticateToken(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Token tidak valid atau sudah kedaluwarsa');
    expect(next).not.toHaveBeenCalled();
  });

  it('menolak token yang sudah kedaluwarsa (403)', () => {
    const expired = jwt.sign({ id: 1, role: 'admin' }, SECRET, {
      expiresIn: '-1s',
    });
    const { req, res, next } = makeReqResNext({
      authorization: `Bearer ${expired}`,
    });
    authenticateToken(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('menerima token valid dan memanggil next() dengan req.user terisi', () => {
    const token = jwt.sign({ id: 7, username: 'ustadz', role: 'ustadz' }, SECRET);
    const { req, res, next } = makeReqResNext({
      authorization: `Bearer ${token}`,
    });
    authenticateToken(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 7, username: 'ustadz', role: 'ustadz' });
    expect(res.statusCode).toBe(200);
  });
});

describe('middleware authorize', () => {
  const runAuthorize = (roles, userRole) => {
    const { req, res, next } = makeReqResNext();
    req.user = { id: 1, role: userRole };
    authorize(...roles)(req, res, next);
    return { res, next };
  };

  it('mengizinkan role yang termasuk dalam daftar', () => {
    const { next } = runAuthorize(['admin', 'ustadz'], 'admin');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('menolak role yang tidak ada di daftar (403)', () => {
    const { res, next } = runAuthorize(['admin', 'ustadz'], 'santri');
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Anda tidak memiliki hak akses');
    expect(next).not.toHaveBeenCalled();
  });

  it('hanya satu role diperbolehkan', () => {
    const ok = runAuthorize(['admin'], 'admin');
    expect(ok.next).toHaveBeenCalledTimes(1);
    const no = runAuthorize(['admin'], 'ustadz');
    expect(no.res.statusCode).toBe(403);
  });
});

describe('API /api/auth - proteksi rute', () => {
  it('GET /api/auth/me tanpa token -> 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me dengan token valid -> lanjut ke handler DB (bukan 401/403)', async () => {
    const token = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, SECRET);
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    // Tanpa DB, handler melempar 500; yang penting lolos middleware autentikasi
    expect([200, 404, 500]).toContain(res.status);
    expect(res.status).not.toBe(401);
    expect(res.status).not.toBe(403);
  });

  it('POST /api/auth/login tanpa username/password -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Username dan password wajib diisi');
  });

  it('POST /api/auth/login dengan username kosong -> 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: '', password: 'rahasia' });
    expect(res.status).toBe(400);
  });
});
