const express = require('express');
const router = express.Router();
const WearableController = require('../controllers/WearableController');
const AuthenticationService = require('../services/AuthenticationService');

// Todas las rutas requieren autenticación
router.use(AuthenticationService.authenticateToken);

// Gestión del dispositivo wearable
router.post('/connect', WearableController.connectDevice);
router.post('/disconnect', WearableController.disconnectDevice);
router.get('/status', WearableController.getDeviceStatus);

// Sincronización de datos
router.post('/sync', WearableController.syncDeviceData);
router.put('/settings', WearableController.updateDeviceSettings);
router.post('/reset-daily', WearableController.resetDailyCounters);

// Historial y datos
router.get('/history', WearableController.getDataHistory);
router.get('/achievements', WearableController.getWearableAchievements);

// Rutas de administrador para estadísticas
router.get('/admin/stats',
  AuthenticationService.authorizeRoles('admin'),
  WearableController.getWearableStats
);

router.get('/admin/devices',
  AuthenticationService.authorizeRoles('admin'),
  WearableController.getConnectedDevices
);

module.exports = router;