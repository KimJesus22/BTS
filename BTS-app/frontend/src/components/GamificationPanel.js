import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGamification } from '../hooks/useGamification';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import AchievementBadge from './AchievementBadge';

// Componente para mostrar indicador de conexión offline
const OfflineIndicator = ({ isOnline }) => {
  const { getCurrentPalette } = useTheme();
  const palette = getCurrentPalette();

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-2 right-2 flex items-center space-x-1 px-2 py-1 rounded-full text-xs"
      style={{
        backgroundColor: palette.warning + '20',
        color: palette.warning,
        border: `1px solid ${palette.warning}`
      }}
    >
      <span>🔴</span>
      <span>Offline</span>
    </motion.div>
  );
};

const GamificationPanel = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { isWearable } = useWearableOptimizations();

  const {
    points,
    unlockedAchievements,
    userStats,
    notifications,
    dismissNotification,
    achievements,
    challenges,
    getChallengeProgress,
    soundEnabled,
    setSoundEnabled,
    isOnline,
    syncOfflineData
  } = useGamification();

  const [activeTab, setActiveTab] = useState('achievements');
  const palette = getCurrentPalette();

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

  const notificationVariants = {
    initial: { opacity: 0, x: 300, scale: 0.8 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: 300, scale: 0.8 }
  };

  const tabs = [
    { id: 'achievements', label: t('gamification.tabs.achievements'), icon: '🏆' },
    { id: 'challenges', label: t('gamification.tabs.challenges'), icon: '🎯' },
    { id: 'stats', label: t('gamification.tabs.stats'), icon: '📊' },
    { id: 'settings', label: t('gamification.tabs.settings'), icon: '⚙️' }
  ];

  const renderAchievementsTab = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {Object.values(achievements).map((achievement) => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        return (
          <motion.div
            key={achievement.id}
            className="flex flex-col items-center p-3 rounded-lg border"
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.border
            }}
            whileHover={animationsEnabled ? { scale: 1.05 } : undefined}
          >
            <AchievementBadge
              achievement={achievement}
              unlocked={isUnlocked}
              size={isWearable ? 'small' : 'medium'}
            />
            <h4 className="text-sm font-semibold mt-2 text-center" style={{ color: palette.text }}>
              {t(achievement.titleKey)}
            </h4>
            <p className="text-xs text-center mt-1" style={{ color: palette.textSecondary }}>
              {t(achievement.descriptionKey)}
            </p>
            <div className="text-xs font-bold mt-1" style={{ color: palette.accent }}>
              {achievement.points} pts
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderChallengesTab = () => (
    <div className="space-y-4 p-4">
      {Object.values(challenges).map((challenge) => {
        const progress = getChallengeProgress(challenge.id);
        const isCompleted = progress >= 1;

        return (
          <motion.div
            key={challenge.id}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: palette.surface,
              borderColor: isCompleted ? palette.success : palette.border
            }}
            whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{challenge.icon}</span>
                <div>
                  <h4 className="font-semibold" style={{ color: palette.text }}>
                    {t(challenge.titleKey)}
                  </h4>
                  <p className="text-sm" style={{ color: palette.textSecondary }}>
                    {t(challenge.descriptionKey)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: palette.accent }}>
                  {challenge.points} pts
                </div>
                <div className="text-xs" style={{ color: palette.textMuted }}>
                  {challenge.type === 'weekly' ? t('gamification.weekly') : t('gamification.monthly')}
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: palette.primary }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            <div className="flex justify-between text-xs mt-1" style={{ color: palette.textMuted }}>
              <span>{t('gamification.progress')}</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );

  const renderStatsTab = () => (
    <div className="p-4 space-y-4">
      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: palette.surfaceElevated }}>
        <div className="text-3xl font-bold" style={{ color: palette.primary }}>
          {points}
        </div>
        <div className="text-sm" style={{ color: palette.textSecondary }}>
          {t('gamification.totalPoints')}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(userStats).map(([key, value]) => {
          if (typeof value !== 'number' || key.includes('lastReset') || key === 'engagementScore') return null;

          const statLabels = {
            profilesVisited: t('gamification.stats.profilesVisited'),
            biosCompleted: t('gamification.stats.biosCompleted'),
            departmentsCompleted: t('gamification.stats.departmentsCompleted'),
            favoritesCount: t('gamification.stats.favoritesCount'),
            weeklyVisits: t('gamification.stats.weeklyVisits'),
            monthlyBios: t('gamification.stats.monthlyBios'),
            weeklyFavorites: t('gamification.stats.weeklyFavorites')
          };

          return (
            <div key={key} className="p-3 rounded-lg text-center" style={{ backgroundColor: palette.surface }}>
              <div className="text-xl font-bold" style={{ color: palette.secondary }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: palette.textSecondary }}>
                {statLabels[key] || key}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: palette.surface }}>
        <div>
          <div className="font-semibold" style={{ color: palette.text }}>
            {t('gamification.settings.soundEnabled')}
          </div>
          <div className="text-sm" style={{ color: palette.textSecondary }}>
            {t('gamification.settings.soundDescription')}
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Botón de sincronización offline */}
      {!isOnline && (
        <div className="p-3 rounded-lg border" style={{ backgroundColor: palette.surface, borderColor: palette.warning }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold" style={{ color: palette.text }}>
                {t('gamification.offline.syncPending')}
              </div>
              <div className="text-sm" style={{ color: palette.textSecondary }}>
                {t('gamification.offline.syncDescription')}
              </div>
            </div>
            <button
              onClick={syncOfflineData}
              className="px-3 py-1 rounded text-sm font-medium"
              style={{
                backgroundColor: palette.primary,
                color: 'white'
              }}
            >
              {t('gamification.offline.syncNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'achievements':
        return renderAchievementsTab();
      case 'challenges':
        return renderChallengesTab();
      case 'stats':
        return renderStatsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderAchievementsTab();
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
          className={`relative w-full max-w-md ${isWearable ? 'max-h-96' : 'max-h-[80vh]'} rounded-lg shadow-xl overflow-hidden`}
          style={{ backgroundColor: palette.background }}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b relative" style={{ borderColor: palette.border }}>
            <h2 className="text-lg font-semibold" style={{ color: palette.text }}>
              {t('gamification.title')}
            </h2>
            <div className="flex items-center space-x-2">
              {/* Indicador de conexión offline */}
              <OfflineIndicator isOnline={isOnline} />
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100"
                style={{ color: palette.text }}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: palette.border }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-2 text-center text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  color: activeTab === tab.id ? palette.primary : palette.textSecondary,
                  borderColor: activeTab === tab.id ? palette.primary : 'transparent',
                  backgroundColor: activeTab === tab.id ? palette.surface : 'transparent'
                }}
              >
                <span className="block text-lg mb-1">{tab.icon}</span>
                {!isWearable && <span>{tab.label}</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={`overflow-y-auto ${isWearable ? 'max-h-64' : 'max-h-96'}`}>
            {renderTabContent()}
          </div>

          {/* Notificaciones flotantes */}
          <AnimatePresence>
            {notifications.slice(0, 3).map((notification) => (
              <motion.div
                key={notification.id}
                className="absolute top-4 right-4 p-3 rounded-lg shadow-lg max-w-xs"
                style={{
                  backgroundColor: palette.surfaceElevated,
                  border: `1px solid ${palette.border}`,
                  color: palette.text
                }}
                variants={notificationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onClick={() => dismissNotification(notification.id)}
              >
                <div className="font-semibold text-sm">{notification.message}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GamificationPanel;