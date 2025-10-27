const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');
const { validateWithJoi, authSchemas, authValidators } = require('../middlewares/validation');

// Rutas públicas de autenticación
router.post('/register', validateWithJoi(authSchemas.register), UsersController.register);
router.post('/login', validateWithJoi(authSchemas.login), UsersController.login);

// Ruta protegida para solicitar reset de contraseña
router.post('/forgot-password', validateWithJoi(authSchemas.forgotPassword), async (req, res) => {
  // Implementación básica - en producción usar email service
  try {
    const result = await require('../services/AuthenticationService').requestPasswordReset(req.body.email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para resetear contraseña con token
router.post('/reset-password', validateWithJoi(authSchemas.resetPassword), async (req, res) => {
  try {
    const result = await require('../services/AuthenticationService').resetPassword(req.body.token, req.body.newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;