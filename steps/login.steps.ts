import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('pengguna membuka halaman login E-Tahfidz', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto('/');
  await expect(page.getByTestId('login-form')).toBeVisible();
});

When('pengguna memasukkan username {string}', async ({ page }, username: string) => {
  await page.getByTestId('username').fill(username);
});

When('pengguna memasukkan password {string}', async ({ page }, password: string) => {
  await page.getByTestId('password').fill(password);
});

When('pengguna menekan tombol login', async ({ page }) => {
  await page.getByTestId('login-button').click();
});

When('pengguna mengosongkan username dan password', async ({ page }) => {
  await page.getByTestId('username').clear();
  await page.getByTestId('password').clear();
});

Then('pengguna berhasil masuk ke dashboard', async ({ page }) => {
  await expect(page.getByTestId('dashboard')).toBeVisible();
});

Then('sistem menampilkan pesan kesalahan login', async ({ page }) => {
  await expect(page.getByTestId('login-error')).toBeVisible();
});
