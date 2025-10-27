import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';

const Leaderboard = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { isWearable } = useWearableOptimizations();

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const palette = getCurrentPalette();

  // Simular datos del leaderboard (en producción vendría de una API)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = [
        { id: 1, name: 'Ana García', points: 1250, achievements: 8, rank: 1 },
        { id: 2, name: 'Carlos López', points: 1180, achievements: 7, rank: 2 },
        { id: 3, name: 'María Rodríguez', points: 1120, achievements: 6, rank: 3 },
        { id: 4, name: 'Juan Martínez', points: 1050, achievements: 5, rank: 4 },
        { id: 5, name: 'Laura Sánchez', points: 980, achievements: 4, rank: 5 },
        { id: 6, name: 'Pedro Gómez', points: 920, achievements: 4, rank: 6 },
        { id: 7, name: 'Sofia Torres', points: 880, achievements: 3, rank: 7 },
        { id: 8, name: 'Diego Ruiz', points: 850, achievements: 3, rank: 8 },
        { id: 9, name: 'Carmen Díaz', points: 820, achievements: 2, rank: 9 },
        { id: 10, name: 'Miguel Fernández', points: 780, achievements: 2, rank: 10 }
      ];

      setLeaderboardData(mockData);
      setLoading(false);
    };

    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, timeFilter]);

  const panelVariants = {
    hidden: {
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.3
      }
    })
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700';
      case 2:
        return '#C0C0C0';
      case 3:
        return '#CD7F32';
      default:
        return palette.textSecondary;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`relative w-full max-w-lg ${isWearable ? 'max-h-96' : 'max-h-[80vh]'} rounded-lg shadow-xl overflow-hidden`}
          style={{ backgroundColor: palette.background }}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.text }}>
              {t('gamification.leaderboard.title')}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
              style={{ color: palette.text }}
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>

          {/* Filtros de tiempo */}
          <div className="flex p-4 border-b" style={{ borderColor: palette.border }}>
            {[
              { value: 'all', label: t('gamification.leaderboard.allTime') },
              { value: 'month', label: t('gamification.leaderboard.thisMonth') },
              { value: 'week', label: t('gamification.leaderboard.thisWeek') }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setTimeFilter(filter.value)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md mx-1 transition-colors ${
                  timeFilter === filter.value
                    ? 'shadow-md'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  backgroundColor: timeFilter === filter.value ? palette.primary : palette.surface,
                  color: timeFilter === filter.value ? 'white' : palette.text
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Contenido del leaderboard */}
          <div className={`overflow-y-auto ${isWearable ? 'max-h-64' : 'max-h-96'}`}>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: palette.primary }}></div>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                <AnimatePresence>
                  {leaderboardData.map((user, index) => (
                    <motion.div
                      key={user.id}
                      className="flex items-center p-3 rounded-lg border"
                      style={{
                        backgroundColor: palette.surface,
                        borderColor: palette.border
                      }}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover={{ scale: 1.02 }}
                    >
                      {/* Ranking */}
                      <div className="flex-shrink-0 w-12 text-center">
                        <span
                          className="text-lg font-bold"
                          style={{ color: getRankColor(user.rank) }}
                        >
                          {getRankIcon(user.rank)}
                        </span>
                      </div>

                      {/* Información del usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="font-semibold" style={{ color: palette.text }}>
                              {user.name}
                            </div>
                            <div className="text-sm" style={{ color: palette.textSecondary }}>
                              {user.achievements} {t('gamification.achievements')}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-bold text-lg" style={{ color: palette.primary }}>
                              {user.points.toLocaleString()}
                            </div>
                            <div className="text-xs" style={{ color: palette.textMuted }}>
                              {t('gamification.points')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Footer con posición del usuario actual */}
          <div className="p-4 border-t" style={{ borderColor: palette.border }}>
            <div className="text-center text-sm" style={{ color: palette.textSecondary }}>
              {t('gamification.leaderboard.yourRank')}: <span className="font-semibold" style={{ color: palette.primary }}>#7</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Leaderboard;