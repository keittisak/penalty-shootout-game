import { motion as Motion } from 'framer-motion';
import { DIRECTIONS, DIRECTION_NAMES, DIRECTION_ICONS } from '../../utils/constants';

/**
 * Goal Post with selectable zones (Placeholder UI using CSS)
 */
export const GoalPost = ({
  selectedZone,
  onSelectZone,
  disabled = false,
  showResult = false,
  shootDirection = null,
  saveDirection = null,
  result = null,
}) => {
  const zones = [DIRECTIONS.LEFT, DIRECTIONS.CENTER, DIRECTIONS.RIGHT];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Goal frame */}
      <div className="goal-post relative h-48 sm:h-64 rounded-t-lg overflow-hidden">
        {/* Net pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full"
            style={{
              backgroundImage: `
                linear-gradient(90deg, white 1px, transparent 1px),
                linear-gradient(0deg, white 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
        </div>

        {/* Zones */}
        <div className="absolute inset-0 flex">
          {zones.map((zone) => (
            <Motion.button
              key={zone}
              className={`
                flex-1 flex flex-col items-center justify-center
                transition-all duration-300 border-r border-white/20 last:border-r-0
                ${selectedZone === zone ? 'zone-selected' : ''}
                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-500/20 cursor-pointer'}
              `}
              onClick={() => !disabled && onSelectZone?.(zone)}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              disabled={disabled}
            >
              {/* Zone label */}
              <span className="text-white/60 text-sm mb-2">{DIRECTION_NAMES[zone]}</span>
              <span className="text-3xl">{DIRECTION_ICONS[zone]}</span>
              
              {/* Show result indicators */}
              {showResult && shootDirection === zone && (
                <Motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute text-5xl"
                >
                  ⚽
                </Motion.div>
              )}
              {showResult && saveDirection === zone && (
                <Motion.div
                  initial={{ scale: 0, x: zone === DIRECTIONS.LEFT ? 50 : zone === DIRECTIONS.RIGHT ? -50 : 0 }}
                  animate={{ scale: 1, x: 0 }}
                  className="absolute text-4xl"
                >
                  🧤
                </Motion.div>
              )}
            </Motion.button>
          ))}
        </div>

        {/* Result overlay */}
        {showResult && result && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <div className={`
              text-4xl sm:text-6xl font-bold px-6 py-4 rounded-xl
              ${result === 'goal' || result === 'timeout_goal' 
                ? 'bg-green-500/80 text-white' 
                : 'bg-red-500/80 text-white'}
            `}>
              {result === 'goal' || result === 'timeout_goal' ? '⚽ GOAL!' : '🧤 SAVED!'}
            </div>
          </Motion.div>
        )}
      </div>

      {/* Grass */}
      <div className="h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-b-lg" />
    </div>
  );
};

export default GoalPost;
