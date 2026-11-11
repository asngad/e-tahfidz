import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { INITIAL_SANTRI, INITIAL_JURNAL_BELAJAR, INITIAL_SETORAN } from '../mockData';

const adminUser = { id: 'admin', nama: 'KH. Ahmad Ridwan, Lc.', role: 'admin' };
const ustadzUser = { id: 'ustadz', nama: 'Ustadz Abdullah Mukhtar', role: 'ustadz' };
const santriUser = {
  id: '12345',
  nis: '12345',
  nama: 'Muhammad Fauzan Al-Hafidz',
  role: 'santri',
  totalJuz: 7,
};

const renderDashboard = (user = adminUser) => {
  const onLogout = vi.fn();
  const setApiUrl = vi.fn();
  render(<Dashboard user={user} onLogout={onLogout} apiUrl="" setApiUrl={setApiUrl} />);
  return { onLogout, setApiUrl };
};

describe('Dashboard - render & navigasi', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('merender sidebar dengan menu untuk admin', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Jurnal Belajar Mandiri')).toBeInTheDocument();
    expect(screen.getByText('Rencana Setoran')).toBeInTheDocument();
    expect(screen.getByText('Peta Progres 30 Juz')).toBeInTheDocument();
    expect(screen.getByText('Data Santri')).toBeInTheDocument();
    expect(screen.getByText('Catatan Nilai Setoran')).toBeInTheDocument();
    expect(screen.getByText('Pengaturan & API')).toBeInTheDocument();
  });

  it('menampilkan nama pengguna dan tombol keluar', () => {
    renderDashboard();
    expect(screen.getByText('KH. Ahmad Ridwan, Lc.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Keluar Akun/i })).toBeInTheDocument();
  });

  it('memanggil onLogout saat tombol keluar diklik', () => {
    const { onLogout } = renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Keluar Akun/i }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('berpindah tab ke Jurnal Belajar', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Jurnal Belajar Mandiri/i }));
    expect(screen.getByText(/Jurnal Belajar & Muroja'ah Harian/i)).toBeInTheDocument();
  });

  it('berpindah tab ke Rencana Setoran', () => {
    renderDashboard();
    // Ada dua tombol yang mengandung teks "Rencana Setoran": sidebar dan tombol
    // "Lihat Jadwal & Rencana Setoran" di tab dashboard. Ambil yang sidebar (index 0).
    fireEvent.click(screen.getAllByRole('button', { name: /Rencana Setoran/i })[0]);
    expect(screen.getByRole('heading', { name: /Rencana & Jadwal Setoran ke Musyrif/i })).toBeInTheDocument();
  });

  it('berpindah tab ke Peta 30 Juz', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    // h2 "Peta Progres 30 Juz Al-Qur'an" di header dan h3 "Progres 30 Juz Al-Qur'an"
    // di konten tab sama-sama cocok dengan regex teks; bedakan lewat peran heading.
    expect(screen.getByRole('heading', { name: /Peta Progres 30 Juz Al-Qur'an/i })).toBeInTheDocument();
  });

  it('berpindah tab ke Data Santri', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    expect(screen.getByText(/Data Santri & Halaqah/i)).toBeInTheDocument();
  });

  it('berpindah tab ke Catatan Nilai Setoran', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    expect(screen.getByText(/Catatan Setoran & Evaluasi Nilai/i)).toBeInTheDocument();
  });

  it('berpindah tab ke Pengaturan', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    expect(screen.getByText(/Pengaturan & Integrasi Backend/i)).toBeInTheDocument();
  });

  it('menu Data Santri tidak tampil untuk role santri', () => {
    renderDashboard(santriUser);
    expect(screen.queryByText('Data Santri')).not.toBeInTheDocument();
  });

  it('role ustadz melihat menu admin dan label Ustadz / Musyrif', () => {
    renderDashboard(ustadzUser);
    expect(screen.getByText('Data Santri')).toBeInTheDocument();
    expect(screen.getByText('Ustadz / Musyrif')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Input Setoran Resmi/i })).toBeInTheDocument();
    expect(screen.queryByText('Administrator')).not.toBeInTheDocument();
  });

  it('role santri melihat ruang santri di tab dashboard', () => {
    renderDashboard(santriUser);
    expect(screen.getByText(/Ruang Santri & Mutaba'ah Hafalan/i)).toBeInTheDocument();
    expect(screen.getByText(/Ahlan wa Sahlan, Muhammad Fauzan Al-Hafidz!/i)).toBeInTheDocument();
  });
});

