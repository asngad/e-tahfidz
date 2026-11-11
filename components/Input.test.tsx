import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('merender label sesuai prop', () => {
    render(<Input label="NIS Santri" />);
    expect(screen.getByText('NIS Santri')).toBeInTheDocument();
  });

  it('menerapkan lebar penuh secara default', () => {
    const { container } = render(<Input label="Nama" />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('tidak menerapkan w-full jika fullWidth=false', () => {
    const { container } = render(<Input label="Nama" fullWidth={false} />);
    expect(container.firstChild).not.toHaveClass('w-full');
  });

  it('menerima perubahan nilai (controlled)', () => {
    const handleChange = vi.fn();
    render(<Input label="NIS" value="12345" onChange={handleChange} />);
    const input = screen.getByDisplayValue('12345');
    fireEvent.change(input, { target: { value: '67890' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('meneruskan atribut input seperti placeholder dan type', () => {
    render(<Input label="Sandi" type="password" placeholder="Masukkan sandi" />);
    const input = screen.getByPlaceholderText('Masukkan sandi');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('className tambahan digabungkan ke input', () => {
    render(<Input label="X" className="extra-style" />);
    expect(screen.getByRole('textbox').className).toContain('extra-style');
  });

  it('input dinonaktifkan jika disabled', () => {
    render(<Input label="X" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });
});
