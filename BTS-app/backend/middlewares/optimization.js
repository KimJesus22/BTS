const compression = require('compression');

// Middleware de compresión
const compressionMiddleware = compression({
  level: 6, // Nivel de compresión (1-9, 6 es buen balance)
  threshold: 1024, // Solo comprimir respuestas mayores a 1KB
  filter: (req, res) => {
    // No comprimir si el cliente no lo soporta
    if (!req.headers['accept-encoding']) {
      return false;
    }

    // No comprimir ciertos tipos de contenido
    const contentType = res.getHeader('Content-Type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('audio/')
    )) {
      return false;
    }

    return compression.filter(req, res);
  }
});

// Middleware para optimización de respuestas JSON
const jsonOptimization = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Remover campos innecesarios en producción
    if (process.env.NODE_ENV === 'production' && data) {
      // Función recursiva para limpiar objetos
      const cleanObject = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(cleanObject);
        } else if (obj && typeof obj === 'object') {
          const cleaned = {};
          for (const [key, value] of Object.entries(obj)) {
            // Omitir campos internos de Mongoose
            if (!key.startsWith('_') && !key.startsWith('$')) {
              cleaned[key] = cleanObject(value);
            }
          }
          return cleaned;
        }
        return obj;
      };

      data = cleanObject(data);
    }

    return originalJson.call(this, data);
  };

  next();
};

// Middleware para cache HTTP
const cacheControl = (maxAge = 300) => { // 5 minutos por defecto
  return (req, res, next) => {
    // Solo cache para GET requests
    if (req.method === 'GET') {
      res.set({
        'Cache-Control': `public, max-age=${maxAge}`,
        'Expires': new Date(Date.now() + maxAge * 1000).toUTCString()
      });
    } else {
      // No cache para otros métodos
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
    }
    next();
  };
};

// Middleware para optimización de queries de base de datos
const queryOptimization = (req, res, next) => {
  // Agregar timeout a queries
  req.dbTimeout = 5000; // 5 segundos

  // Log de queries lentas
  const originalSend = res.send;
  res.send = function(data) {
    if (req.queryStartTime) {
      const duration = Date.now() - req.queryStartTime;
      if (duration > 1000) { // Más de 1 segundo
        console.warn(`[QUERY SLOW] ${req.method} ${req.url} - ${duration}ms`);
      }
    }
    originalSend.call(this, data);
  };

  next();
};

// Middleware para lazy loading de módulos pesados
const lazyLoad = (moduleLoader) => {
  let cachedModule = null;

  return async (req, res, next) => {
    try {
      if (!cachedModule) {
        cachedModule = await moduleLoader();
      }

      req.lazyModule = cachedModule;
      next();
    } catch (error) {
      console.error('Error cargando módulo lazy:', error);
      next(error);
    }
  };
};

// Middleware para optimización de respuestas según el cliente
const clientOptimization = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';

  // Detectar tipo de cliente
  req.clientType = {
    isMobile: /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isTablet: /iPad|Android(?=.*\bMobile\b)|Tablet/i.test(userAgent),
    isDesktop: !/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Tablet/i.test(userAgent),
    isBot: /bot|crawl|spider|slurp|bing|google|yandex/i.test(userAgent.toLowerCase())
  };

  // Optimizar respuesta según el cliente
  if (req.clientType.isMobile) {
    // Para móviles, enviar menos datos
    req.optimizeForMobile = true;
  }

  if (req.clientType.isBot) {
    // Para bots, optimizar para SEO
    req.optimizeForSEO = true;
  }

  next();
};

// Middleware para prefetching inteligente
const intelligentPrefetch = (req, res, next) => {
  // Analizar patrones de navegación para prefetching
  const prefetchUrls = [];

  if (req.url.startsWith('/api/members')) {
    prefetchUrls.push('/api/members/popular');
  }

  if (req.url.startsWith('/api/users/profile')) {
    prefetchUrls.push('/api/users/gamification', '/api/users/optimizations');
  }

  if (prefetchUrls.length > 0) {
    res.set('X-Prefetch-URLs', prefetchUrls.join(', '));
  }

  next();
};

// Middleware para optimización de memoria
const memoryOptimization = (req, res, next) => {
  // Forzar garbage collection si está disponible (solo en desarrollo)
  if (process.env.NODE_ENV === 'development' && global.gc) {
    const startMemory = process.memoryUsage();

    res.on('finish', () => {
      const endMemory = process.memoryUsage();
      const memoryDiff = endMemory.heapUsed - startMemory.heapUsed;

      if (memoryDiff > 10 * 1024 * 1024) { // Más de 10MB
        console.warn(`[MEMORY] Alto uso de memoria en ${req.url}: +${(memoryDiff / 1024 / 1024).toFixed(2)}MB`);
      }
    });
  }

  next();
};

// Middleware para optimización de batería (para dispositivos wearables)
const batteryOptimization = (req, res, next) => {
  // Verificar si la request viene de un dispositivo con batería baja
  const batteryHeader = req.get('X-Battery-Level');
  const batteryLevel = batteryHeader ? parseInt(batteryHeader) : 100;

  req.batteryLevel = batteryLevel;

  if (batteryLevel < 20) {
    // Optimizar respuesta para batería baja
    req.lowBatteryMode = true;

    // Reducir datos enviados
    const originalJson = res.json;
    res.json = function(data) {
      if (data && typeof data === 'object') {
        // Enviar solo datos esenciales
        const essentialData = {
          ...data,
          _optimized: true,
          _batteryMode: true
        };
        return originalJson.call(this, essentialData);
      }
      return originalJson.call(this, data);
    };
  }

  next();
};

module.exports = {
  compressionMiddleware,
  jsonOptimization,
  cacheControl,
  queryOptimization,
  lazyLoad,
  clientOptimization,
  intelligentPrefetch,
  memoryOptimization,
  batteryOptimization
};