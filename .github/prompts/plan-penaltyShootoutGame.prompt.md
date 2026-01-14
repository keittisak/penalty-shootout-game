# 📋 แผนพัฒนาเกมยิงจุดโทษ Multiplayer

## 🎯 สถาปัตยกรรมระบบ (System Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Firebase Realtime DB                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  /games/{gameId}                                         │    │
│  │    ├── status: "waiting" | "playing" | "finished"        │    │
│  │    ├── currentRound: 1-10 (หรือมากกว่าใน Sudden Death)   │    │
│  │    ├── currentPhase: "shooting" | "saving" | "result"    │    │
│  │    ├── currentShooter: "player1" | "player2"             │    │
│  │    ├── player1: { id, name, score, connected, choice }   │    │
│  │    ├── player2: { id, name, score, connected, choice }   │    │
│  │    ├── rounds: [ { shooter, shootChoice, saveChoice,     │    │
│  │    │               result, timestamp } ]                 │    │
│  │    ├── timer: { startedAt, duration }                    │    │
│  │    ├── winner: null | "player1" | "player2" | "draw"     │    │
│  │    └── suddenDeath: boolean                              │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
           │                                    │
           ▼                                    ▼
    ┌─────────────┐                      ┌─────────────┐
    │  Player 1   │                      │  Player 2   │
    │  (Client)   │                      │  (Client)   │
    │  React App  │                      │  React App  │
    └─────────────┘                      └─────────────┘
```

---

## 📁 โครงสร้างโปรเจค

```
penalty-shootout-game-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── GameBoard.jsx          # หน้าจอเกมหลัก
│   │   │   ├── GoalPost.jsx           # UI ประตูฟุตบอล
│   │   │   ├── DirectionSelector.jsx  # ปุ่มเลือกทิศทาง (ซ้าย/กลาง/ขวา)
│   │   │   ├── Timer.jsx              # แสดง countdown
│   │   │   ├── ScoreBoard.jsx         # แสดงคะแนน
│   │   │   ├── RoundIndicator.jsx     # แสดงรอบปัจจุบัน
│   │   │   ├── ResultAnimation.jsx    # animation ผลยิง/เซฟ
│   │   │   └── WaitingOverlay.jsx     # รอผู้เล่นอีกฝั่ง
│   │   ├── Lobby/
│   │   │   ├── CreateGame.jsx         # สร้างห้องเกม
│   │   │   ├── JoinGame.jsx           # เข้าร่วมเกม
│   │   │   └── WaitingRoom.jsx        # รอผู้เล่นคนที่ 2
│   │   ├── Result/
│   │   │   ├── GameResult.jsx         # หน้าผลเกม
│   │   │   └── MatchHistory.jsx       # ประวัติการยิงแต่ละรอบ
│   │   └── UI/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       └── Loading.jsx
│   ├── hooks/
│   │   ├── useGame.js                 # จัดการ state เกม
│   │   ├── useTimer.js                # จัดการ countdown
│   │   ├── useFirebase.js             # เชื่อมต่อ Firebase
│   │   └── usePresence.js             # ตรวจสอบ online/offline
│   ├── services/
│   │   ├── firebase.js                # Firebase config
│   │   ├── gameService.js             # CRUD operations สำหรับเกม
│   │   └── gameLogic.js               # Logic ตัดสินผล (authoritative)
│   ├── utils/
│   │   ├── constants.js               # ค่าคงที่ต่างๆ
│   │   ├── helpers.js                 # utility functions
│   │   └── validators.js              # validation functions
│   ├── context/
│   │   └── GameContext.jsx            # React Context สำหรับ state
│   ├── App.jsx
│   ├── index.js
│   └── index.css                      # Tailwind imports
├── .env                               # Firebase credentials
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🗄️ Firebase Database Schema

