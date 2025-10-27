const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Configuración de Helmet para headers de seguridad
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Configuración de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CORS_ORIGIN
    ].filter(Boolean);

    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: {
    error: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting para autenticación (más restrictivo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // límite de 5 intentos de login/registro por ventana
  message: {
    error: 'Demasiados intentos de autenticación. Intenta más tarde.'
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de autenticación',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Rate limiting para API (menos restrictivo para usuarios autenticados)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // límite de 1000 requests por ventana para usuarios autenticados
  message: {
    error: 'Demasiadas solicitudes a la API'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para sanitizar inputs
const sanitizeInput = (req, res, next) => {
  // Función recursiva para sanitizar objetos
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remover caracteres potencialmente peligrosos
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// Middleware para validar headers de API
const validateApiHeaders = (req, res, next) => {
  // Verificar Content-Type para requests POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type debe ser application/json'
      });
    }
  }

  // Verificar tamaño del body
  if (req.body && JSON.stringify(req.body).length > 1024 * 1024) { // 1MB
    return res.status(413).json({
      error: 'Payload demasiado grande'
    });
  }

  next();
};

// Middleware para detectar ataques de fuerza bruta
const bruteForceProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i,
    /\b(OR|AND)\b.*(=|<|>)/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn(`[SECURITY] Patrón sospechoso detectado desde IP: ${req.ip}`);
      return res.status(403).json({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
    }
  }

  next();
};

// Middleware para logging de seguridad
const securityLogger = (req, res, next) => {
  const securityLog = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    userId: req.userId || 'anonymous'
  };

  // Log de actividades sospechosas
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    console.log('[SECURITY]', JSON.stringify(securityLog));
  }

  next();
};

module.exports = {
  securityHeaders,
  corsOptions,
  cors: cors(corsOptions),
  generalLimiter,
  authLimiter,
  apiLimiter,
  sanitizeInput,
  validateApiHeaders,
  bruteForceProtection,
  securityLogger
};