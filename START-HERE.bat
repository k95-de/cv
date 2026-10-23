@echo off
REM Double-click this file to open "The Flow" (November edition).
REM It starts a tiny local web server and opens your browser.
REM Close this black window to stop the server.
cd /d "%~dp0"
start "" http://localhost:5560/
python -m http.server 5560