describe('Dashboard - jurnal belajar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('menyimpan jurnal belajar baru ke daftar', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Catat Belajar Hari Ini/i }));

    // Judul modal "Catat Jurnal Belajar Mandiri" berada di luar <form>;
    // ambil form-nya lewat tombol submit di dalam form.
    const form = screen.getByRole('button', { name: /Simpan Catatan Belajar/i }).closest('form')!;
    fireEvent.submit(form);

    // Jurnal baru muncul di tab jurnal
    fireEvent.click(screen.getByRole('button', { name: /Jurnal Belajar Mandiri/i }));
    expect(screen.getAllByText(/Ziyadah Mandiri/i).length).toBeGreaterThan(0);
  });

  it('jurnal bawaan santri tampil di daftar', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Jurnal Belajar Mandiri/i }));
    const adaJurnal = INITIAL_JURNAL_BELAJAR.some(j => j.santriId === INITIAL_SANTRI[0].id);
    if (adaJurnal) {
      expect(screen.getAllByText(/Tanggal:/i).length).toBeGreaterThan(0);
    }
  });
});

describe('Dashboard - rencana setoran', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('membuka modal ajukan jadwal dan menyimpan rencana baru', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Ajukan Jadwal Setoran/i }));

    // Judul modal berada di luar <form>; ambil form lewat tombol submit-nya.
    const form = screen.getByRole('button', { name: /Ajukan ke Ustadz/i }).closest('form')!;
    fireEvent.submit(form);

    // Dua tombol mengandung "Rencana Setoran" (sidebar + tombol dashboard); ambil sidebar.
    fireEvent.click(screen.getAllByRole('button', { name: /Rencana Setoran/i })[0]);
    expect(screen.getAllByText(/Target:/i).length).toBeGreaterThan(0);
  });
});

describe('Dashboard - modul 30 juz', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('menampilkan 30 kartu juz di mode grid', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    // Kartu juz berupa div (bukan elemen ber-title) dengan label teks "JUZ n"
    const juzCards = screen.getAllByText(/^JUZ \d+$/);
    expect(juzCards.length).toBe(30);
  });

  it('membuka modal evaluasi juz dan menyimpan progres', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));

    const kartuJuz = screen.getAllByText(/^JUZ \d+$/)[7]; // Juz 8
    fireEvent.click(kartuJuz);

    expect(screen.getByText(/Evaluasi & Status Kelulusan Juz/i)).toBeInTheDocument();
    const form = screen.getByRole('button', { name: /Simpan Perubahan Juz|Tutup/i }).closest('form')!;
    fireEvent.submit(form);
    expect(screen.queryByText(/Evaluasi & Status Kelulusan Juz/i)).not.toBeInTheDocument();
  });

  it('bisa berpindah ke mode tampilan tabel', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    const tabelBtn = screen.getByRole('button', { name: /Tabel Rekap/i });
    fireEvent.click(tabelBtn);
    expect(screen.getByText(/Tabel Rincian Capaian Mutaba'ah/i)).toBeInTheDocument();
  });
});

describe('Dashboard - data santri & setoran (admin)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('menampilkan daftar santri di tab Data Santri', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    expect(screen.getByText(INITIAL_SANTRI[0].nama)).toBeInTheDocument();
  });

  it('menyimpan santri baru lewat modal Tambah Santri', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    // Ada dua tombol "Tambah Santri" (header aksi + header tab); keduanya membuka modal yang sama
    fireEvent.click(screen.getAllByRole('button', { name: /Tambah Santri/i })[0]);

    // Judul modal "Pendaftaran Santri Baru" berada di luar <form>; ambil lewat tombol submit
    const form = screen.getByRole('button', { name: /Daftarkan Santri/i }).closest('form')!;
    // Label input tidak punya htmlFor, jadi pakai placeholder-nya
    fireEvent.change(screen.getByPlaceholderText('Contoh: 12351'), { target: { value: '99999' } });
    fireEvent.change(screen.getByPlaceholderText('Nama lengkap santri...'), { target: { value: 'Santri Uji Coba' } });
    fireEvent.submit(form);

    expect(screen.getByText('Santri Uji Coba')).toBeInTheDocument();
  });

  it('menyimpan setoran resmi baru lewat modal Input Setoran', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Input Setoran Resmi/i }));

    // Judul modal "Input Setoran Hafalan Santri" berada di luar <form>; ambil lewat tombol submit
    const form = screen.getByRole('button', { name: /Simpan Setoran/i }).closest('form')!;
    fireEvent.submit(form);

    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    expect(screen.getAllByText(/Ziyadah|Muroja'ah/i).length).toBeGreaterThan(0);
  });

  it('filter jenis setoran berfungsi', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    // Filter jenis berupa tombol (bukan select/combo)
    const murojaahBtn = screen.getByRole('button', { name: "Muroja'ah" });
    fireEvent.click(murojaahBtn);
    expect(murojaahBtn).toHaveClass('bg-emerald-700');
  });

  it('pencarian santri memfilter daftar', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    const search = screen.getByPlaceholderText(/Cari santri berdasarkan/i);
    fireEvent.change(search, { target: { value: INITIAL_SANTRI[0].nama.slice(0, 5) } });
    expect(search).toHaveValue(INITIAL_SANTRI[0].nama.slice(0, 5));
  });

  it('ekspor CSV tidak melempar error', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    const exportBtn = screen.getByRole('button', { name: /Ekspor CSV/i });
    expect(() => fireEvent.click(exportBtn)).not.toThrow();
  });
});

