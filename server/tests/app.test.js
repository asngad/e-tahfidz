import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';

// Set JWT_SECRET sebelum modul backend di-import
process.env.JWT_SECRET = process.env.JWT_SECRET || 'kunci-rahasia-untuk-unit-test';

const { default: app } = await import('../app.js');

describe('API - root & 404', () => {
  beforeAll(() => {
    // Tidak perlu koneksi DB untuk route statis
  });

  it('GET / mengembalikan info aplikasi', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.application).toContain('E-Tahfidz');
    expect(res.body.status).toBe('running');
  });

  it('GET / endpoint yang tidak ada mengembalikan 404', async () => {
    const res = await request(app).get('/tidak-ada');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Endpoint tidak ditemukan');
  });

  it('menerima JSON body (express.json terpasang)', async () => {
    const res = await request(app)
      .post('/tidak-ada')
      .send({ foo: 'bar' })
      .set('Content-Type', 'application/json');
    // Route tidak ada -> 404, tapi body harus ter-parse tanpa error 500
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
