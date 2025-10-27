import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useGamification } from '../hooks/useGamification';

const GamificationFeedback = ({ type, message, points, onComplete }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { playAchievementSound } = useGamification();

  const [isVisible, setIsVisible] = useState(true);
  const [particles, setParticles] = useState([]);

  const palette = getCurrentPalette();

  useEffect(() => {
    // Reproducir sonido
    playAchievementSound();

    // Crear partículas para animación
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 10 + 5,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][Math.floor(Math.random() * 5)]
    }));
    setParticles(newParticles);

    // Auto-cerrar después de 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [playAchievementSound, onComplete]);

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.5,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.6
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -30,
      transition: {
        duration: 0.4
      }
    }
  };

  const particleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (custom) => ({
      opacity: [0, 1, 1, 0],
      scale: [0, 1, 1, 0],
      x: [0, (Math.random() - 0.5) * 200],
      y: [0, (Math.random() - 0.5) * 200],
      transition: {
        duration: 2,
        delay: custom * 0.1,
        ease: 'easeOut'
      }
    })
  };

  const getFeedbackIcon = () => {
    switch (type) {
      case 'achievement':
        return '🏆';
      case 'points':
        return '⭐';
      case 'challenge':
        return '🎯';
      case 'level':
        return '⬆️';
      default:
        return '🎉';
    }
  };

  const getFeedbackColor = () => {
    switch (type) {
      case 'achievement':
        return palette.success;
      case 'points':
        return palette.accent;
      case 'challenge':
        return palette.primary;
      case 'level':
        return palette.warning;
      default:
        return palette.secondary;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Partículas de fondo */}
          <div className="absolute inset-0 overflow-hidden">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color
                }}
                variants={particleVariants}
                initial="hidden"
                animate="visible"
                custom={particle.id}
              />
            ))}
          </div>

          {/* Modal principal */}
          <motion.div
            className="relative z-10 p-8 rounded-2xl shadow-2xl max-w-sm mx-4 text-center"
            style={{
              backgroundColor: palette.surfaceElevated,
              border: `2px solid ${getFeedbackColor()}`,
              boxShadow: `0 20px 40px rgba(0,0,0,0.3), 0 0 20px ${getFeedbackColor()}40`
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Icono animado */}
            <motion.div
              className="text-6xl mb-4"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              {getFeedbackIcon()}
            </motion.div>

            {/* Mensaje */}
            <motion.h2
              className="text-xl font-bold mb-2"
              style={{ color: palette.text }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {message}
            </motion.h2>

            {/* Puntos */}
            {points && (
              <motion.div
                className="text-2xl font-bold mb-4"
                style={{ color: getFeedbackColor() }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  delay: 0.5,
                  type: 'spring',
                  stiffness: 300
                }}
              >
                +{points} {t('gamification.points')}
              </motion.div>
            )}

            {/* Barra de progreso */}
            <motion.div
              className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: getFeedbackColor() }}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.5, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GamificationFeedback;