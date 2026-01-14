import { motion as Motion } from 'framer-motion';
import { DIRECTIONS, DIRECTION_NAMES, DIRECTION_ICONS } from '../../utils/constants';
import { Button } from '../UI';

/**
 * Direction Selector - buttons to choose shooting/saving direction
 */
export const DirectionSelector = ({
  selectedDirection,
  onSelect,
  disabled = false,
  role = 'shooter', // 'shooter' or 'goalkeeper'
}) => {
  const directions = [DIRECTIONS.LEFT, DIRECTIONS.CENTER, DIRECTIONS.RIGHT];

  const roleEmoji = role === 'shooter' ? '⚽' : '🧤';
  const roleText = role === 'shooter' ? 'ยิงไปทาง' : 'โดดรับทาง';

  return (
    <div className="w-full">
      <p className="text-white/70 text-center mb-4">
        {roleEmoji} {roleText}:
      </p>
      
      <div className="flex gap-3 justify-center">
        {directions.map((direction, index) => (
          <Motion.button
            key={direction}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              flex-1 max-w-32 py-4 px-3 rounded-xl font-bold text-lg
              transition-all duration-200 border-2
              ${selectedDirection === direction
                ? 'bg-blue-600 border-blue-400 text-white scale-105'
                : 'bg-gray-700/50 border-gray-600 text-white/80 hover:bg-gray-600/50 hover:border-gray-500'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onSelect?.(direction)}
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            disabled={disabled}
          >
            <div className="text-2xl mb-1">{DIRECTION_ICONS[direction]}</div>
            <div className="text-sm">{DIRECTION_NAMES[direction]}</div>
          </Motion.button>
        ))}
      </div>

      {selectedDirection && (
        <Motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-green-400 mt-4"
        >
          ✓ เลือก: {DIRECTION_NAMES[selectedDirection]}
        </Motion.p>
      )}
    </div>
  );
};

export default DirectionSelector;
