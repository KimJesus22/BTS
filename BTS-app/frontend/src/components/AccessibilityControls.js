// Componente de Controles de Accesibilidad según WCAG 2.1
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTheme } from '../contexts/ThemeContext';

const AccessibilityControls = () => {
  const { t } = useTranslation();
  const { fontSize, colorPalette, language, animationsEnabled, preferredTheme, changeFontSize, changeColorPalette, changeLanguage, toggleAnimations, changePreferredTheme } = useAccessibility();
  const { changeTheme } = useTheme();

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
    <motion.div
      className="accessibility-controls"
      role="region"
      aria-label={t('accessibility.controls')}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h3
        className="accessibility-title"
        id="accessibility-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        {t('accessibility.controls')}
      </motion.h3>

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
          <motion.button
            onClick={() => handleQuickFontSize(12)}
            className="quick-btn"
            aria-label={t('accessibility.smallFont')}
            whileHover={{ scale: 1.1, backgroundColor: '#e9ecef' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            A-
          </motion.button>
          <motion.button
            onClick={() => handleQuickFontSize(16)}
            className="quick-btn"
            aria-label={t('accessibility.normalFont')}
            whileHover={{ scale: 1.1, backgroundColor: '#e9ecef' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            A
          </motion.button>
          <motion.button
            onClick={() => handleQuickFontSize(20)}
            className="quick-btn"
            aria-label={t('accessibility.largeFont')}
            whileHover={{ scale: 1.1, backgroundColor: '#e9ecef' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            A+
          </motion.button>
          <motion.button
            onClick={() => handleQuickFontSize(24)}
            className="quick-btn"
            aria-label={t('accessibility.extraLargeFont')}
            whileHover={{ scale: 1.1, backgroundColor: '#e9ecef' }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.1 }}
          >
            A++
          </motion.button>
        </div>
      </div>

      {/* Controles de Tema */}
      <div className="theme-controls" role="group" aria-labelledby="theme-title">
        <h4 id="theme-title" className="sr-only">{t('theme.title')}</h4>
        <label className="control-label">{t('theme.title')}:</label>
        <div className="theme-buttons" role="radiogroup" aria-label={t('theme.selectTheme')}>
          <motion.button
            onClick={() => {
              changePreferredTheme('auto');
              changeTheme('auto');
            }}
            className={`theme-btn ${preferredTheme === 'auto' ? 'active' : ''}`}
            aria-label={t('theme.autoMode')}
            role="radio"
            aria-checked={preferredTheme === 'auto'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('theme.auto')}
          </motion.button>
          <motion.button
            onClick={() => {
              changePreferredTheme('light');
              changeTheme('light');
            }}
            className={`theme-btn ${preferredTheme === 'light' ? 'active' : ''}`}
            aria-label={t('theme.lightMode')}
            role="radio"
            aria-checked={preferredTheme === 'light'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('theme.light')}
          </motion.button>
          <motion.button
            onClick={() => {
              changePreferredTheme('dark');
              changeTheme('dark');
            }}
            className={`theme-btn ${preferredTheme === 'dark' ? 'active' : ''}`}
            aria-label={t('theme.darkMode')}
            role="radio"
            aria-checked={preferredTheme === 'dark'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('theme.dark')}
          </motion.button>
          <motion.button
            onClick={() => {
              changePreferredTheme('highContrast');
              changeTheme('highContrast');
            }}
            className={`theme-btn ${preferredTheme === 'highContrast' ? 'active' : ''}`}
            aria-label={t('theme.highContrastMode')}
            role="radio"
            aria-checked={preferredTheme === 'highContrast'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('theme.highContrast')}
          </motion.button>
          <motion.button
            onClick={() => {
              changePreferredTheme('sepia');
              changeTheme('sepia');
            }}
            className={`theme-btn ${preferredTheme === 'sepia' ? 'active' : ''}`}
            aria-label={t('theme.sepiaMode')}
            role="radio"
            aria-checked={preferredTheme === 'sepia'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('theme.sepia')}
          </motion.button>
        </div>
      </div>

      {/* Controles de Paleta de Colores */}
      <div className="color-palette-controls" role="group" aria-labelledby="palette-title">
        <h4 id="palette-title" className="sr-only">{t('accessibility.colorPalette')}</h4>
        <label className="control-label">{t('accessibility.colorPalette')}:</label>
        <div className="palette-buttons" role="radiogroup" aria-label={t('accessibility.selectPalette')}>
          <motion.button
            onClick={() => handlePaletteChange('normal')}
            className={`palette-btn ${colorPalette === 'normal' ? 'active' : ''}`}
            aria-label={t('accessibility.normalPalette')}
            role="radio"
            aria-checked={colorPalette === 'normal'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.normal')}
          </motion.button>
          <motion.button
            onClick={() => handlePaletteChange('deuteranopia')}
            className={`palette-btn ${colorPalette === 'deuteranopia' ? 'active' : ''}`}
            aria-label={t('accessibility.deuteranopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'deuteranopia'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.deuteranopia')}
          </motion.button>
          <motion.button
            onClick={() => handlePaletteChange('protanopia')}
            className={`palette-btn ${colorPalette === 'protanopia' ? 'active' : ''}`}
            aria-label={t('accessibility.protanopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'protanopia'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.protanopia')}
          </motion.button>
          <motion.button
            onClick={() => handlePaletteChange('tritanopia')}
            className={`palette-btn ${colorPalette === 'tritanopia' ? 'active' : ''}`}
            aria-label={t('accessibility.tritanopiaPalette')}
            role="radio"
            aria-checked={colorPalette === 'tritanopia'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.tritanopia')}
          </motion.button>
        </div>
      </div>

      {/* Controles de Idioma */}
      <div className="language-controls" role="group" aria-labelledby="language-title">
        <h4 id="language-title" className="sr-only">{t('accessibility.language')}</h4>
        <label className="control-label">{t('accessibility.language')}:</label>
        <div className="language-buttons" role="radiogroup" aria-label={t('accessibility.selectLanguage')}>
          <motion.button
            onClick={() => handleLanguageChange('es')}
            className={`language-btn ${language === 'es' ? 'active' : ''}`}
            aria-label={t('accessibility.spanish')}
            role="radio"
            aria-checked={language === 'es'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.spanish')}
          </motion.button>
          <motion.button
            onClick={() => handleLanguageChange('en')}
            className={`language-btn ${language === 'en' ? 'active' : ''}`}
            aria-label={t('accessibility.english')}
            role="radio"
            aria-checked={language === 'en'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            {t('accessibility.english')}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccessibilityControls;