@echo off
cd /d "%~dp0"
py tools\update_soundboard.py
if errorlevel 1 (
  echo.
  echo The soundboard was not updated.
)
echo.
pause
