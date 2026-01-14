import { motion as Motion } from 'framer-motion';

/**
 * Font Showcase Component
 * Displays all pixel art fonts used in the game
 */
export const FontShowcase = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-pixel text-5xl sm:text-6xl text-white mb-4">
            ⚽ FONTS SHOWCASE
          </h1>
          <p className="font-pixelMod text-white/60">
            Pixel Art Fonts for Penalty Shootout Game
          </p>
        </div>

        {/* Font 1: PressStart2P */}
        <Motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-lg p-8 border border-white/10 mb-8"
        >
          <h2 className="font-pixel text-2xl text-blue-400 mb-4">
            PressStart2P
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Large Title (4xl)
              </p>
              <p className="font-pixel text-4xl text-white">
                PENALTY SHOOTOUT
              </p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Score Display (3xl)
              </p>
              <p className="font-pixel text-3xl text-yellow-400">3 - 2</p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Status Message (2xl)
              </p>
              <p className="font-pixel text-2xl text-green-400">GOAL!</p>
            </div>
          </div>
          <p className="font-pixelMod text-white/40 text-xs mt-6">
            Best for: Titles, Large Scores, Important Messages
          </p>
        </Motion.div>

        {/* Font 2: PixeloidSans */}
        <Motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-lg p-8 border border-white/10 mb-8"
        >
          <h2 className="font-pixel text-2xl text-blue-400 mb-4">
            PixeloidSans
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Main Text (lg)
              </p>
              <p className="font-pixelMod text-lg text-white">
                Player 1: John Doe | Player 2: Jane Smith
              </p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                UI Labels (base)
              </p>
              <p className="font-pixelMod text-base text-white/70">
                Round 5/10 | Score | Timer | Status
              </p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Small Text (sm)
              </p>
              <p className="font-pixelMod text-sm text-white/50">
                Choose your direction: Left (←) | Center (↓) | Right (→)
              </p>
            </div>
          </div>
          <p className="font-pixelMod text-white/40 text-xs mt-6">
            Best for: UI Text, Labels, Player Names, Regular Content
          </p>
        </Motion.div>

        {/* Font 3: VT323 */}
        <Motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-lg p-8 border border-white/10 mb-8"
        >
          <h2 className="font-pixel text-2xl text-blue-400 mb-4">VT323</h2>
          <div className="space-y-4">
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Timer Display (5xl)
              </p>
              <p className="font-retro text-5xl text-white">10s</p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Terminal Style (2xl)
              </p>
              <p className="font-retro text-2xl text-cyan-400">
                [SUDDEN DEATH]
              </p>
            </div>
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-2">
                Debug Info (lg)
              </p>
              <p className="font-retro text-lg text-green-400">
                {`> GAME_STATE: PLAYING`}
              </p>
            </div>
          </div>
          <p className="font-pixelMod text-white/40 text-xs mt-6">
            Best for: Timer, Terminal-style Text, Special Effects
          </p>
        </Motion.div>

        {/* Usage Examples */}
        <Motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-lg p-8 border border-white/10"
        >
          <h2 className="font-pixel text-2xl text-blue-400 mb-4">
            USAGE EXAMPLES
          </h2>
          <div className="space-y-6">
            {/* Example 1 */}
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-3">
                Game Score Display
              </p>
              <div className="bg-black/20 p-4 rounded border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-pixel text-2xl text-blue-400">
                    Player 1
                  </h3>
                  <p className="font-pixel text-3xl text-blue-400">3</p>
                </div>
                <div className="text-center mb-4">
                  <p className="font-pixel text-white/50 text-sm">
                    ROUND 5/10
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-pixel text-2xl text-red-400">
                    Player 2
                  </h3>
                  <p className="font-pixel text-3xl text-red-400">2</p>
                </div>
              </div>
            </div>

            {/* Example 2 */}
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-3">
                Timer with Urgency
              </p>
              <div className="bg-black/20 p-4 rounded border border-white/10 text-center">
                <p className="font-pixelMod text-white/60 mb-2">TIME LEFT</p>
                <p className="font-retro text-5xl text-red-500 animate-pulse">
                  3s
                </p>
              </div>
            </div>

            {/* Example 3 */}
            <div>
              <p className="font-pixelMod text-white/60 text-sm mb-3">
                Game Over Screen
              </p>
              <div className="bg-black/20 p-4 rounded border border-white/10 text-center space-y-4">
                <p className="font-pixel text-4xl text-yellow-400">
                  GAME OVER!
                </p>
                <p className="font-pixelMod text-lg text-white">
                  Player 1 Wins!
                </p>
                <p className="font-pixel text-2xl text-white">3 - 2</p>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Footer */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="font-pixelMod text-white/40 text-sm">
            📖 See FONTS-SETUP.md for detailed usage documentation
          </p>
        </Motion.div>
      </Motion.div>
    </div>
  );
};

export default FontShowcase;
