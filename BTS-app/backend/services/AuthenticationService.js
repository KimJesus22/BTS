const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

class AuthenticationService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpire = process.env.JWT_EXPIRE || '7d';
  }

  // Generar token JWT
  generateToken(userId) {
    return jwt.sign({ userId }, this.jwtSecret, {
      expiresIn: this.jwtExpire
    });
  }

  // Verificar token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Hash de contraseña
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  // Verificar contraseña
  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // Registrar nuevo usuario
  async register(userData) {
    try {
      const { username, email, password, ...otherData } = userData;

      // Verificar si el usuario ya existe
      const existingUser = await User.findByEmailOrUsername(email);
      if (existingUser) {
        throw new Error('El usuario ya existe');
      }

      // Crear nuevo usuario
      const user = new User({
        username,
        email,
        password,
        ...otherData
      });

      await user.save();

      // Generar token
      const token = this.generateToken(user._id);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Iniciar sesión
  async login(credentials) {
    try {
      const { identifier, password } = credentials;

      // Buscar usuario
      const user = await User.findByEmailOrUsername(identifier);
      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      // Verificar si la cuenta está bloqueada
      if (user.isLocked) {
        throw new Error('Cuenta bloqueada temporalmente');
      }

      // Verificar contraseña
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        await user.incLoginAttempts();
        throw new Error('Credenciales inválidas');
      }

      // Resetear intentos de login y actualizar último login
      await user.resetLoginAttempts();
      user.lastLogin = new Date();
      await user.save();

      // Generar token
      const token = this.generateToken(user._id);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          profile: user.profile,
          gamification: user.gamification
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario por token
  async getUserByToken(token) {
    try {
      const decoded = this.verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Actualizar contraseña (el middleware pre-save la hasheará)
      user.password = newPassword;
      await user.save();

      return { message: 'Contraseña cambiada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Solicitar reset de contraseña
  async requestPasswordReset(email) {
    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // No revelar si el email existe o no por seguridad
        return { message: 'Si el email existe, se enviará un enlace de reset' };
      }

      // Generar token de reset (válido por 1 hora)
      const resetToken = jwt.sign(
        { userId: user._id, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // Aquí se enviaría el email con el token
      // Por ahora solo retornamos el token para desarrollo
      console.log(`Reset token para ${email}: ${resetToken}`);

      return {
        message: 'Se ha enviado un enlace de reset a tu email',
        resetToken // Solo para desarrollo
      };
    } catch (error) {
      throw error;
    }
  }

  // Resetear contraseña con token
  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      if (decoded.type !== 'password_reset') {
        throw new Error('Token inválido');
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      user.password = newPassword;
      await user.save();

      return { message: 'Contraseña reseteada exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  // Verificar permisos de administrador
  async requireAdmin(userId) {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      throw new Error('Acceso denegado: se requieren permisos de administrador');
    }
    return user;
  }

  // Verificar permisos de moderador o superior
  async requireModerator(userId) {
    const user = await User.findById(userId);
    if (!user || !['moderator', 'admin'].includes(user.role)) {
      throw new Error('Acceso denegado: se requieren permisos de moderador');
    }
    return user;
  }

  // Middleware para verificar autenticación
  authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
      }

      const decoded = this.verifyToken(token);
      req.userId = decoded.userId;
      next();
    } catch (error) {
      return res.status(403).json({ error: 'Token inválido' });
    }
  }

  // Middleware para verificar roles
  authorizeRoles(...roles) {
    return async (req, res, next) => {
      try {
        const user = await User.findById(req.userId);
        if (!user || !roles.includes(user.role)) {
          return res.status(403).json({ error: 'Acceso denegado' });
        }
        req.user = user;
        next();
      } catch (error) {
        return res.status(500).json({ error: 'Error de autorización' });
      }
    };
  }
}

module.exports = new AuthenticationService();