describe('Dashboard - pengaturan backend', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validasi URL kosong saat uji koneksi', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    fireEvent.click(screen.getByRole('button', { name: /Uji Koneksi/i }));
    expect(screen.getByText(/URL belum valid/i)).toBeInTheDocument();
  });

  it('uji koneksi dengan URL GAS valid memanggil API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success' }),
      })
    );
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));

    const urlInput = screen.getByPlaceholderText(/https:\/\/script.google.com/i);
    fireEvent.change(urlInput, {
      target: { value: 'https://script.google.com/macros/s/AKfycbTest/exec' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Uji Koneksi/i }));

    expect(await screen.findByText(/Berhasil terhubung/i)).toBeInTheDocument();
  });

  it('simpan URL backend valid memperbarui state', async () => {
    const { setApiUrl } = renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));

    const urlInput = screen.getByPlaceholderText(/https:\/\/script.google.com/i);
    const url = 'https://script.google.com/macros/s/AKfycbBaru/exec';
    fireEvent.change(urlInput, { target: { value: url } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Perubahan URL/i }));

    await screen.findByText(/berhasil disimpan/i);
    expect(setApiUrl).toHaveBeenCalledWith(url);
  });

  it('konfirmasi reset data mengembalikan data bawaan', async () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reset Semua Data ke Bawaan/i }));
    fireEvent.click(screen.getByRole('button', { name: /Ya, Reset Data/i }));

    expect(await screen.findByText(/berhasil dikembalikan ke bawaan/i)).toBeInTheDocument();
    expect(localStorage.getItem('darul_kamal_santri_list')).toBeNull();
  });
});

