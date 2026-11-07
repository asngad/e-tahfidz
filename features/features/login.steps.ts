import { createBdd } from 'playwright-bdd';
import { test, expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

Given(
  'pengguna membuka halaman login E-Tahfidz',
  async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByTestId('login-form')
    ).toBeVisible();
  }
);

When(
  'pengguna memasukkan username {string}',
  async ({ page }, username: string) => {
    await page.getByTestId('username')
      .fill(username);
  }
);

When(
  'pengguna memasukkan password yang valid',
  async ({ page }) => {
    const password = process.env.TEST_PASSWORD;

    if (!password) {
      throw new Error(
        'TEST_PASSWORD belum diatur pada environment.'
      );
    }

    await page.getByTestId('password').fill(password);
  }
);

When(
  'pengguna memasukkan password yang salah',
  async ({ page }) => {
    await page.getByTestId('password')
      .fill('PasswordSalah123!');
  }
);

When(
  'pengguna menekan tombol login',
  async ({ page }) => {
    await page.getByTestId('login-button').click();
  }
);

When(
  'pengguna tidak memasukkan username dan password',
  async ({ page }) => {
    await page.getByTestId('username').clear();
    await page.getByTestId('password').clear();
  }
);

Then(
  'pengguna berhasil masuk ke dashboard',
  async ({ page }) => {
    await expect(
      page.getByTestId('dashboard')
    ).toBeVisible();
  }
);

Then(
  'sistem menampilkan pesan kesalahan login',
  async ({ page }) => {
    await expect(
      page.getByTestId('login-error')
    ).toBeVisible();
  }
);

Then(
  'sistem menampilkan validasi input',
  async ({ page }) => {
    await expect(
      page.getByTestId('login-error')
    ).toBeVisible();
  }
);
