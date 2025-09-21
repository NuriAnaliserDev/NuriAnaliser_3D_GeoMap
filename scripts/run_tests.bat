@echo off
echo 🧪 Testlarni ishga tushirish...

REM Python virtual environment tekshirish
if not exist "venv" (
    echo 📦 Virtual environment yaratilmoqda...
    python -m venv venv
)

REM Virtual environment faollashtirish
echo 🔧 Virtual environment faollashtirilmoqda...
call venv\Scripts\activate.bat

REM Dependencies o'rnatish
echo 📚 Dependencies o'rnatilmoqda...
pip install -r requirements.txt

REM MongoDB tekshirish
echo 🗄️ MongoDB tekshirilmoqda...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ MongoDB ishlayapti
) else (
    echo ⚠️  MongoDB ishlamayapti. Iltimos, MongoDB ni ishga tushiring:
    echo    docker-compose up -d mongodb
    echo    yoki
    echo    mongod --dbpath C:\data\db
    pause
    exit /b 1
)

REM Backend testlari
echo 🐍 Backend testlari ishga tushirilmoqda...
pytest tests/ -v --cov=server --cov=backend --cov-report=html --cov-report=term-missing

REM Frontend testlari
echo ⚛️  Frontend testlari ishga tushirilmoqda...
cd frontend
call npm ci
call npm test -- --coverage
cd ..

REM Security testlari
echo 🔒 Security testlari ishga tushirilmoqda...
pytest tests/test_security.py -v -m security

REM Integration testlari
echo 🔗 Integration testlari ishga tushirilmoqda...
pytest tests/test_integration.py -v -m integration

echo ✅ Barcha testlar muvaffaqiyatli yakunlandi!
echo 📊 Coverage hisoboti: htmlcov\index.html
pause