describe('Dashboard - menu mobile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggle menu mobile membuka dan menutup dropdown', () => {
    renderDashboard(santriUser);
    const toggle = screen.getAllByRole('button').find(b => b.querySelector('.fa-bars'))!;
    fireEvent.click(toggle);
    expect(screen.getByText(/Modul 30 Juz/i)).toBeInTheDocument();

    const closeToggle = screen.getAllByRole('button').find(b => b.querySelector('.fa-times'))!;
    fireEvent.click(closeToggle);
    expect(screen.queryByText(/Modul 30 Juz/i)).not.toBeInTheDocument();
  });

  it('menu mobile santri berpindah tab dan menutup dropdown', () => {
    renderDashboard(santriUser);
    const bars = () => screen.getAllByRole('button').find(b => b.querySelector('.fa-bars'))!;

    fireEvent.click(bars());
    // Nama sidebar punya angka badge, jadi nama persis hanya cocok dengan item mobile
    fireEvent.click(screen.getByRole('button', { name: 'Jurnal Belajar Mandiri' }));
    expect(screen.getByText(/Jurnal Belajar & Muroja'ah Harian/i)).toBeInTheDocument();
    expect(screen.queryByText(/Modul 30 Juz/i)).not.toBeInTheDocument();

    fireEvent.click(bars());
    fireEvent.click(screen.getByRole('button', { name: 'Nilai Setoran' }));
    expect(screen.getByText(/Catatan Setoran & Evaluasi Nilai/i)).toBeInTheDocument();

    fireEvent.click(bars());
    fireEvent.click(screen.getByRole('button', { name: 'Modul 30 Juz' }));
    expect(screen.getByRole('heading', { name: /Peta Progres 30 Juz Al-Qur'an/i })).toBeInTheDocument();

    fireEvent.click(bars());
    // [0] sidebar, [1] item dropdown mobile (keduanya namanya persis "Dashboard")
    fireEvent.click(screen.getAllByRole('button', { name: 'Dashboard' })[1]);
    expect(screen.getByText(/Ruang Santri & Mutaba'ah Hafalan/i)).toBeInTheDocument();
  });

  it('menu mobile admin membuka Data Santri, Pengaturan, dan Keluar', () => {
    const { onLogout } = renderDashboard();
    const bars = () => screen.getAllByRole('button').find(b => b.querySelector('.fa-bars'))!;

    fireEvent.click(bars());
    fireEvent.click(screen.getByRole('button', { name: 'Data Santri' }));
    expect(screen.getByText(/Data Santri & Halaqah/i)).toBeInTheDocument();

    fireEvent.click(bars());
    fireEvent.click(screen.getByRole('button', { name: 'Pengaturan' }));
    expect(screen.getByText(/Pengaturan & Integrasi Backend/i)).toBeInTheDocument();

    fireEvent.click(bars());
    fireEvent.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

/**
 * Tombol tutup (X) tiap modal berada di header kartu modal, di luar <form>.
 * Helper ini mengambil tombol tersebut tanpa perlu tahu teks judulnya.
 */
const getModalCloseButton = (): HTMLElement => {
  const card = document.querySelector('.fixed.inset-0.z-50 > div') as HTMLElement;
  const header = card.firstElementChild as HTMLElement;
  return within(header).getByRole('button');
};

describe('Dashboard - widget aksi tab dashboard (santri)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tombol Lanjutkan Hafalan Ini membuka modal jurnal', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Lanjutkan Hafalan Ini/i }));
    expect(screen.getByText(/Catat Jurnal Belajar Mandiri/i)).toBeInTheDocument();
  });

  it('tombol Buka Peta 30 Juz Anda berpindah ke tab hafalan', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Buka Peta 30 Juz Anda/i }));
    expect(screen.getByRole('heading', { name: /Peta Progres 30 Juz Al-Qur'an/i })).toBeInTheDocument();
  });

  it('tombol Buka Catatan Jurnal Belajar berpindah ke tab jurnal', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Buka Catatan Jurnal Belajar/i }));
    expect(screen.getByText(/Jurnal Belajar & Muroja'ah Harian/i)).toBeInTheDocument();
  });

  it('kedua tombol Lihat Semua berpindah ke tab terkait', () => {
    renderDashboard(santriUser);
    const tombol = screen.getAllByRole('button', { name: /Lihat Semua/i });
    expect(tombol).toHaveLength(2);

    fireEvent.click(tombol[0]);
    expect(screen.getByText(/Jurnal Belajar & Muroja'ah Harian/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(screen.getAllByRole('button', { name: /Lihat Semua/i })[1]);
    expect(screen.getByText(/Catatan Setoran & Evaluasi Nilai/i)).toBeInTheDocument();
  });

  it('tombol Tambah Catatan Belajar Baru membuka modal jurnal', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Tambah Catatan Belajar Baru/i }));
    expect(screen.getByText(/Catat Jurnal Belajar Mandiri/i)).toBeInTheDocument();
  });

  it('tombol Lihat Jadwal & Rencana Setoran berpindah ke tab rencana', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Lihat Jadwal & Rencana Setoran/i }));
    expect(screen.getByRole('heading', { name: /Rencana & Jadwal Setoran ke Musyrif/i })).toBeInTheDocument();
  });
});

describe('Dashboard - modal penanda baca (bookmark)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('membuka modal bookmark lewat tombol Ubah dan menyimpan penanda baru', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: 'Ubah' }));
    expect(screen.getByText(/Atur Penanda Terakhir Baca/i)).toBeInTheDocument();

    // Judul modal berada di luar <form>; ambil form lewat tombol submit-nya
    const form = screen.getByRole('button', { name: /Simpan Penanda/i }).closest('form')!;
    fireEvent.change(within(form).getByRole('combobox'), { target: { value: '1' } });
    fireEvent.change(within(form).getByRole('spinbutton'), { target: { value: '7' } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Atur Penanda Terakhir Baca/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Surat Al-Fatihah/i)).toBeInTheDocument();
    expect(screen.getByText(/Ayat 7 • Juz 1/i)).toBeInTheDocument();
  });

  it('tombol Batal dan tombol X menutup modal bookmark tanpa menyimpan', () => {
    renderDashboard(santriUser);

    fireEvent.click(screen.getByRole('button', { name: 'Ubah' }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Atur Penanda Terakhir Baca/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ayat 45 • Juz 8/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ubah' }));
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Atur Penanda Terakhir Baca/i)).not.toBeInTheDocument();
  });
});

