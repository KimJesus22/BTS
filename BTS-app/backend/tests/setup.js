// Configuración global para tests
require('dotenv').config({ path: '.env.test' });

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bts-test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

// Aumentar timeout por defecto de Jest
jest.setTimeout(10000);

// Configurar console para tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Suprimir errores de deprecación de MongoDB en tests
  if (args[0] && typeof args[0] === 'string' &&
      (args[0].includes('deprecat') || args[0].includes('warning'))) {
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