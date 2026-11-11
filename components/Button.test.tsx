import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('merender children dengan benar', () => {
    render(<Button>Simpan Data</Button>);
    expect(screen.getByRole('button', { name: /Simpan Data/i })).toBeInTheDocument();
  });

  it('menerapkan variant primary secara default', () => {
    render(<Button>Tombol</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-emerald-600');
  });

  it('menerapkan variant danger', () => {
    render(<Button variant="danger">Hapus</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-red-100');
    expect(button.className).toContain('text-red-600');
  });

  it('menerapkan variant secondary', () => {
    render(<Button variant="secondary">Batal</Button>);
    expect(screen.getByRole('button').className).toContain('bg-gray-200');
  });

  it('menampilkan status loading dan menonaktifkan tombol', () => {
    render(<Button isLoading>Simpan</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Memuat...')).toBeInTheDocument();
  });

  it('tetap bisa dinonaktifkan lewat prop disabled', () => {
    render(<Button disabled>Lanjut</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('memanggil onClick ketika diklik', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Klik Saya</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('merender ikon jika prop icon diberikan', () => {
    render(<Button icon="fas fa-trash">Hapus</Button>);
    const icon = document.querySelector('i.fas.fa-trash');
    expect(icon).not.toBeNull();
  });

  it('gabungan className dari props ikut diterapkan', () => {
    render(<Button className="custom-class">X</Button>);
    expect(screen.getByRole('button').className).toContain('custom-class');
  });

  it('meneruskan atribut button lainnya (type)', () => {
    render(<Button type="submit">Kirim</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
