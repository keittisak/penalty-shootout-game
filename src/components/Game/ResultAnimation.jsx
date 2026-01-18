import { useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ROUND_RESULT } from '../../utils/constants';

/**
 * Generate random particles data (only once per render cycle)
 */
const generateParticles = (count) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    rotate: Math.random() * 360,
    duration: 1 + Math.random(),
    delay: Math.random() * 0.3,
    emoji: ['🎉', '✨', '🌟', '🎊'][Math.floor(Math.random() * 4)],
  }));
};

/**
 * Result Animation - displays after each round
 */
export const ResultAnimation = ({
  result,
  shootDirection,
  saveDirection,
  isVisible,
  onComplete,
}) => {
  // Generate particles once and memoize
  const particles = useMemo(() => generateParticles(20), []);

  if (!isVisible) return null;

  const isGoal = result === ROUND_RESULT.GOAL || result === ROUND_RESULT.TIMEOUT_GOAL;

  return (
    <AnimatePresence>
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onComplete}
      >
        <Motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center"
        >
          {/* Main result */}
          <Motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: isGoal ? [0, -5, 5, 0] : [0, 5, -5, 0],
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`
              text-8xl mb-4
              ${isGoal ? 'drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]'}
            `}
          >
            {isGoal ? '⚽' : '🧤'}
          </Motion.div>

          {/* Text */}
          <Motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`
              text-4xl sm:text-5xl font-bold mb-4
              ${isGoal ? 'text-green-400' : 'text-red-400'}
            `}
          >
            {isGoal ? 'GOAL!' : 'SAVED!'}
          </Motion.h2>

          {/* Direction info */}
          <Motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/80 rounded-xl p-4 max-w-xs mx-auto"
          >
            <p className="text-white/70 text-sm">
              ⚽ Shot Direction: <span className="text-yellow-400 font-bold">{shootDirection}</span>
            </p>
            <p className="text-white/70 text-sm mt-1">
              🧤 Save Direction: <span className="text-blue-400 font-bold">{saveDirection}</span>
            </p>
          </Motion.div>

          {/* Particles for goal */}
          {isGoal && (
            <Motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((particle) => (
                <Motion.div
                  key={particle.id}
                  className="absolute text-2xl"
                  initial={{
                    x: '50%',
                    y: '50%',
                    opacity: 1,
                  }}
                  animate={{
                    x: `${particle.x}%`,
                    y: `${particle.y}%`,
                    opacity: 0,
                    rotate: particle.rotate,
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                  }}
                >
                  {particle.emoji}
                </Motion.div>
              ))}
            </Motion.div>
          )}
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
};

export default ResultAnimation;
