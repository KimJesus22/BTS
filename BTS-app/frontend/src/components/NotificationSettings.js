import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useTranslation } from 'react-i18next';
import './NotificationSettings.css';

const NotificationSettings = () => {
  const {
    isSubscribed,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    sendCustomNotification,
    isSupported,
    permissionState
  } = usePushNotifications();

  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const handleToggleSubscription = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromNotifications();
      } else {
        await subscribeToNotifications();
      }
    } catch (error) {
      console.error('Error toggling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTest = async () => {
    setIsLoading(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCustom = async () => {
    setIsLoading(true);
    try {
      await sendCustomNotification(
        t('notifications.newMember.title', '¡Nuevo miembro!'),
        t('notifications.newMember.body', 'Se ha agregado un nuevo miembro a BTS'),
        '/logo192.png',
        '/logo192.png'
      );
    } catch (error) {
      console.error('Error sending custom notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="notification-settings">
        <div className="notification-unsupported">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z" fill="var(--theme-textMuted, #80868b)"/>
          </svg>
          <p>{t('notifications.unsupported', 'Las notificaciones push no son compatibles con este navegador')}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="notification-settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="notification-header">
        <h3 className="notification-title">
          {t('notifications.title', 'Notificaciones Push')}
        </h3>
        <p className="notification-description">
          {t('notifications.description', 'Recibe alertas sobre nuevos miembros y actualizaciones')}
        </p>
      </div>

      <div className="notification-status">
        <div className="status-item">
          <span className="status-label">
            {t('notifications.permission', 'Permisos')}:
          </span>
          <span className={`status-value ${permissionState}`}>
            {permissionState === 'granted' && t('notifications.granted', 'Concedidos')}
            {permissionState === 'denied' && t('notifications.denied', 'Denegados')}
            {permissionState === 'default' && t('notifications.default', 'Por defecto')}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">
            {t('notifications.subscription', 'Suscripción')}:
          </span>
          <span className={`status-value ${isSubscribed ? 'active' : 'inactive'}`}>
            {isSubscribed ? t('notifications.active', 'Activa') : t('notifications.inactive', 'Inactiva')}
          </span>
        </div>
      </div>

      <div className="notification-actions">
        <button
          onClick={handleToggleSubscription}
          disabled={isLoading || permissionState === 'denied'}
          className={`notification-button ${isSubscribed ? 'unsubscribe' : 'subscribe'}`}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : isSubscribed ? (
            t('notifications.unsubscribe', 'Cancelar suscripción')
          ) : (
            t('notifications.subscribe', 'Suscribirse')
          )}
        </button>

        {isSubscribed && (
          <div className="test-actions">
            <button
              onClick={handleSendTest}
              disabled={isLoading}
              className="notification-button test"
            >
              {testSent ? t('notifications.testSent', '¡Enviada!') : t('notifications.sendTest', 'Enviar prueba')}
            </button>

            <button
              onClick={handleSendCustom}
              disabled={isLoading}
              className="notification-button custom"
            >
              {t('notifications.sendCustom', 'Notificación personalizada')}
            </button>
          </div>
        )}
      </div>

      <div className="notification-info">
        <div className="info-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--theme-warning, #fbbc04)"/>
          </svg>
          <span>{t('notifications.info1', 'Las notificaciones aparecen incluso cuando la app está cerrada')}</span>
        </div>

        <div className="info-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="var(--theme-warning, #fbbc04)"/>
          </svg>
          <span>{t('notifications.info2', 'Puedes gestionar permisos en la configuración del navegador')}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationSettings;