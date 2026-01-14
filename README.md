# ⚽ Penalty Shootout Game - เกมยิงจุดโทษ Multiplayer Turn-Based Battle

เกมยิงจุดโทษออนไลน์แบบ real-time multiplayer turn-based battle สำหรับคู่แข่ง 2 คน พร้อมการป้องกันการโกงและจัดการห้องเกม

## 🎮 ฟีเจอร์หลัก

- **Turn-Based Battle System** - เล่นแบบ Turn-based multiplayer ผลัดกันเล่นตรงๆ ระหว่างผู้ยิงและผู้รักษาประตู
- **Multiplayer Real-time** - เชื่อมต่อผ่าน Firebase Realtime Database
- **สุ่มผู้เริ่มต้นยิง** - ระบบสุ่มว่าใครยิงก่อนในแต่ละเกม
- **ป้องกันการโกง** - ใช้ Commit-Reveal Scheme สำหรับซ่อนตัวเลือกผู้ยิง
- **จัดการห้องเกม** - หน้า Admin สำหรับดูและลบห้องเกม
- **Real-time Updates** - อัปเดตคะแนน รอบ และสถานะเกมแบบ real-time
- **Sudden Death Mode** - ระบบต่อเวลาเมื่อคะแนนเท่ากันหลังจบ 10 รอบ
- **ระบบ Presence** - ตรวจสอบสถานะ online/offline ของผู้เล่น

## 🚀 การติดตั้ง

### สิ่งที่ต้องมี
- Node.js 16+ 
- npm หรือ yarn
- Firebase Project

### ขั้นตอนติดตั้ง

1. **Clone Repository**
```bash
git clone <repository-url>
cd penalty-shootout-game-app
```

2. **ติดตั้ง Dependencies**
```bash
npm install
```

3. **ตั้งค่า Firebase**
   - สร้าง Firebase Project ที่ [Firebase Console](https://console.firebase.google.com/)
   - เปิด Realtime Database
   - คัดลอกค่า Firebase Config

4. **สร้างไฟล์ .env**
```bash
cp .env.example .env
```

5. **เติมค่า Firebase ลงใน .env**
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

6. **อัปเดต Firebase Security Rules**

ไปที่ Firebase Console → Realtime Database → Rules และแก้ไขเป็น:

```json
{
  "rules": {
    "games": {
      ".read": "auth != null",
      "$gameId": {
        ".read": "auth != null",
        ".write": "auth != null && (
          !data.exists() || 
          data.child('player1/id').val() === auth.uid ||
          data.child('player2/id').val() === auth.uid
        )"
      }
    }
  }
}
```

7. **รัน Development Server**
```bash
npm run dev
```

เปิด http://localhost:5173 ในเบราว์เซอร์

## 📁 โครงสร้างโปรเจค

```
penalty-shootout-game-app/
├── src/
│   ├── components/
│   │   ├── Game/                 # เกมหลัก
│   │   ├── Lobby/                # หน้าสร้าง/เข้าร่วมเกม
│   │   ├── Result/               # หน้าผลเกม
│   │   └── UI/                   # UI Components
│   ├── pages/
│   │   ├── HomePage.jsx          # หน้าหลัก
│   │   └── AdminPage.jsx         # หน้าจัดการห้องเกม
│   ├── services/
│   │   ├── firebase.js           # Firebase Config
│   │   ├── gameService.js        # Game Operations
│   │   └── gameLogic.js          # Game Logic
│   ├── hooks/
│   │   ├── useGame.js
│   │   ├── useTimer.js
│   │   ├── usePresence.js
│   │   └── usePresence.js
│   ├── context/
│   │   └── GameContext.jsx       # Global State
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🎮 วิธีเล่น

### สร้างห้องเกม
1. ไปที่หน้าหลัก
2. คลิก "🎮 สร้างห้องเกม"
3. ใส่ชื่อผู้เล่น
4. ส่งรหัสห้องให้คู่แข่ง

### เข้าร่วมเกม
1. ไปที่หน้าหลัก
2. คลิก "🎯 เข้าร่วมเกม"
3. ใส่รหัสห้องและชื่อผู้เล่น
4. กดเข้าร่วม

### การเล่น (Turn-Based Battle)
1. ระบบจะสุ่มว่าใครยิงก่อน (ผลัดกัน)
2. **Turn ผู้ยิง** - เลือกทิศทาง (ซ้าย/กลาง/ขวา) ในเวลา 10 วินาที
3. **Turn ผู้รักษา** - เลือกทิศทางในเวลา 10 วินาที (ไม่รู้ตัวเลือกของผู้ยิง)
4. ระบบตัดสินผล (เข้า/เซฟ) และเปิดเผยตัวเลือกทั้งคู่
5. ผลัดกันยิงคนละ 5 ครั้ง (รวม 10 รอบ)
6. คะแนนสูงกว่าเป็นผู้ชนะ
7. ถ้าเท่ากัน เข้า Sudden Death (ยิงผลัดกันจนกว่าจะมีผู้ชนะ)

## 🛠️ เทคโนโลยีที่ใช้

- **Frontend**
  - React 19
  - Vite
  - Tailwind CSS
  - Framer Motion (animations)
  - React Router

- **Backend**
  - Firebase Realtime Database
  - Firebase Authentication (Anonymous)

- **Security**
  - Commit-Reveal Scheme (SHA256)
  - CryptoJS
  - Firebase Security Rules

## 🔧 Build & Deploy

### Build Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📋 Environment Variables

ดูไฟล์ `.env.example` สำหรับรายละเอียด

## 🐛 Troubleshooting

### ได้ error "permission_denied at /games"
- ตรวจสอบว่าแก้ไข Firebase Security Rules แล้ว
- ตรวจสอบว่า Firebase Authentication enabled
- ลองรีเฟรชหน้าและลบ cache

### ไม่สามารถสร้างเกมได้
- ตรวจสอบว่า Firebase credentials ถูกต้อง
- ตรวจสอบว่า Realtime Database enabled
- ดู Console ว่ามี error อะไร

### Timer ไม่ทำงาน
- ตรวจสอบว่าเชื่อมต่อ Firebase
- ตรวจสอบ Browser Console สำหรับ errors

## 🤝 Contribution

ยินดีต้อนรับการ Pull Request และ Issue

## 📝 License

MIT License

## 👨‍💻 ติดต่อสอบถาม

ถ้ามีคำถามหรือข้อเสนอแนะ โปรดเปิด Issue หรือติดต่อผู้พัฒนา