describe('Dashboard - modal jurnal belajar (interaksi field)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mengisi semua field modal jurnal lalu menyimpan', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Catat Belajar Hari Ini/i }));
    const form = screen.getByRole('button', { name: /Simpan Catatan Belajar/i }).closest('form')!;

    const [kegiatan, surah, kelancaran] = within(form).getAllByRole('combobox');
    fireEvent.change(kegiatan, { target: { value: "Muroja'ah Mandiri" } });
    fireEvent.change(surah, { target: { value: '2' } }); // Al-Baqarah (juz 1, 286 ayat)
    fireEvent.change(kelancaran, { target: { value: 'Cukup Lancar' } });

    const [durasi, ayatAwal, ayatAkhir, juz] = within(form).getAllByRole('spinbutton');
    fireEvent.change(durasi, { target: { value: '55' } });
    fireEvent.change(ayatAwal, { target: { value: '5' } });
    fireEvent.change(ayatAkhir, { target: { value: '20' } });
    fireEvent.change(juz, { target: { value: '2' } });

    fireEvent.change(within(form).getByRole('textbox'), {
      target: { value: 'Ayat 5 kemiripan dengan Al-Baqarah' },
    });
    fireEvent.submit(form);

    expect(screen.queryByText(/Catat Jurnal Belajar Mandiri/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Jurnal Belajar Mandiri/i }));
    expect(screen.getAllByText("Muroja'ah Mandiri").length).toBeGreaterThan(0);
    expect(screen.getByText(/Ayat 5 kemiripan dengan Al-Baqarah/i)).toBeInTheDocument();
  });

  it('tombol Batal dan tombol X menutup modal jurnal', () => {
    renderDashboard(santriUser);

    fireEvent.click(screen.getByRole('button', { name: /Catat Belajar Hari Ini/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Catat Jurnal Belajar Mandiri/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Catat Belajar Hari Ini/i }));
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Catat Jurnal Belajar Mandiri/i)).not.toBeInTheDocument();
  });

  it('tombol Tulis Jurnal Belajar Baru di tab jurnal membuka modal', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Jurnal Belajar Mandiri/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tulis Jurnal Belajar Baru/i }));
    expect(screen.getByText(/Catat Jurnal Belajar Mandiri/i)).toBeInTheDocument();
  });
});

describe('Dashboard - modal rencana setoran (interaksi field)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mengisi semua field modal rencana lalu mengajukan', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Ajukan Jadwal Setoran/i }));
    const form = screen.getByRole('button', { name: /Ajukan ke Ustadz/i }).closest('form')!;

    fireEvent.change(form.querySelector<HTMLInputElement>('input[type="date"]')!, {
      target: { value: '2026-12-01' },
    });
    const [waktu, jenis, surah] = within(form).getAllByRole('combobox');
    fireEvent.change(waktu, { target: { value: "Ba'da Maghrib" } });
    fireEvent.change(jenis, { target: { value: "Muroja'ah" } });
    fireEvent.change(surah, { target: { value: '36' } }); // Ya-Sin (juz 22, 83 ayat)

    const [ayatAwal, ayatAkhir, juz] = within(form).getAllByRole('spinbutton');
    fireEvent.change(ayatAwal, { target: { value: '1' } });
    fireEvent.change(ayatAkhir, { target: { value: '15' } });
    fireEvent.change(juz, { target: { value: '22' } });

    fireEvent.change(within(form).getByRole('textbox'), { target: { value: 'Sudah hafal 15x lancar' } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Ajukan Jadwal Setoran ke Musyrif/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: /Rencana Setoran/i })[0]);
    expect(screen.getByText(/Target: 2026-12-01/i)).toBeInTheDocument();
    expect(screen.getByText(/Catatan santri: "Sudah hafal 15x lancar"/i)).toBeInTheDocument();
  });

  it('tombol Batal dan tombol X menutup modal rencana', () => {
    renderDashboard(santriUser);

    fireEvent.click(screen.getByRole('button', { name: /Ajukan Jadwal Setoran/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Ajukan Jadwal Setoran ke Musyrif/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ajukan Jadwal Setoran/i }));
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Ajukan Jadwal Setoran ke Musyrif/i)).not.toBeInTheDocument();
  });

  it('tombol Ajukan Jadwal Setoran di tab rencana membuka modal', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getAllByRole('button', { name: /Rencana Setoran/i })[0]);
    // [0] tombol header, [1] tombol di dalam tab rencana
    const tombolTab = screen.getAllByRole('button', { name: /Ajukan Jadwal Setoran/i })[1];
    fireEvent.click(tombolTab);
    expect(screen.getByText(/Ajukan Jadwal Setoran ke Musyrif/i)).toBeInTheDocument();
  });
});

