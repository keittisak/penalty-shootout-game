import { motion as Motion } from "framer-motion";

/**
 * Loading spinner component
 */
export const Loading = ({ text = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={sizeClasses[size]}
      >
        ⚽
      </Motion.div>
      <p className="text-white/70 text-sm">{text}</p>
    </div>
  );
};

/**
 * Full page loading
 */
export const FullPageLoading = ({ text }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loading text={text} size="lg" />
    </div>
  );
};

export default Loading;
