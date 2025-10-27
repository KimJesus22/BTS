const AuthenticationService = require('../services/AuthenticationService');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('AuthenticationService', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bts-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('register', () => {
    it('debería registrar un usuario exitosamente', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const result = await AuthenticationService.register(userData);

      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBeDefined();
      expect(result.user.password).toBeUndefined(); // No debería incluir password
    });

    it('debería rechazar registro con email duplicado', async () => {
      await User.create({
        username: 'existing',
        email: 'test@example.com',
        password: 'password123'
      });

      const userData = {
        username: 'newuser',
        email: 'test@example.com',
        password: 'password123'
      };

      await expect(AuthenticationService.register(userData))
        .rejects
        .toThrow('El usuario ya existe');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await AuthenticationService.hashPassword('password123')
      });
    });

    it('debería iniciar sesión exitosamente', async () => {
      const credentials = {
        identifier: 'test@example.com',
        password: 'password123'
      };

      const result = await AuthenticationService.login(credentials);

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBeDefined();
    });

    it('debería rechazar credenciales inválidas', async () => {
      const credentials = {
        identifier: 'test@example.com',
        password: 'wrongpassword'
      };

      await expect(AuthenticationService.login(credentials))
        .rejects
        .toThrow('Credenciales inválidas');
    });
  });

  describe('generateToken y verifyToken', () => {
    it('debería generar y verificar token correctamente', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = AuthenticationService.generateToken(userId);
      const decoded = AuthenticationService.verifyToken(token);

      expect(decoded.userId).toBe(userId);
    });

    it('debería rechazar token inválido', () => {
      expect(() => {
        AuthenticationService.verifyToken('invalid-token');
      }).toThrow('Token inválido');
    });
  });

  describe('hashPassword y comparePassword', () => {
    it('debería hashear y comparar contraseña correctamente', async () => {
      const password = 'testpassword123';
      const hashed = await AuthenticationService.hashPassword(password);
      const isValid = await AuthenticationService.comparePassword(password, hashed);

      expect(isValid).toBe(true);
    });

    it('debería rechazar comparación con contraseña incorrecta', async () => {
      const password = 'testpassword123';
      const hashed = await AuthenticationService.hashPassword(password);
      const isValid = await AuthenticationService.comparePassword('wrongpassword', hashed);

      expect(isValid).toBe(false);
    });
  });

  describe('changePassword', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await AuthenticationService.hashPassword('oldpassword')
      });
    });

    it('debería cambiar contraseña exitosamente', async () => {
      const result = await AuthenticationService.changePassword(
        user._id,
        'oldpassword',
        'newpassword123'
      );

      expect(result.message).toBe('Contraseña cambiada exitosamente');

      // Verificar que la nueva contraseña funcione
      const updatedUser = await User.findById(user._id);
      const isValid = await AuthenticationService.comparePassword('newpassword123', updatedUser.password);
      expect(isValid).toBe(true);
    });

    it('debería rechazar contraseña actual incorrecta', async () => {
      await expect(AuthenticationService.changePassword(
        user._id,
        'wrongpassword',
        'newpassword123'
      )).rejects.toThrow('Contraseña actual incorrecta');
    });
  });

  describe('requireAdmin y requireModerator', () => {
    let adminUser, moderatorUser, regularUser;

    beforeEach(async () => {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password',
        role: 'admin'
      });

      moderatorUser = await User.create({
        username: 'moderator',
        email: 'mod@example.com',
        password: 'password',
        role: 'moderator'
      });

      regularUser = await User.create({
        username: 'user',
        email: 'user@example.com',
        password: 'password',
        role: 'user'
      });
    });

    it('requireAdmin debería aceptar usuario admin', async () => {
      const result = await AuthenticationService.requireAdmin(adminUser._id);
      expect(result.username).toBe('admin');
    });

    it('requireAdmin debería rechazar usuario no admin', async () => {
      await expect(AuthenticationService.requireAdmin(regularUser._id))
        .rejects
        .toThrow('Acceso denegado: se requieren permisos de administrador');
    });

    it('requireModerator debería aceptar admin y moderator', async () => {
      let result = await AuthenticationService.requireModerator(adminUser._id);
      expect(result.username).toBe('admin');

      result = await AuthenticationService.requireModerator(moderatorUser._id);
      expect(result.username).toBe('moderator');
    });

    it('requireModerator debería rechazar usuario regular', async () => {
      await expect(AuthenticationService.requireModerator(regularUser._id))
        .rejects
        .toThrow('Acceso denegado: se requieren permisos de moderador');
    });
  });
});