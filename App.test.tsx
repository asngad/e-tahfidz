import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

const LOGIN_MARKER = 'Sistem E-Tahfidz Darul Kamal';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('menampilkan layar login ketika belum autentikasi', () => {
    render(<App />);
    expect(screen.getByText(LOGIN_MARKER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Aplikasi/i })).toBeInTheDocument();
  });

  it('menampilkan dashboard ketika ada sesi tersimpan di localStorage', () => {
    localStorage.setItem(
      'darul_kamal_user',
      JSON.stringify({ id: 'admin', nama: 'Admin Tes', role: 'admin' })
    );
    render(<App />);
    expect(screen.getByText(/Beranda E-Tahfidz/i)).toBeInTheDocument();
    expect(screen.getByText('Ahlan wa Sahlan, Admin Tes!')).toBeInTheDocument();
  });

  it('mengabaikan sesi tersimpan yang JSON-nya korup', () => {
    localStorage.setItem('darul_kamal_user', '{tidak-valid-json');
    render(<App />);
    expect(screen.getByText(LOGIN_MARKER)).toBeInTheDocument();
  });

  it('login melalui masuk cepat lalu logout mengembalikan ke layar login', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Admin/i }));

    await waitFor(() => expect(screen.getByText(/Beranda E-Tahfidz/i)).toBeInTheDocument());

    // Sesi tersimpan di localStorage
    expect(localStorage.getItem('darul_kamal_user')).toContain('"role":"admin"');

    // Logout
    fireEvent.click(screen.getByRole('button', { name: /Keluar Akun/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Masuk Aplikasi/i })).toBeInTheDocument()
    );
    expect(localStorage.getItem('darul_kamal_user')).toBeNull();
  });

  it('membaca URL API dari localStorage jika tersimpan', () => {
    const savedUrl = 'https://script.google.com/macros/s/AKfycbTersimpan/exec';
    localStorage.setItem('darul_kamal_api_url', savedUrl);
    localStorage.setItem(
      'darul_kamal_user',
      JSON.stringify({ id: 'admin', nama: 'Admin Tes', role: 'admin' })
    );
    render(<App />);
    // Buka tab pengaturan untuk melihat input URL yang terisi
    fireEvent.click(screen.getByRole('button', { name: /Pengaturan & API/i }));
    const inputs = screen.getAllByDisplayValue(savedUrl);
    expect(inputs.length).toBeGreaterThan(0);
  });
});