```javascript
// /games/{gameId}
{
  "gameId": "abc123xyz",
  "status": "playing",           // "waiting" | "playing" | "finished"
  "createdAt": 1736780400000,
  "updatedAt": 1736780500000,
  
  // ข้อมูลผู้เล่น
  "player1": {
    "id": "user_abc",
    "name": "Player 1",
    "score": 2,
    "connected": true,
    "lastSeen": 1736780500000,
    // choice จะถูกเข้ารหัสและซ่อนจนกว่าจะเปิดเผย
    "hasChosen": true,
    "encryptedChoice": "hashed_value"  // ป้องกันการโกง
  },
  "player2": {
    "id": "user_xyz",
    "name": "Player 2", 
    "score": 1,
    "connected": true,
    "lastSeen": 1736780500000,
    "hasChosen": false,
    "encryptedChoice": null
  },
  
  // สถานะเกมปัจจุบัน
  "currentRound": 3,              // รอบที่ 1-10 (หรือมากกว่าใน sudden death)
  "currentPhase": "saving",       // "shooting" | "saving" | "result" | "waiting"
  "currentShooter": "player1",    // ใครเป็นคนยิงรอบนี้
  "currentSaver": "player2",      // ใครเป็นผู้รักษาประตู
  
  // Timer
  "timer": {
    "startedAt": 1736780450000,
    "duration": 10000,            // 10 วินาที (milliseconds)
    "phase": "shooting"           // timer สำหรับ phase ไหน
  },
  
  // ประวัติการยิงแต่ละรอบ (เปิดเผยหลังจบรอบ)
  "rounds": [
    {
      "roundNumber": 1,
      "shooter": "player1",
      "saver": "player2",
      "shootChoice": "left",      // เปิดเผยหลังผู้รับเลือก
      "saveChoice": "right",
      "result": "goal",           // "goal" | "saved" | "timeout_goal" | "timeout_saved"
      "timestamp": 1736780420000
    },
    {
      "roundNumber": 2,
      "shooter": "player2",
      "saver": "player1",
      "shootChoice": "center",
      "saveChoice": "center",
      "result": "saved",
      "timestamp": 1736780440000
    }
  ],
  
  // Sudden Death Mode
  "suddenDeath": false,
  "suddenDeathRound": 0,
  
  // ผลเกม
  "winner": null,                 // null | "player1" | "player2"
  "endReason": null               // "normal" | "sudden_death" | "disconnect"
}
```

---

## 🔒 Firebase Security Rules

```javascript
{
  "rules": {
    "games": {
      "$gameId": {
        // อ่านได้เฉพาะผู้เล่นในเกม
        ".read": "auth != null && (
          data.child('player1/id').val() === auth.uid ||
          data.child('player2/id').val() === auth.uid
        )",
        
        // Player 1 แก้ไขได้เฉพาะข้อมูลตัวเอง
        "player1": {
          "hasChosen": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "encryptedChoice": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "connected": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "lastSeen": {
            ".write": "auth.uid === data.parent().child('id').val()"
          }
        },
        
        // Player 2 แก้ไขได้เฉพาะข้อมูลตัวเอง
        "player2": {
          "hasChosen": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "encryptedChoice": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "connected": {
            ".write": "auth.uid === data.parent().child('id').val()"
          },
          "lastSeen": {
            ".write": "auth.uid === data.parent().child('id').val()"
          }
        },
        
        // ห้ามแก้ไข score, rounds โดยตรง (ต้องผ่าน logic)
        "player1/score": {
          ".write": false
        },
        "player2/score": {
          ".write": false
        }
      }
    }
  }
}
```

---

## 🎮 Game Flow Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                         GAME FLOW                                   │
└────────────────────────────────────────────────────────────────────┘

[START]
    │
    ▼
┌─────────────┐
│ CREATE GAME │ ──► Player 1 สร้างห้อง, ได้รับ Game Code
└─────────────┘
    │
    ▼
┌─────────────┐
│ WAITING     │ ──► รอ Player 2 เข้าร่วม
└─────────────┘
    │
    ▼
┌─────────────┐
│ GAME START  │ ──► สุ่มว่าใครยิงก่อน
└─────────────┘
    │
    ▼
┌───────────────────────────────────────────────────────────────┐
│                    MAIN GAME LOOP                              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Round 1-10 (ผลัดกันยิงคนละ 5 ครั้ง)                      │  │
│  │                                                          │  │
│  │  ┌──────────────┐                                        │  │
│  │  │ SHOOTING     │ ◄─────────────────────────────┐        │  │
│  │  │ PHASE        │                               │        │  │
│  │  │              │                               │        │  │
│  │  │ • ผู้ยิงเลือก   │                               │        │  │
│  │  │   ทิศทาง      │                               │        │  │
│  │  │ • Timer 10s  │                               │        │  │
│  │  │ • ซ่อนจากผู้รับ │                               │        │  │
│  │  └──────┬───────┘                               │        │  │
│  │         │                                       │        │  │
│  │         ▼                                       │        │  │
│  │  ┌──────────────┐                               │        │  │
│  │  │ SAVING       │                               │        │  │
│  │  │ PHASE        │                               │        │  │
│  │  │              │                               │        │  │
│  │  │ • ผู้รับเลือก   │                               │        │  │
│  │  │   ทิศทาง      │                               │        │  │
│  │  │ • Timer 10s  │                               │        │  │
│  │  └──────┬───────┘                               │        │  │
│  │         │                                       │        │  │
│  │         ▼                                       │        │  │
│  │  ┌──────────────┐                               │        │  │
│  │  │ RESULT       │                               │        │  │
│  │  │ PHASE        │                               │        │  │
│  │  │              │                               │        │  │
│  │  │ • เปิดเผยผล    │                               │        │  │
│  │  │ • Animation  │                               │        │  │
│  │  │ • อัพเดทคะแนน  │                               │        │  │
│  │  └──────┬───────┘                               │        │  │
│  │         │                                       │        │  │
│  │         ▼                                       │        │  │
│  │  ┌──────────────┐      ยังไม่ครบ 10 รอบ           │        │  │
│  │  │ CHECK END?   │ ──────────────────────────────┘        │  │
│  │  │              │                                        │  │
│  │  │ ครบ 10 รอบ?   │                                        │  │
│  │  └──────┬───────┘                                        │  │
│  │         │ ครบแล้ว                                         │  │
│  └─────────┼────────────────────────────────────────────────┘  │
│            │                                                    │
│            ▼                                                    │
│  ┌──────────────┐                                              │
│  │ SCORE CHECK  │                                              │
│  │              │                                              │
│  │ คะแนนเท่ากัน?  │                                              │
│  └──────┬───────┘                                              │
│         │                                                       │
│    ┌────┴────┐                                                  │
│    │         │                                                  │
│    ▼         ▼                                                  │
│  ไม่เท่า     เท่ากัน                                              │
│    │         │                                                  │
│    ▼         ▼                                                  │
│ [WINNER]  ┌──────────────┐                                      │
│           │ SUDDEN DEATH │ ◄──────────────┐                     │
│           │              │                │                     │
│           │ ยิงทีละคู่      │                │                     │
│           │ จนกว่าจะมีผู้ชนะ │                │                     │
│           └──────┬───────┘                │                     │
│                  │                        │                     │
│                  ▼                        │                     │
│           ┌──────────────┐                │                     │
│           │ ผลต่างกัน?    │ ── ไม่ ─────────┘                     │
│           └──────┬───────┘                                      │
│                  │ ใช่                                           │
│                  ▼                                              │
│              [WINNER]                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────┐
│ GAME END    │ ──► แสดงผล, เสนอเล่นใหม่
└─────────────┘
    │
    ▼
