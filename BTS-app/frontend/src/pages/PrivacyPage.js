// Página de Privacidad y Gestión de Datos
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useUserAnalytics from '../hooks/useUserAnalytics';
import useUserPreferences from '../hooks/useUserPreferences';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const PrivacyPage = () => {
  const { t } = useTranslation();
  const { analytics, clearAnalytics, getStats } = useUserAnalytics();
  const { preferences, resetPreferences, exportPreferences } = useUserPreferences();
  const { hasPermission, requestPermission } = useSpeechRecognition();

  const [showDataViewer, setShowDataViewer] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const stats = getStats();

  // Función para exportar datos
  const handleExportData = () => {
    const data = {
      analytics,
      preferences,
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      exportFormat: exportFormat
    };

    const filename = `bts-app-data-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Función para eliminar todos los datos
  const handleDeleteAllData = () => {
    if (confirmDelete) {
      clearAnalytics();
      resetPreferences();
      localStorage.clear();
      setConfirmDelete(false);
      alert(t('privacy.deleteSuccess'));
    } else {
      setConfirmDelete(true);
    }
  };

  // Función para manejar permisos de micrófono
  const handleMicrophonePermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert(t('privacy.microphoneGranted'));
    } else {
      alert(t('privacy.microphoneDenied'));
    }
  };

  return (
    <div className="privacy-page container py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h2 mb-0">{t('privacy.title')}</h1>
            <Link to="/" className="btn btn-outline-primary">
              ← {t('navigation.backToList')}
            </Link>
          </div>

          {/* Información General */}
          <div className="card mb-4">
            <div className="card-header">
              <h2 className="h5 mb-0">{t('privacy.generalInfo')}</h2>
            </div>
            <div className="card-body">
              <p className="mb-3">{t('privacy.description')}</p>
              <div className="alert alert-info">
                <strong>🔒 {t('privacy.securityNote')}</strong>
                <p className="mb-0">{t('privacy.localStorageOnly')}</p>
              </div>
            </div>
          </div>

          {/* Datos Almacenados */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h2 className="h5 mb-0">{t('privacy.storedData')}</h2>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowDataViewer(!showDataViewer)}
                aria-expanded={showDataViewer}
              >
                {showDataViewer ? t('privacy.hideData') : t('privacy.viewData')}
              </button>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.analyticsData')}</h3>
                  <ul className="list-unstyled">
                    <li>📊 {t('privacy.visits')}: {stats.totalVisits}</li>
                    <li>⭐ {t('privacy.favorites')}: {analytics.favorites?.length || 0}</li>
                    <li>🔍 {t('privacy.searches')}: {analytics.searches?.length || 0}</li>
                    <li>⏱️ {t('privacy.timeSpent')}: {Math.round(stats.totalTimeSpent / 60)} min</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.preferencesData')}</h3>
                  <ul className="list-unstyled">
                    <li>🌐 {t('privacy.language')}: {preferences.language === 'es' ? 'Español' : 'English'}</li>
                    <li>🎨 {t('privacy.theme')}: {preferences.theme}</li>
                    <li>🔊 {t('privacy.voice')}: {preferences.autoPlayVoice ? t('common.enabled') : t('common.disabled')}</li>
                    <li>🤖 {t('privacy.recommendations')}: {preferences.showRecommendations ? t('common.enabled') : t('common.disabled')}</li>
                  </ul>
                </div>
              </div>

              {showDataViewer && (
                <div className="mt-3">
                  <h4 className="h6">{t('privacy.rawData')}</h4>
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0" style={{ fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto' }}>
                      {JSON.stringify({ analytics, preferences }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controles de Privacidad */}
          <div className="card mb-4">
            <div className="card-header">
              <h2 className="h5 mb-0">{t('privacy.privacyControls')}</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.dataControls')}</h3>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-primary"
                      onClick={handleExportData}
                    >
                      📥 {t('privacy.exportData')}
                    </button>
                    <div className="input-group">
                      <label className="input-group-text" htmlFor="exportFormat">
                        {t('privacy.format')}:
                      </label>
                      <select
                        id="exportFormat"
                        className="form-select"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                      >
                        <option value="json">JSON</option>
                        <option value="csv">CSV</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.deletionControls')}</h3>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => resetPreferences()}
                    >
                      🔄 {t('privacy.resetPreferences')}
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      onClick={handleDeleteAllData}
                    >
                      🗑️ {confirmDelete ? t('privacy.confirmDelete') : t('privacy.deleteAllData')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Permisos y Acceso */}
          <div className="card mb-4">
            <div className="card-header">
              <h2 className="h5 mb-0">{t('privacy.permissions')}</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.microphoneAccess')}</h3>
                  <p className="text-muted small mb-2">{t('privacy.microphoneDescription')}</p>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge ${hasPermission ? 'bg-success' : 'bg-warning'}`}>
                      {hasPermission ? '✅' : '⚠️'} {hasPermission ? t('privacy.granted') : t('privacy.denied')}
                    </span>
                    {!hasPermission && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleMicrophonePermission}
                      >
                        {t('privacy.requestPermission')}
                      </button>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.dataSharing')}</h3>
                  <p className="text-muted small">{t('privacy.noDataSharing')}</p>
                  <div className="alert alert-success">
                    <strong>🔒 {t('privacy.privacyGuarantee')}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Legal */}
          <div className="card">
            <div className="card-header">
              <h2 className="h5 mb-0">{t('privacy.legalInfo')}</h2>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.gdprCompliance')}</h3>
                  <ul className="list-unstyled">
                    <li>✅ {t('privacy.rightToAccess')}</li>
                    <li>✅ {t('privacy.rightToRectification')}</li>
                    <li>✅ {t('privacy.rightToErasure')}</li>
                    <li>✅ {t('privacy.rightToDataPortability')}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h3 className="h6">{t('privacy.contact')}</h3>
                  <p className="text-muted small">{t('privacy.contactDescription')}</p>
                  <p className="mb-0">
                    <strong>{t('privacy.lastUpdated')}:</strong> {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;