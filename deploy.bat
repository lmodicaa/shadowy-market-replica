@echo off
echo ========================================
echo   MateCloud - Deploying to Production
echo ========================================
echo.
echo Adding Node.js to PATH...
set PATH=%PATH%;C:\Program Files\nodejs
echo.
echo Starting Vercel deployment...
npx vercel --prod
echo.
echo ========================================
echo   Deploy completed successfully!
echo ========================================
echo.
echo Your site should be live at: https://matecloud.store
echo.
pause
