import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';

const ChallengeNotification = ({ challenge, onClose, autoClose = true }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { isWearable } = useWearableOptimizations();
  const [progress, setProgress] = useState(0);

  const palette = getCurrentPalette();

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  useEffect(() => {
    // Animar el progreso
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.02;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const notificationVariants = {
    hidden: {
      opacity: 0,
      y: -50,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      scale: 0.8,
      transition: {
        duration: 0.3
      }
    }
  };

  const progressVariants = {
    hidden: { width: 0 },
    visible: {
      width: '100%',
      transition: { duration: 5, ease: 'linear' }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          isWearable ? 'max-w-xs mx-auto' : 'max-w-sm'
        }`}
        style={{
          backgroundColor: palette.surfaceElevated,
          borderLeftColor: palette.success,
          color: palette.text,
          borderColor: palette.border
        }}
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">{challenge.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold truncate" style={{ color: palette.text }}>
                {t('gamification.challengeCompleted')}
              </h4>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-gray-100"
                style={{ color: palette.textMuted }}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>

            <p className="text-sm mt-1" style={{ color: palette.textSecondary }}>
              {t(challenge.titleKey)}
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs font-medium" style={{ color: palette.accent }}>
                +{challenge.points} {t('gamification.points')}
              </span>
              <span className="text-xs" style={{ color: palette.textMuted }}>
                {challenge.type === 'weekly' ? t('gamification.weekly') : t('gamification.monthly')}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso para auto-cierre */}
        {autoClose && (
          <motion.div
            className="absolute bottom-0 left-0 h-1 rounded-bl-lg"
            style={{ backgroundColor: palette.primary }}
            variants={progressVariants}
            initial="hidden"
            animate="visible"
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeNotification;