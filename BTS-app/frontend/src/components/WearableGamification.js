import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useGamification } from '../hooks/useGamification';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import AchievementBadge from './AchievementBadge';

const WearableGamification = () => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { isWearable } = useWearableOptimizations();
  const { points, unlockedAchievements, userStats, challenges, getChallengeProgress } = useGamification();

  const [showDetails, setShowDetails] = useState(false);
  const [currentView, setCurrentView] = useState('points'); // points, achievements, challenges

  const palette = getCurrentPalette();

  // Solo mostrar en wearables
  if (!isWearable) return null;

  const views = [
    { id: 'points', icon: '⭐', label: t('gamification.points') },
    { id: 'achievements', icon: '🏆', label: t('gamification.achievements') },
    { id: 'challenges', icon: '🎯', label: t('gamification.challenges') }
  ];

  const renderPointsView = () => (
    <motion.div
      className="text-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="text-3xl font-bold mb-2" style={{ color: palette.primary }}>
        {points}
      </div>
      <div className="text-sm" style={{ color: palette.textSecondary }}>
        {t('gamification.totalPoints')}
      </div>
    </motion.div>
  );

  const renderAchievementsView = () => (
    <div className="p-2">
      <div className="text-center mb-3">
        <div className="text-lg font-bold" style={{ color: palette.text }}>
          {unlockedAchievements.length}
        </div>
        <div className="text-xs" style={{ color: palette.textSecondary }}>
          {t('gamification.unlocked')}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {unlockedAchievements.slice(0, 6).map((achievementId) => (
          <AchievementBadge
            key={achievementId}
            achievement={Object.values(achievements).find(a => a.id === achievementId)}
            unlocked={true}
            size="small"
          />
        ))}
      </div>

      {unlockedAchievements.length > 6 && (
        <div className="text-center mt-2">
          <span className="text-xs" style={{ color: palette.textMuted }}>
            +{unlockedAchievements.length - 6} {t('gamification.more')}
          </span>
        </div>
      )}
    </div>
  );

  const renderChallengesView = () => (
    <div className="p-2 space-y-2">
      {Object.values(challenges).slice(0, 2).map((challenge) => {
        const progress = getChallengeProgress(challenge.id);
        return (
          <div key={challenge.id} className="p-2 rounded border" style={{ backgroundColor: palette.surface, borderColor: palette.border }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">{challenge.icon}</span>
              <span className="text-xs font-bold" style={{ color: palette.accent }}>
                {challenge.points}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  backgroundColor: palette.primary
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'points':
        return renderPointsView();
      case 'achievements':
        return renderAchievementsView();
      case 'challenges':
        return renderChallengesView();
      default:
        return renderPointsView();
    }
  };

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-40"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className="w-16 h-16 rounded-full shadow-lg cursor-pointer overflow-hidden"
        style={{ backgroundColor: palette.surfaceElevated }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Vista compacta */}
        {!showDetails && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl">🎮</span>
          </div>
        )}

        {/* Vista expandida */}
        {showDetails && (
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Navegación entre vistas */}
            <div className="flex h-8 border-b" style={{ borderColor: palette.border }}>
              {views.map((view) => (
                <button
                  key={view.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentView(view.id);
                  }}
                  className={`flex-1 text-xs transition-colors ${
                    currentView === view.id ? 'font-bold' : ''
                  }`}
                  style={{
                    color: currentView === view.id ? palette.primary : palette.textSecondary
                  }}
                >
                  {view.icon}
                </button>
              ))}
            </div>

            {/* Contenido de la vista actual */}
            <div className="h-24 overflow-hidden">
              {renderCurrentView()}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Notificación de puntos si hay cambios recientes */}
      {userStats.engagementScore > 0 && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          !
        </motion.div>
      )}
    </motion.div>
  );
};

export default WearableGamification;