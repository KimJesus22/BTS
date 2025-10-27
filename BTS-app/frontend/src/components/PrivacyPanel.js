// Componente de Panel de Privacidad
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import useUserAnalytics from '../hooks/useUserAnalytics';
import useUserPreferences from '../hooks/useUserPreferences';

const PrivacyPanel = () => {
  const { t } = useTranslation();
  const { animationsEnabled } = useAccessibility();
  const { analytics, clearAnalytics, getStats, setAnalyticsOptOut } = useUserAnalytics();
  const { preferences, resetPreferences } = useUserPreferences();

  const [showDataDetails, setShowDataDetails] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  // const [importData, setImportData] = useState(''); // Para futura implementación de importación
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Verificar permisos de notificación al montar
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Solicitar permiso de notificaciones
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // Exportar datos
  const handleExport = () => {
    const data = {
      analytics,
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    let content, filename, mimeType;

    if (exportFormat === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'bts-privacy-data.json';
      mimeType = 'application/json';
    } else {
      // CSV simplificado
      const csvData = [
        ['Tipo', 'Dato', 'Valor'],
        ['Preferencias', 'Idioma', preferences.language],
        ['Preferencias', 'Tema', preferences.theme],
        ['Analytics', 'Visitas Totales', getStats().totalVisits],
        ['Analytics', 'Miembros Más Visitados', getStats().mostVisitedMember || 'N/A'],
        ['Analytics', 'Búsquedas Recientes', analytics.searches.slice(0, 5).join('; ')],
      ];
      content = csvData.map(row => row.join(',')).join('\n');
      filename = 'bts-privacy-data.csv';
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportDialog(false);
  };

  // Importar datos (función preparada para futura implementación)
  // const handleImport = () => {
  //   try {
  //     const data = JSON.parse(importData);
  //     if (data.analytics) {
  //       // Aquí podríamos implementar la importación de analytics
  //       // Por simplicidad, solo importamos preferencias
  //     }
  //     if (data.preferences) {
  //       importPreferences(JSON.stringify(data.preferences));
  //       alert(t('privacy.importSuccess'));
  //     }
  //     setImportData('');
  //   } catch (error) {
  //     alert(t('privacy.importError'));
  //   }
  // };

  // Eliminar todos los datos (Right to be forgotten)
  const handleDeleteAllData = () => {
    if (window.confirm(t('privacy.confirmDelete'))) {
      clearAnalytics();
      resetPreferences();
      // Limpiar todos los datos relacionados con BTS
      const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('bts-'));
      keysToRemove.forEach(key => localStorage.removeItem(key));
      alert(t('privacy.deleteSuccess'));
      setShowDeleteDialog(false);
      // Recargar la página para reflejar los cambios
      window.location.reload();
    }
  };

  // Calcular tamaño de datos almacenados
  const calculateDataSize = () => {
    const data = JSON.stringify({ analytics, preferences });
    return (new Blob([data]).size / 1024).toFixed(2); // KB
  };

  return (
    <div className="privacy-panel" role="main" aria-labelledby="privacy-title">
      <h1 id="privacy-title" className="privacy-title">{t('privacy.title')}</h1>

      {/* Información general sobre privacidad */}
      <section className="privacy-section" aria-labelledby="data-info-title">
        <h2 id="data-info-title">{t('privacy.dataInfo.title')}</h2>
        <div className="data-info-grid">
          <div className="data-category">
            <h3>{t('privacy.dataInfo.analytics.title')}</h3>
            <ul>
              <li>{t('privacy.dataInfo.analytics.visits')}</li>
              <li>{t('privacy.dataInfo.analytics.searches')}</li>
              <li>{t('privacy.dataInfo.analytics.favorites')}</li>
              <li>{t('privacy.dataInfo.analytics.timeSpent')}</li>
            </ul>
          </div>
          <div className="data-category">
            <h3>{t('privacy.dataInfo.preferences.title')}</h3>
            <ul>
              <li>{t('privacy.dataInfo.preferences.language')}</li>
              <li>{t('privacy.dataInfo.preferences.theme')}</li>
              <li>{t('privacy.dataInfo.preferences.accessibility')}</li>
              <li>{t('privacy.dataInfo.preferences.voice')}</li>
            </ul>
          </div>
        </div>

        <motion.button
          onClick={() => setShowDataDetails(!showDataDetails)}
          className="toggle-details-btn"
          aria-expanded={showDataDetails}
          aria-controls="data-details"
          whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
          whileTap={animationsEnabled ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.1 }}
        >
          {showDataDetails ? t('privacy.hideDetails') : t('privacy.showDetails')}
        </motion.button>

        {showDataDetails && (
          <div id="data-details" className="data-details">
            <p><strong>{t('privacy.storageSize')}:</strong> {calculateDataSize()} KB</p>
            <p><strong>{t('privacy.lastActivity')}:</strong> {analytics.lastActivity ? new Date(analytics.lastActivity).toLocaleString() : t('privacy.never')}</p>
            <p><strong>{t('privacy.totalVisits')}:</strong> {getStats().totalVisits}</p>
            <p><strong>{t('privacy.recentSearches')}:</strong> {analytics.searches.slice(0, 3).join(', ') || t('privacy.none')}</p>
          </div>
        )}
      </section>

      {/* Controles de privacidad */}
      <section className="privacy-section" aria-labelledby="controls-title">
        <h2 id="controls-title">{t('privacy.controls.title')}</h2>

        {/* Opciones de opt-out */}
        <div className="opt-out-section">
          <h3>{t('privacy.controls.optOut.title')}</h3>
          <div className="opt-out-options">
            <motion.label
              className="checkbox-label"
              whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
              transition={{ duration: 0.1 }}
            >
              <motion.input
                type="checkbox"
                checked={analytics.optOut}
                onChange={(e) => setAnalyticsOptOut(e.target.checked)}
                whileTap={animationsEnabled ? { scale: 0.9 } : undefined}
                transition={{ duration: 0.1 }}
              />
              {t('privacy.controls.optOut.analytics')}
            </motion.label>
            <motion.label
              className="checkbox-label"
              whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
              transition={{ duration: 0.1 }}
            >
              <motion.input
                type="checkbox"
                checked={!preferences.voiceSearch}
                onChange={(e) => preferences.updatePreference('voiceSearch', !e.target.checked)}
                whileTap={animationsEnabled ? { scale: 0.9 } : undefined}
                transition={{ duration: 0.1 }}
              />
              {t('privacy.controls.optOut.voiceSearch')}
            </motion.label>
            <motion.label
              className="checkbox-label"
              whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
              transition={{ duration: 0.1 }}
            >
              <motion.input
                type="checkbox"
                checked={!preferences.searchHistory}
                onChange={(e) => preferences.updatePreference('searchHistory', !e.target.checked)}
                whileTap={animationsEnabled ? { scale: 0.9 } : undefined}
                transition={{ duration: 0.1 }}
              />
              {t('privacy.controls.optOut.searchHistory')}
            </motion.label>
          </div>
        </div>

        {/* Notificaciones sobre uso de micrófono */}
        <div className="microphone-notifications">
          <h3>{t('privacy.microphone.title')}</h3>
          <p>{t('privacy.microphone.description')}</p>
          {notificationPermission === 'default' && (
            <button onClick={requestNotificationPermission} className="notification-btn">
              {t('privacy.microphone.requestPermission')}
            </button>
          )}
          <p className="permission-status">
            {t('privacy.microphone.permissionStatus')}: <strong>{notificationPermission}</strong>
          </p>
        </div>

        {/* Transparencia de almacenamiento */}
        <div className="storage-transparency">
          <h3>{t('privacy.storage.title')}</h3>
          <div className="storage-info">
            <p>{t('privacy.storage.localStorage')}</p>
            <p>{t('privacy.storage.noServer')}</p>
            <p>{t('privacy.storage.encryption')}</p>
          </div>
        </div>
      </section>

      {/* Acciones de datos */}
      <section className="privacy-section" aria-labelledby="actions-title">
        <h2 id="actions-title">{t('privacy.actions.title')}</h2>

        <div className="action-buttons">
          <motion.button
            onClick={() => setShowExportDialog(true)}
            className="action-btn export-btn"
            aria-label={t('privacy.actions.export.ariaLabel')}
            whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#28a745' } : undefined}
            whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
            transition={{ duration: 0.1 }}
          >
            {t('privacy.actions.export.title')}
          </motion.button>

          <motion.button
            onClick={() => setShowDeleteDialog(true)}
            className="action-btn delete-btn"
            aria-label={t('privacy.actions.delete.ariaLabel')}
            whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#dc3545' } : undefined}
            whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
            transition={{ duration: 0.1 }}
          >
            {t('privacy.actions.delete.title')}
          </motion.button>
        </div>
      </section>

      {/* Diálogo de exportación */}
      {showExportDialog && (
        <div className="modal-overlay" role="dialog" aria-labelledby="export-title">
          <div className="modal-content">
            <h3 id="export-title">{t('privacy.export.title')}</h3>
            <div className="export-options">
              <label>
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                JSON ({t('privacy.export.jsonFormat')})
              </label>
              <label>
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                />
                CSV ({t('privacy.export.csvFormat')})
              </label>
            </div>
            <div className="modal-actions">
              <motion.button
                onClick={handleExport}
                className="confirm-btn"
                whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#28a745' } : undefined}
                whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.1 }}
              >
                {t('privacy.export.confirm')}
              </motion.button>
              <motion.button
                onClick={() => setShowExportDialog(false)}
                className="cancel-btn"
                whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#6c757d' } : undefined}
                whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.1 }}
              >
                {t('privacy.cancel')}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de eliminación */}
      {showDeleteDialog && (
        <div className="modal-overlay" role="dialog" aria-labelledby="delete-title">
          <div className="modal-content delete-modal">
            <h3 id="delete-title">{t('privacy.delete.title')}</h3>
            <p className="warning-text">{t('privacy.delete.warning')}</p>
            <ul className="delete-list">
              <li>{t('privacy.delete.list.analytics')}</li>
              <li>{t('privacy.delete.list.preferences')}</li>
              <li>{t('privacy.delete.list.favorites')}</li>
              <li>{t('privacy.delete.list.searchHistory')}</li>
            </ul>
            <p className="warning-text">{t('privacy.delete.irreversible')}</p>
            <div className="modal-actions">
              <motion.button
                onClick={handleDeleteAllData}
                className="delete-confirm-btn"
                whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#dc3545' } : undefined}
                whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.1 }}
              >
                {t('privacy.delete.confirm')}
              </motion.button>
              <motion.button
                onClick={() => setShowDeleteDialog(false)}
                className="cancel-btn"
                whileHover={animationsEnabled ? { scale: 1.05, backgroundColor: '#6c757d' } : undefined}
                whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.1 }}
              >
                {t('privacy.cancel')}
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Información de cumplimiento */}
      <section className="privacy-section compliance-info" aria-labelledby="compliance-title">
        <h2 id="compliance-title">{t('privacy.compliance.title')}</h2>
        <div className="compliance-badges">
          <span className="compliance-badge gdpr">{t('privacy.compliance.gdpr')}</span>
          <span className="compliance-badge ccpa">{t('privacy.compliance.ccpa')}</span>
          <span className="compliance-badge wcag">{t('privacy.compliance.wcag')}</span>
        </div>
        <p>{t('privacy.compliance.description')}</p>
      </section>
    </div>
  );
};

export default PrivacyPanel;