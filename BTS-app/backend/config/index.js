require('dotenv').config();

const config = {
  // Configuración del servidor
  server: {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  },

  // Configuración de base de datos
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bts-app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d'
  },

  // Configuración de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    morganFormat: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
  },

  // Configuración de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: {
      general: 100,
      auth: 5,
      api: 1000
    }
  },

  // Configuración de gamificación
  gamification: {
    levelThresholds: (() => {
      const thresholds = {};
      for (let level = 1; level <= 100; level++) {
        thresholds[level] = Math.floor(1000 * Math.pow(1.2, level - 1));
      }
      return thresholds;
    })(),
    achievementPoints: {
      firstLogin: 100,
      profileComplete: 200,
      memberFan: 250,
      btsExpert: 300,
      socialSharer: 150,
      accessibilityAdvocate: 200,
      wearableConnected: 150
    }
  },

  // Configuración de optimizaciones
  optimizations: {
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    compressionLevel: 6,
    queryTimeout: 5000 // 5 segundos
  },

  // Configuración de seguridad
  security: {
    bcryptRounds: 12,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    maxLoginAttempts: 5,
    lockoutDuration: 2 * 60 * 60 * 1000 // 2 horas
  },

  // Configuración de wearable
  wearable: {
    syncInterval: 15 * 60 * 1000, // 15 minutos
    dataRetentionDays: 365,
    batteryWarningThreshold: 20,
    maxReadingsPerSync: 100
  },

  // Configuración de accesibilidad
  accessibility: {
    supportedLanguages: ['es', 'en'],
    fontSizeOptions: ['small', 'medium', 'large', 'extra-large'],
    colorSchemes: ['default', 'high-contrast', 'dark', 'light', 'colorblind-friendly']
  },


  // Validar configuración
  validate() {
    const required = ['JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
    }

    // Validar formato de JWT_SECRET
    if (this.jwt.secret.length < 32) {
      console.warn('Advertencia: JWT_SECRET debería tener al menos 32 caracteres');
    }

    return true;
  }
};

// Validar configuración al cargar
config.validate();

module.exports = config;