@echo off
echo 🔄 Avtomatik push ishlayapti...
git add .
git commit -m "Add all new features: Auth, 3D Visualization, CSV Upload, Docker, CI/CD"
git push origin main
echo ✅ Push muvaffaqiyatli yakunlandi!
pause
