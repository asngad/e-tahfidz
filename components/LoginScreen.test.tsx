import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { LoginScreen } from './LoginScreen';
import { PLACEHOLDER_MARKER } from '../constants';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbTest123/exec';

describe('LoginScreen', () => {
  const setup = (apiUrl = `https://script.google.com/macros/s/${PLACEHOLDER_MARKER}/exec`) => {
    const setApiUrl = vi.fn();
    const onLoginSuccess = vi.fn();
    render(
      <LoginScreen apiUrl={apiUrl} setApiUrl={setApiUrl} onLoginSuccess={onLoginSuccess} />
    );
    return { setApiUrl, onLoginSuccess };
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('merender form login dan tombol masuk cepat', () => {
    setup();
    expect(screen.getByText('Sistem E-Tahfidz Darul Kamal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Contoh: admin atau 12345/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Masukkan kata sandi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Aplikasi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admin/i })).toBeInTheDocument();
  });

  it('menampilkan indikator mode demo ketika URL placeholder', () => {
    setup();
    expect(screen.getByText(/Mode Demo \/ Offline Lokal/i)).toBeInTheDocument();
  });

  it('menampilkan indikator terkoneksi GAS ketika URL valid', () => {
    setup(GAS_URL);
    expect(screen.getByText(/Terkoneksi: Google Apps Script/i)).toBeInTheDocument();
  });

  it('validasi: form kosong menampilkan pesan error', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    expect(
      await screen.findByText('ID Pengguna dan Kata Sandi wajib diisi.')
    ).toBeInTheDocument();
  });

  it('login demo berhasil dengan id admin dan password benar', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    );
  });

  it('login demo gagal ketika password salah', async () => {
    setup();
    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'salah' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    expect(await screen.findByText(/tidak cocok dengan akun demo/i)).toBeInTheDocument();
  });

  it('login akun demo santri lewat NIS 12345', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'santri123' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'santri', id: '12345' })
    );
  });

  it('login akun ustadz alternatif (ustadz/admin123)', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: 'ustadz' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'ustadz' })
    );
  });

  it('masuk cepat (1-klik) admin langsung memanggil onLoginSuccess', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Admin/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1));
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'admin' })
    );
  });

  it('masuk cepat santri langsung memanggil onLoginSuccess', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Santri/i }));
    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'santri' })
    ));
  });

  it('masuk cepat ustadz langsung memanggil onLoginSuccess', async () => {
    const { onLoginSuccess } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Ustadz/i }));
    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'ustadz' })
    ));
  });

  it('login via Google Apps Script sukses ketika API merespons success', async () => {
    const { onLoginSuccess } = setup(GAS_URL);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'success', nama: 'Santri GAS', role: 'santri' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: 'gastoken' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'rahasia' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(() => expect(onLoginSuccess).toHaveBeenCalledTimes(1), { timeout: 3000 });
    expect(onLoginSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ nama: 'Santri GAS', role: 'santri' })
    );
    expect(fetchMock).toHaveBeenCalledWith(
      GAS_URL,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('login via GAS gagal menampilkan pesan error', async () => {
    setup(GAS_URL);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'error', message: 'ID atau Kata Sandi salah.' }),
      })
    );

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), { target: { value: 'salahid' } });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), { target: { value: 'salahpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    expect(await screen.findByText(/Gagal login via Google Apps Script/i)).toBeInTheDocument();
  });

  it('menolak format URL backend yang tidak valid', async () => {
    const { setApiUrl } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    const urlInput = screen.getByPlaceholderText(/script.google.com/i);
    fireEvent.change(urlInput, { target: { value: 'https://bukan-google.com/exec' } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan URL/i }));

    expect(await screen.findByText(/Format URL tidak valid/i)).toBeInTheDocument();
    expect(setApiUrl).not.toHaveBeenCalled();
  });

  it('menyimpan URL backend yang valid', async () => {
    const { setApiUrl } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    const urlInput = screen.getByPlaceholderText(/script.google.com/i);
    fireEvent.change(urlInput, { target: { value: GAS_URL } });
    fireEvent.click(screen.getByRole('button', { name: /Simpan URL/i }));

    await waitFor(() => expect(setApiUrl).toHaveBeenCalledWith(GAS_URL));
    expect(screen.queryByText(/Format URL tidak valid/i)).not.toBeInTheDocument();
  });

  it('membuka dan menutup modal panduan Google Apps Script', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lihat Kode Script/i }));
    expect(screen.getByText(/Panduan Backend Google Apps Script/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Tutup Panduan/i }));
    expect(
      screen.queryByText(/Panduan Backend Google Apps Script/i)
    ).not.toBeInTheDocument();
  });

  it('menutup modal panduan lewat tombol X di header', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lihat Kode Script/i }));

    const judul = screen.getByText(/Panduan Backend Google Apps Script/i);
    fireEvent.click(within(judul.parentElement!).getByRole('button'));

    expect(
      screen.queryByText(/Panduan Backend Google Apps Script/i)
    ).not.toBeInTheDocument();
  });

  it('menyalin kode skrip ke clipboard lewat tombol Salin Kode', async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);

    setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Lihat Kode Script/i }));
    fireEvent.click(screen.getByRole('button', { name: /Salin Kode/i }));

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: /Tersalin!/i })).toBeInTheDocument();
  });

  it('drawer konfigurasi backend bisa dibuka dan ditutup lewat tombol Tutup', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    expect(screen.getByText(/Pengaturan Backend \(Opsional\)/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tutup' }));
    expect(screen.queryByText(/Pengaturan Backend \(Opsional\)/i)).not.toBeInTheDocument();
  });

  it('tombol Reset ke Demo mengosongkan URL backend', () => {
    const { setApiUrl } = setup(GAS_URL);
    fireEvent.click(screen.getByRole('button', { name: /Konfigurasi/i }));
    fireEvent.click(screen.getByRole('button', { name: /Reset ke Demo/i }));

    expect(setApiUrl).toHaveBeenCalledWith('');
  });

  it('login santri dari data tersimpan di localStorage (NIS sebagai password)', async () => {
    localStorage.setItem(
      'darul_kamal_santri_list',
      JSON.stringify([{ id: 's-99', nis: '55555', nama: 'Santri Lokal', kelas: 'X - Wustho' }])
    );
    const { onLoginSuccess } = setup();

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), {
      target: { value: '55555' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), {
      target: { value: '55555' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(
      () =>
        expect(onLoginSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'santri', nama: 'Santri Lokal' })
        ),
      { timeout: 2000 }
    );
  });

  it('login santri dari localStorage dengan password bawaan santri123', async () => {
    localStorage.setItem(
      'darul_kamal_santri_list',
      JSON.stringify([{ id: 's-99', nis: '55556', nama: 'Santri Dua', kelas: 'XI - Ula' }])
    );
    const { onLoginSuccess } = setup();

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), {
      target: { value: 'santri dua' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), {
      target: { value: 'santri123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    await waitFor(
      () =>
        expect(onLoginSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ role: 'santri', nama: 'Santri Dua' })
        ),
      { timeout: 2000 }
    );
  });

  it('santri tersimpan dengan password salah jatuh ke pesan error', async () => {
    localStorage.setItem(
      'darul_kamal_santri_list',
      JSON.stringify([{ id: 's-99', nis: '55557', nama: 'Santri Tiga', kelas: 'XI - Ula' }])
    );
    setup();

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), {
      target: { value: '55557' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), {
      target: { value: 'salah' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    expect(await screen.findByText(/tidak cocok dengan akun demo/i)).toBeInTheDocument();
  });

  it('data santri rusak di localStorage tidak membuat crash', async () => {
    localStorage.setItem('darul_kamal_santri_list', '{bukan-json-valid');
    setup();

    fireEvent.change(screen.getByPlaceholderText(/Contoh: admin atau 12345/i), {
      target: { value: 'tak dikenal' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Masukkan kata sandi/i), {
      target: { value: 'apa saja' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk Aplikasi/i }));

    expect(await screen.findByText(/tidak cocok dengan akun demo/i)).toBeInTheDocument();
  });
});
