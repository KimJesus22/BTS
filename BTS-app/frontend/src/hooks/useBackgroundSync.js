import { useCallback, useEffect, useState } from 'react';
import { usePWA } from './usePWA';

export const useBackgroundSync = () => {
  const { registration, syncOfflineData } = usePWA();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  // Registrar sincronización en segundo plano
  const registerBackgroundSync = useCallback(async (tag = 'content-sync') => {
    if (!registration) return false;

    try {
      await registration.sync.register(tag);
      setPendingSyncs(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error registering background sync:', error);
      return false;
    }
  }, [registration]);

  // Sincronización periódica de contenido
  const registerPeriodicSync = useCallback(async (tag = 'content-sync', minInterval = 24 * 60 * 60 * 1000) => {
    if (!('periodicSync' in registration)) return false;

    try {
      await registration.periodicSync.register(tag, {
        minInterval: minInterval // 24 horas por defecto
      });
      return true;
    } catch (error) {
      console.error('Error registering periodic sync:', error);
      return false;
    }
  }, [registration]);

  // Sincronizar datos manualmente
  const manualSync = useCallback(async () => {
    setSyncStatus('syncing');

    try {
      const success = await syncOfflineData();
      if (success) {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        setPendingSyncs(prev => Math.max(0, prev - 1));
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Error during manual sync:', error);
      setSyncStatus('error');
    }

    // Reset status after 3 seconds
    setTimeout(() => setSyncStatus('idle'), 3000);
  }, [syncOfflineData]);

  // Sincronizar datos específicos
  const syncSpecificData = useCallback(async (dataType, data) => {
    setSyncStatus('syncing');

    try {
      const response = await fetch(`/api/sync/${dataType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setSyncStatus('success');
        setLastSyncTime(new Date());
        return true;
      } else {
        setSyncStatus('error');
        return false;
      }
    } catch (error) {
      console.error(`Error syncing ${dataType}:`, error);
      setSyncStatus('error');
      return false;
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, []);

  // Obtener estado de conectividad
  const getConnectivityStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }, []);

  // Reintentar sincronización fallida
  const retryFailedSync = useCallback(async () => {
    const failedSyncs = JSON.parse(localStorage.getItem('failed-syncs') || '[]');

    if (failedSyncs.length === 0) return;

    setSyncStatus('syncing');

    const successfulSyncs = [];
    const stillFailedSyncs = [];

    for (const syncData of failedSyncs) {
      try {
        const response = await fetch(syncData.url, {
          method: syncData.method,
          headers: syncData.headers,
          body: syncData.body
        });

        if (response.ok) {
          successfulSyncs.push(syncData);
        } else {
          stillFailedSyncs.push(syncData);
        }
      } catch (error) {
        stillFailedSyncs.push(syncData);
      }
    }

    // Actualizar localStorage
    localStorage.setItem('failed-syncs', JSON.stringify(stillFailedSyncs));

    if (successfulSyncs.length > 0) {
      setSyncStatus('success');
      setLastSyncTime(new Date());
    } else {
      setSyncStatus('error');
    }

    setTimeout(() => setSyncStatus('idle'), 3000);
  }, []);

  // Almacenar sincronización fallida para reintento posterior
  const storeFailedSync = useCallback((url, method, headers, body) => {
    const failedSyncs = JSON.parse(localStorage.getItem('failed-syncs') || '[]');
    failedSyncs.push({
      url,
      method,
      headers,
      body,
      timestamp: Date.now()
    });
    localStorage.setItem('failed-syncs', JSON.stringify(failedSyncs));
  }, []);

  // Limpiar sincronizaciones fallidas antiguas
  const cleanupOldFailedSyncs = useCallback(() => {
    const failedSyncs = JSON.parse(localStorage.getItem('failed-syncs') || '[]');
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    const recentSyncs = failedSyncs.filter(sync => sync.timestamp > oneWeekAgo);
    localStorage.setItem('failed-syncs', JSON.stringify(recentSyncs));
  }, []);

  // Escuchar eventos de sincronización
  useEffect(() => {
    if (!registration) return;

    const handleSync = (event) => {
      if (event.tag === 'offline-queue') {
        event.waitUntil(processOfflineQueue());
      }
    };

    const handlePeriodicSync = (event) => {
      if (event.tag === 'content-sync') {
        event.waitUntil(performPeriodicSync());
      }
    };

    navigator.serviceWorker.addEventListener('sync', handleSync);
    navigator.serviceWorker.addEventListener('periodicsync', handlePeriodicSync);

    return () => {
      navigator.serviceWorker.removeEventListener('sync', handleSync);
      navigator.serviceWorker.removeEventListener('periodicsync', handlePeriodicSync);
    };
  }, [registration]);

  // Procesar cola offline
  const processOfflineQueue = async () => {
    try {
      const cache = await caches.open('offline-queue');
      const requests = await cache.keys();

      for (const request of requests) {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.delete(request);
            setPendingSyncs(prev => Math.max(0, prev - 1));
          }
        } catch (error) {
          console.error('Error processing offline request:', error);
        }
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  };

  // Realizar sincronización periódica
  const performPeriodicSync = async () => {
    try {
      // Sincronizar datos del usuario
      await syncSpecificData('user-preferences', {});

      // Sincronizar recomendaciones de IA
      await syncSpecificData('ai-recommendations', {});

      // Sincronizar estadísticas de usuario
      await syncSpecificData('user-analytics', {});

      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Error during periodic sync:', error);
    }
  };

  // Limpiar sincronizaciones fallidas periódicamente
  useEffect(() => {
    const interval = setInterval(cleanupOldFailedSyncs, 24 * 60 * 60 * 1000); // Una vez al día
    return () => clearInterval(interval);
  }, [cleanupOldFailedSyncs]);

  return {
    syncStatus,
    lastSyncTime,
    pendingSyncs,
    registerBackgroundSync,
    registerPeriodicSync,
    manualSync,
    syncSpecificData,
    getConnectivityStatus,
    retryFailedSync,
    storeFailedSync,
    cleanupOldFailedSyncs
  };
};