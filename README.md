# 🗺️ Nuri3D - Geologik Analiz Tizimi

3 nuqta usuli yordamida geologik qatlamlarning strike, dip va dip direction hisoblash tizimi.

## ✨ Xususiyatlar

### 🔧 Backend (FastAPI)
- **3 Nuqta Analizi**: Strike, dip va dip direction hisoblash
- **CSV Upload**: Ko'p nuqtalarni bir vaqtda yuklash va hisoblash
- **Auth Tizimi**: Username/password bilan himoyalangan API
- **Export**: CSV, JSON, PDF formatlarida natijalarni eksport qilish
- **MongoDB**: Ma'lumotlarni saqlash

### 🎨 Frontend (React)
- **3D Vizualizatsiya**: three.js bilan interaktiv 3D ko'rinish
- **Login/Register**: Foydalanuvchi autentifikatsiyasi
- **Download Buttons**: Natijalarni yuklab olish
- **CSV Upload**: Fayl yuklash interfeysi
- **Responsive Design**: Barcha qurilmalarda ishlaydi

### 🐳 Docker & Deploy
- **Docker Compose**: To'liq konteynerizatsiya
- **GitHub Actions**: CI/CD pipeline
- **Nginx**: Frontend hosting
- **MongoDB**: Ma'lumotlar bazasi

## 🚀 Tez Boshlash

### 1. Loyihani klonlash
```bash
git clone https://github.com/NuriAnaliserDev/NuriAnaliser_3D_GeoMap.git
cd NuriAnaliser_3D_GeoMap
```

### 2. Docker orqali ishga tushirish
```bash
docker-compose up -d
```

### 3. Manual ishga tushirish

#### Backend:
```bash
# Virtual environment yaratish
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Paketlarni o'rnatish
pip install -r requirements.txt

# Server ishga tushirish
python server.py
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📊 API Endpointlar

### Auth
- `POST /api/auth/register` - Ro'yxatdan o'tish
- `POST /api/auth/login` - Kirish

### Analiz
- `POST /api/analyze/three-point` - 3 nuqta analizi
- `POST /api/analyze/upload-csv` - CSV fayl yuklash

### Ma'lumotlar
- `GET /api/projects` - Loyihalar ro'yxati
- `GET /api/results` - Natijalar ro'yxati
- `GET /api/results/export/{format}` - Export (csv/json/pdf)

## 🎯 Foydalanish

1. **Ro'yxatdan o'ting** yoki **kiring**
2. **3 ta nuqta koordinatalarini** kiriting
3. **Hisoblash** tugmasini bosing
4. **3D vizualizatsiyada** natijani ko'ring
5. **CSV fayl** yuklash orqali ko'p nuqtalarni bir vaqtda hisoblang
6. **Export** tugmalari orqali natijalarni yuklab oling

## 📁 Loyiha Strukturasi

```
Nuri3D/
├── backend/                 # FastAPI backend
│   ├── database.py         # MongoDB ulanishi
│   └── services/           # Xizmatlar
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React komponentlari
│   │   └── App.jsx        # Asosiy komponent
│   └── package.json
├── tests/                  # Test fayllari
├── docker-compose.yml     # Docker konfiguratsiyasi
├── Dockerfile.backend     # Backend Dockerfile
└── server.py             # Asosiy server fayli
```

## 🔧 Texnologiyalar

### Backend
- **FastAPI** - Web framework
- **MongoDB** - Ma'lumotlar bazasi
- **Pandas** - Ma'lumotlarni qayta ishlash
- **NumPy** - Matematik hisoblar
- **ReportLab** - PDF generatsiya

### Frontend
- **React 19** - UI framework
- **three.js** - 3D vizualizatsiya
- **@react-three/fiber** - React three.js integratsiyasi
- **Vite** - Build tool

### DevOps
- **Docker** - Konteynerizatsiya
- **GitHub Actions** - CI/CD
- **Nginx** - Web server

## 📝 CSV Format

CSV fayl quyidagi formatda bo'lishi kerak:

```csv
x,y,z
0,0,100
10,0,120
0,10,110
5,5,115
15,5,125
5,15,105
```

Har 3 ta qator uchun strike, dip va dip direction hisoblanadi.

## 🧪 Testlar

```bash
# Backend testlari
python -m pytest tests/ -v

# Frontend testlari
cd frontend
npm test
```

## 🚀 Deploy

### GitHub Actions
Kod push qilinganda avtomatik:
1. Testlar ishga tushadi
2. Docker image build qilinadi
3. Production ga deploy qilinadi

### Manual Deploy
```bash
# Docker image build qilish
docker build -f Dockerfile.backend -t nuri3d/backend .
docker build -f frontend/Dockerfile -t nuri3d/frontend ./frontend

# Deploy qilish
docker-compose up -d
```

## 📞 Yordam

Muammo bo'lsa:
1. GitHub Issues da xabar bering
2. README ni diqqat bilan o'qing
3. Log fayllarni tekshiring

## 📄 Litsenziya

MIT License - Batafsil ma'lumot uchun LICENSE faylini ko'ring.

---

**Nuri3D** - Geologik analiz uchun professional yechim! 🗺️✨