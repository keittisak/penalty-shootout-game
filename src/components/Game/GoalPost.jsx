import { motion as Motion } from "framer-motion";
import {
  DIRECTIONS,
  DIRECTION_NAMES,
  DIRECTION_ICONS,
} from "../../utils/constants";

import goalpostImg from "@/assets/images/goal/goalpost.png";
import goalkeeperIdleImg from "@/assets/images/player/goalkeeper_idle.png";
// import goalkeeperIdleWhiteImg from "@/assets/images/player/goalkeeper_idle_white.png";
// import goalkeeperIdleImg from "@/assets/images/player/goalkeeper_idle_v2.png";

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
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Goal frame */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        {/* Goal post image background */}
        <img
          src={goalpostImg}
          alt="Goal Post"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Goalkeeper idle image */}
        <img
          src={goalkeeperIdleImg}
          alt="Goalkeeper"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-32 sm:h-40 object-contain"
        />

        {/* Zones */}
        {/* <div className="absolute inset-0 flex">
          {zones.map((zone) => (
            <Motion.button
              key={zone}
              className={`
                flex-1 flex flex-col items-center justify-center
                transition-all duration-300 border-r border-white/20 last:border-r-0
                ${selectedZone === zone ? "zone-selected" : ""}
                ${
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "hover:bg-blue-500/20 cursor-pointer"
                }
              `}
              onClick={() => !disabled && onSelectZone?.(zone)}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              disabled={disabled}
            >
  
              <span className="text-white/60 text-sm mb-2">
                {DIRECTION_NAMES[zone]}
              </span>
              <span className="text-3xl">{DIRECTION_ICONS[zone]}</span>

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
                  initial={{
                    scale: 0,
                    x:
                      zone === DIRECTIONS.LEFT
                        ? 50
                        : zone === DIRECTIONS.RIGHT
                        ? -50
                        : 0,
                  }}
                  animate={{ scale: 1, x: 0 }}
                  className="absolute text-4xl"
                >
                  🧤
                </Motion.div>
              )}
            </Motion.button>
          ))}
        </div> */}

        {/* Result overlay */}
        {showResult && result && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <div
              className={`
              text-4xl sm:text-6xl font-bold px-6 py-4 rounded-xl
              ${
                result === "goal" || result === "timeout_goal"
                  ? "bg-green-500/80 text-white"
                  : "bg-red-500/80 text-white"
              }
            `}
            >
              {result === "goal" || result === "timeout_goal"
                ? "⚽ GOAL!"
                : "🧤 SAVED!"}
            </div>
          </Motion.div>
        )}
      </div>

      {/* Grass */}
      {/* <div className="h-8 bg-gradient-to-b from-green-600 to-green-700 rounded-b-lg" /> */}
    </div>
  );
};

export default GoalPost;
