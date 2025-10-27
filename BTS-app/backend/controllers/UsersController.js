const Joi = require('joi');
const User = require('../models/User');
const AccessibilityConfig = require('../models/AccessibilityConfig');
const Wearable = require('../models/Wearable');
const AuthenticationService = require('../services/AuthenticationService');
const GamificationService = require('../services/GamificationService');
const OptimizationService = require('../services/OptimizationService');

class UsersController {
  // Validación para registro
  registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    profile: Joi.object({
      firstName: Joi.string().trim().max(50),
      lastName: Joi.string().trim().max(50),
      bio: Joi.string().trim().max(500),
      language: Joi.string().valid('es', 'en').default('es')
    }),
    accessibility: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large').default('medium'),
      highContrast: Joi.boolean().default(false),
      reducedMotion: Joi.boolean().default(false),
      screenReader: Joi.boolean().default(false)
    })
  });

  // Registro de usuario
  async register(req, res) {
    try {
      const { error, value } = this.registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos de registro inválidos',
          details: error.details[0].message
        });
      }

      const result = await AuthenticationService.register(value);

      // Otorgar logro de primer login
      await GamificationService.grantAchievement(result.user.id, 'first_login');

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Validación para login
  loginSchema = Joi.object({
    identifier: Joi.string().required(), // email o username
    password: Joi.string().required()
  });

  // Inicio de sesión
  async login(req, res) {
    try {
      const { error, value } = this.loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Credenciales inválidas',
          details: error.details[0].message
        });
      }

      const result = await AuthenticationService.login(value);

      // Actualizar racha y verificar logros
      await GamificationService.updateStreak(result.user.id);

      res.json({
        message: 'Inicio de sesión exitoso',
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({ error: error.message });
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId)
        .select('-password -loginAttempts -lockUntil')
        .populate('profile.favoriteMembers', 'id name role');

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para actualizar perfil
  updateProfileSchema = Joi.object({
    profile: Joi.object({
      firstName: Joi.string().trim().max(50),
      lastName: Joi.string().trim().max(50),
      bio: Joi.string().trim().max(500),
      avatar: Joi.string().uri(),
      language: Joi.string().valid('es', 'en'),
      favoriteMembers: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
    }),
    accessibility: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large'),
      highContrast: Joi.boolean(),
      reducedMotion: Joi.boolean(),
      screenReader: Joi.boolean()
    })
  });

  // Actualizar perfil
  async updateProfile(req, res) {
    try {
      const { error, value } = this.updateProfileSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details[0].message
        });
      }

      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Actualizar campos
      if (value.profile) {
        Object.assign(user.profile, value.profile);
      }

      if (value.accessibility) {
        Object.assign(user.accessibility, value.accessibility);
      }

      await user.save();

      // Verificar logro de perfil completo
      const isProfileComplete = user.profile.firstName &&
                               user.profile.lastName &&
                               user.profile.bio &&
                               user.profile.avatar;

      if (isProfileComplete) {
        await GamificationService.grantAchievement(user._id, 'profile_complete');
      }

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(user._id);

      res.json({
        message: 'Perfil actualizado exitosamente',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          accessibility: user.accessibility
        }
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para cambiar contraseña
  changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  });

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { error, value } = this.changePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details[0].message
        });
      }

      await AuthenticationService.changePassword(
        req.userId,
        value.currentPassword,
        value.newPassword
      );

      res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener configuración de accesibilidad
  async getAccessibilityConfig(req, res) {
    try {
      let config = await AccessibilityConfig.findOne({ userId: req.userId });

      if (!config) {
        // Crear configuración por defecto
        config = new AccessibilityConfig({ userId: req.userId });
        await config.save();
      }

      res.json({ accessibilityConfig: config });
    } catch (error) {
      console.error('Error obteniendo configuración de accesibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para actualizar configuración de accesibilidad
  updateAccessibilitySchema = Joi.object({
    preferences: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large', 'extra-large'),
      fontFamily: Joi.string().valid('default', 'dyslexic', 'sans-serif', 'serif'),
      colorScheme: Joi.string().valid('default', 'high-contrast', 'dark', 'light', 'colorblind-friendly'),
      motion: Joi.string().valid('default', 'reduced', 'none'),
      sound: Joi.string().valid('default', 'muted', 'screen-reader')
    }),
    assistiveTechnologies: Joi.object({
      screenReader: Joi.object({
        enabled: Joi.boolean(),
        type: Joi.string().valid('none', 'nvda', 'jaaws', 'voiceover', 'talkback', 'other')
      }),
      keyboardNavigation: Joi.boolean(),
      focusManagement: Joi.boolean(),
      skipLinks: Joi.boolean()
    }),
    contentAdaptations: Joi.object({
      simplifiedLanguage: Joi.boolean(),
      largePrint: Joi.boolean(),
      audioDescriptions: Joi.boolean(),
      signLanguage: Joi.boolean()
    }),
    deviceSettings: Joi.object({
      touchTargets: Joi.string().valid('default', 'large', 'extra-large'),
      gestureSupport: Joi.boolean(),
      voiceCommands: Joi.boolean()
    }),
    notifications: Joi.object({
      accessibilityAlerts: Joi.boolean(),
      guidanceMessages: Joi.boolean(),
      errorAnnouncements: Joi.boolean()
    })
  });

  // Actualizar configuración de accesibilidad
  async updateAccessibilityConfig(req, res) {
    try {
      const { error, value } = this.updateAccessibilitySchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Configuración inválida',
          details: error.details[0].message
        });
      }

      let config = await AccessibilityConfig.findOne({ userId: req.userId });

      if (!config) {
        config = new AccessibilityConfig({ userId: req.userId });
      }

      // Actualizar configuración
      Object.assign(config.preferences, value.preferences || {});
      Object.assign(config.assistiveTechnologies, value.assistiveTechnologies || {});
      Object.assign(config.contentAdaptations, value.contentAdaptations || {});
      Object.assign(config.deviceSettings, value.deviceSettings || {});
      Object.assign(config.notifications, value.notifications || {});

      await config.save();

      // Verificar logro de accesibilidad
      if (config.hasAdvancedSettings) {
        await GamificationService.grantAchievement(req.userId, 'accessibility_advocate');
      }

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.json({
        message: 'Configuración de accesibilidad actualizada',
        accessibilityConfig: config
      });
    } catch (error) {
      console.error('Error actualizando configuración de accesibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Resetear configuración de accesibilidad
  async resetAccessibilityConfig(req, res) {
    try {
      let config = await AccessibilityConfig.findOne({ userId: req.userId });

      if (!config) {
        config = new AccessibilityConfig({ userId: req.userId });
      }

      await config.resetToDefault();

      res.json({
        message: 'Configuración de accesibilidad reseteada',
        accessibilityConfig: config
      });
    } catch (error) {
      console.error('Error reseteando configuración de accesibilidad:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener datos de gamificación
  async getGamificationData(req, res) {
    try {
      const user = await User.findById(req.userId).select('gamification');

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const achievements = await GamificationService.getUserAchievements(req.userId);
      const availableAchievements = GamificationService.getAvailableAchievements();

      res.json({
        gamification: user.gamification,
        achievements,
        availableAchievements
      });
    } catch (error) {
      console.error('Error obteniendo datos de gamificación:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener optimizaciones personalizadas
  async getOptimizations(req, res) {
    try {
      const optimizations = await OptimizationService.getAllOptimizations(req.userId);

      res.json(optimizations);
    } catch (error) {
      console.error('Error obteniendo optimizaciones:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas del usuario
  async getUserStats(req, res) {
    try {
      const user = await User.findById(req.userId)
        .select('gamification createdAt lastLogin')
        .populate('profile.favoriteMembers', 'name');

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const daysSinceRegistration = Math.floor(
        (new Date() - user.createdAt) / (1000 * 60 * 60 * 24)
      );

      res.json({
        stats: {
          level: user.gamification.level,
          experience: user.gamification.experience,
          currentStreak: user.gamification.streak.current,
          longestStreak: user.gamification.streak.longest,
          achievementsCount: user.gamification.achievements.length,
          favoriteMembersCount: user.profile.favoriteMembers?.length || 0,
          daysSinceRegistration,
          lastLogin: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar cuenta (soft delete)
  async deleteAccount(req, res) {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.isActive = false;
      await user.save();

      res.json({ message: 'Cuenta eliminada exitosamente' });
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener leaderboard (solo para usuarios autenticados)
  async getLeaderboard(req, res) {
    try {
      const type = req.query.type || 'experience';
      const limit = parseInt(req.query.limit) || 10;

      const leaderboard = await GamificationService.getLeaderboard(type, limit);

      res.json({ leaderboard });
    } catch (error) {
      console.error('Error obteniendo leaderboard:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new UsersController();