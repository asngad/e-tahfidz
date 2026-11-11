import { describe, it, expect } from 'vitest';
import {
  JUZ_METADATA,
  QURAN_SURAHS,
  DEMO_USERS,
  INITIAL_SANTRI,
  INITIAL_SETORAN,
  INITIAL_JURNAL_BELAJAR,
  INITIAL_RENCANA_SETORAN,
  createDefaultJuzProgress,
} from './mockData';

describe('createDefaultJuzProgress', () => {
  it('selalu menghasilkan 30 entri juz', () => {
    const progress = createDefaultJuzProgress(7);
    expect(Object.keys(progress)).toHaveLength(30);
  });

  it('menandai juz <= totalJuz sebagai Mutqin', () => {
    const progress = createDefaultJuzProgress(7);
    for (let j = 1; j <= 7; j++) {
      expect(progress[j].status).toBe('Mutqin');
      expect(progress[j].juz).toBe(j);
    }
  });

  it('menandai juz setelah totalJuz sebagai Sedang Berjalan (sedang berjalan)', () => {
    const progress = createDefaultJuzProgress(7);
    expect(progress[8].status).toBe('Sedang Berjalan');
  });

  it('menandai juz jauh setelah totalJuz sebagai Belum dimulai', () => {
    const progress = createDefaultJuzProgress(7);
    for (let j = 9; j <= 30; j++) {
      expect(progress[j].status).toBe('Belum');
    }
  });

  it('hanya juz 1 yang berjalan ketika totalJuz 0', () => {
    const progress = createDefaultJuzProgress(0);
    expect(progress[1].status).toBe('Sedang Berjalan');
    for (let j = 2; j <= 30; j++) {
      expect(progress[j].status).toBe('Belum');
    }
  });
});

describe('QURAN_SURAHS', () => {
  it('memuat 114 surat', () => {
    expect(QURAN_SURAHS).toHaveLength(114);
  });

  it('nomor surat berurutan 1 sampai 114', () => {
    expect(QURAN_SURAHS[0].nomor).toBe(1);
    expect(QURAN_SURAHS[113].nomor).toBe(114);
  });

  it('setiap surat memiliki juz valid antara 1-30', () => {
    for (const surah of QURAN_SURAHS) {
      expect(surah.juz).toBeGreaterThanOrEqual(1);
      expect(surah.juz).toBeLessThanOrEqual(30);
    }
  });
});

describe('JUZ_METADATA', () => {
  it('memuat tepat 30 juz', () => {
    expect(JUZ_METADATA).toHaveLength(30);
  });

  it('urutan juz berurutan 1-30 dengan nama latin unik', () => {
    const latinNames = JUZ_METADATA.map(m => m.namaLatin);
    expect(new Set(latinNames).size).toBe(30);
    JUZ_METADATA.forEach((m, i) => expect(m.juz).toBe(i + 1));
  });
});

describe('DEMO_USERS', () => {
  it('memuat akun demo admin, santri, dan ustadz', () => {
    expect(Object.keys(DEMO_USERS)).toEqual(expect.arrayContaining(['admin', 'santri', 'ustadz']));
  });

  it('password demo sesuai dokumentasi README', () => {
    expect(DEMO_USERS.admin.pass).toBe('admin123');
    expect(DEMO_USERS.santri.pass).toBe('santri123');
    expect(DEMO_USERS.ustadz.pass).toBe('ustadz123');
  });

  it('role setiap akun demo benar', () => {
    expect(DEMO_USERS.admin.user.role).toBe('admin');
    expect(DEMO_USERS.santri.user.role).toBe('santri');
    expect(DEMO_USERS.ustadz.user.role).toBe('ustadz');
  });
});

describe('data awal (INITIAL_*)', () => {
  it('memiliki santri bawaan', () => {
    expect(INITIAL_SANTRI.length).toBeGreaterThan(0);
    expect(INITIAL_SANTRI[0]).toHaveProperty('nis');
    expect(INITIAL_SANTRI[0]).toHaveProperty('nama');
  });

  it('memiliki riwayat setoran bawaan', () => {
    expect(INITIAL_SETORAN.length).toBeGreaterThan(0);
    expect(INITIAL_SETORAN[0]).toHaveProperty('nilai');
  });

  it('memiliki jurnal belajar bawaan', () => {
    expect(INITIAL_JURNAL_BELAJAR.length).toBeGreaterThan(0);
    expect(INITIAL_JURNAL_BELAJAR[0]).toHaveProperty('durasiMenit');
  });

  it('memiliki rencana setoran bawaan', () => {
    expect(INITIAL_RENCANA_SETORAN.length).toBeGreaterThan(0);
    expect(INITIAL_RENCANA_SETORAN[0]).toHaveProperty('tanggalTarget');
  });

  it('ID santri unik', () => {
    const ids = INITIAL_SANTRI.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
