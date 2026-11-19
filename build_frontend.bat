@echo off
title Ruang Rontgen - Build React Frontend
cd /d "%~dp0frontend"
echo ========================================================
echo   Melakukan Kompilasi React 19 Frontend (Vite Build)
echo ========================================================
npm run build
pause
