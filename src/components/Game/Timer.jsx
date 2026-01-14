import { motion as Motion } from "framer-motion";
import { formatTimeSeconds } from "../../utils/helpers";

/**
 * Timer display component
 */
export const Timer = ({ timeLeft, isUrgent = false }) => {
  const seconds = formatTimeSeconds(timeLeft);
  const isLow = seconds <= 3;

  return (
    <Motion.div
      className={`
        text-center p-4 rounded-xl
        ${isLow ? "bg-red-500/20" : "bg-gray-700/30"}
      `}
      animate={isLow ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isLow ? Infinity : 0 }}
    >
      <p className="text-white/60 text-sm mb-1">⏱️ Time Remaining</p>
      <Motion.p
        className={`
          text-4xl font-bold font-mono
          ${isLow ? "text-red-400" : "text-white"}
        `}
        key={seconds}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.1 }}
      >
        {seconds}
      </Motion.p>
    </Motion.div>
  );
};

export default Timer;
