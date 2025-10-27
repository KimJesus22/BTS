const Joi = require('joi');
const Member = require('../models/Member');
const GamificationService = require('../services/GamificationService');

class MembersController {
  // Validación para obtener miembros
  getMembersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(''),
    role: Joi.string().valid('Leader', 'Rapper', 'Dancer', 'Vocalist', 'Visual', 'Main Vocalist', 'Center').allow(''),
    sortBy: Joi.string().valid('name', 'role', 'id').default('id'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  });

  // Obtener todos los miembros con filtros y paginación
  async getMembers(req, res) {
    try {
      // Validar parámetros de consulta
      const { error, value } = this.getMembersSchema.validate(req.query);
      if (error) {
        return res.status(400).json({
          error: 'Parámetros de consulta inválidos',
          details: error.details[0].message
        });
      }

      const { page, limit, search, role, sortBy, sortOrder } = value;
      const skip = (page - 1) * limit;

      // Construir query de búsqueda
      let query = {};

      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { real_name: new RegExp(search, 'i') },
          { role: new RegExp(search, 'i') }
        ];
      }

      if (role) {
        query.role = new RegExp(role, 'i');
      }

      // Construir opciones de ordenamiento
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Ejecutar consulta
      const members = await Member.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .select('-__v');

      const total = await Member.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      // Otorgar puntos de gamificación si el usuario está autenticado
      if (req.userId) {
        await GamificationService.addExperience(req.userId, 10, 'Ver miembros');
      }

      res.json({
        members,
        pagination: {
          currentPage: page,
          totalPages,
          totalMembers: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        filters: {
          search: search || null,
          role: role || null
        }
      });
    } catch (error) {
      console.error('Error obteniendo miembros:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para obtener miembro por ID
  getMemberByIdSchema = Joi.object({
    id: Joi.number().integer().min(1).max(7).required()
  });

  // Obtener miembro específico por ID
  async getMemberById(req, res) {
    try {
      // Validar parámetro de ruta
      const { error, value } = this.getMemberByIdSchema.validate({ id: parseInt(req.params.id) });
      if (error) {
        return res.status(400).json({
          error: 'ID de miembro inválido',
          details: error.details[0].message
        });
      }

      const { id } = value;

      const member = await Member.findOne({ id }).select('-__v');

      if (!member) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }

      // Otorgar puntos de gamificación
      if (req.userId) {
        await GamificationService.addExperience(req.userId, 5, 'Ver perfil de miembro');

        // Verificar logro de fan dedicado
        const userMembers = await Member.find({});
        const viewedMembers = new Set(); // En un caso real, esto vendría de una colección de visitas
        // Por simplicidad, asumimos que ver este miembro cuenta
        viewedMembers.add(id);

        if (viewedMembers.size >= 7) { // Todos los miembros
          await GamificationService.grantAchievement(req.userId, 'member_fan');
        }
      }

      res.json(member);
    } catch (error) {
      console.error('Error obteniendo miembro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para actualizar estadísticas
  updateStatsSchema = Joi.object({
    memberId: Joi.number().integer().min(1).max(7).required(),
    stats: Joi.object({
      followers: Joi.number().integer().min(0),
      likes: Joi.number().integer().min(0),
      views: Joi.number().integer().min(0)
    }).required()
  });

  // Actualizar estadísticas de un miembro (solo administradores)
  async updateMemberStats(req, res) {
    try {
      const { error, value } = this.updateStatsSchema.validate({
        memberId: parseInt(req.params.id),
        stats: req.body
      });

      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details[0].message
        });
      }

      const { memberId, stats } = value;

      const member = await Member.findOne({ id: memberId });
      if (!member) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }

      // Actualizar estadísticas
      await member.updateStats(stats);

      res.json({
        message: 'Estadísticas actualizadas exitosamente',
        member: {
          id: member.id,
          name: member.name,
          stats: member.stats
        }
      });
    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Validación para agregar logro
  addAchievementSchema = Joi.object({
    memberId: Joi.number().integer().min(1).max(7).required(),
    achievement: Joi.object({
      title: Joi.string().trim().min(1).max(100).required(),
      year: Joi.number().integer().min(2013).max(new Date().getFullYear()).required(),
      description: Joi.string().trim().min(1).max(500).required()
    }).required()
  });

  // Agregar logro a un miembro (solo administradores)
  async addMemberAchievement(req, res) {
    try {
      const { error, value } = this.addAchievementSchema.validate({
        memberId: parseInt(req.params.id),
        achievement: req.body
      });

      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details[0].message
        });
      }

      const { memberId, achievement } = value;

      const member = await Member.findOne({ id: memberId });
      if (!member) {
        return res.status(404).json({ error: 'Miembro no encontrado' });
      }

      // Agregar logro
      member.achievements.push(achievement);
      await member.save();

      res.json({
        message: 'Logro agregado exitosamente',
        member: {
          id: member.id,
          name: member.name,
          achievements: member.achievements
        }
      });
    } catch (error) {
      console.error('Error agregando logro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas generales de miembros
  async getMembersStats(req, res) {
    try {
      const stats = await Member.aggregate([
        {
          $group: {
            _id: null,
            totalMembers: { $sum: 1 },
            totalFollowers: { $sum: '$stats.followers' },
            totalLikes: { $sum: '$stats.likes' },
            totalViews: { $sum: '$stats.views' },
            avgFollowers: { $avg: '$stats.followers' },
            avgLikes: { $avg: '$stats.likes' },
            avgViews: { $avg: '$stats.views' },
            roles: { $addToSet: '$role' },
            achievementsCount: { $sum: { $size: '$achievements' } }
          }
        }
      ]);

      if (stats.length === 0) {
        return res.json({
          totalMembers: 0,
          totalFollowers: 0,
          totalLikes: 0,
          totalViews: 0,
          avgFollowers: 0,
          avgLikes: 0,
          avgViews: 0,
          roles: [],
          achievementsCount: 0
        });
      }

      res.json(stats[0]);
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Buscar miembros por nombre
  async searchMembers(req, res) {
    try {
      const searchTerm = req.query.q;

      if (!searchTerm || searchTerm.trim().length < 2) {
        return res.status(400).json({
          error: 'Término de búsqueda requerido (mínimo 2 caracteres)'
        });
      }

      const members = await Member.find({
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { real_name: new RegExp(searchTerm, 'i') },
          { role: new RegExp(searchTerm, 'i') }
        ]
      }).select('id name real_name role biography');

      // Otorgar puntos por búsqueda
      if (req.userId) {
        await GamificationService.addExperience(req.userId, 2, 'Buscar miembros');
      }

      res.json({
        query: searchTerm,
        results: members.length,
        members
      });
    } catch (error) {
      console.error('Error buscando miembros:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener miembros populares (por estadísticas)
  async getPopularMembers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const members = await Member.find({})
        .sort({ 'stats.followers': -1, 'stats.likes': -1 })
        .limit(limit)
        .select('id name role stats');

      res.json({
        popularMembers: members,
        criteria: 'followers and likes'
      });
    } catch (error) {
      console.error('Error obteniendo miembros populares:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new MembersController();