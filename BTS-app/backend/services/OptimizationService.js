const User = require('../models/User');
const Wearable = require('../models/Wearable');
const AccessibilityConfig = require('../models/AccessibilityConfig');

class OptimizationService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  // Optimizaciones de batería
  async getBatteryOptimizations(userId) {
    try {
      const wearable = await Wearable.findOne({ userId });
      if (!wearable) {
        return { optimizations: [] };
      }

      const optimizations = [];

      // Optimizaciones basadas en batería
      if (wearable.battery.level < 20) {
        optimizations.push({
          type: 'battery',
          priority: 'high',
          title: 'Batería baja',
          description: 'Activa modo ahorro de energía',
          actions: [
            'Reducir frecuencia de sincronización',
            'Desactivar notificaciones no esenciales',
            'Minimizar vibraciones'
          ]
        });
      }

      // Optimizaciones basadas en uso
      const lastSyncHours = wearable.connection.lastSync ?
        (new Date() - wearable.connection.lastSync) / (1000 * 60 * 60) : 24;

      if (lastSyncHours > 12) {
        optimizations.push({
          type: 'sync',
          priority: 'medium',
          title: 'Sincronización pendiente',
          description: 'Hace tiempo que no sincronizas tus datos',
          actions: [
            'Sincronizar datos manualmente',
            'Verificar conexión del dispositivo'
          ]
        });
      }

      return { optimizations };
    } catch (error) {
      throw error;
    }
  }

  // Optimizaciones de rendimiento
  async getPerformanceOptimizations(userId) {
    try {
      const user = await User.findById(userId).select('accessibility wearable');
      const optimizations = [];

      // Optimizaciones de accesibilidad
      if (user.accessibility) {
        if (user.accessibility.reducedMotion) {
          optimizations.push({
            type: 'accessibility',
            priority: 'medium',
            title: 'Movimiento reducido activado',
            description: 'Optimizando animaciones para mejor rendimiento',
            actions: [
              'Animaciones minimizadas',
              'Transiciones suaves desactivadas'
            ]
          });
        }

        if (user.accessibility.screenReader) {
          optimizations.push({
            type: 'accessibility',
            priority: 'high',
            title: 'Lector de pantalla activo',
            description: 'Optimizando contenido para accesibilidad',
            actions: [
              'Etiquetas ARIA optimizadas',
              'Navegación por teclado mejorada'
            ]
          });
        }
      }

      // Optimizaciones de wearable
      if (user.wearable && user.wearable.deviceType !== 'none') {
        const wearable = await Wearable.findOne({ userId });

        if (wearable && wearable.connection.isConnected) {
          optimizations.push({
            type: 'wearable',
            priority: 'low',
            title: 'Dispositivo conectado',
            description: 'Sincronización automática activa',
            actions: [
              'Datos actualizados en tiempo real',
              'Notificaciones inteligentes activas'
            ]
          });
        }
      }

      return { optimizations };
    } catch (error) {
      throw error;
    }
  }

  // Optimizaciones de gamificación personalizadas
  async getGamificationOptimizations(userId) {
    try {
      const user = await User.findById(userId).select('gamification');
      const optimizations = [];

      const { gamification } = user;

      // Verificar si está cerca de un nuevo nivel
      const currentLevelThreshold = this.getLevelThreshold(gamification.level);
      const nextLevelThreshold = this.getLevelThreshold(gamification.level + 1);
      const progressToNext = nextLevelThreshold - gamification.experience;

      if (progressToNext <= 500) { // Menos de 500 XP para el siguiente nivel
        optimizations.push({
          type: 'gamification',
          priority: 'high',
          title: '¡Cerca del siguiente nivel!',
          description: `Solo necesitas ${progressToNext} XP más para el nivel ${gamification.level + 1}`,
          actions: [
            'Completa actividades diarias',
            'Participa en desafíos',
            'Ayuda a otros usuarios'
          ]
        });
      }

      // Verificar racha
      const now = new Date();
      const lastActivity = gamification.streak.lastActivity;
      if (lastActivity) {
        const hoursSinceLastActivity = (now - lastActivity) / (1000 * 60 * 60);

        if (hoursSinceLastActivity > 24 && hoursSinceLastActivity < 48) {
          optimizations.push({
            type: 'gamification',
            priority: 'high',
            title: '¡No rompas tu racha!',
            description: 'Inicia sesión hoy para mantener tu racha activa',
            actions: [
              'Inicia sesión diariamente',
              'Completa al menos una actividad'
            ]
          });
        }
      }

      // Logros casi completados
      const incompleteAchievements = gamification.achievements.filter(a => a.progress < 100);
      if (incompleteAchievements.length > 0) {
        optimizations.push({
          type: 'gamification',
          priority: 'medium',
          title: 'Logros pendientes',
          description: `Tienes ${incompleteAchievements.length} logro(s) casi completado(s)`,
          actions: [
            'Revisa tus logros pendientes',
            'Completa las tareas faltantes'
          ]
        });
      }

      return { optimizations };
    } catch (error) {
      throw error;
    }
  }

  // Optimizaciones de accesibilidad inteligentes
  async getAccessibilityOptimizations(userId) {
    try {
      const config = await AccessibilityConfig.findOne({ userId }).populate('userId');
      if (!config) {
        return {
          optimizations: [{
            type: 'accessibility',
            priority: 'high',
            title: 'Configura tu accesibilidad',
            description: 'Personaliza la app según tus necesidades',
            actions: [
              'Configurar opciones de accesibilidad',
              'Elegir tamaño de fuente preferido',
              'Activar modo alto contraste si es necesario'
            ]
          }]
        };
      }

      const optimizations = [];

      // Verificar configuraciones avanzadas
      if (config.hasAdvancedSettings) {
        optimizations.push({
          type: 'accessibility',
          priority: 'low',
          title: 'Configuración avanzada activa',
          description: 'Tus preferencias de accesibilidad están optimizadas',
          actions: [
            'Configuración guardada',
            'Aplicando automáticamente'
          ]
        });
      }

      // Sugerencias basadas en uso
      const user = config.userId;
      if (user.accessibility.screenReader && !config.assistiveTechnologies.screenReader.enabled) {
        optimizations.push({
          type: 'accessibility',
          priority: 'medium',
          title: 'Mejora la experiencia con lector de pantalla',
          description: 'Configura opciones específicas para lectores de pantalla',
          actions: [
            'Activar soporte para lectores de pantalla',
            'Configurar navegación por teclado'
          ]
        });
      }

      return { optimizations };
    } catch (error) {
      throw error;
    }
  }

  // Optimizaciones de contenido personalizadas
  async getContentOptimizations(userId) {
    try {
      const user = await User.findById(userId).select('profile gamification');
      const optimizations = [];

      // Basado en idioma preferido
      if (user.profile.language === 'es') {
        optimizations.push({
          type: 'content',
          priority: 'low',
          title: 'Contenido en español',
          description: 'Mostrando contenido en tu idioma preferido',
          actions: [
            'Traducciones automáticas activas',
            'Contenido localizado'
          ]
        });
      }

      // Basado en nivel de gamificación
      if (user.gamification.level >= 10) {
        optimizations.push({
          type: 'content',
          priority: 'medium',
          title: 'Contenido avanzado disponible',
          description: 'Tu nivel te da acceso a contenido exclusivo',
          actions: [
            'Contenido premium desbloqueado',
            'Desafíos avanzados disponibles'
          ]
        });
      }

      // Basado en miembros favoritos
      if (user.profile.favoriteMembers && user.profile.favoriteMembers.length > 0) {
        optimizations.push({
          type: 'content',
          priority: 'low',
          title: 'Contenido personalizado',
          description: 'Mostrando más contenido de tus miembros favoritos',
          actions: [
            'Recomendaciones personalizadas',
            'Notificaciones específicas'
          ]
        });
      }

      return { optimizations };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las optimizaciones para un usuario
  async getAllOptimizations(userId) {
    try {
      const cacheKey = `optimizations_${userId}`;
      const cached = this.cache.get(cacheKey);

      if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
        return cached.data;
      }

      const [
        batteryOpts,
        performanceOpts,
        gamificationOpts,
        accessibilityOpts,
        contentOpts
      ] = await Promise.all([
        this.getBatteryOptimizations(userId),
        this.getPerformanceOptimizations(userId),
        this.getGamificationOptimizations(userId),
        this.getAccessibilityOptimizations(userId),
        this.getContentOptimizations(userId)
      ]);

      const allOptimizations = [
        ...batteryOpts.optimizations,
        ...performanceOpts.optimizations,
        ...gamificationOpts.optimizations,
        ...accessibilityOpts.optimizations,
        ...contentOpts.optimizations
      ];

      // Ordenar por prioridad
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      allOptimizations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      const result = {
        totalOptimizations: allOptimizations.length,
        optimizations: allOptimizations,
        categories: {
          battery: batteryOpts.optimizations.length,
          performance: performanceOpts.optimizations.length,
          gamification: gamificationOpts.optimizations.length,
          accessibility: accessibilityOpts.optimizations.length,
          content: contentOpts.optimizations.length
        },
        generatedAt: new Date()
      };

      // Cachear resultado
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Limpiar caché
  clearCache(userId = null) {
    if (userId) {
      const cacheKey = `optimizations_${userId}`;
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  // Método auxiliar para calcular umbrales de nivel
  getLevelThreshold(level) {
    return Math.floor(1000 * Math.pow(1.2, level - 1));
  }

  // Optimizaciones del sistema (para administradores)
  async getSystemOptimizations() {
    try {
      const stats = await Promise.all([
        User.countDocuments({ isActive: true }),
        Wearable.countDocuments({ 'connection.isConnected': true }),
        AccessibilityConfig.countDocuments({ 'assistiveTechnologies.screenReader.enabled': true })
      ]);

      const [activeUsers, connectedWearables, screenReaderUsers] = stats;

      const optimizations = [];

      // Optimizaciones basadas en estadísticas del sistema
      if (activeUsers > 1000) {
        optimizations.push({
          type: 'system',
          priority: 'high',
          title: 'Alto volumen de usuarios',
          description: `${activeUsers} usuarios activos requieren optimizaciones de rendimiento`,
          actions: [
            'Implementar caché distribuido',
            'Optimizar consultas de base de datos',
            'Configurar balanceo de carga'
          ]
        });
      }

      if (connectedWearables > 100) {
        optimizations.push({
          type: 'system',
          priority: 'medium',
          title: 'Múltiples dispositivos conectados',
          description: `${connectedWearables} wearables conectados`,
          actions: [
            'Optimizar sincronización de datos',
            'Implementar colas de procesamiento',
            'Monitorear uso de batería'
          ]
        });
      }

      if (screenReaderUsers > 50) {
        optimizations.push({
          type: 'system',
          priority: 'medium',
          title: 'Alto uso de accesibilidad',
          description: `${screenReaderUsers} usuarios usan lectores de pantalla`,
          actions: [
            'Optimizar rendimiento de accesibilidad',
            'Mejorar soporte ARIA',
            'Implementar navegación eficiente'
          ]
        });
      }

      return {
        systemOptimizations: optimizations,
        stats: {
          activeUsers,
          connectedWearables,
          screenReaderUsers
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OptimizationService();