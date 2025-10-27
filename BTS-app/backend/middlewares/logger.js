const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const morgan = require('morgan');
require('winston-daily-rotate-file');

// Configuración de Winston para logging avanzado
const logLevel = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'logs';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level: level.toUpperCase(),
      message,
      ...meta
    });
  })
);

// Transportes de Winston
const transports = [
  // Log a consola en desarrollo
  new winston.transports.Console({
    level: logLevel,
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
      })
    )
  }),

  // Log de errores a archivo rotativo
  new DailyRotateFile({
    filename: `${logDir}/error-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: customFormat,
    maxSize: '20m',
    maxFiles: '14d'
  }),

  // Log general a archivo rotativo
  new DailyRotateFile({
    filename: `${logDir}/combined-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    format: customFormat,
    maxSize: '20m',
    maxFiles: '14d'
  }),

  // Log de seguridad separado
  new DailyRotateFile({
    filename: `${logDir}/security-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    format: customFormat,
    maxSize: '20m',
    maxFiles: '14d'
  })
];

// Crear logger de Winston
const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: `${logDir}/exceptions-%DATE%.log`,
      datePattern: 'YYYY-MM-DD'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: `${logDir}/rejections-%DATE%.log`,
      datePattern: 'YYYY-MM-DD'
    })
  ]
});

// Stream para Morgan
const morganStream = {
  write: (message) => {
    logger.info('HTTP Request', { message: message.trim() });
  }
};

// Configuración de Morgan para logging HTTP
const loggerMiddleware = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
  {
    stream: morganStream,
    skip: (req, res) => {
      // Skip logging para rutas de health check en producción y tests
      return (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') && req.url === '/health';
    }
  }
);

// Middleware personalizado para logging de errores detallado
const errorLogger = (error, req, res, next) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    statusCode: error.statusCode,
    request: {
      method: req.method,
      url: req.url,
      userId: req.userId || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }
  };

  // Log con Winston según severidad
  if (error.statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (error.statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  } else {
    logger.info('Application Error', errorLog);
  }

  next(error);
};

// Middleware para logging de actividades importantes
const activityLogger = (activity, details = {}) => {
  return (req, res, next) => {
    const activityLog = {
      activity,
      userId: req.userId || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.url,
      ...details
    };

    logger.info(`Activity: ${activity}`, activityLog);
    next();
  };
};

// Función para logging de autenticación
const authLogger = (action, userId, details = {}) => {
  logger.info(`Auth: ${action}`, {
    userId,
    action,
    ...details
  });
};

// Función para logging de seguridad
const securityLogger = (event, details = {}) => {
  logger.warn(`Security: ${event}`, {
    event,
    ...details
  });
};

// Middleware para logging de rendimiento
const performanceLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir a milisegundos

    const perfLog = {
      method: req.method,
      url: req.url,
      duration: parseFloat(duration.toFixed(2)),
      status: res.statusCode,
      userId: req.userId || 'anonymous',
      ip: req.ip
    };

    // Log de rendimiento según severidad
    if (duration > 5000) { // Más de 5 segundos
      logger.error('Performance Critical', perfLog);
    } else if (duration > 1000) { // Más de 1 segundo
      logger.warn('Performance Slow', perfLog);
    } else if (duration > 100) { // Más de 100ms
      logger.info('Performance Normal', perfLog);
    }
  });

  next();
};

module.exports = {
  logger,
  loggerMiddleware,
  errorLogger,
  activityLogger,
  performanceLogger,
  authLogger,
  securityLogger
};