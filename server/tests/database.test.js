import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRequire } from 'node:module';

const requireNative = createRequire(import.meta.url);
const db = requireNative('../config/database');

describe('server/config/database - testConnection', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('berhasil ping dan selalu melepas koneksi', async () => {
    const conn = {
      ping: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };
    vi.spyOn(db.pool, 'getConnection').mockResolvedValue(conn);

    await db.testConnection();

    expect(db.pool.getConnection).toHaveBeenCalledTimes(1);
    expect(conn.ping).toHaveBeenCalledTimes(1);
    expect(conn.release).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('MySQL berhasil terhubung!');
  });

  it('koneksi gagal dibuka -> error diteruskan (tanpa koneksi untuk dilepas)', async () => {
    vi.spyOn(db.pool, 'getConnection').mockRejectedValue(new Error('koneksi ditolak'));

    await expect(db.testConnection()).rejects.toThrow('koneksi ditolak');
  });

  it('ping gagal -> koneksi tetap dilepas lewat blok finally', async () => {
    const conn = {
      ping: vi.fn().mockRejectedValue(new Error('ping gagal')),
      release: vi.fn(),
    };
    vi.spyOn(db.pool, 'getConnection').mockResolvedValue(conn);

    await expect(db.testConnection()).rejects.toThrow('ping gagal');
    expect(conn.release).toHaveBeenCalledTimes(1);
  });
});
