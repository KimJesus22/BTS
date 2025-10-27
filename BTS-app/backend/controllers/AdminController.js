const Joi = require('joi');
const User = require('../models/User');
const Member = require('../models/Member');
const Wearable = require('../models/Wearable');
const AccessibilityConfig = require('../models/AccessibilityConfig');
const GamificationService = require('../services/GamificationService');
const OptimizationService = require('../services/OptimizationService');

class AdminController {
  // Validación para crear miembro
  createMemberSchema = Joi.object({
    id: Joi.number().integer().min(1).max(7).required(),
    name: Joi.string().trim().min(1).max(50).required(),
    real_name: Joi.string().trim().min(1).max(100).required(),
    role: Joi.string().trim().min(1).max(100).required(),
    biography: Joi.object({
      es: Joi.string().trim().min(1).required(),
      en: Joi.string().trim().min(1).required()
    }).required(),
    birth_date: Joi.date().required(),
    birth_place: Joi.string().trim().min(1).required(),
    debut_date: Joi.date().default(() => new Date('2013-06-13')),
    social_media: Joi.object({
      instagram: Joi.string().uri(),
      twitter: Joi.string().uri(),
      weverse: Joi.string().uri()
    }),
    achievements: Joi.array().items(Joi.object({
      title: Joi.string().trim().min(1).max(200).required(),
      year: Joi.number().integer().min(2013).max(new Date().getFullYear()).required(),
      description: Joi.string().trim().min(1).max(500).required()
    }))
  });

  // Crear nuevo miembro (solo administradores)
  async createMember(req, res) {
    try {
      const { error, value } = this.createMemberSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos del miembro inválidos',
          details: error.details[0].message
        });
      }

      // Verificar si el ID ya existe
      const existingMember = await Member.findOne({ id: value.id });
      if (existingMember) {
        return res.status(400).json({ error: 'Ya existe un miembro con ese ID' });
      }

      const member = new Member(value);
      await member.save();

      res.status(201).json({
        message: 'Miembro creado exitosamente',
        member
      });
    } catch (error) {
      console.error('Error creando miembro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar miembro (solo administradores)
  async updateMember(req, res) {
    try {
      const memberId = parseInt(req.params.id);

      const member = await Member.findOne({ id: memberId });
      if (!member) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }

      const allowedFields = [
        'name', 'real_name', 'role', 'biography', 'birth_date',
        'birth_place', 'debut_date', 'social_media', 'achievements'
      ];

      // Actualizar solo campos permitidos
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          member[field] = req.body[field];
        }
      });

      await member.save();

      res.json({
        message: 'Miembro actualizado exitosamente',
        member
      });
    } catch (error) {
      console.error('Error actualizando miembro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Eliminar miembro (solo administradores)
  async deleteMember(req, res) {
    try {
      const memberId = parseInt(req.params.id);

      const member = await Member.findOneAndDelete({ id: memberId });
      if (!member) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }

      res.json({
        message: 'Miembro eliminado exitosamente',
        member: { id: member.id, name: member.name }
      });
    } catch (error) {
      console.error('Error eliminando miembro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener todos los usuarios (solo administradores)
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select('-password -loginAttempts -lockUntil')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments();

      res.json({
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener usuario por ID (solo administradores)
  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id)
        .select('-password -loginAttempts -lockUntil')
        .populate('profile.favoriteMembers', 'id name role');

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar rol de usuario (solo administradores)
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;

      if (!['user', 'admin', 'moderator'].includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.role = role;
      await user.save();

      res.json({
        message: 'Rol de usuario actualizado exitosamente',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error actualizando rol:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas generales del sistema
  async getSystemStats(req, res) {
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        totalMembers,
        connectedWearables,
        accessibilityConfigs,
        gamificationStats
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'admin' }),
        Member.countDocuments(),
        Wearable.countDocuments({ 'connection.isConnected': true }),
        AccessibilityConfig.countDocuments(),
        GamificationService.getGamificationStats()
      ]);

      res.json({
        systemStats: {
          users: {
            total: totalUsers,
            active: activeUsers,
            admins: adminUsers
          },
          members: {
            total: totalMembers
          },
          wearables: {
            connected: connectedWearables
          },
          accessibility: {
            configs: accessibilityConfigs
          },
          gamification: gamificationStats
        }
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener optimizaciones del sistema
  async getSystemOptimizations(req, res) {
    try {
      const optimizations = await OptimizationService.getSystemOptimizations();

      res.json(optimizations);
    } catch (error) {
      console.error('Error obteniendo optimizaciones del sistema:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Resetear progreso de gamificación de un usuario
  async resetUserGamification(req, res) {
    try {
      await GamificationService.resetUserProgress(req.params.id);

      res.json({ message: 'Progreso de gamificación reseteado exitosamente' });
    } catch (error) {
      console.error('Error reseteando gamificación:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener logs de actividad (simulado)
  async getActivityLogs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const type = req.query.type; // 'all', 'auth', 'gamification', 'wearable'

      // En un caso real, esto vendría de una colección de logs
      // Por ahora, retornamos datos simulados
      const mockLogs = [
        {
          id: 1,
          type: 'auth',
          userId: '507f1f77bcf86cd799439011',
          action: 'login',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutos atrás
          details: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
        },
        {
          id: 2,
          type: 'gamification',
          userId: '507f1f77bcf86cd799439011',
          action: 'achievement_earned',
          timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutos atrás
          details: { achievementId: 'first_login', points: 100 }
        }
      ];

      // Filtrar por tipo si se especifica
      let filteredLogs = mockLogs;
      if (type && type !== 'all') {
        filteredLogs = mockLogs.filter(log => log.type === type);
      }

      res.json({
        logs: filteredLogs.slice((page - 1) * limit, page * limit),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredLogs.length / limit),
          totalLogs: filteredLogs.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Exportar datos de usuario
  async exportUserData(req, res) {
    try {
      const userId = req.params.id;

      const [
        user,
        accessibilityConfig,
        wearable
      ] = await Promise.all([
        User.findById(userId).select('-password -loginAttempts -lockUntil'),
        AccessibilityConfig.findOne({ userId }),
        Wearable.findOne({ userId })
      ]);

      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      const exportData = {
        user: user.toObject(),
        accessibilityConfig: accessibilityConfig?.toObject() || null,
        wearable: wearable?.toObject() || null,
        exportDate: new Date(),
        exportedBy: req.userId
      };

      res.json({
        message: 'Datos exportados exitosamente',
        data: exportData
      });
    } catch (error) {
      console.error('Error exportando datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Suspender usuario temporalmente
  async suspendUser(req, res) {
    try {
      const { duration, reason } = req.body; // duration en horas

      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.lockUntil = new Date(Date.now() + (duration * 60 * 60 * 1000));
      await user.save();

      res.json({
        message: `Usuario suspendido por ${duration} horas`,
        suspension: {
          userId: user._id,
          username: user.username,
          lockUntil: user.lockUntil,
          reason: reason || 'Sin especificar'
        }
      });
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Reactivar usuario
  async reactivateUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      user.lockUntil = undefined;
      user.loginAttempts = 0;
      user.isActive = true;
      await user.save();

      res.json({
        message: 'Usuario reactivado exitosamente',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error('Error reactivando usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new AdminController();