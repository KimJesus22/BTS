import { useState, useEffect, useCallback } from 'react';
import { usePWA } from './usePWA';

export const usePushNotifications = () => {
  const { registration, requestNotificationPermission } = usePWA();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);

  // Verificar estado de suscripción
  const checkSubscription = useCallback(async () => {
    if (!registration?.pushManager) return;

    try {
      const existingSubscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!existingSubscription);
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  }, [registration]);

  // Suscribirse a notificaciones push
  const subscribeToNotifications = useCallback(async () => {
    if (!registration?.pushManager) {
      console.error('Push manager not available');
      return false;
    }

    try {
      // Solicitar permisos primero
      const permissionGranted = await requestNotificationPermission();
      if (!permissionGranted) {
        console.log('Notification permission denied');
        return false;
      }

      // Crear suscripción
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.REACT_APP_VAPID_PUBLIC_KEY ||
          'BKxQzAkV7R8G6VcQyJZ9YHnMqJhJfWJGjzQmJfWJGjzQmJfWJGjzQmJfWJGjzQmJfWJGjzQmJfWJGjzQmJfWJGjzQmJf' // Clave de ejemplo
        )
      });

      setSubscription(pushSubscription);
      setIsSubscribed(true);

      // Enviar suscripción al servidor
      await sendSubscriptionToServer(pushSubscription);

      return true;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  }, [registration, requestNotificationPermission]);

  // Cancelar suscripción
  const unsubscribeFromNotifications = useCallback(async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      setIsSubscribed(false);

      // Notificar al servidor
      await removeSubscriptionFromServer(subscription);

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  // Enviar notificación de prueba
  const sendTestNotification = useCallback(async () => {
    if (!isSubscribed) return false;

    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          message: '¡Notificación de prueba desde BTS Members!'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }, [isSubscribed, subscription]);

  // Enviar notificación personalizada
  const sendCustomNotification = useCallback(async (title, body, icon = '/logo192.png', badge = '/logo192.png') => {
    if (!isSubscribed) return false;

    try {
      const response = await fetch('/api/push/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          notification: {
            title,
            body,
            icon,
            badge,
            data: {
              url: window.location.href,
              timestamp: Date.now()
            }
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending custom notification:', error);
      return false;
    }
  }, [isSubscribed, subscription]);

  // Verificar soporte de notificaciones
  const isSupported = () => {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  };

  // Obtener estado de permisos
  const getPermissionState = () => {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  };

  // Inicializar
  useEffect(() => {
    if (registration) {
      checkSubscription();
    }
  }, [registration, checkSubscription]);

  return {
    isSubscribed,
    subscription,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    sendCustomNotification,
    isSupported: isSupported(),
    permissionState: getPermissionState(),
    checkSubscription
  };
};

// Función auxiliar para convertir VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Función para enviar suscripción al servidor
async function sendSubscriptionToServer(subscription) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send subscription to server');
    }
  } catch (error) {
    console.error('Error sending subscription to server:', error);
  }
}

// Función para remover suscripción del servidor
async function removeSubscriptionFromServer(subscription) {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription from server');
    }
  } catch (error) {
    console.error('Error removing subscription from server:', error);
  }
}