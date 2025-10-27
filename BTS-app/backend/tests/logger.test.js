const winston = require('winston');
const { logger, loggerMiddleware, errorLogger, activityLogger, performanceLogger, authLogger, securityLogger } = require('../middlewares/logger');

// Mock winston
jest.mock('winston', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  })),
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    errors: jest.fn(),
    json: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
    simple: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  }
}));

// Mock DailyRotateFile
jest.mock('winston-daily-rotate-file');

describe('Logger Middleware', () => {
  let mockLogger;
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    };
    winston.createLogger.mockReturnValue(mockLogger);

    mockReq = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      userId: 'user123',
      get: jest.fn((header) => 'test-agent')
    };

    mockRes = {
      statusCode: 200,
      get: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loggerMiddleware', () => {
    it('debería loggear requests HTTP exitosamente', () => {
      loggerMiddleware(mockReq, mockRes, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          message: expect.any(String)
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería manejar requests sin userId', () => {
      mockReq.userId = undefined;

      loggerMiddleware(mockReq, mockRes, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'HTTP Request',
        expect.objectContaining({
          message: expect.any(String)
        })
      );
    });
  });

  describe('errorLogger', () => {
    it('debería loggear errores del servidor (5xx)', () => {
      const error = new Error('Test error');
      error.statusCode = 500;

      errorLogger(error, mockReq, mockRes, mockNext);

      expect(mockLogger.error).toHaveBeenCalledWith('Server Error', expect.objectContaining({
        message: 'Test error',
        statusCode: 500,
        request: expect.any(Object)
      }));
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('debería loggear errores del cliente (4xx)', () => {
      const error = new Error('Not found');
      error.statusCode = 404;

      errorLogger(error, mockReq, mockRes, mockNext);

      expect(mockLogger.warn).toHaveBeenCalledWith('Client Error', expect.objectContaining({
        message: 'Not found',
        statusCode: 404
      }));
    });

    it('debería loggear errores de aplicación sin statusCode', () => {
      const error = new Error('Application error');

      errorLogger(error, mockReq, mockRes, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Application Error', expect.objectContaining({
        message: 'Application error'
      }));
    });
  });

  describe('activityLogger', () => {
    it('debería loggear actividades con detalles', () => {
      const middleware = activityLogger('user_login', { sessionId: 'abc123' });

      middleware(mockReq, mockRes, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Activity: user_login', {
        activity: 'user_login',
        userId: 'user123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        method: 'GET',
        url: '/api/test',
        sessionId: 'abc123'
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería manejar actividades sin detalles adicionales', () => {
      const middleware = activityLogger('profile_update');

      middleware(mockReq, mockRes, mockNext);

      expect(mockLogger.info).toHaveBeenCalledWith('Activity: profile_update', expect.objectContaining({
        activity: 'profile_update'
      }));
    });
  });

  describe('performanceLogger', () => {
    let mockResWithFinish;

    beforeEach(() => {
      mockResWithFinish = {
        ...mockRes,
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // Simular llamada inmediata para tests
            setTimeout(() => callback(), 10);
          }
        })
      };
    });

    it('debería loggear rendimiento normal', () => {
      jest.useFakeTimers();

      performanceLogger(mockReq, mockResWithFinish, mockNext);

      jest.advanceTimersByTime(100);

      expect(mockLogger.info).toHaveBeenCalledWith('Performance Normal', expect.objectContaining({
        method: 'GET',
        url: '/api/test',
        duration: expect.any(Number),
        status: 200
      }));

      jest.useRealTimers();
    });

    it('debería loggear rendimiento lento', () => {
      jest.useFakeTimers();

      performanceLogger(mockReq, mockResWithFinish, mockNext);

      jest.advanceTimersByTime(1500);

      expect(mockLogger.warn).toHaveBeenCalledWith('Performance Slow', expect.objectContaining({
        duration: expect.any(Number)
      }));

      jest.useRealTimers();
    });

    it('debería loggear rendimiento crítico', () => {
      jest.useFakeTimers();

      performanceLogger(mockReq, mockResWithFinish, mockNext);

      jest.advanceTimersByTime(6000);

      expect(mockLogger.error).toHaveBeenCalledWith('Performance Critical', expect.objectContaining({
        duration: expect.any(Number)
      }));

      jest.useRealTimers();
    });
  });

  describe('authLogger', () => {
    it('debería loggear eventos de autenticación', () => {
      authLogger('login_success', 'user123', { username: 'testuser' });

      expect(mockLogger.info).toHaveBeenCalledWith('Auth: login_success', {
        userId: 'user123',
        action: 'login_success',
        username: 'testuser'
      });
    });
  });

  describe('securityLogger', () => {
    it('debería loggear eventos de seguridad', () => {
      securityLogger('suspicious_activity', {
        ip: '192.168.1.1',
        attempts: 5
      });

      expect(mockLogger.warn).toHaveBeenCalledWith('Security: suspicious_activity', {
        event: 'suspicious_activity',
        ip: '192.168.1.1',
        attempts: 5
      });
    });
  });

  describe('Winston Logger Configuration', () => {
    it('debería crear logger con configuración correcta', () => {
      expect(winston.createLogger).toHaveBeenCalledWith({
        level: expect.any(String),
        format: expect.any(Object),
        transports: expect.any(Array),
        exceptionHandlers: expect.any(Array),
        rejectionHandlers: expect.any(Array)
      });
    });
  });
});