@echo off
setlocal
cd /d "%~dp0"

py tools\update_timer_music.py
if errorlevel 1 (
  echo.
  echo The timer music list could not be updated.
  pause
  exit /b 1
)

echo.
echo Timer music list updated successfully.
pause
