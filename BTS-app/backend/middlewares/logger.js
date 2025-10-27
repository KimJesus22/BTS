const morgan = require('morgan');

// Configuración personalizada de Morgan para logging estructurado
const loggerMiddleware = morgan((tokens, req, res) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: tokens['response-time'](req, res),
    userAgent: tokens['user-agent'](req, res),
    ip: tokens['remote-addr'](req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    userId: req.userId || 'anonymous'
  };

  // Log diferente según el nivel
  const status = parseInt(tokens.status(req, res));
  if (status >= 500) {
    console.error('[ERROR]', JSON.stringify(logData));
  } else if (status >= 400) {
    console.warn('[WARN]', JSON.stringify(logData));
  } else if (status >= 300) {
    console.info('[INFO]', JSON.stringify(logData));
  } else {
    console.log('[INFO]', JSON.stringify(logData));
  }

  return null; // No devolver nada para evitar doble logging
}, {
  skip: (req, res) => {
    // Skip logging para rutas de health check o assets estáticos
    return req.url === '/health' || req.url.startsWith('/static/');
  }
});

// Middleware personalizado para logging de errores detallado
const errorLogger = (error, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.userId || 'anonymous',
      ip: req.ip
    }
  };

  console.error('[ERROR]', JSON.stringify(errorLog, null, 2));
  next(error);
};

// Middleware para logging de actividades importantes
const activityLogger = (activity, details = {}) => {
  return (req, res, next) => {
    const activityLog = {
      timestamp: new Date().toISOString(),
      activity,
      userId: req.userId || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details: {
        method: req.method,
        url: req.url,
        ...details
      }
    };

    console.log(`[ACTIVITY: ${activity.toUpperCase()}]`, JSON.stringify(activityLog));
    next();
  };
};

// Middleware para logging de rendimiento
const performanceLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convertir a milisegundos

    const perfLog = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      duration: `${duration.toFixed(2)}ms`,
      status: res.statusCode,
      userId: req.userId || 'anonymous'
    };

    // Log de rendimiento lento
    if (duration > 1000) { // Más de 1 segundo
      console.warn('[PERF SLOW]', JSON.stringify(perfLog));
    } else if (duration > 5000) { // Más de 5 segundos
      console.error('[PERF CRITICAL]', JSON.stringify(perfLog));
    }
  });

  next();
};

module.exports = {
  loggerMiddleware,
  errorLogger,
  activityLogger,
  performanceLogger
};