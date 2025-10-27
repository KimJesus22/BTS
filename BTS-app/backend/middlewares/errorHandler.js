// Middleware de Manejo Centralizado de Errores para BTS-app
// Proporciona respuestas JSON consistentes y logging apropiado

const config = require('../config');

/**
 * Middleware de manejo centralizado de errores
 * Captura errores de manera global y devuelve respuestas JSON consistentes
 */
const errorHandler = (err, req, res, next) => {
  // Extraer información del error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';
  const code = err.code || getErrorCode(statusCode, err);
  const details = err.details || null;

  // Crear objeto de error estructurado
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    }
  };

  // Logging basado en el tipo de error
  if (statusCode >= 500) {
    // Errores del servidor - logging completo
    console.error('Error interno del servidor:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  } else if (statusCode >= 400) {
    // Errores del cliente - logging básico
    console.warn('Error de cliente:', {
      statusCode,
      code,
      message,
      url: req.url,
      method: req.method
    });
  }

  // Enviar respuesta JSON consistente
  res.status(statusCode).json(errorResponse);
};

/**
 * Determina el código de error basado en el tipo de error
 */
function getErrorCode(statusCode, err) {
  // Códigos específicos basados en el tipo de error
  if (err.name === 'ValidationError' || err.isJoi) {
    return 'VALIDATION_ERROR';
  }

  if (err.name === 'CastError' || err.name === 'BSONTypeError') {
    return 'INVALID_DATA_TYPE';
  }

  if (err.code === 11000) { // MongoDB duplicate key
    return 'DUPLICATE_ENTRY';
  }

  if (err.name === 'JsonWebTokenError') {
    return 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    return 'TOKEN_EXPIRED';
  }

  // Códigos basados en status HTTP
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'RATE_LIMIT_EXCEEDED';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 502:
      return 'BAD_GATEWAY';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Clase base para errores personalizados
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getErrorCode(statusCode, this);
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores específicos para diferentes situaciones
 */
class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos') {
    super(message, 409, 'CONFLICT');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Demasiadas solicitudes') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Middleware para capturar errores asíncronos no manejados
 */
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para crear errores personalizados
 */
const createError = (message, statusCode = 500, code = null, details = null) => {
  return new AppError(message, statusCode, code, details);
};

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  asyncErrorHandler,
  createError
};