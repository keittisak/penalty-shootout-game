# 🎨 Pixel Art Fonts Setup Guide

## 📦 ฟอนต์ที่ใช้ในเกม

เกม Penalty Shootout ใช้ 3 ฟอนต์หลักตามแผนพัฒนา:

### 1. **PressStart2P** (ตัวใหญ่ Pixel Retro)
- **ใช้สำหรับ:** หัวข้อหลัก, ชื่อเกม, คะแนน ใหญ่
- **ลักษณะ:** ตัวใหญ่ 8-bit retro style
- **License:** OFL (Open Font License)
- **Download:** https://fonts.google.com/specimen/Press+Start+2P

### 2. **PixeloidSans** (ตัวปกติ Pixel)
- **ใช้สำหรับ:** ข้อความปกติ, UI elements, ป้ายชื่อ
- **ลักษณะ:** ตัวปกติ pixel style โมเดิร์น
- **License:** Free
- **Download:** 
  - https://itch.io/game-assets/free (ค้นหา "PixeloidSans")
  - หรือ https://www.1001fonts.com/pixeloid-fonts.html

### 3. **VT323** (Retro Terminal)
- **ใช้สำหรับ:** Timer, Code-like elements, Special effects
- **ลักษณะ:** Terminal-style retro font
- **License:** OFL (Open Font License)
- **Download:** https://fonts.google.com/specimen/VT323

---

## 🚀 วิธีติดตั้ง (ใช้ Google Fonts CDN)

### ✅ วิธีนี้ (แนะนำ): ใช้ Google Fonts CDN

ฟอนต์ได้เชื่อมต่อจาก Google Fonts โดยอัตโนมัติในไฟล์ `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');
```

✅ **ข้อดี:**
- ✨ ไม่ต้องดาวน์โหลดไฟล์
- ✨ ปรับปรุงโดยอัตโนมัติ
- ✨ ทำงานได้ทันที
- ✨ ประหยัดเนื้อที่ storage
- ✨ รองรับทุก browsers

❌ **ข้อเสีย:**
- ต้องมีการเชื่อมต่อ Internet

**🎯 การเตรียม:**
1. ฟอนต์ได้ติดตั้งแล้ว - ไม่ต้องทำอะไรเพิ่มเติม! ✅
2. เพียงแค่เรียกใช้ `npm run dev` และใช้ font classes

---
npm run buildnpm run buildnpm run build
### วิธีที่ 2 (Alternative): ใช้ Local Font Files

**หากต้องการใช้ไฟล์ local (ไม่แนะนำ):**

1. **ดาวน์โหลด TTF files:**
   - PressStart2P.ttf
   - PixeloidSans.ttf
   - VT323.ttf

2. **วางไฟล์ในโฟลเดอร์:**
   ```
   public/assets/fonts/
   ├── PressStart2P.ttf
   ├── PixeloidSans.ttf
   └── VT323.ttf
   ```

3. **ฟอนต์จะ import โดยอัตโนมัติจาก `src/index.css`**

✅ **ข้อดี:**
- ไม่ต้องต้องเชื่อมต่อ Internet
- โหลดเร็วกว่า
- ปลอดภัยกว่า

❌ **ข้อเสีย:**
- ต้องดาวน์โหลดด้วยตนเอง
- ขนาดไฟล์เพิ่มขึ้น (ประมาณ 500KB)

---

## 📝 วิธีใช้ใน Components

### Tailwind CSS Class

ใช้ class แบบ Tailwind ที่กำหนดไว้แล้วใน `tailwind.config.js`:

```jsx
// ตัวใหญ่ Pixel Retro (PressStart2P)
<h1 className="font-pixel text-4xl">⚽ Penalty Shootout</h1>

// ตัวปกติ Pixel (PixeloidSans)
<p className="font-pixelMod text-lg">Score: 3 - 2</p>

// Retro Terminal (VT323)
<div className="font-retro text-2xl">SUDDEN DEATH!</div>
```

### Direct Font Family

หรือใช้ CSS style โดยตรง:

```jsx
// JSX
<div style={{ fontFamily: "'PressStart2P', sans-serif" }}>
  Game Title
</div>

// CSS
.game-title {
  font-family: 'PressStart2P', system-ui, sans-serif;
  font-size: 2.25rem;
}
```

---

## 🎨 ตัวอย่าง Component

### ScoreBoard Component

