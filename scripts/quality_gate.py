#!/usr/bin/env python3
"""
Quality Gate - Test coverage va kod sifatini tekshirish
"""
import subprocess
import sys
import json
import os
from pathlib import Path


def run_command(command, cwd=None):
    """Buyruqni ishga tushirish"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=True, 
            text=True, 
            cwd=cwd
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def check_python_coverage():
    """Python coverage tekshirish"""
    print("🐍 Python coverage tekshirilmoqda...")
    
    success, stdout, stderr = run_command("pytest tests/ --cov=server --cov=backend --cov-report=json --cov-report=term-missing")
    
    if not success:
        print(f"❌ Python testlar muvaffaqiyatsiz: {stderr}")
        return False
    
    # Coverage faylini o'qish
    if os.path.exists("coverage.json"):
        with open("coverage.json", "r") as f:
            coverage_data = json.load(f)
        
        total_coverage = coverage_data["totals"]["percent_covered"]
        print(f"📊 Python coverage: {total_coverage:.2f}%")
        
        if total_coverage < 80:
            print(f"❌ Coverage 80% dan past: {total_coverage:.2f}%")
            return False
        else:
            print(f"✅ Coverage yetarli: {total_coverage:.2f}%")
            return True
    else:
        print("❌ Coverage fayli topilmadi")
        return False


def check_frontend_coverage():
    """Frontend coverage tekshirish"""
    print("⚛️  Frontend coverage tekshirilmoqda...")
    
    # Frontend testlari
    success, stdout, stderr = run_command("npm test -- --coverage", cwd="frontend")
    
    if not success:
        print(f"❌ Frontend testlar muvaffaqiyatsiz: {stderr}")
        return False
    
    # Coverage faylini tekshirish
    coverage_file = Path("frontend/coverage/coverage-summary.json")
    if coverage_file.exists():
        with open(coverage_file, "r") as f:
            coverage_data = json.load(f)
        
        total_coverage = coverage_data["total"]["lines"]["pct"]
        print(f"📊 Frontend coverage: {total_coverage:.2f}%")
        
        if total_coverage < 70:
            print(f"❌ Frontend coverage 70% dan past: {total_coverage:.2f}%")
            return False
        else:
            print(f"✅ Frontend coverage yetarli: {total_coverage:.2f}%")
            return True
    else:
        print("❌ Frontend coverage fayli topilmadi")
        return False


def check_code_quality():
    """Kod sifatini tekshirish"""
    print("🔍 Kod sifatini tekshirilmoqda...")
    
    # Black formatting
    success, stdout, stderr = run_command("black --check .")
    if not success:
        print("❌ Black formatting xatoligi")
        print(stderr)
        return False
    
    # isort
    success, stdout, stderr = run_command("isort --check-only .")
    if not success:
        print("❌ isort xatoligi")
        print(stderr)
        return False
    
    # Ruff linting
    success, stdout, stderr = run_command("ruff check .")
    if not success:
        print("❌ Ruff linting xatoligi")
        print(stderr)
        return False
    
    print("✅ Kod sifatida muammolar yo'q")
    return True


def check_security():
    """Xavfsizlik tekshiruvi"""
    print("🔒 Xavfsizlik tekshirilmoqda...")
    
    # Security testlari
    success, stdout, stderr = run_command("pytest tests/test_security.py -v -m security")
    if not success:
        print("❌ Security testlar muvaffaqiyatsiz")
        print(stderr)
        return False
    
    print("✅ Xavfsizlik testlari muvaffaqiyatli")
    return True


def main():
    """Asosiy funksiya"""
    print("🚀 Quality Gate tekshiruvi boshlanmoqda...\n")
    
    checks = [
        ("Python Coverage", check_python_coverage),
        ("Frontend Coverage", check_frontend_coverage),
        ("Code Quality", check_code_quality),
        ("Security", check_security),
    ]
    
    passed = 0
    total = len(checks)
    
    for name, check_func in checks:
        print(f"\n{'='*50}")
        print(f"🔍 {name} tekshirilmoqda...")
        print('='*50)
        
        if check_func():
            print(f"✅ {name} - MUV AFFAQIYATLI")
            passed += 1
        else:
            print(f"❌ {name} - MUVAFFAQIYATSIZ")
    
    print(f"\n{'='*50}")
    print(f"📊 NATIJA: {passed}/{total} tekshiruv muvaffaqiyatli")
    print('='*50)
    
    if passed == total:
        print("🎉 Barcha quality gate tekshiruvlari muvaffaqiyatli!")
        print("✅ Deploy qilish mumkin!")
        return 0
    else:
        print("❌ Ba'zi tekshiruvlar muvaffaqiyatsiz!")
        print("⚠️  Deploy qilishdan oldin muammolarni hal qiling!")
        return 1


if __name__ == "__main__":
    sys.exit(main())

