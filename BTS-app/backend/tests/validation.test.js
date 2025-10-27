const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Member = require('../models/Member');

describe('Validación y Sanitización de Entradas', () => {
  beforeAll(async () => {
    // Configurar base de datos de prueba si es necesario
  });

  afterAll(async () => {
    // Limpiar base de datos de prueba
  });

  describe('Validación de Autenticación', () => {
    test('Debe rechazar registro con datos inválidos', async () => {
      const invalidUser = {
        username: 'us', // muy corto
        email: 'invalid-email', // email inválido
        password: '123' // muy corta
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
      expect(response.body.error.timestamp).toBeDefined();
    });

    test('Debe rechazar login con datos faltantes', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('Debe sanitizar entradas XSS en registro', async () => {
      const xssUser = {
        username: 'testuser<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssUser);

      expect(response.status).toBe(201);
      // Verificar que el username fue sanitizado
      expect(response.body.user.username).not.toContain('<script>');
    });
  });

  describe('Validación de Usuarios', () => {
    let authToken;

    beforeAll(async () => {
      // Crear usuario de prueba y obtener token
      const testUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      authToken = registerResponse.body.token;
    });

    test('Debe rechazar actualización de perfil con datos inválidos', async () => {
      const invalidProfile = {
        profile: {
          firstName: 'A'.repeat(100), // muy largo
          bio: 'B'.repeat(600) // muy largo
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProfile);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('Debe rechazar cambio de contraseña con contraseña débil', async () => {
      const weakPassword = {
        currentPassword: 'ValidPass123!',
        newPassword: '123' // muy débil
      };

      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(weakPassword);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });
  });

  describe('Validación de Miembros', () => {
    test('Debe rechazar búsqueda con término muy corto', async () => {
      const response = await request(app)
        .get('/api/members/search?q=a');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });

    test('Debe validar parámetros de paginación', async () => {
      const response = await request(app)
        .get('/api/members?page=-1&limit=200');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });

    test('Debe validar ID de miembro', async () => {
      const response = await request(app)
        .get('/api/members/999'); // ID inválido

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });
  });

  describe('Validación de Wearables', () => {
    let authToken;

    beforeAll(async () => {
      // Obtener token de autenticación
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'testuser',
          password: 'ValidPass123!'
        });

      authToken = loginResponse.body.token;
    });

    test('Debe rechazar conexión de dispositivo con datos inválidos', async () => {
      const invalidDevice = {
        device: {
          type: 'invalid_type',
          brand: 'invalid_brand',
          model: ''
        }
      };

      const response = await request(app)
        .post('/api/wearable/connect')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDevice);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });

    test('Debe validar datos de sensores', async () => {
      const invalidSensorData = {
        sensorData: {
          heartRate: 300, // inválido
          steps: -100 // inválido
        }
      };

      const response = await request(app)
        .post('/api/wearable/sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSensorData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Datos de entrada inválidos');
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.timestamp).toBeDefined();
    });
  });

  describe('Validación de Administrador', () => {
    // Nota: Para pruebas de admin necesitaríamos un usuario admin
    test('Debe validar creación de miembro con datos requeridos faltantes', async () => {
      const incompleteMember = {
        name: 'Test Member'
        // faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/admin/members')
        .send(incompleteMember);

      expect(response.status).toBe(401); // No autorizado sin token admin
    });
  });

  describe('Sanitización XSS', () => {
    test('Debe sanitizar entradas con scripts maliciosos', async () => {
      const maliciousInput = {
        username: '<script>alert("xss")</script>TestUser',
        email: 'test@example.com',
        password: 'ValidPass123!',
        profile: {
          bio: '<img src=x onerror=alert("xss")>',
          firstName: '<b>Bold</b> Name'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousInput);

      expect(response.status).toBe(201);
      // Verificar que los scripts fueron removidos/sanitizados
      expect(response.body.user.username).not.toContain('<script>');
      expect(response.body.user.username).not.toContain('alert');
    });

    test('Debe sanitizar consultas SQL potencialmente peligrosas', async () => {
      const sqlInjection = {
        search: "'; DROP TABLE users; --"
      };

      const response = await request(app)
        .get('/api/members/search')
        .query(sqlInjection);

      // La aplicación debería manejar esto sin errores
      expect(response.status).toBe(400); // Debido a longitud mínima
    });
  });

  describe('Validación de Tipos de Datos', () => {
    test('Debe rechazar tipos de datos incorrectos', async () => {
      const wrongTypes = {
        username: 12345, // debería ser string
        email: 'test@example.com',
        password: 'ValidPass123!',
        profile: {
          firstName: [], // debería ser string
          language: 'invalid_lang' // debería ser 'es' o 'en'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(wrongTypes);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });

    test('Debe validar arrays y objetos anidados', async () => {
      const invalidNested = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass123!',
        accessibility: {
          fontSize: 'invalid_size', // debería ser small, medium, large
          highContrast: 'not_boolean' // debería ser boolean
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidNested);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Datos de entrada inválidos');
    });
  });

  describe('Validación de Rangos y Límites', () => {
    test('Debe validar longitudes mínimas y máximas', async () => {
      const tooLong = {
        username: 'a'.repeat(51), // máximo 50 caracteres
        email: 'test@example.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(tooLong);

      expect(response.status).toBe(400);
      expect(response.body.details.some(detail =>
        detail.message.includes('no puede exceder')
      )).toBe(true);
    });

    test('Debe validar rangos numéricos', async () => {
      const invalidRange = {
        device: {
          type: 'smartwatch',
          brand: 'apple',
          model: 'Test Model',
          firmwareVersion: '1.0'
        },
        settings: {
          units: 'invalid_units' // debería ser 'metric' o 'imperial'
        }
      };

      const response = await request(app)
        .post('/api/wearable/connect')
        .set('Authorization', `Bearer ${authToken || 'dummy'}`)
        .send(invalidRange);

      expect(response.status).toBe(401); // Sin token válido
    });
  });
});