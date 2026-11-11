Feature: Autentikasi Pengguna E-Tahfidz

  Sebagai pengguna aplikasi E-Tahfidz
  Saya ingin dapat masuk ke dalam sistem sesuai hak akses
  Agar dapat mengelola dan memantau hafalan Al-Qur'an santri

  Background:
    Given pengguna membuka halaman login E-Tahfidz

  @positive
  Scenario: Login berhasil sebagai Administrator
    When pengguna memasukkan username "admin"
    And pengguna memasukkan password "admin123"
    And pengguna menekan tombol login
    Then pengguna berhasil masuk ke dashboard

  @positive
  Scenario: Login berhasil sebagai Santri
    When pengguna memasukkan username "12345"
    And pengguna memasukkan password "santri123"
    And pengguna menekan tombol login
    Then pengguna berhasil masuk ke dashboard

  @negative
  Scenario: Login gagal dengan password salah
    When pengguna memasukkan username "admin"
    And pengguna memasukkan password "PasswordSalah!"
    And pengguna menekan tombol login
    Then sistem menampilkan pesan kesalahan login

  @validation
  Scenario: Validasi form login ketika kolom kosong
    When pengguna mengosongkan username dan password
    And pengguna menekan tombol login
    Then sistem menampilkan pesan kesalahan login
