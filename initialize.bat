@echo off
start cmd /k "cd /d frontend && npm run dev"
start cmd /k "cd /d backend && node index.js"
timeout /t 1 >nul
start http://localhost:5173/