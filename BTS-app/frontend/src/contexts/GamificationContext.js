// Contexto de Gamificación para sistema avanzado de puntos, logros y retos
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Definir logros disponibles
const ACHIEVEMENTS = {
  FIRST_PROFILE: {
    id: 'first_profile',
    titleKey: 'gamification.achievements.firstProfile.title',
    descriptionKey: 'gamification.achievements.firstProfile.description',
    icon: '🎯',
    points: 10,
    condition: (stats) => stats.profilesVisited >= 1
  },
  PROFILE_EXPLORER: {
    id: 'profile_explorer',
    titleKey: 'gamification.achievements.profileExplorer.title',
    descriptionKey: 'gamification.achievements.profileExplorer.description',
    icon: '🔍',
    points: 25,
    condition: (stats) => stats.profilesVisited >= 5
  },
  BIO_MASTER: {
    id: 'bio_master',
    titleKey: 'gamification.achievements.bioMaster.title',
    descriptionKey: 'gamification.achievements.bioMaster.description',
    icon: '📖',
    points: 50,
    condition: (stats) => stats.biosCompleted >= 3
  },
  DEPARTMENT_COMPLETE: {
    id: 'department_complete',
    titleKey: 'gamification.achievements.departmentComplete.title',
    descriptionKey: 'gamification.achievements.departmentComplete.description',
    icon: '🏢',
    points: 100,
    condition: (stats) => stats.departmentsCompleted >= 1
  },
  TEAM_PLAYER: {
    id: 'team_player',
    titleKey: 'gamification.achievements.teamPlayer.title',
    descriptionKey: 'gamification.achievements.teamPlayer.description',
    icon: '🤝',
    points: 75,
    condition: (stats) => stats.favoritesCount >= 7
  },
  PERFECT_SCORE: {
    id: 'perfect_score',
    titleKey: 'gamification.achievements.perfectScore.title',
    descriptionKey: 'gamification.achievements.perfectScore.description',
    icon: '⭐',
    points: 200,
    condition: (stats) => stats.profilesVisited >= 7 && stats.biosCompleted >= 7
  }
};

// Definir retos semanales/mensuales
const CHALLENGES = {
  WEEKLY_VISIT_5: {
    id: 'weekly_visit_5',
    type: 'weekly',
    titleKey: 'gamification.challenges.weeklyVisit5.title',
    descriptionKey: 'gamification.challenges.weeklyVisit5.description',
    icon: '👥',
    points: 30,
    target: 5,
    condition: (stats) => stats.weeklyVisits >= 5
  },
  MONTHLY_BIO_3: {
    id: 'monthly_bio_3',
    type: 'monthly',
    titleKey: 'gamification.challenges.monthlyBio3.title',
    descriptionKey: 'gamification.challenges.monthlyBio3.description',
    icon: '📝',
    points: 60,
    target: 3,
    condition: (stats) => stats.monthlyBios >= 3
  },
  WEEKLY_FAVORITE_3: {
    id: 'weekly_favorite_3',
    type: 'weekly',
    titleKey: 'gamification.challenges.weeklyFavorite3.title',
    descriptionKey: 'gamification.challenges.weeklyFavorite3.description',
    icon: '❤️',
    points: 25,
    target: 3,
    condition: (stats) => stats.weeklyFavorites >= 3
  }
};

// Crear el contexto
const GamificationContext = createContext();

