Write-Host "🔄 Avtomatik push ishlayapti..." -ForegroundColor Green
git add .
git commit -m "Add all new features: Auth, 3D Visualization, CSV Upload, Docker, CI/CD"
git push origin main
Write-Host "✅ Push muvaffaqiyatli yakunlandi!" -ForegroundColor Green
Read-Host "Press Enter to continue"
