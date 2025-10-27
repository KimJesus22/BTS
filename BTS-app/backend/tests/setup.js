// Configuración global para tests
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || 5432;
process.env.DB_NAME = process.env.DB_NAME || 'bts_test';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'admin123';
process.env.DB_DIALECT = 'postgres';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

// Aumentar timeout por defecto de Jest
jest.setTimeout(10000);

// Configurar console para tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suprimir errores de deprecación de PostgreSQL y Sequelize en tests
  if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('deprecat') || args[0].includes('warning') ||
       args[0].includes('Sequelize'))) {
    return;
  }
  originalConsoleError(...args);
};

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar variables globales para tests
global.testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

global.testMember = {
  id: 1,
  name: 'RM',
  real_name: 'Kim Nam-joon',
  role: 'Leader, Rapper',
  biography: {
    es: 'Biografía de RM',
    en: 'RM biography'
  }
};