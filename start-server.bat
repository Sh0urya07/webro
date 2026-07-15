@echo off
REM ============================================================
REM  WEBRO — one-click local server launcher (Windows)
REM  Double-click this file to run the site at http://localhost:8080
REM ============================================================
cd /d "%~dp0"
set PORT=8080

echo.
echo   Starting WEBRO at http://localhost:%PORT%
echo   (Keep this window open while you browse. Close it to stop.)
echo.

REM Open the browser shortly after the server starts.
start "" http://localhost:%PORT%

REM Try Python, then the "py" launcher, then Node's "serve".
python -m http.server %PORT% 2>nul
if %errorlevel%==0 goto :eof

py -m http.server %PORT% 2>nul
if %errorlevel%==0 goto :eof

npx --yes serve -l %PORT% .
if %errorlevel%==0 goto :eof

echo.
echo   Could not find Python or Node on this PC.
echo   Install Python (https://python.org) or Node (https://nodejs.org),
echo   then double-click this file again.
echo.
pause
