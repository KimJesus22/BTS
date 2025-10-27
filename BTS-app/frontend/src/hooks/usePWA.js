import { useState, useEffect } from 'react';
import { useBatteryOptimization } from './useBatteryOptimization';

export const usePWA = () => {
  const { powerSavingMode, getOptimizationSettings } = useBatteryOptimization();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [cacheSize, setCacheSize] = useState(0);

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Registrar service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registrado:', reg);
          setRegistration(reg);

          // Verificar si hay actualizaciones disponibles
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Escuchar mensajes del service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CONTENT_UPDATED') {
              // Manejar actualización de contenido
              console.log('Contenido actualizado:', event.data.data);
            }
          });
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    }
  }, []);

  // Detectar si la app está instalada
  useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => {
      window.removeEventListener('appinstalled', () => setIsInstalled(true));
    };
  }, []);

  // Detectar si es instalable
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  // Instalar la aplicación
  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      return outcome === 'accepted';
    }
    return false;
  };

  // Actualizar la aplicación
  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  // Enviar notificación push
  const sendNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const defaultOptions = {
        body: 'Nuevo contenido disponible',
        icon: '/logo192.png',
        badge: '/logo192.png',
        vibrate: [100, 50, 100],
        ...options
      };
      new Notification(title, defaultOptions);
    }
  };

  // Sincronizar datos offline
  const syncOfflineData = async () => {
    if ('serviceWorker' in navigator && registration) {
      try {
        // En modo ahorro, reducir frecuencia de sincronización
        const optimizations = getOptimizationSettings();
        if (powerSavingMode) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay adicional
        }

        await registration.sync.register('offline-queue');
        return true;
      } catch (error) {
        console.error('Error registrando sync:', error);
        return false;
      }
    }
    return false;
  };

  // Limpiar cache inteligente
  const clearSmartCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();

          // En modo ahorro, eliminar más agresivamente
          const maxEntries = powerSavingMode ? 10 : 50;

          if (keys.length > maxEntries) {
            // Eliminar entradas antiguas
            const entriesToDelete = keys.slice(0, keys.length - maxEntries);
            await Promise.all(entriesToDelete.map(key => cache.delete(key)));
          }

          totalSize += keys.length;
        }

        setCacheSize(totalSize);
        return true;
      } catch (error) {
        console.error('Error limpiando cache:', error);
        return false;
      }
    }
    return false;
  };

  // Verificar conectividad a internet
  const checkConnectivity = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  return {
    isOnline,
    isInstallable,
    isInstalled,
    updateAvailable,
    installApp,
    updateApp,
    sendNotification,
    requestNotificationPermission,
    syncOfflineData,
    checkConnectivity,
    clearSmartCache,
    cacheSize,
    registration
  };
};