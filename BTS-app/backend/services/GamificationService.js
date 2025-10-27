const User = require('../models/User');
const Wearable = require('../models/Wearable');

class GamificationService {
  constructor() {
    this.levelThresholds = this.generateLevelThresholds();
    this.achievementDefinitions = this.getAchievementDefinitions();
  }

  // Generar umbrales de nivel (cada nivel requiere más XP)
  generateLevelThresholds() {
    const thresholds = {};
    for (let level = 1; level <= 100; level++) {
      thresholds[level] = Math.floor(1000 * Math.pow(1.2, level - 1));
    }
    return thresholds;
  }

  // Definiciones de logros
  getAchievementDefinitions() {
    return {
      // Logros de interacción
      first_login: {
        title: 'Primeros Pasos',
        description: 'Inicia sesión por primera vez',
        icon: '🎯',
        points: 100,
        category: 'engagement'
      },
      profile_complete: {
        title: 'Perfil Completo',
        description: 'Completa toda la información de tu perfil',
        icon: '👤',
        points: 200,
        category: 'profile'
      },
      social_sharer: {
        title: 'Comparte y Gana',
        description: 'Comparte contenido de BTS 5 veces',
        icon: '📤',
        points: 150,
        category: 'social'
      },

      // Logros de conocimiento
      bts_expert: {
        title: 'Experto en BTS',
        description: 'Responde correctamente 10 preguntas sobre BTS',
        icon: '🧠',
        points: 300,
        category: 'knowledge'
      },
      member_fan: {
        title: 'Fan Dedicado',
        description: 'Visita el perfil de todos los miembros',
        icon: '💜',
        points: 250,
        category: 'engagement'
      },

      // Logros de actividad física (con wearable)
      step_master: {
        title: 'Maestro de los Pasos',
        description: 'Alcanza la meta diaria de pasos 7 días seguidos',
        icon: '🚶',
        points: 500,
        category: 'fitness'
      },
      heart_healthy: {
        title: 'Corazón Saludable',
        description: 'Mantén ritmo cardíaco en zona saludable por 30 minutos',
        icon: '❤️',
        points: 400,
        category: 'fitness'
      },
      sleep_champion: {
        title: 'Campeón del Sueño',
        description: 'Duerme 8 horas de calidad 5 noches seguidas',
        icon: '😴',
        points: 450,
        category: 'fitness'
      },

      // Logros de racha
      streak_7: {
        title: 'Racha de 7',
        description: 'Inicia sesión 7 días seguidos',
        icon: '🔥',
        points: 350,
        category: 'streak'
      },
      streak_30: {
        title: 'Racha de 30',
        description: 'Inicia sesión 30 días seguidos',
        icon: '🌟',
        points: 1000,
        category: 'streak'
      },

      // Logros sociales
      friend_maker: {
        title: 'Hacedor de Amigos',
        description: 'Conecta con 10 usuarios',
        icon: '🤝',
        points: 300,
        category: 'social'
      },
      community_helper: {
        title: 'Ayudante Comunitario',
        description: 'Ayuda a 5 usuarios con sus preguntas',
        icon: '🤗',
        points: 400,
        category: 'social'
      },

      // Logros de accesibilidad
      accessibility_advocate: {
        title: 'Defensor de la Accesibilidad',
        description: 'Configura opciones de accesibilidad avanzadas',
        icon: '♿',
        points: 200,
        category: 'accessibility'
      },

      // Logros de wearable
      wearable_connected: {
        title: 'Conectado',
        description: 'Conecta tu dispositivo wearable',
        icon: '📱',
        points: 150,
        category: 'wearable'
      },
      data_sync_master: {
        title: 'Maestro de Sincronización',
        description: 'Sincroniza datos por 30 días seguidos',
        icon: '🔄',
        points: 600,
        category: 'wearable'
      }
    };
  }

  // Agregar puntos de experiencia a un usuario
  async addExperience(userId, points, reason = '') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const oldLevel = user.gamification.level;
      user.gamification.experience += points;

      // Calcular nuevo nivel
      let newLevel = oldLevel;
      for (let level = oldLevel; level <= 100; level++) {
        if (user.gamification.experience >= this.levelThresholds[level]) {
          newLevel = level;
        } else {
          break;
        }
      }

      // Actualizar nivel si cambió
      if (newLevel > oldLevel) {
        user.gamification.level = newLevel;

        // Verificar logros relacionados con nivel
        await this.checkLevelAchievements(user);
      }

      // Registrar actividad para racha
      await this.updateStreak(user);

      await user.save();

