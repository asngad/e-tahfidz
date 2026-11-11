import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { callAPI } from './apiService';

describe('apiService.callAPI', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('mengirim POST dengan payload JSON dan Content-Type text/plain', async () => {
    const payload = { action: 'login', id: 'admin', password: 'admin123' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'success', nama: 'Admin', role: 'admin' }),
    });

    const result = await callAPI('https://script.google.com/macros/s/ABC/exec', payload);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/ABC/exec',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
    );
    expect(result.status).toBe('success');
    expect(result.nama).toBe('Admin');
  });

  it('melempar error ketika respons HTTP tidak ok', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(callAPI('https://example.com/exec', { action: 'ping' })).rejects.toThrow(
      'Gagal terhubung ke server. HTTP Error: 500'
    );
  });

  it('melempar error ketika fetch gagal jaringan', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(callAPI('https://example.com/exec', { action: 'ping' })).rejects.toThrow(
      'Gagal terhubung ke server. Failed to fetch'
    );
  });

  it('melempar error ketika body respons bukan JSON valid', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    });

    await expect(callAPI('https://example.com/exec', { action: 'ping' })).rejects.toThrow(
      'Gagal terhubung ke server. Unexpected token'
    );
  });

  it('memakai pesan default ketika error tidak memiliki pesan', async () => {
    // error tanpa properti message -> cabang `error.message || "Unknown error"`
    mockFetch.mockRejectedValue({});

    await expect(callAPI('https://example.com/exec', { action: 'ping' })).rejects.toThrow(
      'Gagal terhubung ke server. Unknown error'
    );
  });
});
