@echo off
echo ===================================================
echo Starting BusinessSight AI Enterprise Cockpit
echo "See Next Month. Simulate What-If. Act Before Impact."
echo ===================================================

echo Starting FastAPI Backend Gateway on http://localhost:8000...
start cmd /k "cd /d %~dp0backend && set PYTHONPATH=. && python run.py"

timeout /t 3 /nobreak >nul

echo Starting React + Vite Frontend on http://localhost:3000...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services launched successfully!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Opening browser to http://localhost:3000...
timeout /t 2 /nobreak >nul
start http://localhost:3000
echo ===================================================
