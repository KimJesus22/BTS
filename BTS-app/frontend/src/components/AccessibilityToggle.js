// Componente AccessibilityToggle: Botón flotante para activar/desactivar modo de accesibilidad completo
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';

const AccessibilityToggle = memo(() => {
  const { t } = useTranslation();
  const { accessibilityMode, toggleAccessibilityMode } = useAccessibility();

  return (
    <motion.button
      className={`accessibility-toggle ${accessibilityMode ? 'active' : ''}`}
      onClick={toggleAccessibilityMode}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleAccessibilityMode();
        }
      }}
      aria-label={accessibilityMode ? t('accessibility.disableMode') : t('accessibility.enableMode')}
      aria-checked={accessibilityMode}
      role="switch"
      tabIndex={0}
      whileHover={accessibilityMode ? {} : { scale: 1.1 }}
      whileTap={accessibilityMode ? {} : { scale: 0.9 }}
      transition={accessibilityMode ? { duration: 0 } : { duration: 0.2 }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: accessibilityMode ? '#007bff' : '#6c757d',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span id="accessibility-toggle" aria-hidden="true">♿</span>
    </motion.button>
  );
});

AccessibilityToggle.displayName = 'AccessibilityToggle';

export default AccessibilityToggle;