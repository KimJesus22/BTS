const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/UsersController');

// Rutas públicas de autenticación
router.post('/register', UsersController.register);
router.post('/login', UsersController.login);

// Ruta protegida para solicitar reset de contraseña
router.post('/forgot-password', async (req, res) => {
  // Implementación básica - en producción usar email service
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  try {
    const result = await require('../services/AuthenticationService').requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para resetear contraseña con token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token y nueva contraseña requeridos' });
  }

  try {
    const result = await require('../services/AuthenticationService').resetPassword(token, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;