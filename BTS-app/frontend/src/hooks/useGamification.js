import { useGamification as useGamificationContext } from '../contexts/GamificationContext';
import { useCallback, useEffect } from 'react';
import { usePushNotifications } from './usePushNotifications';
import { usePWA } from './usePWA';

export const useGamification = () => {
  const gamification = useGamificationContext();
  const { sendCustomNotification } = usePushNotifications();
  const { isOnline, registration } = usePWA();

  // Función para registrar visita a perfil
  const trackProfileVisit = useCallback((profileId) => {
    gamification.updateStats('profilesVisited');
    gamification.updateStats('weeklyVisits');

    // Cachear offline si no hay conexión
    if (!isOnline && registration) {
      const offlineData = {
        type: 'profile_visit',
        profileId,
        timestamp: Date.now()
      };
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_GAMIFICATION_DATA',
        data: offlineData
      });
    }
  }, [gamification, isOnline, registration]);

  // Función para registrar completación de biografía
  const trackBioCompletion = useCallback((profileId) => {
    gamification.updateStats('biosCompleted');
    gamification.updateStats('monthlyBios');
    gamification.addPoints(5, 'Biografía completada');

    // Cachear offline si no hay conexión
    if (!isOnline && registration) {
      const offlineData = {
        type: 'bio_completion',
        profileId,
        timestamp: Date.now()
      };
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_GAMIFICATION_DATA',
        data: offlineData
      });
    }
  }, [gamification, isOnline, registration]);

  // Función para registrar favorito
  const trackFavorite = useCallback((profileId) => {
    gamification.updateStats('favoritesCount');
    gamification.updateStats('weeklyFavorites');
    gamification.addPoints(2, 'Perfil añadido a favoritos');

    // Cachear offline si no hay conexión
    if (!isOnline && registration) {
      const offlineData = {
        type: 'favorite_added',
        profileId,
        timestamp: Date.now()
      };
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_GAMIFICATION_DATA',
        data: offlineData
      });
    }
  }, [gamification, isOnline, registration]);

  // Función para registrar gestos táctiles exitosos
  const trackSwipeGesture = useCallback((gestureType, itemId) => {
    const pointsMap = {
      'swipe_favorite': 3,
      'swipe_delete': 1,
      'swipe_refresh': 2,
      'swipe_navigation': 1
    };

    const points = pointsMap[gestureType] || 1;
    const descriptions = {
      'swipe_favorite': 'Gesto táctil: Favorito',
      'swipe_delete': 'Gesto táctil: Eliminar',
      'swipe_refresh': 'Gesto táctil: Actualizar',
      'swipe_navigation': 'Gesto táctil: Navegación'
    };

    gamification.addPoints(points, descriptions[gestureType] || 'Gesto táctil exitoso');
    gamification.updateStats('gestureCount');

    // Cachear offline si no hay conexión
    if (!isOnline && registration) {
      const offlineData = {
        type: 'gesture_performed',
        gestureType,
        itemId,
        timestamp: Date.now()
      };
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_GESTURE_DATA',
        data: offlineData
      });
    }
  }, [gamification, isOnline, registration]);

  // Función para registrar completación de departamento
  const trackDepartmentCompletion = useCallback((department) => {
    gamification.updateStats('departmentsCompleted');
    gamification.addPoints(20, `Departamento ${department} completado`);

    // Cachear offline si no hay conexión
    if (!isOnline && registration) {
      const offlineData = {
        type: 'department_completion',
        department,
        timestamp: Date.now()
      };
      navigator.serviceWorker.controller?.postMessage({
        type: 'STORE_GAMIFICATION_DATA',
        data: offlineData
      });
    }
  }, [gamification, isOnline, registration]);

  // Función para enviar notificación de logro
  const notifyAchievement = useCallback((achievement) => {
    if (sendCustomNotification) {
      sendCustomNotification(
        '¡Nuevo logro desbloqueado!',
        `Has obtenido el logro: ${achievement.title}`,
        '/logo192.png',
        '/logo192.png'
      );
    }
  }, [sendCustomNotification]);

  // Función para enviar notificación de reto completado
  const notifyChallengeCompleted = useCallback((challenge) => {
    if (sendCustomNotification) {
      sendCustomNotification(
        '¡Reto completado!',
        `Has completado el reto: ${challenge.title}`,
        '/logo192.png',
        '/logo192.png'
      );
    }
  }, [sendCustomNotification]);

  // Función para sincronizar datos offline cuando se recupera la conexión
  const syncOfflineData = useCallback(async () => {
    if (isOnline && registration) {
      try {
        await registration.sync.register('gamification-sync');
      } catch (error) {
        console.error('Error registering gamification sync:', error);
      }
    }
  }, [isOnline, registration]);

  // Efecto para manejar notificaciones de gamificación
  useEffect(() => {
    gamification.notifications.forEach(notification => {
      if (notification.type === 'achievement' && notification.achievement) {
        notifyAchievement(notification.achievement);
      } else if (notification.type === 'challenge' && notification.challenge) {
        notifyChallengeCompleted(notification.challenge);
      }
    });
  }, [gamification.notifications, notifyAchievement, notifyChallengeCompleted]);

  // Efecto para sincronizar cuando se recupera la conexión
  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline, syncOfflineData]);

  // Efecto para escuchar mensajes del service worker
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'GAMIFICATION_SYNCED') {
        console.log('Gamification data synced successfully');
        // Aquí se podría mostrar una notificación de sincronización exitosa
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleMessage);
  }, []);

  return {
    ...gamification,
    trackProfileVisit,
    trackBioCompletion,
    trackFavorite,
    trackSwipeGesture,
    trackDepartmentCompletion,
    notifyAchievement,
    notifyChallengeCompleted,
    syncOfflineData,
    isOnline
  };
};