// Proveedor del contexto
export const GamificationProvider = ({ children }) => {
  const { t } = useTranslation();

  // Estado de puntos y estadísticas
  const [points, setPoints] = useState(() => {
    const saved = localStorage.getItem('gamification-points');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Estado de logros desbloqueados
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem('gamification-achievements');
    return saved ? JSON.parse(saved) : [];
  });

  // Estado de retos activos
  const [activeChallenges, setActiveChallenges] = useState(() => {
    const saved = localStorage.getItem('gamification-challenges');
    return saved ? JSON.parse(saved) : {};
  });

  // Estado de estadísticas del usuario
  const [userStats, setUserStats] = useState(() => {
    const saved = localStorage.getItem('gamification-stats');
    return saved ? JSON.parse(saved) : {
      profilesVisited: 0,
      biosCompleted: 0,
      departmentsCompleted: 0,
      favoritesCount: 0,
      weeklyVisits: 0,
      monthlyBios: 0,
      weeklyFavorites: 0,
      lastResetWeekly: Date.now(),
      lastResetMonthly: Date.now(),
      engagementScore: 0
    };
  });

  // Estado para notificaciones de gamificación
  const [notifications, setNotifications] = useState([]);

  // Estado para sonidos de logro
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('gamification-sound-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Función para reproducir sonido de logro
  const playAchievementSound = useCallback(() => {
    if (!soundEnabled) return;

    try {
      // Crear un beep simple usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('No se pudo reproducir sonido de logro:', error);
    }
  }, [soundEnabled]);

  // Función para añadir puntos
  const addPoints = useCallback((amount, reason = '') => {
    setPoints(prev => {
      const newPoints = prev + amount;
      localStorage.setItem('gamification-points', newPoints.toString());

      // Añadir notificación
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'points',
        message: t('gamification.pointsEarned', { points: amount, reason }),
        timestamp: Date.now()
      }]);

      return newPoints;
    });
  }, [t]);

  // Función para verificar y desbloquear logros
  const checkAchievements = useCallback(() => {
    const newAchievements = [];

    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.condition(userStats)) {
        newAchievements.push(achievement);
        setUnlockedAchievements(prev => [...prev, achievement.id]);
      }
    });

    // Otorgar puntos por logros desbloqueados
    newAchievements.forEach(achievement => {
      addPoints(achievement.points, t('gamification.achievementUnlocked', { name: t(achievement.titleKey) }));
      playAchievementSound();

      // Añadir notificación de logro
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'achievement',
        message: t('gamification.achievementUnlocked', { name: t(achievement.titleKey) }),
        achievement,
        timestamp: Date.now()
      }]);
    });

    if (newAchievements.length > 0) {
      localStorage.setItem('gamification-achievements', JSON.stringify([...unlockedAchievements, ...newAchievements.map(a => a.id)]));
    }
  }, [userStats, unlockedAchievements, addPoints, playAchievementSound, t]);

  // Función para actualizar estadísticas
  const updateStats = useCallback((statName, value = 1) => {
    setUserStats(prev => {
      const newStats = { ...prev, [statName]: prev[statName] + value };
      localStorage.setItem('gamification-stats', JSON.stringify(newStats));

      // Verificar logros después de actualizar estadísticas
      setTimeout(() => checkAchievements(), 100);

      return newStats;
    });
  }, [checkAchievements]);

  // Función para verificar retos
  const checkChallenges = useCallback(() => {
    const completedChallenges = [];

    Object.values(CHALLENGES).forEach(challenge => {
      if (!activeChallenges[challenge.id]?.completed && challenge.condition(userStats)) {
        completedChallenges.push(challenge);
        setActiveChallenges(prev => ({
          ...prev,
          [challenge.id]: { ...prev[challenge.id], completed: true, completedAt: Date.now() }
        }));
      }
    });

    // Otorgar puntos por retos completados
    completedChallenges.forEach(challenge => {
      addPoints(challenge.points, t('gamification.challengeCompleted', { name: t(challenge.titleKey) }));
      playAchievementSound();

      // Añadir notificación de reto completado
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'challenge',
        message: t('gamification.challengeCompleted', { name: t(challenge.titleKey) }),
        challenge,
        timestamp: Date.now()
      }]);
    });

    if (completedChallenges.length > 0) {
      localStorage.setItem('gamification-challenges', JSON.stringify(activeChallenges));
    }
  }, [userStats, activeChallenges, addPoints, playAchievementSound, t]);

  // Función para resetear estadísticas semanales/mensuales
  const resetPeriodicStats = useCallback(() => {
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    setUserStats(prev => {
      const newStats = { ...prev };

      // Reset semanal
      if (now - prev.lastResetWeekly >= oneWeek) {
        newStats.weeklyVisits = 0;
        newStats.weeklyFavorites = 0;
        newStats.lastResetWeekly = now;
      }

      // Reset mensual
      if (now - prev.lastResetMonthly >= oneMonth) {
        newStats.monthlyBios = 0;
        newStats.lastResetMonthly = now;
      }

      localStorage.setItem('gamification-stats', JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  // Función para eliminar notificación
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Función para obtener progreso de retos
  const getChallengeProgress = useCallback((challengeId) => {
    const challenge = CHALLENGES[challengeId];
    if (!challenge) return 0;

    const statMap = {
      weekly_visit_5: 'weeklyVisits',
      monthly_bio_3: 'monthlyBios',
      weekly_favorite_3: 'weeklyFavorites'
    };

    const statName = statMap[challengeId];
    return statName ? Math.min(userStats[statName] / challenge.target, 1) : 0;
  }, [userStats]);

  // Efecto para verificar retos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      checkChallenges();
      resetPeriodicStats();
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [checkChallenges, resetPeriodicStats]);

  // Efecto para limpiar notificaciones antiguas
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.timestamp < 10000)); // Mantener 10 segundos
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Valor del contexto
  const value = {
    // Estado
    points,
    unlockedAchievements,
    activeChallenges,
    userStats,
    notifications,
    soundEnabled,

    // Datos estáticos
    achievements: ACHIEVEMENTS,
    challenges: CHALLENGES,

    // Funciones
    addPoints,
    updateStats,
    checkAchievements,
    checkChallenges,
    playAchievementSound,
    dismissNotification,
    getChallengeProgress,
    setSoundEnabled: (enabled) => {
      setSoundEnabled(enabled);
      localStorage.setItem('gamification-sound-enabled', JSON.stringify(enabled));
    }
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification debe ser usado dentro de un GamificationProvider');
  }
  return context;
};

export default GamificationContext;
