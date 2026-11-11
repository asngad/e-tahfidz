# 📖 E-Tahfidz Pondok Pesantren Darul Kamal

[![CI & SonarQube](https://github.com/asngad/e-tahfidz/actions/workflows/ci.yml/badge.svg)](https://github.com/asngad/e-tahfidz/actions/workflows/ci.yml)
[![Unit Test](https://img.shields.io/badge/unit%20test-196%20passed-brightgreen)](./docs/01-unit-testing.md)
[![Coverage](https://img.shields.io/badge/coverage-98.68%25%20statements-brightgreen)](./docs/01-unit-testing.md)
[![Linter](https://img.shields.io/badge/ESLint-0%20error-brightgreen)](./docs/02-linting-typecheck.md)
[![BDD Integration](https://img.shields.io/badge/BDD%20Playwright-4%20passed-brightgreen)](./docs/03-integration-testing.md)
[![SonarQube Quality Gate](https://img.shields.io/badge/Quality%20Gate-PASSED-brightgreen)](./docs/04-sonarqube-analysis.md)
[![SonarQube Ratings](https://img.shields.io/badge/SonarQube-A%20%7C%20A%20%7C%20A-brightgreen)](./docs/04-sonarqube-analysis.md)

Sistem Informasi Manajemen Tahfidz Al-Qur'an berbasis Web untuk **Pondok Pesantren Darul Kamal**. Aplikasi ini dirancang untuk mempermudah pencatatan setoran hafalan santri (*Ziyadah* dan *Muroja'ah*), pemantauan progres 30 Juz, penilaian tajwid, serta dapat beroperasi secara **Offline/Lokal** maupun terhubung dengan **Google Sheets** via **Google Apps Script (GAS)**.

---

## 📚 Dokumentasi Lengkap Demo Final Project (`/docs`)

Seluruh laporan teknis dan tangkapan layar pengujian telah disusun secara komprehensif pada direktori [`/docs`](./docs/README.md):

- 📊 [**Dokumentasi Utama & Executive Summary**](./docs/README.md)
- 🧪 [**01. Unit Testing & Code Coverage Report (196 Tests Passed, 98.68% Coverage)**](./docs/01-unit-testing.md)
- 🧹 [**02. Linter & Static Typing Report (ESLint 9 + TypeScript, 0 Errors)**](./docs/02-linting-typecheck.md)
- 🎭 [**03. Integration Testing Report (Playwright + Cucumber BDD, 4 Skenario)**](./docs/03-integration-testing.md)
- 🛡️ [**04. SonarQube Static Code Analysis (Reliability A, Security A, Maintainability A, Quality Gate OK)**](./docs/04-sonarqube-analysis.md)

---

## 🚀 Fitur Utama

- **Multi-Role User**:
  - 👑 **Administrator**: Pemantauan keseluruhan santri, halaqah, statistik pesantren, dan pengaturan integrasi backend.
  - 📖 **Ustadz / Musyrif**: Input setoran hafalan baru, penilaian tajwid/makhorijul huruf, serta evaluasi catatan santri.
  - 🌟 **Santri**: Ruang mandiri santri untuk mencatat **Jurnal Belajar & Muroja'ah Harian**, mengatur **Penanda Terakhir Dibaca (Bookmark)**, mengajukan **Rencana & Jadwal Setoran ke Musyrif**, melacak **Streak Keistiqomahan Belajar**, serta memantau **Peta Capaian 30 Juz Al-Qur'an**.
- **Pencatatan Setoran Lengkap**:
  - Mendukung jenis setoran **Ziyadah** (hafalan baru) dan **Muroja'ah** (pengulangan).
  - Detail surat, rentang ayat, nomor juz, dan predikat nilai (*Mumtaz, Jayyid Jiddan, Jayyid, Maqbul*).
- **Modul Progres 30 Juz Al-Qur'an Interaktif**:
  - Peta matriks 30 Juz lengkap dengan nama Arab (الم, سَيَقُولُ, dll.), nama Latin, dan rentang surat.
  - Status 4 warna per juz: *Mutqin (Lulus Tasmi')*, *Sedang Berjalan (Ziyadah Aktif)*, *Perlu Muroja'ah Ulang*, dan *Belum Dimulai*.
  - Modal interaktif evaluasi tasmi', penguji, tanggal kelulusan, dan catatan ayat mutasyabihat.
  - Tampilan ganda (Grid Kartu 30 Juz & Tabel Rekapitulasi).
  - Cetak Lembar Pantau Mutaba'ah 30 Juz siap cetak/PDF.
- **Fleksibilitas Backend Ganda**:
  - **Mode Demo / Offline**: Berjalan langsung tanpa instalasi server tambahan (menggunakan penyimpanan lokal).
  - **Mode Google Apps Script**: Terhubung langsung ke spreadsheet Google Sheets untuk sinkronisasi data santri secara cloud.

---

## 🔑 Akun Uji Coba Bawaan (Demo)

Anda dapat langsung masuk ke aplikasi menggunakan akun bawaan atau menekan tombol **Masuk Cepat (1-Klik)** di halaman login:

| Peran (Role) | ID Pengguna / NIS | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Akses penuh dashboard, data santri, & pengaturan API |
| **Santri** | `12345` atau `santri` | `santri123` | Profil santri Muhammad Fauzan Al-Hafidz (7 Juz) |
| **Ustadz / Musyrif** | `ustadz` | `ustadz123` | Pembina Halaqah Abu Bakar Ash-Shiddiq |

---

## 💻 Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** (versi 18 ke atas disarankan)
- **npm** atau **bun** / **yarn**

### Langkah Menjalankan:

1. **Clone atau buka repositori:**
   ```bash
   cd e-tahfidz-darul-kamal
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di browser pada alamat `http://localhost:3000` (atau port yang ditentukan Vite).

4. **Build untuk Production:**
   ```bash
   npm run build
   ```

---

## 🧪 Quality Assurance (Unit Test, Linter, SonarQube)

Semua pemeriksaan kualitas berjalan otomatis di GitHub Actions (`.github/workflows/ci.yml`) pada setiap *push* dan *pull request* ke `main` / `master` / `develop`.

| Kriteria | Perintah | Status |
| :--- | :--- | :--- |
| **Unit Test (wajib)** | `npm test` — 196 test / 14 file (Vitest 3, frontend + backend) | ✅ Lulus (100%) |
| **Linter (wajib)** | `npm run lint` — ESLint 9 flat config (TypeScript + Express) | ✅ 0 error |
| **Type Check (wajib)** | `npm run typecheck` — `tsc --noEmit` | ✅ Lulus |
| **Coverage (opsional, target ≥ 80%)** | `npm run test:coverage` — Vitest v8 coverage + threshold 80% | ✅ Stmts 98.68% · Lines 98.68% · Branch 86.44% · Funcs 95.80% |
| **Integration Testing (opsional)** | `npm run test:bdd` — Playwright + Cucumber BDD (`features/login.feature`) | ✅ 4 skenario lulus |
| **SonarQube (wajib & opsional)** | Scan SonarQube Community Edition (lokal `localhost:9000`) via `npm run sonar` | ✅ Quality Gate OK · Reliability A · Security A · Maintainability A · Coverage 95.1% |

### Perintah Lengkap

```bash
npm test              # Jalankan seluruh 196 unit test (frontend + backend)
npm run test:watch    # Mode watch saat development
npm run test:coverage # Unit test + laporan coverage (threshold 80%)
npm run test:server   # Khusus unit test backend (Express + MySQL)
npm run lint          # Cek lint tanpa mengubah file (ESLint 9)
npm run lint:fix      # Perbaiki otomatis masalah lint yang bisa diperbaiki
npm run typecheck     # Cek tipe TypeScript tanpa menghasilkan output
npm run test:bdd      # Jalankan pengujian integrasi BDD Cucumber + Playwright (Headless)
npm run test:bdd:headed # Jalankan pengujian integrasi BDD dengan browser terlihat (Demo Interaktif)
npm run sonar:local   # Eksekusi scan SonarQube lokal sekali klik via run-sonar.ps1
```

### Struktur Test

```
├── App.test.tsx                    # Test komponen App (routing auth)
├── index.test.tsx                  # Test entry point (mount ke #root)
├── mockData.test.ts                # Test helper data mock
├── components/
│   ├── Dashboard.test.tsx          # 69 test: modul 30 juz, setoran, jurnal, dll.
│   └── LoginScreen.test.tsx        # 24 test: login, drawer, clipboard, dsb.
├── services/apiService.test.ts     # Test layer HTTP ke Google Apps Script
└── server/tests/                   # Test backend Express (supertest + mock DB)
    ├── app.test.js                 # Health check & routing dasar
    ├── authRoutes.test.js          # Login, /me, otorisasi, error handling
    ├── database.test.js            # Koneksi MySQL (success/failure path)
    ├── santriSurah.test.js         # API santri & surah
    ├── santriRoutes.test.js        # CRUD santri
    └── setoran.test.js             # API setoran (GET/POST/PATCH)
```

### Menjalankan Integration Testing (Opsional)

```bash
npx playwright install   # sekali saja
npm run test:bdd         # BDD Cucumber + Playwright (features/ & steps/)
```

### Setup SonarQube Community Edition (self-hosted, lokal)

1. Unduh SonarQube Community dari https://www.sonarqube.org/downloads/ (butuh Java 17+), lalu ekstrak.
2. Jalankan server:
   ```powershell
   .\sonarqube-<versi>\bin\windows-x86-64\StartSonar.bat
   ```
   Buka **http://localhost:9000** → login `admin` / `admin` → wajib ganti password.
3. Buat token analisis: **My Account → Security → Generate Tokens** → tipe **Project Analysis Token** → simpan.
4. Set variabel lingkungan lalu jalankan scan dari terminal:
   ```powershell
   $env:SONAR_TOKEN = "<token>"
   npm run sonar
   ```
   Konfigurasi scan ada di [`sonar-project.properties`](sonar-project.properties) (`sonar.host.url=http://localhost:9000`, `sonar.projectKey=asngad_e-tahfidz`).
5. Hasil analisis (Reliability / Maintainability / Security + Coverage) tampil di **http://localhost:9000** → Quality Gate **Sonar way**.
6. *(Opsional)* Untuk scan otomatis di GitHub Actions: set repository **variable** `SONAR_HOST_URL` (URL SonarQube yang bisa dijangkau CI) dan **secret** `SONAR_TOKEN` — bila belum diatur, langkah scan otomatis dilewati agar CI tetap hijau.

---

## 🔗 Panduan Integrasi Google Apps Script (Google Sheets)

Jika ingin menghubungkan aplikasi ke Google Sheets milik pesantren:

1. Buka [Google Sheets](https://sheets.new) baru, buat sheet bernama `Santri`.
2. Klik menu **Ekstensi** > **Apps Script**.
3. Hapus kode bawaan dan tempelkan kode berikut ke dalam file `Code.gs`:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'login') {
      var id = String(data.id || '').trim();
      var pass = String(data.password || '').trim();

      // Akun Admin Bawaan
      if (id === 'admin' && pass === 'admin123') {
        return createResponse({
          status: 'success',
          nama: 'Administrator Darul Kamal',
          role: 'admin'
        });
      }

      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('Santri') || ss.getSheets()[0];
      var values = sheet.getDataRange().getValues();

      // Format kolom: [0] ID/NIS, [1] Nama, [2] Kata Sandi, [3] Role
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]).trim() === id && String(values[i][2]).trim() === pass) {
          return createResponse({
            status: 'success',
            nama: values[i][1],
            role: values[i][3] || 'santri'
          });
        }
      }

      return createResponse({ status: 'error', message: 'ID atau Kata Sandi salah.' });
    }

    return createResponse({ status: 'error', message: 'Aksi tidak dikenali.' });
  } catch (err) {
    return createResponse({ status: 'error', message: err.toString() });
  }
}

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Klik tombol **Deploy** > **New Deployment** (Deployment Baru).
5. Pilih jenis **Web App**.
6. Konfigurasikan:
   - **Execute as**: *Me (email Anda)*
   - **Who has access**: *Anyone (Siapa saja)*
7. Salin URL Web App yang berakhiran `/exec`.
8. Buka menu **Pengaturan & API** di aplikasi E-Tahfidz, tempelkan URL tersebut, lalu simpan.

---

## 📁 Struktur Berkas

```
├── App.tsx                 # Komponen utama & state otentikasi
├── components/
│   ├── Button.tsx          # Komponen tombol dengan loading & icon
│   ├── Dashboard.tsx       # Tampilan dashboard interaktif (Admin, Ustadz, Santri)
│   ├── Input.tsx           # Komponen input form
│   └── LoginScreen.tsx     # Tampilan login dengan opsi demo & konfigurasi GAS
├── constants.ts            # Konstanta URL default & aset pola Islami
├── mockData.ts             # Data bawaan (santri, setoran, akun demo, & template Code.gs)
├── services/
│   └── apiService.ts       # Service komunikasi HTTP POST ke Google Apps Script
├── types.ts                # TypeScript interface data model
└── index.html              # Entry point HTML dengan Tailwind & FontAwesome
```

---

## 🕌 Pondok Pesantren Darul Kamal
*Mencetak Generasi Qur'ani yang Berakhlakul Karimah dan Berwawasan Luas.*