```jsx
import { motion as Motion } from 'framer-motion';

export const ScoreBoard = ({ player1Name, player2Name, score1, score2, round }) => {
  return (
    <Motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-lg p-4 border border-white/10"
    >
      {/* Title - PressStart2P */}
      <h2 className="font-pixel text-center text-white mb-4">
        ROUND {round}/10
      </h2>

      {/* Players and Scores */}
      <div className="flex justify-between items-center gap-8">
        {/* Player 1 */}
        <div className="text-center">
          <p className="font-pixelMod text-white/60 text-sm mb-2">
            {player1Name}
          </p>
          <div className="font-pixel text-4xl text-blue-400">
            {score1}
          </div>
        </div>

        {/* VS */}
        <div className="font-pixel text-white/30 text-xl">VS</div>

        {/* Player 2 */}
        <div className="text-center">
          <p className="font-pixelMod text-white/60 text-sm mb-2">
            {player2Name}
          </p>
          <div className="font-pixel text-4xl text-red-400">
            {score2}
          </div>
        </div>
      </div>
    </Motion.div>
  );
};
```

### Timer Component

```jsx
export const Timer = ({ timeLeft, isUrgent }) => {
  const seconds = Math.ceil(timeLeft / 1000);

  return (
    <div className={`font-retro text-6xl text-center ${
      isUrgent ? 'text-red-500 animate-pulse' : 'text-white'
    }`}>
      {seconds}s
    </div>
  );
};
```

### Game Title

```jsx
export const GameTitle = () => {
  return (
    <Motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="text-center mb-12"
    >
      <h1 className="font-pixel text-5xl sm:text-6xl text-white mb-2">
        ⚽ PENALTY SHOOTOUT
      </h1>
      <p className="font-pixelMod text-white/60 text-sm">
        Multiplayer Turn-Based Battle
      </p>
    </Motion.div>
  );
};
```

---

## 📊 Font Usage Summary

| Component | Font | Size | Color | ตัวอย่าง |
|-----------|------|------|-------|---------|
| Main Title | PressStart2P | 4xl-6xl | white | ⚽ PENALTY SHOOTOUT |
| Score Display | PressStart2P | 3xl-4xl | blue/red | 3 |
| Player Names | PixeloidSans | lg-xl | white/60 | Player 1 |
| Timer | VT323 | 5xl-6xl | white/red | 10s |
| UI Text | PixeloidSans | sm-md | white/60 | ยิง, เซฟ, โกล |
| Status Messages | PressStart2P | lg-2xl | yellow/green | GOAL!, SAVED! |
| Labels | PixeloidSans | xs-sm | white/40 | Round, Score |

---

## 🔧 ตัวอย่างการติดตั้ง

### ✅ ขั้นตอนการติดตั้ง (Google Fonts CDN)

**ทั้งหมดได้ทำเรียบร้อยแล้ว!** ✨

```bash
# 1. Fonts ได้ import จาก Google Fonts ในไฟล์ src/index.css
✅ @import url('https://fonts.googleapis.com/css2?...')

# 2. Tailwind config ได้ตั้งค่าแล้ว
✅ tailwind.config.js - font-pixel, font-pixelMod, font-retro

# 3. เพียงแค่รัน dev server
npm run dev

# 4. ใช้งานได้เลย!
<h1 className="font-pixel text-4xl">⚽ PENALTY SHOOTOUT</h1>
```

---

### (ถ้าต้องการใช้ Local Files แทน)

1. **สร้าง public/assets/fonts folder:**
```bash
mkdir -p public/assets/fonts
```

2. **ดาวน์โหลด font files จาก:**
- **PressStart2P:** https://fonts.google.com/specimen/Press+Start+2P (Download)
- **PixeloidSans:** ค้นหา "PixeloidSans font free download"
- **VT323:** https://fonts.google.com/specimen/VT323 (Download)

3. **วาง .ttf files ไปที่:**
```
public/assets/fonts/
├── PressStart2P.ttf
├── PixeloidSans.ttf
└── VT323.ttf
```

4. **Fonts จะ import โดยอัตโนมัติจาก src/index.css**

---

## 🎯 ขั้นต่อไป

### 1️⃣ เริ่มใช้ Fonts ทันที

```bash
npm run dev
```

### 2️⃣ ใช้ font classes ใน components:

```jsx
<h1 className="font-pixel text-4xl">Your Text</h1>
<p className="font-pixelMod text-lg">Description</p>
<div className="font-retro text-2xl">Timer</div>
```

### 3️⃣ ตรวจสอบการแสดงผลใน browser

🎉 เสร็จเรียบร้อย! Fonts ทำงานได้เลยโดยไม่ต้องดาวน์โหลดไฟล์เพิ่มเติม

---

## 📚 อ้างอิง

- [Google Fonts](https://fonts.google.com/)
- [Tailwind CSS Font Family](https://tailwindcss.com/docs/font-family)
- [CSS @font-face](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
- [Itch.io Game Assets](https://itch.io/game-assets/free)