[END]
```

---

## 🔐 ระบบป้องกันการโกง (Anti-Cheat)

### 1. Commit-Reveal Scheme (ซ่อนตัวเลือกผู้ยิง)

```javascript
// services/gameLogic.js

import CryptoJS from 'crypto-js';

// Phase 1: ผู้ยิงส่ง hash ของตัวเลือก + secret
export const commitChoice = (choice, secret) => {
  // choice = "left" | "center" | "right"
  // secret = random string ที่ผู้เล่นสร้าง
  const commitment = CryptoJS.SHA256(choice + secret).toString();
  return commitment;
};

// Phase 2: หลังผู้รับเลือก, ผู้ยิงเปิดเผย choice + secret
export const revealChoice = (choice, secret, commitment) => {
  const computedHash = CryptoJS.SHA256(choice + secret).toString();
  return computedHash === commitment; // ถ้าตรงกัน = ไม่โกง
};

// ตัวอย่างการใช้งาน
/*
  1. ผู้ยิงเลือก "left" และสร้าง secret "xyz123"
  2. คำนวณ hash: SHA256("leftxyz123") = "abc..."
  3. ส่ง hash ไป Firebase (ผู้รับเห็นแค่ hash)
  4. ผู้รับเลือก "right"
  5. ผู้ยิงส่ง reveal: { choice: "left", secret: "xyz123" }
  6. ระบบตรวจสอบว่า hash ตรงกัน
  7. ถ้าตรง = ใช้ choice นั้น, ถ้าไม่ตรง = ผู้ยิงโดนปรับแพ้รอบนั้น
*/
```

### 2. Server-side Validation (ใช้ Firebase Functions หากต้องการ)

```javascript
// Alternative: ใช้ Client-side validation ร่วมกับ Firebase Rules
// เพื่อให้ทำงานได้โดยไม่ต้องมี Backend

// services/gameService.js
export const processRoundResult = async (gameId, roundData) => {
  const { shootChoice, saveChoice } = roundData;
  
  // ตรวจสอบว่าตัวเลือกถูกต้อง
  const validChoices = ['left', 'center', 'right'];
  if (!validChoices.includes(shootChoice) || !validChoices.includes(saveChoice)) {
    throw new Error('Invalid choice');
  }
  
  // ตัดสินผล
  const result = shootChoice === saveChoice ? 'saved' : 'goal';
  
  // ใช้ Firebase Transaction เพื่อ atomic update
  const gameRef = ref(database, `games/${gameId}`);
  await runTransaction(gameRef, (currentData) => {
    if (currentData) {
      // อัพเดทผลรอบนี้
      currentData.rounds.push({
        ...roundData,
        result,
        timestamp: Date.now()
      });
      
      // อัพเดทคะแนน
      if (result === 'goal') {
        const shooter = currentData.currentShooter;
        currentData[shooter].score += 1;
      }
      
      return currentData;
    }
    return currentData;
  });
};
```

---

## ⏱️ Timer System

```javascript
// hooks/useTimer.js
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, serverTimestamp } from 'firebase/database';
import { database } from '../services/firebase';

