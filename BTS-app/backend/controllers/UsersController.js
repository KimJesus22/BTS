const Joi = require('joi');
const User = require('../models/User');
const AccessibilityConfig = require('../models/AccessibilityConfig');
const Wearable = require('../models/Wearable');
const AuthenticationService = require('../services/AuthenticationService');
const GamificationService = require('../services/GamificationService');
const OptimizationService = require('../services/OptimizationService');
const { validateWithJoi, authSchemas, userSchemas } = require('../middlewares/validation');

class UsersController {
  // Registro de usuario con validación centralizada
  async register(req, res, next) {
    try {
      // La validación ya se realizó en el middleware
      const result = await AuthenticationService.register(req.body);

      // Otorgar logro de primer login
      await GamificationService.grantAchievement(result.user.id, 'first_login');

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  // Inicio de sesión con validación centralizada
  async login(req, res, next) {
    try {
      // La validación ya se realizó en el middleware
      const result = await AuthenticationService.login(req.body);

      // Actualizar racha y verificar logros
      await GamificationService.updateStreak(result.user.id);

      res.json({
        message: 'Inicio de sesión exitoso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password', 'loginAttempts', 'lockUntil'] },
        include: [{
          model: User.sequelize.models.Member,
          as: 'favoriteMembers',
          attributes: ['id', 'name', 'role'],
          through: { attributes: [] }
        }]
      });

      if (!user) {
        const notFoundError = new Error('Usuario no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar perfil con validación centralizada
  async updateProfile(req, res, next) {
    try {
      // La validación ya se realizó en el middleware
      const user = await User.findByPk(req.userId);
      if (!user) {
        const notFoundError = new Error('Usuario no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      // Actualizar campos
      if (req.body.profile) {
        if (req.body.profile.firstName) user.firstName = req.body.profile.firstName;
        if (req.body.profile.lastName) user.lastName = req.body.profile.lastName;
        if (req.body.profile.avatar) user.avatar = req.body.profile.avatar;
        if (req.body.profile.bio) user.bio = req.body.profile.bio;
        if (req.body.profile.favoriteMembers) user.favoriteMembers = req.body.profile.favoriteMembers;
        if (req.body.profile.language) user.language = req.body.profile.language;
      }

      if (req.body.accessibility) {
        if (req.body.accessibility.fontSize) user.fontSize = req.body.accessibility.fontSize;
        if (req.body.accessibility.highContrast) user.highContrast = req.body.accessibility.highContrast;
        if (req.body.accessibility.reducedMotion) user.reducedMotion = req.body.accessibility.reducedMotion;
        if (req.body.accessibility.screenReader) user.screenReader = req.body.accessibility.screenReader;
      }

      await user.save();

      // Verificar logro de perfil completo
      const isProfileComplete = user.firstName &&
                                user.lastName &&
                                user.bio &&
                                user.avatar;

      if (isProfileComplete) {
        await GamificationService.grantAchievement(user.id, 'profile_complete');
      }

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(user.id);

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            bio: user.bio,
            favoriteMembers: user.favoriteMembers,
            language: user.language
          },
          accessibility: {
            fontSize: user.fontSize,
            highContrast: user.highContrast,
            reducedMotion: user.reducedMotion,
            screenReader: user.screenReader
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Cambiar contraseña con validación centralizada
  async changePassword(req, res, next) {
    try {
      // La validación ya se realizó en el middleware
      await AuthenticationService.changePassword(
        req.userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // Obtener configuración de accesibilidad
  async getAccessibilityConfig(req, res, next) {
    try {
      let config = await AccessibilityConfig.findOne({ where: { userId: req.userId } });

      if (!config) {
        // Crear configuración por defecto
        config = await AccessibilityConfig.create({ userId: req.userId });
      }

      res.json({ accessibilityConfig: config });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar configuración de accesibilidad con validación centralizada
  async updateAccessibilityConfig(req, res, next) {
    try {
      // La validación ya se realizó en el middleware
      let config = await AccessibilityConfig.findOne({ where: { userId: req.userId } });

      if (!config) {
        config = await AccessibilityConfig.create({ userId: req.userId });
      }

      // Actualizar configuración
      if (req.body.preferences) {
        if (req.body.preferences.fontSize) config.fontSize = req.body.preferences.fontSize;
        if (req.body.preferences.fontFamily) config.fontFamily = req.body.preferences.fontFamily;
        if (req.body.preferences.colorScheme) config.colorScheme = req.body.preferences.colorScheme;
        if (req.body.preferences.motion) config.motion = req.body.preferences.motion;
        if (req.body.preferences.sound) config.sound = req.body.preferences.sound;
      }

      if (req.body.assistiveTechnologies) {
        if (req.body.assistiveTechnologies.screenReader !== undefined) {
          config.screenReader_enabled = req.body.assistiveTechnologies.screenReader.enabled;
          config.screenReader_type = req.body.assistiveTechnologies.screenReader.type;
        }
        if (req.body.assistiveTechnologies.keyboardNavigation !== undefined) config.keyboardNavigation = req.body.assistiveTechnologies.keyboardNavigation;
        if (req.body.assistiveTechnologies.focusManagement !== undefined) config.focusManagement = req.body.assistiveTechnologies.focusManagement;
        if (req.body.assistiveTechnologies.skipLinks !== undefined) config.skipLinks = req.body.assistiveTechnologies.skipLinks;
      }

      if (req.body.contentAdaptations) {
        if (req.body.contentAdaptations.simplifiedLanguage !== undefined) config.simplifiedLanguage = req.body.contentAdaptations.simplifiedLanguage;
        if (req.body.contentAdaptations.largePrint !== undefined) config.largePrint = req.body.contentAdaptations.largePrint;
        if (req.body.contentAdaptations.audioDescriptions !== undefined) config.audioDescriptions = req.body.contentAdaptations.audioDescriptions;
        if (req.body.contentAdaptations.signLanguage !== undefined) config.signLanguage = req.body.contentAdaptations.signLanguage;
      }

      if (req.body.deviceSettings) {
        if (req.body.deviceSettings.touchTargets) config.touchTargets = req.body.deviceSettings.touchTargets;
        if (req.body.deviceSettings.gestureSupport !== undefined) config.gestureSupport = req.body.deviceSettings.gestureSupport;
        if (req.body.deviceSettings.voiceCommands !== undefined) config.voiceCommands = req.body.deviceSettings.voiceCommands;
      }

      if (req.body.notifications) {
        if (req.body.notifications.accessibilityAlerts !== undefined) config.accessibilityAlerts = req.body.notifications.accessibilityAlerts;
        if (req.body.notifications.guidanceMessages !== undefined) config.guidanceMessages = req.body.notifications.guidanceMessages;
        if (req.body.notifications.errorAnnouncements !== undefined) config.errorAnnouncements = req.body.notifications.errorAnnouncements;
      }

      await config.save();

      // Verificar logro de accesibilidad
      if (config.getHasAdvancedSettings()) {
        await GamificationService.grantAchievement(req.userId, 'accessibility_advocate');
      }

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.json({
        message: 'Configuración de accesibilidad actualizada',
        accessibilityConfig: config
      });
    } catch (error) {
      next(error);
    }
  }

  // Resetear configuración de accesibilidad
  async resetAccessibilityConfig(req, res, next) {
    try {
      let config = await AccessibilityConfig.findOne({ where: { userId: req.userId } });

      if (!config) {
        config = await AccessibilityConfig.create({ userId: req.userId });
      }

      await config.resetToDefault();

      res.json({
        message: 'Configuración de accesibilidad reseteada',
        accessibilityConfig: config
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener datos de gamificación
  async getGamificationData(req, res, next) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: ['gamification_level', 'gamification_experience', 'gamification_achievements', 'gamification_streak_current', 'gamification_streak_longest', 'gamification_streak_lastActivity']
      });

      if (!user) {
        const notFoundError = new Error('Usuario no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      const achievements = await GamificationService.getUserAchievements(req.userId);
      const availableAchievements = GamificationService.getAvailableAchievements();

      res.json({
        gamification: {
          level: user.gamification_level,
          experience: user.gamification_experience,
          achievements: user.gamification_achievements,
          streak: {
            current: user.gamification_streak_current,
            longest: user.gamification_streak_longest,
            lastActivity: user.gamification_streak_lastActivity
          }
        },
        achievements,
        availableAchievements
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener optimizaciones personalizadas
  async getOptimizations(req, res, next) {
    try {
      const optimizations = await OptimizationService.getAllOptimizations(req.userId);

      res.json(optimizations);
    } catch (error) {
      next(error);
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(req, res, next) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: ['gamification_level', 'gamification_experience', 'gamification_achievements', 'gamification_streak_current', 'gamification_streak_longest', 'createdAt', 'lastLogin', 'favoriteMembers']
      });

      if (!user) {
        const notFoundError = new Error('Usuario no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      const daysSinceRegistration = Math.floor(
        (new Date() - user.createdAt) / (1000 * 60 * 60 * 24)
      );

      res.json({
        stats: {
          level: user.gamification_level,
          experience: user.gamification_experience,
          currentStreak: user.gamification_streak_current,
          longestStreak: user.gamification_streak_longest,
          achievementsCount: user.gamification_achievements ? user.gamification_achievements.length : 0,
          favoriteMembersCount: user.favoriteMembers ? user.favoriteMembers.length : 0,
          daysSinceRegistration,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar cuenta (soft delete)
  async deleteAccount(req, res, next) {
    try {
      const user = await User.findByPk(req.userId);

      if (!user) {
        const notFoundError = new Error('Usuario no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      user.isActive = false;
      await user.save();

      res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  // Obtener leaderboard (solo para usuarios autenticados)
  async getLeaderboard(req, res, next) {
    try {
      const type = req.query.type || 'experience';
      const limit = parseInt(req.query.limit) || 10;

      const leaderboard = await GamificationService.getLeaderboard(type, limit);

      res.json({ leaderboard });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();