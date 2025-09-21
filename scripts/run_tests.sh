#!/bin/bash

# Test ishga tushirish scripti
set -e

echo "🧪 Testlarni ishga tushirish..."

# Python virtual environment tekshirish
if [ ! -d "venv" ]; then
    echo "📦 Virtual environment yaratilmoqda..."
    python -m venv venv
fi

# Virtual environment faollashtirish
echo "🔧 Virtual environment faollashtirilmoqda..."
source venv/bin/activate

# Dependencies o'rnatish
echo "📚 Dependencies o'rnatilmoqda..."
pip install -r requirements.txt

# MongoDB ishga tushirish (agar kerak bo'lsa)
echo "🗄️ MongoDB tekshirilmoqda..."
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB ishlamayapti. Iltimos, MongoDB ni ishga tushiring:"
    echo "   docker-compose up -d mongodb"
    echo "   yoki"
    echo "   mongod --dbpath /path/to/your/db"
    exit 1
fi

# Backend testlari
echo "🐍 Backend testlari ishga tushirilmoqda..."
pytest tests/ -v --cov=server --cov=backend --cov-report=html --cov-report=term-missing

# Frontend testlari
echo "⚛️  Frontend testlari ishga tushirilmoqda..."
cd frontend
npm ci
npm test -- --coverage
cd ..

# Security testlari
echo "🔒 Security testlari ishga tushirilmoqda..."
pytest tests/test_security.py -v -m security

# Integration testlari
echo "🔗 Integration testlari ishga tushirilmoqda..."
pytest tests/test_integration.py -v -m integration

echo "✅ Barcha testlar muvaffaqiyatli yakunlandi!"
echo "📊 Coverage hisoboti: htmlcov/index.html"