export const useTimer = (gameId, duration = 10000) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const timerRef = ref(database, `games/${gameId}/timer`);
    
    const unsubscribe = onValue(timerRef, (snapshot) => {
      const timerData = snapshot.val();
      if (timerData && timerData.startedAt) {
        const elapsed = Date.now() - timerData.startedAt;
        const remaining = Math.max(0, timerData.duration - elapsed);
        setTimeLeft(remaining);
        setIsExpired(remaining === 0);
      }
    });
    
    return () => unsubscribe();
  }, [gameId]);
  
  // Countdown ฝั่ง client
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 100;
        if (newTime <= 0) {
          setIsExpired(true);
          return 0;
        }
        return newTime;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [timeLeft]);
  
  return { timeLeft, isExpired };
};
```

---

## 📡 Presence System (ตรวจสอบ Disconnect)

```javascript
// hooks/usePresence.js
import { useEffect } from 'react';
import { ref, onDisconnect, set, serverTimestamp, onValue } from 'firebase/database';
import { database } from '../services/firebase';

export const usePresence = (gameId, playerId, playerKey) => {
  useEffect(() => {
    if (!gameId || !playerId) return;
    
    const connectedRef = ref(database, '.info/connected');
    const playerConnectedRef = ref(database, `games/${gameId}/${playerKey}/connected`);
    const playerLastSeenRef = ref(database, `games/${gameId}/${playerKey}/lastSeen`);
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        // เมื่อ disconnect ให้ set connected = false
        onDisconnect(playerConnectedRef).set(false);
        onDisconnect(playerLastSeenRef).set(serverTimestamp());
        
        // ตอนนี้ online
        set(playerConnectedRef, true);
        set(playerLastSeenRef, serverTimestamp());
      }
    });
    
    return () => unsubscribe();
  }, [gameId, playerId, playerKey]);
};

// ตรวจสอบ opponent disconnect
export const useOpponentPresence = (gameId, opponentKey, onDisconnect) => {
  useEffect(() => {
    if (!gameId) return;
    
    const opponentConnectedRef = ref(database, `games/${gameId}/${opponentKey}/connected`);
    
    const unsubscribe = onValue(opponentConnectedRef, (snapshot) => {
      if (snapshot.val() === false) {
        onDisconnect();
      }
    });
    
    return () => unsubscribe();
  }, [gameId, opponentKey, onDisconnect]);
};
```

---

## 🎨 UI Components Overview

### Main Game Screen Layout
```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │              SCOREBOARD                              │   │
│  │   Player 1: 2    [Round 5/10]    Player 2: 1        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │                    ⚽ GOAL POST ⚽                   │   │
│  │              ┌─────┬─────┬─────┐                    │   │
│  │              │     │     │     │                    │   │
│  │              │  L  │  C  │  R  │                    │   │
│  │              │     │     │     │                    │   │
│  │              └─────┴─────┴─────┘                    │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    TIMER: 7s                         │   │
│  │                                                      │   │
│  │     Your turn to SHOOT! Choose direction:           │   │
│  │                                                      │   │
│  │    ┌─────────┐  ┌─────────┐  ┌─────────┐           │   │
│  │    │  LEFT   │  │ CENTER  │  │  RIGHT  │           │   │
│  │    │   ←     │  │    ↓    │  │    →    │           │   │
│  │    └─────────┘  └─────────┘  └─────────┘           │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Round History: ⚽ ❌ ⚽ ⚽ _  |  ❌ ⚽ _ _ _         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Development Phases

### Phase 1: Project Setup (Day 1)
- [ ] สร้างโปรเจค React ด้วย Vite
- [ ] ติดตั้ง dependencies (Firebase, Tailwind CSS)
- [ ] ตั้งค่า Firebase project และ Realtime Database
- [ ] ตั้งค่า Firebase Security Rules
- [ ] สร้างโครงสร้างโฟลเดอร์

### Phase 2: Authentication & Lobby (Day 2-3)
- [ ] Anonymous Authentication
- [ ] หน้า Create Game
- [ ] หน้า Join Game (ด้วย Game Code)
- [ ] Waiting Room
- [ ] ระบบ Presence (online/offline)

### Phase 3: Core Game Logic (Day 4-6)
- [ ] Game State Management (Context/Reducer)
- [ ] Firebase Realtime listeners
- [ ] Commit-Reveal scheme สำหรับซ่อนตัวเลือก
- [ ] Timer system
- [ ] Round processing logic
- [ ] Score calculation
- [ ] Turn switching logic

### Phase 4: Game UI (Day 7-9)
- [ ] Goal Post component
- [ ] Direction Selector buttons
- [ ] Timer display
- [ ] Scoreboard
- [ ] Round indicator
- [ ] Waiting overlays
- [ ] Role indicator (Shooter/Goalkeeper)

### Phase 5: Animations (Day 10-11)
- [ ] Ball shooting animation
- [ ] Goalkeeper diving animation
- [ ] Goal celebration
- [ ] Save celebration
- [ ] Round transition animations

### Phase 6: End Game & Sudden Death (Day 12-13)
- [ ] Regular game end (after 10 rounds)
- [ ] Sudden Death mode
- [ ] Winner announcement
- [ ] Match history display
- [ ] Play again option