      return {
        oldLevel,
        newLevel,
        experience: user.gamification.experience,
        leveledUp: newLevel > oldLevel
      };
    } catch (error) {
      throw error;
    }
  }

  // Otorgar logro a un usuario
  async grantAchievement(userId, achievementId, progress = 100) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const achievement = this.achievementDefinitions[achievementId];
      if (!achievement) {
        throw new Error('Logro no encontrado');
      }

      // Verificar si ya tiene el logro
      const existingAchievement = user.gamification.achievements.find(
        a => a.badgeId === achievementId
      );

      if (existingAchievement) {
        if (existingAchievement.progress >= 100) {
          return { alreadyGranted: true };
        }
        existingAchievement.progress = progress;
        if (progress >= 100) {
          existingAchievement.earnedAt = new Date();
        }
      } else {
        user.gamification.achievements.push({
          badgeId: achievementId,
          earnedAt: progress >= 100 ? new Date() : null,
          progress: progress
        });
      }

      // Agregar puntos si el logro se completó
      if (progress >= 100 && !existingAchievement?.earnedAt) {
        await this.addExperience(userId, achievement.points, `Logro: ${achievement.title}`);
      }

      await user.save();

      return {
        achievement: {
          id: achievementId,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          points: achievement.points,
          category: achievement.category
        },
        progress,
        completed: progress >= 100
      };
    } catch (error) {
      throw error;
    }
  }

  // Verificar logros basados en nivel
  async checkLevelAchievements(user) {
    const level = user.gamification.level;

    // Logros por nivel
    const levelAchievements = {
      5: 'level_5',
      10: 'level_10',
      25: 'level_25',
      50: 'level_50',
      100: 'level_100'
    };

    if (levelAchievements[level]) {
      await this.grantAchievement(user._id, levelAchievements[level]);
    }
  }

  // Actualizar racha de actividad
  async updateStreak(user) {
    const now = new Date();
    const lastActivity = user.gamification.streak.lastActivity;

    if (!lastActivity) {
      // Primera actividad
      user.gamification.streak.current = 1;
      user.gamification.streak.lastActivity = now;
    } else {
      const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Día consecutivo
        user.gamification.streak.current += 1;
        user.gamification.streak.lastActivity = now;

        // Actualizar racha más larga
        if (user.gamification.streak.current > user.gamification.streak.longest) {
          user.gamification.streak.longest = user.gamification.streak.current;
        }

        // Verificar logros de racha
        await this.checkStreakAchievements(user);
      } else if (daysDiff > 1) {
        // Racha rota
        user.gamification.streak.current = 1;
        user.gamification.streak.lastActivity = now;
      }
      // Si daysDiff === 0, es el mismo día, no hacer nada
    }
  }

  // Verificar logros de racha
  async checkStreakAchievements(user) {
    const currentStreak = user.gamification.streak.current;

    if (currentStreak === 7) {
      await this.grantAchievement(user._id, 'streak_7');
    } else if (currentStreak === 30) {
      await this.grantAchievement(user._id, 'streak_30');
    }
  }

  // Verificar logros de wearable
  async checkWearableAchievements(userId) {
    try {
      const wearable = await Wearable.findOne({ userId });
      if (!wearable) return;

      // Verificar metas diarias
      if (wearable.sensors.steps.current >= wearable.sensors.steps.dailyGoal) {
        await this.grantAchievement(userId, 'step_master');
      }

      if (wearable.sensors.calories.current >= wearable.sensors.calories.dailyGoal) {
        await this.grantAchievement(userId, 'calories_goal');
      }

      // Verificar conexión de dispositivo
      if (wearable.connection.isConnected) {
        await this.grantAchievement(userId, 'wearable_connected');
      }

    } catch (error) {
      console.error('Error verificando logros de wearable:', error);
    }
  }

  // Obtener leaderboard
  async getLeaderboard(type = 'experience', limit = 10) {
    try {
      let sortCriteria = {};

      switch (type) {
        case 'experience':
          sortCriteria = { 'gamification.experience': -1 };
          break;
        case 'level':
          sortCriteria = { 'gamification.level': -1, 'gamification.experience': -1 };
          break;
        case 'streak':
          sortCriteria = { 'gamification.streak.longest': -1 };
          break;
        default:
          sortCriteria = { 'gamification.experience': -1 };
      }

      const users = await User.find({ isActive: true })
        .select('username profile.avatar gamification')
        .sort(sortCriteria)
        .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        userId: user._id,
        username: user.username,
        avatar: user.profile.avatar,
        gamification: user.gamification
      }));
    } catch (error) {
      throw error;
    }
  }

  // Obtener estadísticas de gamificación
  async getGamificationStats() {
    try {
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            avgLevel: { $avg: '$gamification.level' },
            avgExperience: { $avg: '$gamification.experience' },
            totalAchievements: { $sum: { $size: '$gamification.achievements' } },
            avgStreak: { $avg: '$gamification.streak.longest' },
            maxLevel: { $max: '$gamification.level' },
            maxExperience: { $max: '$gamification.experience' }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalUsers: 0,
          avgLevel: 0,
          avgExperience: 0,
          totalAchievements: 0,
          avgStreak: 0,
          maxLevel: 0,
          maxExperience: 0
        };
      }

      return stats[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener logros disponibles
  getAvailableAchievements() {
    return Object.keys(this.achievementDefinitions).map(id => ({
      id,
      ...this.achievementDefinitions[id]
    }));
  }

  // Obtener logros de un usuario
  async getUserAchievements(userId) {
    try {
      const user = await User.findById(userId).select('gamification.achievements');
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user.gamification.achievements.map(achievement => ({
        ...achievement.toObject(),
        details: this.achievementDefinitions[achievement.badgeId] || {}
      }));
    } catch (error) {
      throw error;
    }
  }

  // Resetear progreso de gamificación (para testing)
  async resetUserProgress(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.gamification = {
        level: 1,
        experience: 0,
        achievements: [],
        streak: {
          current: 0,
          longest: 0,
          lastActivity: null
        }
      };

      await user.save();
      return { message: 'Progreso reseteado exitosamente' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new GamificationService();