describe('Dashboard - modal setoran resmi & pendaftaran santri (admin)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mengisi semua field modal setoran resmi lalu menyimpan', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Input Setoran Resmi/i }));
    const form = screen.getByRole('button', { name: /Simpan Setoran/i }).closest('form')!;

    const [santri, jenis, surah, nilai] = within(form).getAllByRole('combobox');
    fireEvent.change(santri, { target: { value: INITIAL_SANTRI[1].id } });
    fireEvent.change(jenis, { target: { value: "Muroja'ah" } });
    fireEvent.change(surah, { target: { value: '12' } }); // Yusuf (juz 12, 111 ayat)
    fireEvent.change(nilai, { target: { value: 'C (Jayyid)' } });

    const [juz, ayatAwal, ayatAkhir] = within(form).getAllByRole('spinbutton');
    fireEvent.change(juz, { target: { value: '12' } });
    fireEvent.change(ayatAwal, { target: { value: '1' } });
    fireEvent.change(ayatAkhir, { target: { value: '30' } });

    fireEvent.change(within(form).getByRole('textbox'), { target: { value: 'Perhatikan mad thabi\u2019i' } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Input Setoran Hafalan Santri/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    expect(screen.getAllByText(/Musyrif: KH. Ahmad Ridwan/i).length).toBeGreaterThan(0);
  });

  it('tombol Batal dan tombol X menutup modal setoran resmi', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: /Input Setoran Resmi/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Input Setoran Hafalan Santri/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Input Setoran Resmi/i }));
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Input Setoran Hafalan Santri/i)).not.toBeInTheDocument();
  });

  it('mengisi field pendaftaran santri lalu menyimpan', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    // [0] tombol header, [1] tombol di dalam tab Data Santri
    fireEvent.click(screen.getAllByRole('button', { name: 'Tambah Santri' })[1]);

    const form = screen.getByRole('button', { name: /Daftarkan Santri/i }).closest('form')!;
    const textboxes = within(form).getAllByRole('textbox');
    // urutan: NIS, Nama, Kelas, Halaqah, Musyrif
    fireEvent.change(textboxes[0], { target: { value: '99111' } });
    fireEvent.change(textboxes[1], { target: { value: 'Santri Halaqah Baru' } });
    fireEvent.change(textboxes[2], { target: { value: 'IX - Tahfidz Dasar' } });
    fireEvent.change(textboxes[3], { target: { value: 'Halaqah Utsman' } });
    fireEvent.change(textboxes[4], { target: { value: 'Ustadz Baru' } });
    fireEvent.change(within(form).getByRole('spinbutton'), { target: { value: '5' } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Pendaftaran Santri Baru/i)).not.toBeInTheDocument();
    expect(screen.getByText('Santri Halaqah Baru')).toBeInTheDocument();
    expect(screen.getByText('Halaqah Utsman')).toBeInTheDocument();
    expect(screen.getByText('Ustadz Baru')).toBeInTheDocument();
  });

  it('tombol Batal dan tombol X menutup modal pendaftaran santri', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));

    fireEvent.click(screen.getAllByRole('button', { name: 'Tambah Santri' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Pendaftaran Santri Baru/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Tambah Santri' })[0]);
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Pendaftaran Santri Baru/i)).not.toBeInTheDocument();
  });
});

