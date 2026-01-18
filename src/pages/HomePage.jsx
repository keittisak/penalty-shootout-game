import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useGameContext } from "../context/GameContext";
import { Button } from "../components/UI";

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
          className="text-8xl mb-12"
        >
          ⚽
        </Motion.div>
        <h1 className="font-pixel text-4xl sm:text-5xl text-white mb-2">
          PENALTY SHOOTOUT
        </h1>
        <p className="font-pixelMod text-white/60">
          Multiplayer Turn-Based Battle
        </p>
      </Motion.div>

      {/* Menu Buttons */}
      <Motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-xs space-y-4"
      >
        <Button
          onClick={() => navigate("/create")}
          className="w-full"
          size="lg"
          disabled={!isConfigured || authLoading}
        >
          🎮 CREATE GAME
        </Button>

        <Button
          onClick={() => navigate("/join")}
          variant="secondary"
          className="w-full"
          size="lg"
          disabled={!isConfigured || authLoading}
        >
          🎯 JOIN GAME
        </Button>

        <Button
          onClick={() => navigate("/admin")}
          variant="ghost"
          className="w-full"
          size="sm"
        >
          ⚙️ MANAGE ROOMS
        </Button>

        {/* Font Showcase Link (Optional) */}
        {/* <Button
          onClick={() => {
            // For now, show an alert. Later we can add a route
            alert('FontShowcase component available at: src/components/FontShowcase.jsx');
          }}
          variant="ghost"
          className="w-full text-xs"
          size="sm"
        >
          🎨 FONT SHOWCASE
        </Button> */}
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
            <p className="text-yellow-400 text-sm mb-2">
              ⚠️ Firebase Not Configured
            </p>
            <p className="text-white/60 text-xs">
              Please create .env file with Firebase credentials
            </p>
            <p className="text-white/40 text-xs mt-2">
              See .env.example for reference
            </p>
          </div>
        )}

        {isConfigured && authLoading && (
          <p className="text-white/50 text-sm">🔄 Connecting...</p>
        )}

        {isConfigured && !authLoading && isAuthenticated && (
          <p className="text-green-400 text-sm">✓ Ready to Play!</p>
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
