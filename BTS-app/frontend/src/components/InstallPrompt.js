import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePWA } from '../hooks/usePWA';
import { useTranslation } from 'react-i18next';
import './InstallPrompt.css';

const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya ha visto el prompt antes
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (isInstallable && !isInstalled && !isDismissed) {
      // Mostrar el prompt después de un pequeño delay
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, isDismissed]);

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setIsVisible(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('install-prompt-dismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="install-overlay"
            onClick={handleDismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="install-modal"
            role="dialog"
            aria-labelledby="install-title"
            aria-describedby="install-description"
          >
            <div className="install-content">
              <div className="install-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" fill="var(--theme-primary, #1a73e8)"/>
                </svg>
              </div>

              <div className="install-text">
                <h3 id="install-title" className="install-title">
                  {t('pwa.install.title', 'Instalar BTS Members')}
                </h3>
                <p id="install-description" className="install-description">
                  {t('pwa.install.description', 'Instala la aplicación para acceder más rápido y disfrutar de una experiencia completa offline.')}
                </p>
              </div>

              <div className="install-features">
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="var(--theme-success, #34a853)"/>
                  </svg>
                  <span>{t('pwa.install.feature1', 'Acceso rápido desde el escritorio')}</span>
                </div>
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="var(--theme-success, #34a853)"/>
                  </svg>
                  <span>{t('pwa.install.feature2', 'Funciona sin conexión a internet')}</span>
                </div>
                <div className="feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="var(--theme-success, #34a853)"/>
                  </svg>
                  <span>{t('pwa.install.feature3', 'Notificaciones push')}</span>
                </div>
              </div>

              <div className="install-actions">
                <button
                  onClick={handleDismiss}
                  className="install-button secondary"
                  aria-label={t('pwa.install.cancel', 'Cancelar instalación')}
                >
                  {t('pwa.install.cancel', 'Ahora no')}
                </button>
                <button
                  onClick={handleInstall}
                  className="install-button primary"
                  aria-label={t('pwa.install.confirm', 'Instalar aplicación')}
                >
                  {t('pwa.install.confirm', 'Instalar')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;