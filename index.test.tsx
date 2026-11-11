import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen } from '@testing-library/react';

const LOGIN_MARKER = 'Sistem E-Tahfidz Darul Kamal';

describe('index.tsx (entry point aplikasi)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    const el = document.getElementById('root');
    if (el) document.body.removeChild(el);
    document.body.innerHTML = '';
  });

  it('me-mount App ke elemen #root', async () => {
    const rootEl = document.createElement('div');
    rootEl.id = 'root';
    document.body.appendChild(rootEl);

    await import('./index');

    expect(await screen.findByText(LOGIN_MARKER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Masuk Aplikasi/i })).toBeInTheDocument();
  });

  it('melempar error jika elemen #root tidak ada', async () => {
    vi.resetModules();
    await expect(import('./index')).rejects.toThrow(
      'Could not find root element to mount to'
    );
  });
});
