const Joi = require('joi');
const { Op } = require('sequelize');
const Member = require('../models/Member');
const GamificationService = require('../services/GamificationService');
const { validateWithJoi, memberSchemas } = require('../middlewares/validation');

class MembersController {
  // Obtener todos los miembros con filtros y paginación
  async getMembers(req, res, next) {
    try {
      // La validación de parámetros de consulta se realiza en el middleware de rutas
      const { page = 1, limit = 10, search, role, sortBy = 'name', sortOrder = 'asc' } = req.query;
      const offset = (page - 1) * limit;

      // Construir where clause
      let where = {};

      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { real_name: { [Op.iLike]: `%${search}%` } },
          { role: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (role) {
        where.role = { [Op.iLike]: `%${role}%` };
      }

      // Construir opciones de ordenamiento
      const order = [[sortBy, sortOrder.toUpperCase()]];

      // Ejecutar consulta
      const { count: total, rows: members } = await Member.findAndCountAll({
        where,
        order,
        offset,
        limit: parseInt(limit),
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      const totalPages = Math.ceil(total / limit);

      // Otorgar puntos de gamificación si el usuario está autenticado
      if (req.userId) {
        await GamificationService.addExperience(req.userId, 10, 'Ver miembros');
      }

      res.json({
        members,
        pagination: {
          currentPage: parseInt(page),
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
      next(error);
    }
  }

  // Obtener miembro específico por ID
  async getMemberById(req, res, next) {
    try {
      // La validación del parámetro de ruta se realiza en el middleware de rutas
      const id = parseInt(req.params.id);

      const member = await Member.findByPk(id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
      });

      if (!member) {
        const notFoundError = new Error('Miembro no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      // Otorgar puntos de gamificación
      if (req.userId) {
        await GamificationService.addExperience(req.userId, 5, 'Ver perfil de miembro');

        // Verificar logro de fan dedicado
        const totalMembers = await Member.count();
        const viewedMembers = new Set(); // En un caso real, esto vendría de una colección de visitas
        // Por simplicidad, asumimos que ver este miembro cuenta
        viewedMembers.add(id);

        if (viewedMembers.size >= totalMembers) { // Todos los miembros
          await GamificationService.grantAchievement(req.userId, 'member_fan');
        }
      }

      res.json(member);
    } catch (error) {
      next(error);
    }
  }

  // Actualizar estadísticas de un miembro (solo administradores)
  async updateMemberStats(req, res, next) {
    try {
      // La validación se realiza en el middleware de rutas
      const memberId = parseInt(req.params.id);
      const stats = req.body;

      const member = await Member.findByPk(memberId);
      if (!member) {
        const notFoundError = new Error('Miembro no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      // Actualizar estadísticas
      await member.updateStats(stats);

      res.json({
        message: 'Estadísticas actualizadas exitosamente',
        member: {
          id: member.id,
          name: member.name,
          followers: member.followers,
          likes: member.likes,
          views: member.views
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Agregar logro a un miembro (solo administradores)
  async addMemberAchievement(req, res, next) {
    try {
      // La validación se realiza en el middleware de rutas
      const memberId = parseInt(req.params.id);
      const achievement = req.body;

      const member = await Member.findByPk(memberId);
      if (!member) {
        const notFoundError = new Error('Miembro no encontrado');
        notFoundError.name = 'NotFoundError';
        return next(notFoundError);
      }

      // Agregar logro
      const currentAchievements = member.achievements || [];
      currentAchievements.push(achievement);
      member.achievements = currentAchievements;
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
      next(error);
    }
  }

  // Obtener estadísticas generales de miembros
  async getMembersStats(req, res, next) {
    try {
      const stats = await Member.findAll({
        attributes: [
          [Member.sequelize.fn('COUNT', Member.sequelize.col('id')), 'totalMembers'],
          [Member.sequelize.fn('SUM', Member.sequelize.col('followers')), 'totalFollowers'],
          [Member.sequelize.fn('SUM', Member.sequelize.col('likes')), 'totalLikes'],
          [Member.sequelize.fn('SUM', Member.sequelize.col('views')), 'totalViews'],
          [Member.sequelize.fn('AVG', Member.sequelize.col('followers')), 'avgFollowers'],
          [Member.sequelize.fn('AVG', Member.sequelize.col('likes')), 'avgLikes'],
          [Member.sequelize.fn('AVG', Member.sequelize.col('views')), 'avgViews']
        ],
        raw: true
      });

      if (!stats || stats.length === 0) {
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

      // Obtener roles únicos y contar logros
      const roles = await Member.findAll({
        attributes: [[Member.sequelize.fn('DISTINCT', Member.sequelize.col('role')), 'role']],
        raw: true
      });

      const achievementsCount = await Member.sum('achievements', {
        where: {
          achievements: {
            [Op.ne]: null
          }
        }
      });

      res.json({
        ...stats[0],
        roles: roles.map(r => r.role),
        achievementsCount: achievementsCount || 0
      });
    } catch (error) {
      next(error);
    }
  }

  // Buscar miembros por nombre
  async searchMembers(req, res, next) {
    try {
      // La validación del término de búsqueda se realiza en el middleware de rutas
      const searchTerm = req.query.q;

      const members = await Member.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { real_name: { [Op.iLike]: `%${searchTerm}%` } },
            { role: { [Op.iLike]: `%${searchTerm}%` } }
          ]
        },
        attributes: ['id', 'name', 'real_name', 'role', 'biography_es', 'biography_en']
      });

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
      next(error);
    }
  }

  // Obtener miembros populares (por estadísticas)
  async getPopularMembers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const members = await Member.findAll({
        order: [
          ['followers', 'DESC'],
          ['likes', 'DESC']
        ],
        limit,
        attributes: ['id', 'name', 'role', 'followers', 'likes', 'views']
      });

      res.json({
        popularMembers: members,
        criteria: 'followers and likes'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MembersController();