### Phase 7: Edge Cases & Polish (Day 14-15)
- [ ] Handle player disconnect
- [ ] Handle timeout (auto random choice)
- [ ] Reconnection logic
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile responsive design
- [ ] Testing & bug fixes

---

## 🔧 Key Implementation Details

### 1. Game State Machine

```javascript
// utils/constants.js
export const GAME_STATES = {
  WAITING: 'waiting',         // รอผู้เล่นคนที่ 2
  STARTING: 'starting',       // กำลังเริ่มเกม
  SHOOTING_PHASE: 'shooting', // ผู้ยิงกำลังเลือก
  SAVING_PHASE: 'saving',     // ผู้รับกำลังเลือก
  REVEALING: 'revealing',     // กำลังเปิดเผยผล
  RESULT_PHASE: 'result',     // แสดง animation ผล
  SUDDEN_DEATH: 'sudden_death',
  FINISHED: 'finished'        // จบเกม
};

export const DIRECTIONS = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

export const TIMER_DURATION = 10000; // 10 seconds
export const RESULT_DISPLAY_DURATION = 3000; // 3 seconds
export const TOTAL_ROUNDS = 10; // 5 per player
```

### 2. Turn Order Logic

```javascript
// services/gameLogic.js
export const determineShooterForRound = (roundNumber) => {
  // รอบ 1, 3, 5, 7, 9 = Player 1 ยิง
  // รอบ 2, 4, 6, 8, 10 = Player 2 ยิง
  return roundNumber % 2 === 1 ? 'player1' : 'player2';
};

export const determineSaverForRound = (roundNumber) => {
  return roundNumber % 2 === 1 ? 'player2' : 'player1';
};
```

### 3. Win Condition Check

```javascript
// services/gameLogic.js
export const checkWinCondition = (gameState) => {
  const { player1, player2, currentRound, suddenDeath } = gameState;
  
  // ยังไม่ครบ 10 รอบ
  if (currentRound < 10 && !suddenDeath) {
    return { finished: false, winner: null };
  }
  
  // ครบ 10 รอบแล้ว
  if (currentRound >= 10 && !suddenDeath) {
    if (player1.score !== player2.score) {
      return {
        finished: true,
        winner: player1.score > player2.score ? 'player1' : 'player2',
        reason: 'normal'
      };
    }
    // เท่ากัน = เข้า sudden death
    return { finished: false, winner: null, enterSuddenDeath: true };
  }
  
  // Sudden Death: ตรวจสอบทุกๆ 2 รอบ (หลังทั้งคู่ยิงครบ)
  if (suddenDeath && currentRound % 2 === 0) {
    const lastTwoRounds = gameState.rounds.slice(-2);
    const p1Result = lastTwoRounds.find(r => r.shooter === 'player1')?.result;
    const p2Result = lastTwoRounds.find(r => r.shooter === 'player2')?.result;
    
    if (p1Result === 'goal' && p2Result !== 'goal') {
      return { finished: true, winner: 'player1', reason: 'sudden_death' };
    }
    if (p2Result === 'goal' && p1Result !== 'goal') {
      return { finished: true, winner: 'player2', reason: 'sudden_death' };
    }
  }
  
  return { finished: false, winner: null };
};
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.x",
    "firebase": "^11.x",
    "crypto-js": "^4.x",
    "framer-motion": "^11.x",
    "uuid": "^11.x"
  },
  "devDependencies": {
    "vite": "^6.x",
    "tailwindcss": "^4.x",
    "autoprefixer": "^10.x",
    "postcss": "^8.x"
  }
}
```

---

## 🎨 Asset Files สำหรับเกมยิงจุดโทษ (Pixel Art Style)

### 📦 โครงสร้างโฟลเดอร์ Asset

