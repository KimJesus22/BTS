const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/AdminController');
const AuthenticationService = require('../services/AuthenticationService');
const { validateWithJoi, adminSchemas, adminValidators } = require('../middlewares/validation');

// Todas las rutas requieren rol de administrador
router.use(AuthenticationService.authenticateToken);
router.use(AuthenticationService.authorizeRoles('admin'));

// Gestión de miembros
router.post('/members', validateWithJoi(adminSchemas.createMember), AdminController.createMember);
router.put('/members/:id', AdminController.updateMember);
router.delete('/members/:id', AdminController.deleteMember);

// Gestión de usuarios
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id/role', validateWithJoi(adminSchemas.updateUserRole), AdminController.updateUserRole);
router.put('/users/:id/suspend', validateWithJoi(adminSchemas.suspendUser), AdminController.suspendUser);
router.put('/users/:id/reactivate', AdminController.reactivateUser);
router.get('/users/:id/export', AdminController.exportUserData);

// Gestión de gamificación
router.post('/users/:id/reset-gamification', AdminController.resetUserGamification);

// Estadísticas y monitoreo
router.get('/stats', AdminController.getSystemStats);
router.get('/optimizations', AdminController.getSystemOptimizations);
router.get('/logs', AdminController.getActivityLogs);

module.exports = router;