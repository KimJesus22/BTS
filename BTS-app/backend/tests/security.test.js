const { securityHeaders, sanitizeInput, validateApiHeaders, bruteForceProtection } = require('../middlewares/security');

describe('Security Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1'
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('securityHeaders (Helmet)', () => {
    it('debería ser una función de middleware', () => {
      expect(typeof securityHeaders).toBe('function');
    });

    it('debería configurar headers de seguridad básicos', () => {
      // Mock setHeader method
      mockRes.setHeader = jest.fn();

      securityHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.setHeader).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('sanitizeInput', () => {
    it('debería sanitizar scripts maliciosos en el body', () => {
      mockReq.body = {
        comment: '<script>alert("xss")</script>Normal text'
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.comment).toBe('Normal text');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería sanitizar scripts en query params', () => {
      mockReq.query = {
        search: '<img src=x onerror=alert(1)>'
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.query.search).toBe('');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería sanitizar scripts en route params', () => {
      mockReq.params = {
        id: '<script>evil()</script>123'
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.params.id).toBe('123');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería manejar objetos anidados', () => {
      mockReq.body = {
        user: {
          bio: '<b>Bold text</b> and <script>evil()</script>'
        }
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.user.bio).toBe('Bold text and ');
      expect(mockNext).toHaveBeenCalled();
    });

    it('debería manejar arrays en el body', () => {
      mockReq.body = {
        tags: ['<script>tag1</script>', 'normal', '<b>tag3</b>']
      };

      sanitizeInput(mockReq, mockRes, mockNext);

      expect(mockReq.body.tags).toEqual(['tag1', 'normal', 'tag3']);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateApiHeaders', () => {
    it('debería permitir requests POST válidos', () => {
      mockReq.method = 'POST';
      mockReq.headers['content-type'] = 'application/json';
      mockReq.body = { test: 'data' };

      validateApiHeaders(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debería rechazar requests POST sin Content-Type', () => {
      mockReq.method = 'POST';
      delete mockReq.headers['content-type'];

      validateApiHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Content-Type debe ser application/json'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería rechazar requests POST con Content-Type inválido', () => {
      mockReq.method = 'POST';
      mockReq.headers['content-type'] = 'text/plain';

      validateApiHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Content-Type debe ser application/json'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería rechazar payloads muy grandes', () => {
      mockReq.method = 'POST';
      mockReq.headers['content-type'] = 'application/json';
      mockReq.body = 'x'.repeat(1024 * 1024 + 1); // Más de 1MB

      validateApiHeaders(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(413);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Payload demasiado grande'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería permitir requests GET sin validación de Content-Type', () => {
      mockReq.method = 'GET';

      validateApiHeaders(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('bruteForceProtection', () => {
    it('debería permitir requests normales', () => {
      mockReq.body = { email: 'user@example.com', password: 'password123' };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('debería bloquear inyección SQL', () => {
      mockReq.body = { query: "'; DROP TABLE users; --" };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería bloquear ataques XSS', () => {
      mockReq.body = { comment: '<script>alert("xss")</script>' };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería bloquear operadores MongoDB', () => {
      mockReq.body = { filter: { $where: 'this.password.length > 0' } };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería bloquear eventos inline', () => {
      mockReq.query = { param: 'onclick=alert(1)' };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('debería manejar objetos complejos', () => {
      mockReq.body = {
        user: {
          profile: {
            bio: 'Normal text',
            settings: {
              theme: 'dark',
              notifications: { $ne: null } // Operador MongoDB sospechoso
            }
          }
        }
      };

      bruteForceProtection(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Solicitud bloqueada por medidas de seguridad'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});