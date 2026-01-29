@echo off
echo ==========================================
echo      AUTO GITHUB PUSH SCRIPT
echo ==========================================
echo.
cd /d "%~dp0"

echo [1/3] Menambahkan semua perubahan...
git add .
if %errorlevel% neq 0 (
    echo Gagal melakukan git add. Pastikan git terinstall.
    pause
    exit /b
)

echo.
echo [2/3] Membuat commit harian...
set datestr=%date:~-4%%date:~3,2%%date:~0,2%
git commit -m "Auto-save: Update harian %datestr%"
if %errorlevel% neq 0 (
    echo Tidak ada perubahan untuk dicommit atau terjadi error.
    pause
    exit /b
)

echo.
echo [3/3] Mengirim ke GitHub (Push)...
git push origin main
if %errorlevel% neq 0 (
    echo Gagal push ke GitHub. Periksa koneksi internet atau kredensial.
    pause
    exit /b
)

echo.
echo ==========================================
echo      SUKSES! Kode berhasil disimpan.
echo ==========================================
timeout /t 5
