import { motion as Motion } from 'framer-motion';
import { Loading } from '../UI';

/**
 * Waiting Overlay - shows when waiting for opponent action
 */
export const WaitingOverlay = ({
  isWaiting,
  message = 'Waiting for opponent...',
  subMessage = '',
}) => {
  if (!isWaiting) return null;

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20 rounded-xl"
    >
      <div className="text-center">
        <Loading text={message} />
        {subMessage && (
          <p className="text-white/50 text-sm mt-2">{subMessage}</p>
        )}
      </div>
    </Motion.div>
  );
};

export default WaitingOverlay;
