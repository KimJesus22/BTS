import { useState, useCallback, useEffect } from 'react';
import { useGamification } from './useGamification';
import { useWearableOptimizations } from './useWearableOptimizations';
import { usePWA } from './usePWA';

export const useSocialSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareCache, setShareCache] = useState(new Map());
  const { addPoints, trackSwipeGesture } = useGamification();
  const { isWearable, hapticFeedback, triggerHapticFeedback } = useWearableOptimizations();
  const { isOnline, registration } = usePWA();

  // Verificar soporte para Web Share API
  const isWebShareSupported = useCallback(() => {
    return navigator.share !== undefined;
  }, []);

  // Configuraciones de plataformas sociales
  const socialPlatforms = {
    twitter: {
      name: 'Twitter',
      url: 'https://twitter.com/intent/tweet',
      icon: 'twitter',
      color: '#1DA1F2',
      params: { text: 'text', url: 'url', hashtags: 'hashtags' }
    },
    facebook: {
      name: 'Facebook',
      url: 'https://www.facebook.com/sharer/sharer.php',
      icon: 'facebook',
      color: '#1877F2',
      params: { u: 'url' }
    },
    instagram: {
      name: 'Instagram',
      url: 'https://www.instagram.com/',
      icon: 'instagram',
      color: '#E4405F',
      note: 'Comparte desde la app de Instagram'
    },
    whatsapp: {
      name: 'WhatsApp',
      url: 'https://wa.me/',
      icon: 'whatsapp',
      color: '#25D366',
      params: { text: 'text' }
    },
    linkedin: {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/sharing/share-offsite/',
      icon: 'linkedin',
      color: '#0077B5',
      params: { url: 'url' }
    },
    telegram: {
      name: 'Telegram',
      url: 'https://t.me/share/url',
      icon: 'telegram',
      color: '#0088CC',
      params: { url: 'url', text: 'text' }
    }
  };

  // Función para compartir usando Web Share API nativa
  const shareNative = useCallback(async (data) => {
    if (!isWebShareSupported()) {
      throw new Error('Web Share API no soportada');
    }

    const shareData = {
      title: data.title || 'BTS - Miembros',
      text: data.text || 'Descubre más sobre BTS',
      url: data.url || window.location.href
    };

    // Agregar archivos si existen
    if (data.files && data.files.length > 0) {
      shareData.files = data.files;
    }

    await navigator.share(shareData);
  }, [isWebShareSupported]);

  // Función para compartir usando fallback (ventana popup)
  const shareFallback = useCallback((platform, data) => {
    const config = socialPlatforms[platform];
    if (!config) return;

    let shareUrl = config.url;

    // Construir URL con parámetros
    if (config.params) {
      const params = new URLSearchParams();
      Object.entries(config.params).forEach(([param, dataKey]) => {
        if (data[dataKey]) {
          params.append(param, data[dataKey]);
        }
      });
      shareUrl += `?${params.toString()}`;
    }

    // Abrir en nueva ventana
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      shareUrl,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  }, []);

  // Función principal para compartir
  const share = useCallback(async (platform, data = {}) => {
    setIsSharing(true);

    try {
      const shareData = {
        title: data.title || 'BTS - Miembros',
        text: data.text || 'Descubre más sobre los miembros de BTS',
        url: data.url || window.location.href,
        ...data
      };

      // Intentar compartir nativo primero
      if (isWebShareSupported() && !platform) {
        await shareNative(shareData);
      } else if (platform) {
        shareFallback(platform, shareData);
      } else {
        throw new Error('Método de compartir no disponible');
      }

      // Otorgar puntos por compartir
      addPoints(5, `Contenido compartido en ${platform || 'dispositivo'}`);

      // Feedback háptico para wearables
      if (isWearable && hapticFeedback) {
        triggerHapticFeedback([20, 10, 20]); // Patrón de éxito
      }

      // Cachear el enlace compartido
      const cacheKey = `${platform || 'native'}-${Date.now()}`;
      setShareCache(prev => new Map(prev.set(cacheKey, {
        platform: platform || 'native',
        data: shareData,
        timestamp: Date.now()
      })));

      // Limpiar cache antiguo (mantener solo últimos 10)
      setShareCache(prev => {
        if (prev.size > 10) {
          const entries = Array.from(prev.entries());
          return new Map(entries.slice(-10));
        }
        return prev;
      });

      return { success: true, method: platform ? 'fallback' : 'native' };

    } catch (error) {
      console.error('Error al compartir:', error);

      // Feedback háptico de error para wearables
      if (isWearable && hapticFeedback) {
        triggerHapticFeedback([100, 50, 100]); // Patrón de error
      }

      return { success: false, error: error.message };
    } finally {
      setIsSharing(false);
    }
  }, [
    isWebShareSupported,
    shareNative,
    shareFallback,
    addPoints,
    isWearable,
    hapticFeedback,
    triggerHapticFeedback
  ]);

  // Función para compartir con gestos táctiles
  const shareWithGesture = useCallback(async (gestureDirection, data) => {
    // Mapear dirección de gesto a plataforma
    const gesturePlatformMap = {
      left: 'twitter',
      right: 'facebook',
      up: 'whatsapp',
      down: 'instagram'
    };

    const platform = gesturePlatformMap[gestureDirection];
    if (!platform) return;

    // Registrar gesto en gamificación
    trackSwipeGesture(`swipe_share_${gestureDirection}`, 'social-share');

    // Compartir
    return await share(platform, data);
  }, [share, trackSwipeGesture]);

  // Función para obtener estadísticas de compartir
  const getShareStats = useCallback(() => {
    const stats = {
      totalShares: shareCache.size,
      platforms: {},
      recentShares: []
    };

    shareCache.forEach((share, key) => {
      const platform = share.platform;
      stats.platforms[platform] = (stats.platforms[platform] || 0) + 1;
      stats.recentShares.push({ ...share, key });
    });

    // Ordenar shares recientes por timestamp
    stats.recentShares.sort((a, b) => b.timestamp - a.timestamp);

    return stats;
  }, [shareCache]);

  // Función para limpiar cache
  const clearShareCache = useCallback(() => {
    setShareCache(new Map());
  }, []);

  // Función para compartir offline (cachear para sincronización posterior)
  const shareOffline = useCallback((platform, data) => {
    if (!isOnline && registration) {
      const offlineData = {
        type: 'social_share',
        platform,
        data,
        timestamp: Date.now(),
        id: `offline-share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      // Cachear localmente primero
      const cacheKey = `offline-${platform}-${Date.now()}`;
      setShareCache(prev => new Map(prev.set(cacheKey, {
        platform,
        data,
        timestamp: Date.now(),
        offline: true,
        synced: false
      })));

      // Enviar al service worker para persistencia offline
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_OFFLINE_SHARE',
        data: offlineData
      });

      // Otorgar puntos por intento de compartir offline
      addPoints(2, 'Compartir programado para cuando haya conexión');

      return { success: true, offline: true, id: offlineData.id };
    }

    return share(platform, data);
  }, [isOnline, registration, share, addPoints]);

  // Función para sincronizar shares offline cuando se recupera la conexión
  const syncOfflineShares = useCallback(async () => {
    if (!isOnline || !registration) return;

    try {
      // Buscar shares offline en el cache
      const offlineShares = [];
      shareCache.forEach((share, key) => {
        if (share.offline && !share.synced) {
          offlineShares.push({ key, ...share });
        }
      });

      // Sincronizar cada share offline
      for (const offlineShare of offlineShares) {
        try {
          await share(offlineShare.platform, offlineShare.data);

          // Marcar como sincronizado
          setShareCache(prev => {
            const updated = new Map(prev);
            updated.set(offlineShare.key, {
              ...offlineShare,
              synced: true,
              syncedAt: Date.now()
            });
            return updated;
          });

          // Notificar al service worker
          navigator.serviceWorker.controller?.postMessage({
            type: 'MARK_SHARE_SYNCED',
            id: offlineShare.key
          });

        } catch (error) {
          console.error('Error sincronizando share offline:', error);
        }
      }

      // Limpiar shares offline antiguos (más de 7 días)
      setShareCache(prev => {
        const now = Date.now();
        const filtered = new Map();

        prev.forEach((value, key) => {
          if (!value.offline || (now - value.timestamp < 7 * 24 * 60 * 60 * 1000)) {
            filtered.set(key, value);
          }
        });

        return filtered;
      });

    } catch (error) {
      console.error('Error en sincronización offline:', error);
    }
  }, [isOnline, registration, share, shareCache]);

  // Limpiar cache periódicamente y sincronizar offline
  useEffect(() => {
    const interval = setInterval(() => {
      // Limpiar cache antiguo
      setShareCache(prev => {
        const now = Date.now();
        const filtered = new Map();

        prev.forEach((value, key) => {
          // Mantener shares de las últimas 24 horas, o shares offline sin sincronizar
          const isRecent = now - value.timestamp < 24 * 60 * 60 * 1000;
          const isOfflineUnsynced = value.offline && !value.synced;

          if (isRecent || isOfflineUnsynced) {
            filtered.set(key, value);
          }
        });

        return filtered;
      });

      // Intentar sincronizar shares offline
      if (isOnline) {
        syncOfflineShares();
      }
    }, 60 * 60 * 1000); // Cada hora

    return () => clearInterval(interval);
  }, [isOnline, syncOfflineShares]);

  // Sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline) {
      syncOfflineShares();
    }
  }, [isOnline, syncOfflineShares]);

  return {
    share,
    shareWithGesture,
    shareOffline,
    syncOfflineShares,
    isSharing,
    isWebShareSupported: isWebShareSupported(),
    socialPlatforms,
    getShareStats,
    clearShareCache,
    shareCache,
    isOnline
  };
};