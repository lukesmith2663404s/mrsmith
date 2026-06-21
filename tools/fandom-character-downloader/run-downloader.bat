@echo off
setlocal
cd /d "%~dp0\..\.."

echo Installing required Python packages...
py -m pip install -r tools\fandom-character-downloader\requirements.txt
if errorlevel 1 (
  echo.
  echo The "py" command failed. Trying "python" instead...
  python -m pip install -r tools\fandom-character-downloader\requirements.txt
  if errorlevel 1 goto :error
)

echo.
echo Downloading character images...
py tools\fandom-character-downloader\download_character_images.py
if errorlevel 9009 (
  python tools\fandom-character-downloader\download_character_images.py
)

echo.
echo Finished. Open:
echo tools\fandom-character-downloader\character-review.html
pause
exit /b

:error
echo.
echo Python or the required packages could not be installed.
pause
exit /b 1
