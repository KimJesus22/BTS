import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useDesignTokens } from '../hooks/useDesignTokens';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';

const AchievementBadge = ({ achievement, unlocked = false, size = 'medium', showProgress = false, progress = 0 }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { getColor, getSpacing, getBorderRadius, getShadow } = useDesignTokens();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable } = useWearableOptimizations();

  const palette = getCurrentPalette();

  const sizeClasses = {
    small: `w-12 h-12 ${isWearable ? 'text-base' : 'text-lg'}`,
    medium: `w-16 h-16 ${isWearable ? 'text-xl' : 'text-2xl'}`,
    large: `w-24 h-24 ${isWearable ? 'text-3xl' : 'text-4xl'}`
  };

  const badgeVariants = {
    locked: {
      scale: 1,
      opacity: 0.5,
      filter: 'grayscale(100%)'
    },
    unlocked: {
      scale: [1, 1.1, 1],
      opacity: 1,
      filter: 'grayscale(0%)',
      transition: {
        duration: 0.5,
        times: [0, 0.5, 1]
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const progressVariants = {
    hidden: { pathLength: 0 },
    visible: {
      pathLength: progress,
      transition: { duration: 1, ease: 'easeInOut' }
    }
  };

  return (
    <motion.div
      className={`achievement-badge ${sizeClasses[size]} ${unlocked ? 'unlocked' : 'locked'} relative inline-flex items-center justify-center rounded-full border-2 ${
        unlocked
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg'
          : 'border-gray-300 bg-gray-100 text-gray-400'
      }`}
      variants={badgeVariants}
      initial={unlocked ? 'unlocked' : 'locked'}
      animate={unlocked ? 'unlocked' : 'locked'}
      whileHover={animationsEnabled && !reducedAnimations ? 'hover' : undefined}
      style={{
        background: unlocked
          ? `linear-gradient(135deg, ${palette.success}, ${palette.accent})`
          : palette.surface,
        borderColor: unlocked ? palette.success : palette.border,
        color: unlocked ? 'white' : palette.textMuted
      }}
    >
      {/* Icono del logro */}
      <span className="relative z-10" role="img" aria-label={t(achievement.titleKey)}>
        {achievement.icon}
      </span>

      {/* Indicador de progreso circular */}
      {showProgress && (
        <svg
          className="absolute inset-0 w-full h-full transform -rotate-90"
          viewBox="0 0 36 36"
        >
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={palette.borderLight}
            strokeWidth="2"
          />
          <motion.path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={palette.primary}
            strokeWidth="2"
            strokeLinecap="round"
            variants={progressVariants}
            initial="hidden"
            animate="visible"
          />
        </svg>
      )}

      {/* Tooltip con información del logro */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
        <div className="font-semibold">{t(achievement.titleKey)}</div>
        <div className="text-xs opacity-90">{t(achievement.descriptionKey)}</div>
        <div className="text-xs font-bold text-yellow-400">{achievement.points} pts</div>
        {/* Flecha del tooltip */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
      </div>
    </motion.div>
  );
};

export default AchievementBadge;