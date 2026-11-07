Feature: Pengujian Aplikasi Lokal di Port 5173

  Scenario: Memverifikasi halaman utama aplikasi lokal
    Given Pengguna mengakses aplikasi lokal di "http://localhost:5173/"
    Then Elemen tombol dengan teks "count is" harus terlihat
    When Pengguna mengklik tombol "count is"
    Then Teks tombol berubah menjadi "count is 1"