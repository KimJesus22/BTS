require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const config = require('./config/index');

// Importar middlewares
const {
  loggerMiddleware,
  errorLogger,
  performanceLogger
} = require('./middlewares/logger');

const {
  securityHeaders,
  cors,
  generalLimiter,
  authLimiter,
  apiLimiter,
  sanitizeInput,
  validateApiHeaders,
  bruteForceProtection,
  securityLogger
} = require('./middlewares/security');

const {
  compressionMiddleware,
  jsonOptimization,
  cacheControl,
  queryOptimization,
  clientOptimization,
  batteryOptimization
} = require('./middlewares/optimization');

// Importar rutas
const authRoutes = require('./routes/auth');
const membersRoutes = require('./routes/members');
const usersRoutes = require('./routes/users');
const wearableRoutes = require('./routes/wearable');
const adminRoutes = require('./routes/admin');

// Conectar a la base de datos
connectDB();

// Crear aplicación Express
const app = express();

// Middlewares globales de seguridad y optimización
app.use(securityHeaders);
app.use(cors);
app.use(compressionMiddleware);
app.use(jsonOptimization);
app.use(clientOptimization);
app.use(batteryOptimization);

// Middlewares de logging y monitoreo
app.use(loggerMiddleware);
app.use(performanceLogger);
app.use(securityLogger);

// Middlewares de validación y sanitización
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(sanitizeInput);
app.use(validateApiHeaders);
app.use(bruteForceProtection);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use(generalLimiter);

// Middleware de optimización de queries
app.use(queryOptimization);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/wearable', wearableRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de health check
app.get('/health', cacheControl(60), (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: '1.0.0'
  });
});

// Ruta de información de la API
app.get('/api', cacheControl(300), (req, res) => {
  res.json({
    name: 'BTS-app Backend API',
    version: '1.0.0',
    description: 'API RESTful para la aplicación BTS con arquitectura MVC',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members',
      users: '/api/users',
      wearable: '/api/wearable',
      admin: '/api/admin'
    },
    documentation: '/api/docs'
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  errorLogger(err, req, res, next);

  // No enviar detalles del error en producción
  const isDevelopment = config.server.nodeEnv === 'development';

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Manejo de señales para graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

// Iniciar servidor
const server = app.listen(config.server.port, () => {
  console.log(`🚀 Servidor BTS-app backend corriendo en el puerto ${config.server.port}`);
  console.log(`📝 Ambiente: ${config.server.nodeEnv}`);
  console.log(`🔗 CORS Origin: ${config.server.corsOrigin}`);
  console.log(`📊 Health check: http://localhost:${config.server.port}/health`);
  console.log(`📚 API Info: http://localhost:${config.server.port}/api`);
});

// Exportar app para testing
module.exports = app;