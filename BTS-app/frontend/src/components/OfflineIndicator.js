import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';
import './OfflineIndicator.css';

const OfflineIndicator = () => {
  const { isOnline, updateAvailable, updateApp } = usePWA();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {(!isOnline || updateAvailable) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`offline-indicator ${!isOnline ? 'offline' : 'update'}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="indicator-content">
            <div className="indicator-icon">
              {!isOnline ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z" fill="currentColor"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z" fill="currentColor"/>
                </svg>
              )}
            </div>
            <div className="indicator-text">
              <span className="indicator-title">
                {!isOnline ? t('pwa.offline.title', 'Sin conexión') : t('pwa.update.title', 'Actualización disponible')}
              </span>
              <span className="indicator-message">
                {!isOnline
                  ? t('pwa.offline.message', 'Trabajando en modo offline')
                  : t('pwa.update.message', 'Nueva versión disponible')
                }
              </span>
            </div>
            {updateAvailable && (
              <button
                onClick={updateApp}
                className="update-button"
                aria-label={t('pwa.update.button', 'Actualizar aplicación')}
              >
                {t('pwa.update.button', 'Actualizar')}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;