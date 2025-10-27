const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');
const AuthenticationService = require('../services/AuthenticationService');
const { validateWithJoi, userSchemas, userValidators } = require('../middlewares/validation');

// Todas las rutas de usuarios requieren autenticación
router.use(AuthenticationService.authenticateToken);

// Rutas de perfil de usuario
router.get('/profile', UsersController.getProfile);
router.put('/profile', validateWithJoi(userSchemas.updateProfile), UsersController.updateProfile);
router.delete('/profile', UsersController.deleteAccount);

// Gestión de contraseña
router.put('/password', validateWithJoi(userSchemas.changePassword), UsersController.changePassword);

// Configuración de accesibilidad
router.get('/accessibility', UsersController.getAccessibilityConfig);
router.put('/accessibility', validateWithJoi(userSchemas.updateAccessibility), UsersController.updateAccessibilityConfig);
router.post('/accessibility/reset', UsersController.resetAccessibilityConfig);

// Datos de gamificación
router.get('/gamification', UsersController.getGamificationData);
router.get('/leaderboard', UsersController.getLeaderboard);

// Optimizaciones personalizadas
router.get('/optimizations', UsersController.getOptimizations);

// Estadísticas del usuario
router.get('/stats', UsersController.getUserStats);

module.exports = router;