describe('Dashboard - modul 30 juz (interaksi mendalam)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('admin mengubah status & detail juz lewat modal evaluasi', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    fireEvent.click(screen.getAllByText(/^JUZ \d+$/)[0]);

    expect(screen.getByText(/Evaluasi & Status Kelulusan Juz/i)).toBeInTheDocument();
    const form = screen.getByRole('button', { name: /Simpan Perubahan Juz/i }).closest('form')!;

    const [statusSel, nilaiSel] = within(form).getAllByRole('combobox');
    fireEvent.change(statusSel, { target: { value: 'Mutqin' } });
    fireEvent.change(nilaiSel, { target: { value: 'A (Mumtaz)' } });
    fireEvent.change(form.querySelector<HTMLInputElement>('input[type="date"]')!, {
      target: { value: '2026-03-05' },
    });
    const [penguji, catatan] = within(form).getAllByRole('textbox');
    fireEvent.change(penguji, { target: { value: 'Ustadz Penguji Baru' } });
    fireEvent.change(catatan, { target: { value: 'Catatan evaluasi juz 1' } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Evaluasi & Status Kelulusan Juz/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tabel Rekap/i }));
    expect(screen.getAllByText('Ustadz Penguji Baru').length).toBeGreaterThan(0);
  });

  it('admin mengubah juz menjadi Perlu Muroja\u2019ah (tanpa nilai tasmi)', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    fireEvent.click(screen.getAllByText(/^JUZ \d+$/)[29]); // Juz 30

    const form = screen.getByRole('button', { name: /Simpan Perubahan Juz/i }).closest('form')!;
    const [statusSel, nilaiSel] = within(form).getAllByRole('combobox');
    expect(nilaiSel).toBeDisabled();
    fireEvent.change(statusSel, { target: { value: "Perlu Muroja'ah" } });
    fireEvent.submit(form);

    expect(screen.queryByText(/Evaluasi & Status Kelulusan Juz/i)).not.toBeInTheDocument();
  });

  it('tombol Tutup dan tombol X menutup modal evaluasi juz', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));

    fireEvent.click(screen.getAllByText(/^JUZ \d+$/)[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByText(/Evaluasi & Status Kelulusan Juz/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByText(/^JUZ \d+$/)[1]);
    fireEvent.click(getModalCloseButton());
    expect(screen.queryByText(/Evaluasi & Status Kelulusan Juz/i)).not.toBeInTheDocument();
  });

  it('klik baris tabel dan tombol Detail membuka modal evaluasi', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tabel Rekap/i }));

    const rows = screen.getAllByRole('row');
    fireEvent.click(rows[1]); // baris Juz 1
    expect(screen.getByText(/Evaluasi & Status Kelulusan Juz/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));

    fireEvent.click(screen.getAllByRole('button', { name: /^Detail$/ })[0]);
    expect(screen.getByText(/Evaluasi & Status Kelulusan Juz/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));

    fireEvent.click(screen.getByRole('button', { name: /Grid 30 Juz/i }));
    expect(screen.getAllByText(/^JUZ \d+$/)).toHaveLength(30);
  });

  it('filter status tetap menyaring saat mode tabel aktif', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Tabel Rekap/i }));

    const progress = INITIAL_SANTRI[0].juzProgress || {};
    const jumlahMutqin = Object.values(progress).filter(p => p.status === 'Mutqin').length;

    fireEvent.click(screen.getByRole('button', { name: /^Mutqin \(\d+\)$/ }));
    // header + baris Mutqin
    expect(screen.getAllByRole('row')).toHaveLength(jumlahMutqin + 1);

    fireEvent.click(screen.getByRole('button', { name: 'Semua (30)' }));
    expect(screen.getAllByRole('row')).toHaveLength(31);
  });

  it('filter status pada peta 30 juz menyaring kartu', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    const progress = INITIAL_SANTRI[0].juzProgress || {};
    const hitung = (status: string) =>
      Object.values(progress).filter(p => p.status === status).length;

    fireEvent.click(screen.getByRole('button', { name: /^Mutqin \(\d+\)$/ }));
    expect(screen.queryAllByText(/^JUZ \d+$/)).toHaveLength(hitung('Mutqin'));

    fireEvent.click(screen.getByRole('button', { name: /^Sedang Berjalan \(\d+\)$/ }));
    expect(screen.queryAllByText(/^JUZ \d+$/)).toHaveLength(hitung('Sedang Berjalan'));

    fireEvent.click(screen.getByRole('button', { name: /^Perlu Muroja'ah \(\d+\)$/ }));
    expect(screen.queryAllByText(/^JUZ \d+$/)).toHaveLength(hitung("Perlu Muroja'ah"));

    fireEvent.click(screen.getByRole('button', { name: /^Belum \(\d+\)$/ }));
    expect(screen.queryAllByText(/^JUZ \d+$/)).toHaveLength(hitung('Belum'));

    fireEvent.click(screen.getByRole('button', { name: 'Semua (30)' }));
    expect(screen.queryAllByText(/^JUZ \d+$/)).toHaveLength(30);
  });

  it('admin dapat berpindah santri aktif lewat select Pilih Santri', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: INITIAL_SANTRI[1].id } });
    expect(select).toHaveValue(INITIAL_SANTRI[1].id);
    expect(screen.getByRole('heading', { name: INITIAL_SANTRI[1].nama })).toBeInTheDocument();
  });

  it('tombol Cetak Lembar Pantau memanggil window.print', () => {
    const printMock = vi.fn();
    Object.defineProperty(window, 'print', { value: printMock, configurable: true, writable: true });
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cetak Lembar Pantau/i }));
    expect(printMock).toHaveBeenCalledTimes(1);
  });

  it('tombol Cetak Lembar Pantau menangani error window.print', () => {
    Object.defineProperty(window, 'print', {
      value: () => { throw new Error('print tidak didukung'); },
      configurable: true,
      writable: true,
    });
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Peta Progres 30 Juz/i }));
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /Cetak Lembar Pantau/i }))
    ).not.toThrow();
  });
});

