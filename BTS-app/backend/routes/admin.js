const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AuthenticationService = require('../services/AuthenticationService');

// Todas las rutas requieren rol de administrador
router.use(AuthenticationService.authenticateToken);
router.use(AuthenticationService.authorizeRoles('admin'));

// Gestión de miembros
router.post('/members', AdminController.createMember);
router.put('/members/:id', AdminController.updateMember);
router.delete('/members/:id', AdminController.deleteMember);

// Gestión de usuarios
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id/role', AdminController.updateUserRole);
router.put('/users/:id/suspend', AdminController.suspendUser);
router.put('/users/:id/reactivate', AdminController.reactivateUser);
router.get('/users/:id/export', AdminController.exportUserData);

// Gestión de gamificación
router.post('/users/:id/reset-gamification', AdminController.resetUserGamification);

// Estadísticas y monitoreo
router.get('/stats', AdminController.getSystemStats);
router.get('/optimizations', AdminController.getSystemOptimizations);
router.get('/logs', AdminController.getActivityLogs);

module.exports = router;