```
penalty-shootout-game-app/
├── public/
│   └── assets/
│       ├── fonts/
│       │   ├── PressStart2P.ttf           # Pixel retro font
│       │   ├── PixeloidSans.ttf           # Modern pixel font
│       │   └── VT323.ttf                  # VT323 pixel font
│       ├── images/
│       │   ├── player/
│       │   │   ├── kicker-idle.png        # ผู้เตะ ยืนเฉย (64x64)
│       │   │   ├── kicker-run.png         # ผู้เตะ วิ่ง (64x64)
│       │   │   ├── kicker-kick-left.png   # ท่าเตะซ้าย (64x64)
│       │   │   ├── kicker-kick-center.png # ท่าเตะกลาง (64x64)
│       │   │   ├── kicker-kick-right.png  # ท่าเตะขวา (64x64)
│       │   │   ├── goalkeeper-idle.png    # ผู้รักษา ยืนเฉย (64x64)
│       │   │   ├── goalkeeper-dive-left.png   # ดำดน ซ้าย (64x64)
│       │   │   ├── goalkeeper-dive-center.png # ดำดน กลาง (64x64)
│       │   │   ├── goalkeeper-dive-right.png  # ดำดน ขวา (64x64)
│       │   │   └── goalkeeper-saved.png       # เซฟสำเร็จ (64x64)
│       │   ├── ball/
│       │   │   ├── ball.png               # ลูกบอล (16x16)
│       │   │   ├── ball-trail.png         # เส้นลูกบอลบิน (8x8)
│       │   │   └── ball-particles.png     # particle effect (8x8)
│       │   ├── goal/
│       │   │   ├── goalpost.png           # ประตูฟุตบอล (256x256)
│       │   │   ├── net.png                # เบ้าประตู (256x256)
│       │   │   ├── goal-zone-left.png     # zone ซ้าย (80x200)
│       │   │   ├── goal-zone-center.png   # zone กลาง (80x200)
│       │   │   └── goal-zone-right.png    # zone ขวา (80x200)
│       │   ├── ui/
│       │   │   ├── button-default.png     # ปุ่ม (160x40)
│       │   │   ├── button-hover.png       # ปุ่มホバー (160x40)
│       │   │   ├── button-pressed.png     # ปุ่มกด (160x40)
│       │   │   ├── button-disabled.png    # ปุ่ม disabled (160x40)
│       │   │   ├── panel-bg.png           # พื้นหลัง panel (400x300)
│       │   │   └── border.png             # frame/border (200x200)
│       │   ├── effects/
│       │   │   ├── goal-explosion.png     # particle explosion (128x128)
│       │   │   ├── save-effect.png        # effect การเซฟ (128x128)
│       │   │   ├── spark.png              # spark particles (16x16)
│       │   │   ├── smoke.png              # smoke effect (32x32)
│       │   │   └── dust.png               # dust cloud (32x32)
│       │   ├── background/
│       │   │   ├── stadium-bg.png         # พื้นหลังสนาม (800x600)
│       │   │   ├── field-grass.png        # หญ้าสนาม (256x256 tileable)
│       │   │   ├── crowd-silhouette.png   # ชุมชนเชียร์ (800x200)
│       │   │   └── lights.png             # ไฟสนาม (800x600)
│       │   └── icons/
│       │       ├── arrow-left.png         # ลูกศร ซ้าย (32x32)
│       │       ├── arrow-center.png       # ลูกศร กลาง (32x32)
│       │       ├── arrow-right.png        # ลูกศร ขวา (32x32)
│       │       ├── timer-icon.png         # ไอคอน timer (32x32)
│       │       ├── score-icon.png         # ไอคอน คะแนน (32x32)
│       │       ├── round-icon.png         # ไอคอน รอบ (32x32)
│       │       ├── success.png            # ✓ สำเร็จ (32x32)
│       │       ├── failed.png             # ✗ ล้มเหลว (32x32)
│       │       └── vs-icon.png            # VS icon (64x64)
│       ├── sounds/
│       │   ├── sfx/
│       │   │   ├── kick-weak.mp3          # เสียงเตะอ่อน
│       │   │   ├── kick-medium.mp3        # เสียงเตะปกติ
│       │   │   ├── kick-strong.mp3        # เสียงเตะแรง
│       │   │   ├── goal-whistle.mp3       # นกหวีด ยิงเข้า
│       │   │   ├── goal-cheer.mp3         # เสียงชุมชน เชียร์
│       │   │   ├── save-sound.mp3         # เสียงเซฟ
│       │   │   ├── post-hit.mp3           # ลูกบอล ชน post
│       │   │   ├── button-click.mp3       # คลิกปุ่ม
│       │   │   ├── countdown-beep.mp3     # beep countdown
│       │   │   ├── round-start.mp3        # เสียงเริ่มรอบ
│       │   │   ├── round-end.mp3          # เสียงจบรอบ
│       │   │   └── game-over.mp3          # เสียงจบเกม
│       │   └── music/
│       │       ├── menu-theme.mp3         # BGM เมนู (loop)
│       │       ├── game-theme.mp3         # BGM เกม (loop)
│       │       ├── sudden-death-theme.mp3 # BGM sudden death (tension)
│       │       ├── victory-theme.mp3      # BGM ชนะ
│       │       └── defeat-theme.mp3       # BGM แพ้
│       └── sprites/
│           ├── kicker-spritesheet.png     # ทุกท่า ผู้เตะ (512x256, 8 frames)
│           ├── goalkeeper-spritesheet.png # ทุกท่า ผู้รักษา (512x256, 8 frames)
│           ├── ball-trail-spritesheet.png # trail ลูกบอล (256x64, 4 frames)
│           └── explosion-spritesheet.png  # particle explosion (512x256, 16 frames)
```

---

### 🎬 Sprite Sheet ข้อมูล

#### Kicker Spritesheet (512x256)
```
┌────────────────────────────────────────────────────┐
│  Idle  Run1  Run2  Kick Kick Kick Kick Kick        │ (64x64 each)
│                      L    C    R    E    S        │
└────────────────────────────────────────────────────┘
Frames: 0=idle, 1-2=run, 3-6=kicks, 7=end
```

