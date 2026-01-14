import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import { Button } from '../components/UI';

/**
 * Home Page - Main menu
 */
export const HomePage = () => {
  const navigate = useNavigate();
  const { isConfigured, authLoading, isAuthenticated } = useGameContext();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Title */}
      <Motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <Motion.div
          animate={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          ⚽
        </Motion.div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
          Penalty Shootout
        </h1>
        <p className="text-white/60">เกมยิงจุดโทษ Multiplayer</p>
      </Motion.div>

      {/* Menu Buttons */}
      <Motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs space-y-4"
      >
        <Button
          onClick={() => navigate('/create')}
          className="w-full"
          size="lg"
          disabled={!isConfigured || authLoading}
        >
          🎮 สร้างห้องเกม
        </Button>

        <Button
          onClick={() => navigate('/join')}
          variant="secondary"
          className="w-full"
          size="lg"
          disabled={!isConfigured || authLoading}
        >
          🎯 เข้าร่วมเกม
        </Button>

        <Button
          onClick={() => navigate('/admin')}
          variant="ghost"
          className="w-full"
          size="sm"
        >
          ⚙️ จัดการห้องเกม
        </Button>
      </Motion.div>

      {/* Status indicators */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        {!isConfigured && (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 max-w-sm">
            <p className="text-yellow-400 text-sm mb-2">⚠️ Firebase ยังไม่ได้ตั้งค่า</p>
            <p className="text-white/60 text-xs">
              กรุณาสร้างไฟล์ .env และใส่ค่า Firebase credentials
            </p>
            <p className="text-white/40 text-xs mt-2">
              ดูตัวอย่างได้ที่ .env.example
            </p>
          </div>
        )}

        {isConfigured && authLoading && (
          <p className="text-white/50 text-sm">
            🔄 กำลังเชื่อมต่อ...
          </p>
        )}

        {isConfigured && !authLoading && isAuthenticated && (
          <p className="text-green-400 text-sm">
            ✓ พร้อมเล่น!
          </p>
        )}
      </Motion.div>

      {/* Footer */}
      <Motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-4 text-center text-white/30 text-xs"
      >
        <p>Built with React + Firebase + Tailwind CSS</p>
        <p className="mt-1">🎨 Placeholder UI - No assets required</p>
      </Motion.footer>
    </div>
  );
};

export default HomePage;
