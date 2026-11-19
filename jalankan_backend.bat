@echo off
title Ruang Rontgen - Backend Server (Port 5000)
cd /d "%~dp0project X-ray jantung1\project X-ray jantung"
echo ========================================================
echo   Menjalankan Flask Backend AI Classifier di Port 5000
echo ========================================================
.venv\Scripts\python.exe app.py
pause
