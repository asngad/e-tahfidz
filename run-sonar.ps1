# =====================================================================
# run-sonar.ps1 - Script Eksekusi SonarQube Static Code Analysis Lokal
# =====================================================================

param (
    [string]$Token = $env:SONAR_TOKEN
)

$HostUrl = "http://localhost:9000"
$ProjectKey = "asngad_e-tahfidz"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   E-TAHFIDZ - SONARQUBE STATIC CODE ANALYSIS SCAN   " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Bersihkan proxy bermasalah dari session
$env:http_proxy = ""
$env:HTTP_PROXY = ""

# 2. Cek status server SonarQube
Write-Host "`n[1/4] Memeriksa status server SonarQube di $HostUrl..." -ForegroundColor Yellow
try {
    $status = Invoke-RestMethod -Uri "$HostUrl/api/system/status" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "      Server SonarQube AKTIF: Status $($status.status) (v$($status.version))" -ForegroundColor Green
} catch {
    Write-Host "      [PERHATIAN] Server SonarQube belum aktif di $HostUrl" -ForegroundColor Red
    Write-Host "      Silakan jalankan StartSonar.bat terlebih dahulu, lalu jalankan kembali skrip ini." -ForegroundColor Gray
    exit 1
}

# 3. Cek laporan coverage
Write-Host "`n[2/4] Memeriksa laporan unit test coverage..." -ForegroundColor Yellow
if (-not (Test-Path "coverage/lcov.info")) {
    Write-Host "      Laporan coverage belum ada. Menjalankan 'npm run test:coverage'..." -ForegroundColor Cyan
    npm run test:coverage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "      [GAGAL] Unit test & coverage gagal." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "      Laporan coverage ditemukan: coverage/lcov.info" -ForegroundColor Green
}

# 4. Token Analisis
Write-Host "`n[3/4] Memeriksa token analisis SonarQube..." -ForegroundColor Yellow
if (-not $Token -and (Test-Path ".sonar-token")) {
    $Token = (Get-Content ".sonar-token" -Raw).Trim()
}

if (-not $Token) {
    Write-Host "      Token belum ditemukan di `$env:SONAR_TOKEN atau file .sonar-token" -ForegroundColor Yellow
    Write-Host "      Langkah membuat token:" -ForegroundColor Gray
    Write-Host "      1. Buka http://localhost:9000 di browser" -ForegroundColor Gray
    Write-Host "      2. My Account -> Security -> Generate Tokens (Tipe: Project Analysis Token)" -ForegroundColor Gray
    Write-Host "      3. Tempelkan token di bawah ini:" -ForegroundColor Gray
    $Token = Read-Host "      Masukkan Token SonarQube"
    if (-not $Token) {
        Write-Host "      [GAGAL] Token wajib diisi untuk melakukan scan." -ForegroundColor Red
        exit 1
    }
    # Tanyakan apakah ingin menyimpan ke .sonar-token (file sudah ada di .gitignore)
    $save = Read-Host "      Simpan token ke file .sonar-token agar tidak perlu memasukkan lagi? (y/n)"
    if ($save -eq 'y' -or $save -eq 'Y') {
        Set-Content -Path ".sonar-token" -Value $Token
        Write-Host "      Token disimpan ke .sonar-token (terlindungi oleh .gitignore)." -ForegroundColor Green
    }
}

# 5. Jalankan Scanner
Write-Host "`n[4/4] Menjalankan SonarScanner..." -ForegroundColor Yellow
$env:SONAR_TOKEN = $Token
npm run sonar

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n======================================================" -ForegroundColor Green
    Write-Host "   SCAN SONARQUBE BERHASIL!                         " -ForegroundColor Green
    Write-Host "   Buka dashboard hasil analisis di:                 " -ForegroundColor Green
    Write-Host "   $HostUrl/dashboard?id=$ProjectKey                 " -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Green
} else {
    Write-Host "`n[CATATAN] Scan selesai dengan kode keluar: $LASTEXITCODE" -ForegroundColor Yellow
}