#### Goalkeeper Spritesheet (512x256)
```
┌────────────────────────────────────────────────────┐
│  Idle  Dive  Dive  Dive  Save  Idle  Idle  Ready  │ (64x64 each)
│         L    C    R                               │
└────────────────────────────────────────────────────┘
Frames: 0=idle, 1-3=dives, 4=saved, 5-7=ready
```

#### Explosion Spritesheet (512x256)
```
16 frames ของ explosion animation (32x32 each)
สำหรับเล่น เมื่อลูกบอลเข้าประตู
```

---

### 🎨 ขนาด Asset แนะนำ

| Asset Type | ขนาด | หมายเหตุ |
|-----------|------|--------|
| Characters (Player/GK) | 64x64 px | Pixel art standard |
| Ball | 16x16 px | ขนาดเล็ก เพื่อความสมจริง |
| UI Buttons | 160x40 px | หรือ 200x50 px |
| Game Canvas | 800x600 px | หรือ 1024x768 px |
| Sprite Sheets | 256x256+ | Power of 2 (256/512/1024) |
| Icons | 32x32 px | UI icons |
| Background | 800x600 px | หรือ tileable 256x256 |

---

### 📥 ที่มา Asset ฟรี (Pixel Art)

#### 🔗 Website ที่แนะนำ

1. **Itch.io** - https://itch.io/game-assets/free
   - ค้นหา: "pixel soccer", "penalty", "football"
   - มี free packs มากมาย

2. **OpenGameArt.org** - https://opengameart.org/
   - Pixel art backgrounds
   - Character sprites
   - ฟรี CC0/CC-BY license

3. **Kenney.nl** - https://kenney.nl/assets
   - Sports asset packs
   - UI elements
   - ฟรี CC0 license

4. **Freepik.com** - https://www.freepik.com/
   - ค้นหา "pixel soccer"
   - มี free + premium

5. **Game-icons.net** - https://game-icons.net/
   - Simple pixel icons
   - ฟรี CC0

6. **itch.io creators**
   - vinrob (pixel art)
   - chasersgaming (sports)
   - zenzebra (pixel stuff)

---

### 🎨 สร้าง Asset เอง

#### Tools สำหรับสร้าง Pixel Art

1. **Aseprite** (แนะนำ)
   - $19.99 (ขณะนี้)
   - มี trial ฟรี 30 วัน
   - เหมาะสุด สำหรับ spritesheet + animation

2. **Piskel** (ฟรี)
   - https://www.piskelapp.com/
   - Web-based
   - ง่าย สำหรับ beginner

3. **LibreSprite** (ฟรี)
   - Fork ของ Aseprite
   - Open source
   - ใช้ได้แทน Aseprite

4. **Photoshop** / **GIMP**
   - ถ้าต้องการ flexibility มากขึ้น
   - GIMP ฟรี

5. **Krita** (ฟรี)
   - ดี สำหรับ pixel art
   - มีเครื่องมือพิเศษ

---

### 🔧 วิธีใช้ Asset ใน React

#### Import รูปภาพ

```jsx
// filepath: src/components/Game/GoalPost.jsx
import goalpostImg from '@/assets/images/goal/goalpost.png';
import { motion } from 'framer-motion';

export const GoalPost = () => {
  return (
    <motion.div className="relative w-64 h-80">
      <img 
        src={goalpostImg} 
        alt="Goal Post"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};
```

#### Import เสียง

```jsx
// filepath: src/hooks/useSound.js
import { useCallback } from 'react';
import kickStrongSound from '@/assets/sounds/sfx/kick-strong.mp3';
import goalWhistleSound from '@/assets/sounds/sfx/goal-whistle.mp3';
import saveSoundFile from '@/assets/sounds/sfx/save-sound.mp3';

export const useSound = () => {
  const playSound = useCallback((audioPath, volume = 1) => {
    const audio = new Audio(audioPath);
    audio.volume = volume;
    audio.play().catch(err => console.log('Audio play failed:', err));
  }, []);
  
  const playKickSound = () => playSound(kickStrongSound, 0.8);
  const playGoalSound = () => playSound(goalWhistleSound, 1);
  const playSaveSound = () => playSound(saveSoundFile, 0.9);
  
  return { playKickSound, playGoalSound, playSaveSound, playSound };
};
```

#### Import Fonts ใน Tailwind

```css
/* filepath: src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap');

@font-face {
  font-family: 'PressStart2P';
  src: url('/assets/fonts/PressStart2P.ttf') format('truetype');
}

@layer base {
  @font-face {
    font-family: 'Pixel';
    src: url('/assets/fonts/PixeloidSans.ttf') format('truetype');
  }
}
```

```javascript
// filepath: tailwind.config.js
export default {
  theme: {
    fontFamily: {
      pixel: ['PressStart2P', 'sans-serif'],      // ตัวใหญ่ pixel
      pixelMod: ['Pixel', 'PixeloidSans', 'sans-serif'],  // ตัวปกติ
      retro: ['VT323', 'monospace'],              // แบบ retro
    },
    extend: {
      colors: {
        'pixel-green': '#00FF00',
        'pixel-blue': '#0000FF',
        'pixel-red': '#FF0000',
      }
    }
  },
};
```

---

### 🎬 ตัวอย่าง Component ที่ใช้ Asset

```jsx
// filepath: src/components/Game/ResultAnimation.jsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import goalExplosionImg from '@/assets/images/effects/goal-explosion.png';
import goalWhistle from '@/assets/sounds/sfx/goal-whistle.mp3';
import saveEffect from '@/assets/sounds/sfx/save-sound.mp3';
import { useSound } from '@/hooks/useSound';

export const ResultAnimation = ({ result, onComplete }) => {
  const { playSound } = useSound();

  useEffect(() => {
    if (result === 'goal') {
      playSound(goalWhistle, 1);
    } else if (result === 'saved') {
      playSound(saveEffect, 0.8);
    }
  }, [result, playSound]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    >
      {result === 'goal' && (
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 0.8, repeat: 2 }}
          className="text-center"
        >
          <img
            src={goalExplosionImg}
            alt="Goal!"
            className="w-64 h-64 drop-shadow-2xl"
          />
          <motion.p
            className="font-pixel text-4xl text-yellow-400 mt-4 drop-shadow-lg"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ⚽ GOAL! ⚽
          </motion.p>
        </motion.div>
      )}

      {result === 'saved' && (
        <motion.div
          animate={{ scale: [1, 0.9, 1] }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.p
            className="font-pixel text-5xl text-blue-400 drop-shadow-lg"
            animate={{ x: [-20, 20, -20] }}
            transition={{ duration: 0.6 }}
          >
            🛡️ SAVED! 🛡️
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};
```

#### Player Character Component

```jsx
// filepath: src/components/Game/Player.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import kickerIdleImg from '@/assets/images/player/kicker-idle.png';
import kickerKickLeftImg from '@/assets/images/player/kicker-kick-left.png';
import kickerKickCenterImg from '@/assets/images/player/kicker-kick-center.png';
import kickerKickRightImg from '@/assets/images/player/kicker-kick-right.png';

export const Player = ({ action = 'idle', direction = 'center' }) => {
  const [imageSrc, setImageSrc] = useState(kickerIdleImg);

  useEffect(() => {
    if (action === 'kick') {
      if (direction === 'left') setImageSrc(kickerKickLeftImg);
      else if (direction === 'right') setImageSrc(kickerKickRightImg);
      else setImageSrc(kickerKickCenterImg);
    } else {
      setImageSrc(kickerIdleImg);
    }
  }, [action, direction]);

  return (
    <motion.div
      animate={{
        y: action === 'kick' ? [0, -20, 0] : 0,
        scale: action === 'kick' ? [1, 1.1, 1] : 1,
      }}
      transition={{ duration: 0.6 }}
      className="relative w-16 h-16"
    >
      <img
        src={imageSrc}
        alt="Player"
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};
```

---

### ✅ Asset Checklist

**Characters**
- [ ] Kicker idle + kick animations (left/center/right)
- [ ] Goalkeeper idle + dive animations (left/center/right)
- [ ] Save animation

**Objects**
- [ ] Ball (16x16)
- [ ] Goal post with net
- [ ] Goal zones (left/center/right)

**UI**
- [ ] Buttons (default, hover, pressed, disabled)
- [ ] Panel backgrounds
- [ ] Borders/frames
- [ ] Icons (arrows, timer, score, round)

**Effects**
- [ ] Goal explosion
- [ ] Save effect
- [ ] Spark/dust particles
- [ ] Ball trail

**Background**
- [ ] Stadium background
- [ ] Grass field (tileable)
- [ ] Crowd
- [ ] Stadium lights

**Fonts**
- [ ] PressStart2P (ตัวใหญ่)
- [ ] PixeloidSans (ตัวปกติ)
- [ ] VT323 (retro)

**Sounds**
- [ ] Kick sounds (weak, medium, strong)
- [ ] Goal whistle
- [ ] Save sound
- [ ] Button click
- [ ] Countdown beep
- [ ] Game over

**Music**
- [ ] Menu theme
- [ ] Game theme
- [ ] Sudden death theme
- [ ] Victory theme

---

## ✅ สรุป

แผนนี้ครอบคลุม:
1. **สถาปัตยกรรมระบบ** - Client-based ใช้ Firebase Realtime DB
2. **ป้องกันการโกง** - Commit-Reveal scheme + Firebase Security Rules  
3. **Game Flow** - Turn-based พร้อม Timer
4. **Sudden Death** - รองรับการต่อเวลาจนกว่าจะมีผู้ชนะ
5. **Disconnect Handling** - Presence system
6. **UI/UX** - Tailwind CSS + Framer Motion animations
7. **Asset Files** - โครงสร้างครบถ้วนสำหรับ Pixel Art style
