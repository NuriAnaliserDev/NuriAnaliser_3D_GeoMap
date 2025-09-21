#!/bin/bash

# Git History dan Maxfiy Ma'lumotlarni Olib Tashlash
# Bu script BFG Repo-Cleaner yordamida ishlaydi

echo "🔍 Git history dan maxfiy ma'lumotlarni tekshirish..."

# 1. Git log da maxfiy ma'lumotlarni qidirish
echo "📋 Git log da maxfiy ma'lumotlar:"
git log --all -p | grep -i -E "(password|secret|key|token|credential)" | head -20

echo ""
echo "🔧 BFG Repo-Cleaner bilan tozalash uchun buyruqlar:"
echo ""

# 2. BFG Repo-Cleaner o'rnatish (agar yo'q bo'lsa)
echo "1. BFG Repo-Cleaner o'rnatish:"
echo "   wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar"
echo ""

# 3. Maxfiy fayllarni olib tashlash
echo "2. Maxfiy fayllarni olib tashlash:"
echo "   java -jar bfg-1.14.0.jar --delete-files .env"
echo "   java -jar bfg-1.14.0.jar --delete-files '*.key'"
echo "   java -jar bfg-1.14.0.jar --delete-files '*.pem'"
echo ""

# 4. Maxfiy matnlarni olib tashlash
echo "3. Maxfiy matnlarni olib tashlash:"
echo "   java -jar bfg-1.14.0.jar --replace-text <(echo 'password123==>SECURE_PASSWORD')"
echo "   java -jar bfg-1.14.0.jar --replace-text <(echo 'admin==>SECURE_USER')"
echo ""

# 5. Git history ni qayta yozish
echo "4. Git history ni qayta yozish:"
echo "   git reflog expire --expire=now --all"
echo "   git gc --prune=now --aggressive"
echo ""

echo "⚠️  DIQQAT: Bu operatsiyalar qaytarib bo'lmaydi!"
echo "   Backup yarating: git bundle create backup.bundle --all"
echo ""

# 6. Xavfsizlik tekshiruvi
echo "5. Xavfsizlik tekshiruvi:"
echo "   git log --all -p | grep -i -E '(password|secret|key|token)' | wc -l"
echo "   (Agar 0 chiqsa, tozalash muvaffaqiyatli)"

