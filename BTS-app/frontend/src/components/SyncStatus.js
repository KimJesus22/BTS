import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBackgroundSync } from '../hooks/useBackgroundSync';
import { useTranslation } from 'react-i18next';
import './SyncStatus.css';

const SyncStatus = () => {
  const { syncStatus, lastSyncTime, pendingSyncs, manualSync } = useBackgroundSync();
  const { t } = useTranslation();

  const formatLastSyncTime = (date) => {
    if (!date) return t('sync.never', 'Nunca');

    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('sync.justNow', 'Ahora mismo');
    if (minutes < 60) return t('sync.minutesAgo', '{{count}} min atrás', { count: minutes });
    if (hours < 24) return t('sync.hoursAgo', '{{count}} h atrás', { count: hours });
    return t('sync.daysAgo', '{{count}} días atrás', { count: days });
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v4m0 12v4m10-10h-4m-12 0H2m15.364 6.364l-2.828-2.828m-8.484 0L3.636 7.636m12.728 12.728l-2.828-2.828M7.05 16.95L4.222 14.122" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
          </svg>
        );
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'var(--theme-primary, #1a73e8)';
      case 'success': return 'var(--theme-success, #34a853)';
      case 'error': return 'var(--theme-error, #ea4335)';
      default: return 'var(--theme-textMuted, #80868b)';
    }
  };

  return (
    <AnimatePresence>
      {(syncStatus !== 'idle' || pendingSyncs > 0) && (
        <motion.div
          className="sync-status"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="sync-content">
            <div
              className={`sync-icon ${syncStatus === 'syncing' ? 'spinning' : ''}`}
              style={{ color: getStatusColor() }}
            >
              {getStatusIcon()}
            </div>

            <div className="sync-info">
              <div className="sync-title">
                {syncStatus === 'syncing' && t('sync.syncing', 'Sincronizando...')}
                {syncStatus === 'success' && t('sync.success', 'Sincronización exitosa')}
                {syncStatus === 'error' && t('sync.error', 'Error de sincronización')}
                {syncStatus === 'idle' && pendingSyncs > 0 && t('sync.pending', 'Sincronización pendiente')}
              </div>

              <div className="sync-details">
                {lastSyncTime && (
                  <span className="sync-time">
                    {t('sync.lastSync', 'Última:')} {formatLastSyncTime(lastSyncTime)}
                  </span>
                )}
                {pendingSyncs > 0 && (
                  <span className="sync-pending">
                    {t('sync.pendingCount', '{{count}} pendiente', { count: pendingSyncs })}
                  </span>
                )}
              </div>
            </div>

            {syncStatus === 'error' && (
              <button
                onClick={manualSync}
                className="sync-retry-button"
                aria-label={t('sync.retry', 'Reintentar sincronización')}
              >
                {t('sync.retry', 'Reintentar')}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyncStatus;