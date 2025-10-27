const express = require('express');
const router = express.Router();
const WearableController = require('../controllers/WearableController');
const AuthenticationService = require('../services/AuthenticationService');
const { validateWithJoi, wearableSchemas, wearableValidators } = require('../middlewares/validation');

// Todas las rutas requieren autenticación
router.use(AuthenticationService.authenticateToken);

// Gestión del dispositivo wearable
router.post('/connect', validateWithJoi(wearableSchemas.connectDevice), WearableController.connectDevice);
router.post('/disconnect', WearableController.disconnectDevice);
router.get('/status', WearableController.getDeviceStatus);

// Sincronización de datos
router.post('/sync', validateWithJoi(wearableSchemas.syncData), WearableController.syncDeviceData);
router.put('/settings', validateWithJoi(wearableSchemas.updateSettings), WearableController.updateDeviceSettings);
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