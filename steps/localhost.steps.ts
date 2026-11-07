
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given(
  'Pengguna mengakses aplikasi lokal di {string}',
  async ({ page }, url: string) => {
    await page.goto(url);
  }
);

Then(
  'Elemen tombol dengan teks {string} harus terlihat',
  async ({ page }, buttonText: string) => {
    await expect(
      page.getByRole('button', { name: buttonText })
    ).toBeVisible();
  }
);

When(
  'Pengguna mengklik tombol {string}',
  async ({ page }, buttonText: string) => {
    await page.getByRole('button', { name: buttonText }).click();
  }
);

Then(
  'Teks tombol berubah menjadi {string}',
  async ({ page }, expectedText: string) => {
    await expect(
      page.getByRole('button')
    ).toHaveText(expectedText);
  }
);
