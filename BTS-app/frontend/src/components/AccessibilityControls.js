// Componente de Controles de Accesibilidad según WCAG 2.1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityControls = () => {
  const { t } = useTranslation();
  const { fontSize, colorPalette, language, changeFontSize, changeColorPalette, changeLanguage } = useAccessibility();

  // Función para manejar cambios en el slider
  const handleFontSizeChange = (e) => {
    changeFontSize(parseInt(e.target.value, 10));
  };

  // Función para manejar botones rápidos de tamaño de fuente
  const handleQuickFontSize = (size) => {
    changeFontSize(size);
  };

  // Función para manejar cambios en la paleta de colores
  const handlePaletteChange = (palette) => {
    changeColorPalette(palette);
  };

  // Función para manejar cambios de idioma
  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  return (
    <div className="accessibility-controls" role="region" aria-label={t('accessibility.controls')}>
      <h3 className="accessibility-title" id="accessibility-title">{t('accessibility.controls')}</h3>

      {/* Controles de Tamaño de Fuente */}
      <div className="font-size-controls" role="group" aria-labelledby="font-size-title">
        <h4 id="font-size-title" className="sr-only">{t('accessibility.controls')}</h4>
        <label htmlFor="font-size-slider" className="control-label">
          {t('accessibility.fontSize')}: {fontSize}px
        </label>
        <input
          id="font-size-slider"
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={handleFontSizeChange}
          className="font-size-slider"
          aria-describedby="font-size-description"
          aria-valuemin="12"
          aria-valuemax="24"
          aria-valuenow={fontSize}
          aria-valuetext={`${fontSize}px`}
        />
        <div id="font-size-description" className="sr-only">
          {t('accessibility.fontSizeDescription')}
        </div>

        {/* Botones rápidos */}
        <div className="quick-buttons" role="group" aria-label={t('accessibility.quickButtons')}>
          <button
            onClick={() => handleQuickFontSize(12)}
            className="quick-btn"
            aria-label={t('accessibility.smallFont')}
          >
            A-
          </button>
          <button
            onClick={() => handleQuickFontSize(16)}
            className="quick-btn"
            aria-label={t('accessibility.normalFont')}
          >
            A
          </button>
          <button
            onClick={() => handleQuickFontSize(20)}
            className="quick-btn"
            aria-label={t('accessibility.largeFont')}
          >
            A+
          </button>
          <button
            onClick={() => handleQuickFontSize(24)}
            className="quick-btn"
            aria-label={t('accessibility.extraLargeFont')}
          >
            A++
          </button>
        </div>
      </div>

      {/* Controles de Paleta de Colores */}
      <div className="color-palette-controls" role="group" aria-labelledby="palette-title">
        <h4 id="palette-title" className="sr-only">{t('accessibility.colorPalette')}</h4>
        <label className="control-label">{t('accessibility.colorPalette')}:</label>
        <div className="palette-buttons" role="radiogroup" aria-label={t('accessibility.selectPalette')}>
          <button
            onClick={() => handlePaletteChange('normal')}
            className={`palette-btn ${colorPalette === 'normal' ? 'active' : ''}`}
            aria-label={t('accessibility.normalPalette')}
            role="radio"
            aria-checked={colorPalette === 'normal'}
          >
            {t('accessibility.normal')}
          </button>
          <button
            onClick={() => handlePaletteChange('deuteranopia')}
            className={`palette-btn ${colorPalette === 'deuteranopia' ? 'active' : ''}`}
            aria-label={t('accessibility.deuteranopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'deuteranopia'}
          >
            {t('accessibility.deuteranopia')}
          </button>
          <button
            onClick={() => handlePaletteChange('protanopia')}
            className={`palette-btn ${colorPalette === 'protanopia' ? 'active' : ''}`}
            aria-label={t('accessibility.protanopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'protanopia'}
          >
            {t('accessibility.protanopia')}
          </button>
          <button
            onClick={() => handlePaletteChange('tritanopia')}
            className={`palette-btn ${colorPalette === 'tritanopia' ? 'active' : ''}`}
            aria-label={t('accessibility.tritanopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'tritanopia'}
          >
            {t('accessibility.tritanopia')}
          </button>
        </div>
      </div>

      {/* Controles de Idioma */}
      <div className="language-controls" role="group" aria-labelledby="language-title">
        <h4 id="language-title" className="sr-only">{t('accessibility.language')}</h4>
        <label className="control-label">{t('accessibility.language')}:</label>
        <div className="language-buttons" role="radiogroup" aria-label={t('accessibility.selectLanguage')}>
          <button
            onClick={() => handleLanguageChange('es')}
            className={`language-btn ${language === 'es' ? 'active' : ''}`}
            aria-label={t('accessibility.spanish')}
            role="radio"
            aria-checked={language === 'es'}
          >
            {t('accessibility.spanish')}
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`language-btn ${language === 'en' ? 'active' : ''}`}
            aria-label={t('accessibility.english')}
            role="radio"
            aria-checked={language === 'en'}
          >
            {t('accessibility.english')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityControls;