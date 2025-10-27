const express = require('express');
const router = express.Router();
const MembersController = require('../controllers/MembersController');
const AuthenticationService = require('../services/AuthenticationService');
const { validateWithJoi, memberSchemas, memberValidators } = require('../middlewares/validation');

// Middleware de autenticación opcional para miembros
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = AuthenticationService.verifyToken(token);
      req.userId = decoded.userId;
    }
    next();
  } catch (error) {
    // Si el token es inválido, continuar sin autenticación
    next();
  }
};

// Rutas públicas (no requieren autenticación)
router.get('/', optionalAuth, memberValidators.getMembers, MembersController.getMembers);
router.get('/search', optionalAuth, validateWithJoi(memberSchemas.searchMembers), MembersController.searchMembers);
router.get('/popular', optionalAuth, MembersController.getPopularMembers);
router.get('/stats', MembersController.getMembersStats);

// Rutas que requieren ID específico
router.get('/:id', optionalAuth, memberValidators.getMemberById, MembersController.getMemberById);

// Rutas protegidas (requieren autenticación de administrador)
router.put('/:id/stats',
  AuthenticationService.authenticateToken,
  AuthenticationService.authorizeRoles('admin'),
  validateWithJoi(memberSchemas.updateStats),
  MembersController.updateMemberStats
);

router.post('/:id/achievements',
  AuthenticationService.authenticateToken,
  AuthenticationService.authorizeRoles('admin'),
  validateWithJoi(memberSchemas.addAchievement),
  MembersController.addMemberAchievement
);

module.exports = router;