describe('Dashboard - tab rencana, santri, dan setoran (admin/ustadz)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('admin menyetujui rencana setoran yang diajukan', () => {
    renderDashboard();
    fireEvent.click(screen.getAllByRole('button', { name: /Rencana Setoran/i })[0]);

    expect(screen.getByRole('button', { name: /Setujui Jadwal/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Setujui Jadwal/i }));

    expect(screen.queryByRole('button', { name: /Setujui Jadwal/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Disetujui Musyrif').length).toBeGreaterThanOrEqual(2);
  });

  it('kartu santri: tombol Buka Peta 30 Juz membuka peta santri itu', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Buka Peta 30 Juz' })[0]);

    expect(screen.getByRole('heading', { name: /Peta Progres 30 Juz Al-Qur'an/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: INITIAL_SANTRI[0].nama })).toBeInTheDocument();
  });

  it('kartu santri: ikon + membuka modal setoran untuk santri terpilih', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    fireEvent.click(screen.getAllByTitle('Input Setoran Resmi')[0]);

    const form = screen.getByRole('button', { name: /Simpan Setoran/i }).closest('form')!;
    expect(within(form).getAllByRole('combobox')[0]).toHaveValue(INITIAL_SANTRI[0].id);

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Input Setoran Hafalan Santri/i)).not.toBeInTheDocument();
  });

  it('filter santri pada tab catatan setoran menyaring daftar', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: INITIAL_SANTRI[1].id } });

    expect(select).toHaveValue(INITIAL_SANTRI[1].id);
    expect(screen.queryByText(/Belum ada catatan setoran resmi yang sesuai filter/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(INITIAL_SANTRI[1].nama).length).toBeGreaterThan(0);
  });

  it('tombol Setoran Baru membuka modal dan bisa dibatalkan', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Setoran Baru' }));
    expect(screen.getByText(/Input Setoran Hafalan Santri/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText(/Input Setoran Hafalan Santri/i)).not.toBeInTheDocument();
  });

  it('pencarian santri berdasarkan NIS menyaring daftar', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Data Santri/i }));
    const search = screen.getByPlaceholderText(/Cari santri berdasarkan/i);
    fireEvent.change(search, { target: { value: INITIAL_SANTRI[1].nis } });

    expect(screen.queryByText(INITIAL_SANTRI[0].nama)).not.toBeInTheDocument();
    expect(screen.getAllByText(INITIAL_SANTRI[1].nama).length).toBeGreaterThan(0);
  });

  it('santri melihat tab catatan setoran tanpa filter santri', () => {
    renderDashboard(santriUser);
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getAllByText(/Ziyadah|Muroja'ah/i).length).toBeGreaterThan(0);
  });

  it('filter santri tanpa data setoran menampilkan status kosong', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Catatan Nilai Setoran/i }));
    // s-5 (Hilman Syakir) tidak punya catatan setoran bawaan
    const tanpaData = INITIAL_SANTRI.find(
      s => !INITIAL_SETORAN.some(r => r.santriId === s.id)
    )!;
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: tanpaData.id } });

    expect(
      screen.getByText(/Belum ada catatan setoran resmi yang sesuai filter/i)
    ).toBeInTheDocument();
  });
});

describe('Dashboard - pengaturan backend (interaksi tambahan)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('tombol Reset ke Offline mengosongkan backend URL', () => {
    const { setApiUrl } = renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reset ke Offline/i }));

    expect(setApiUrl).toHaveBeenCalledWith('');
    expect(screen.getByText(/Kembali ke Mode Offline Lokal/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/https:\/\/script.google.com/i)).toHaveValue('');
  });

  it('uji koneksi yang gagal menampilkan pesan error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('jaringan putus')));
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));

    const urlInput = screen.getByPlaceholderText(/https:\/\/script.google.com/i);
    fireEvent.change(urlInput, { target: { value: 'https://script.google.com/macros/s/AKfycbGagal/exec' } });
    fireEvent.click(screen.getByRole('button', { name: /Uji Koneksi/i }));

    expect(await screen.findByText(/Gagal terhubung/i)).toBeInTheDocument();
  });

  it('tombol Batal pada modal konfirmasi reset menutup modal', () => {
    renderDashboard();
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reset Semua Data ke Bawaan/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));

    expect(screen.queryByText(/Konfirmasi Reset Data/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/berhasil dikembalikan ke bawaan/i)).not.toBeInTheDocument();
  });
});
