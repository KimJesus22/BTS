const { sequelize } = require('../config/database');
const User = require('../models/User');
const AuthenticationService = require('../services/AuthenticationService');

// Mock del logger
jest.mock('../middlewares/logger', () => ({
  authLogger: jest.fn()
}));

const { authLogger } = require('../middlewares/logger');

describe('AuthenticationService', () => {
  let testUser;

  beforeAll(async () => {
    // Crear tablas para tests
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar datos
    await User.destroy({ where: {} });

    // Crear usuario de prueba
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Limpiar mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario exitosamente', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword123'
      };

      const result = await AuthenticationService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.username).toBe('newuser');
      expect(result.user.email).toBe('new@example.com');

      // Verificar logging
      expect(authLogger).toHaveBeenCalledWith('User Registered', expect.any(String), {
        username: 'newuser',
        email: 'new@example.com',
        role: 'user'
      });
    });

    it('debería rechazar registro de usuario existente', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(AuthenticationService.register(userData))
        .rejects
        .toThrow('El usuario ya existe');
    });

    it('debería validar datos de registro incompletos', async () => {
      const invalidData = {
        username: 'test'
        // Falta email y password
      };

      await expect(AuthenticationService.register(invalidData))
        .rejects
        .toThrow();
    });
  });

  describe('login', () => {
    it('debería iniciar sesión exitosamente', async () => {
      const credentials = {
        identifier: 'test@example.com',
        password: 'password123'
      };

      const result = await AuthenticationService.login(credentials);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');

      // Verificar logging
      expect(authLogger).toHaveBeenCalledWith('Login Successful', expect.any(String), {
        username: 'testuser',
        role: 'user'
      });
    });

    it('debería rechazar credenciales inválidas', async () => {
      const credentials = {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(AuthenticationService.login(credentials))
        .rejects
        .toThrow('Credenciales inválidas');

      // Verificar logging de intento fallido
      expect(authLogger).toHaveBeenCalledWith('Login Failed - Invalid Password', expect.any(String), {
        username: 'testuser',
        attempts: 1
      });
    });

    it('debería rechazar usuario inexistente', async () => {
      const credentials = {
        identifier: 'nonexistent@example.com',
        password: 'password123'
      };

      await expect(AuthenticationService.login(credentials))
        .rejects
        .toThrow('Credenciales inválidas');
    });

    it('debería manejar bloqueo de cuenta por múltiples intentos fallidos', async () => {
      const credentials = {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      };

      // Simular múltiples intentos fallidos
      for (let i = 0; i < 5; i++) {
        try {
          await AuthenticationService.login(credentials);
        } catch (error) {
          // Ignorar errores esperados
        }
      }

      // El sexto intento debería estar bloqueado
      await expect(AuthenticationService.login(credentials))
        .rejects
        .toThrow('Cuenta bloqueada temporalmente');
    });

    it('debería permitir login con username', async () => {
      const credentials = {
        identifier: 'testuser',
        password: 'password123'
      };

      const result = await AuthenticationService.login(credentials);

      expect(result.user.username).toBe('testuser');
      expect(authLogger).toHaveBeenCalledWith('Login Successful', expect.any(String), {
        username: 'testuser',
        role: 'user'
      });
    });
  });

  describe('changePassword', () => {
    it('debería cambiar contraseña exitosamente', async () => {
      const result = await AuthenticationService.changePassword(
        testUser.id,
        'password123',
        'newpassword456'
      );

      expect(result.message).toBe('Contraseña cambiada exitosamente');

      // Verificar que la nueva contraseña funcione
      const loginResult = await AuthenticationService.login({
        identifier: 'test@example.com',
        password: 'newpassword456'
      });

      expect(loginResult.user.email).toBe('test@example.com');
    });

    it('debería rechazar contraseña actual incorrecta', async () => {
      await expect(AuthenticationService.changePassword(
        testUser.id,
        'wrongpassword',
        'newpassword456'
      )).rejects.toThrow('Contraseña actual incorrecta');
    });

    it('debería rechazar cambio para usuario inexistente', async () => {
      await expect(AuthenticationService.changePassword(
        'nonexistent-id',
        'password123',
        'newpassword456'
      )).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('JWT Token Methods', () => {
    it('debería generar token JWT válido', () => {
      const token = AuthenticationService.generateToken('user123');

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
    });

    it('debería verificar token JWT válido', () => {
      const token = AuthenticationService.generateToken('user123');
      const decoded = AuthenticationService.verifyToken(token);

      expect(decoded.userId).toBe('user123');
    });

    it('debería rechazar token JWT inválido', () => {
      expect(() => {
        AuthenticationService.verifyToken('invalid-token');
      }).toThrow('Token inválido');
    });

    it('debería rechazar token JWT expirado', () => {
      // Crear token con expiración inmediata (esto requiere manipular el tiempo)
      const originalExpire = AuthenticationService.jwtExpire;
      AuthenticationService.jwtExpire = '0s';

      const token = AuthenticationService.generateToken('user123');

      // Restaurar configuración
      AuthenticationService.jwtExpire = originalExpire;

      // El token debería expirar inmediatamente
      expect(() => {
        AuthenticationService.verifyToken(token);
      }).toThrow('Token inválido');
    });
  });

  describe('getUserByToken', () => {
    it('debería obtener usuario por token válido', async () => {
      const token = AuthenticationService.generateToken(testUser.id);
      const user = await AuthenticationService.getUserByToken(token);

      expect(user.id).toBe(testUser.id);
      expect(user.email).toBe(testUser.email);
    });

    it('debería rechazar token con usuario inexistente', async () => {
      const token = AuthenticationService.generateToken('nonexistent-id');

      await expect(AuthenticationService.getUserByToken(token))
        .rejects
        .toThrow('Usuario no encontrado');
    });
  });

  describe('Password Reset', () => {
    it('debería solicitar reset de contraseña para usuario existente', async () => {
      const result = await AuthenticationService.requestPasswordReset('test@example.com');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('resetToken');
      expect(typeof result.resetToken).toBe('string');
    });

    it('debería manejar solicitud de reset para usuario inexistente', async () => {
      const result = await AuthenticationService.requestPasswordReset('nonexistent@example.com');

      expect(result.message).toBe('Si el email existe, se enviará un enlace de reset');
      expect(result).not.toHaveProperty('resetToken');
    });

    it('debería resetear contraseña con token válido', async () => {
      const resetToken = AuthenticationService.generateToken({
        userId: testUser.id,
        type: 'password_reset'
      });

      const result = await AuthenticationService.resetPassword(resetToken, 'newpassword789');

      expect(result.message).toBe('Contraseña reseteada exitosamente');

      // Verificar que la nueva contraseña funcione
      const loginResult = await AuthenticationService.login({
        identifier: 'test@example.com',
        password: 'newpassword789'
      });

      expect(loginResult.user.email).toBe('test@example.com');
    });

    it('debería rechazar token de reset inválido', async () => {
      await expect(AuthenticationService.resetPassword('invalid-token', 'newpassword'))
        .rejects
        .toThrow('Token inválido');
    });
  });

  describe('Role-based Authorization', () => {
    let adminUser;

    beforeEach(async () => {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
    });

    it('debería permitir acceso de administrador', async () => {
      const user = await AuthenticationService.requireAdmin(adminUser.id);

      expect(user.role).toBe('admin');
      expect(user.username).toBe('admin');
    });

    it('debería rechazar acceso de administrador para usuario regular', async () => {
      await expect(AuthenticationService.requireAdmin(testUser.id))
        .rejects
        .toThrow('Acceso denegado: se requieren permisos de administrador');
    });

    it('debería permitir acceso de moderador para administrador', async () => {
      const user = await AuthenticationService.requireModerator(adminUser.id);

      expect(user.role).toBe('admin');
    });

    it('debería rechazar acceso para usuario sin permisos', async () => {
      await expect(AuthenticationService.requireModerator(testUser.id))
        .rejects
        .toThrow('Acceso denegado: se requieren permisos de moderador');
    });
  });
});