import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

const OnboardingStep = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  hasNext,
  hasPrevious,
  canSkip,
  settings
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const palette = getCurrentPalette();

  // Variantes de animación para el contenido
  const contentVariants = {
    hidden: {
      opacity: 0,
      y: settings.animationsEnabled ? 20 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: settings.animationDuration,
        ease: settings.animationEase
      }
    }
  };

  // Función para obtener el texto del botón principal
  const getPrimaryButtonText = () => {
    if (hasNext) {
      return t('onboarding.next');
    }
    return t('onboarding.finish');
  };

  // Función para manejar el clic en el botón principal
  const handlePrimaryClick = () => {
    if (hasNext) {
      onNext();
    } else {
      onSkip(); // En el último paso, skip completa el tutorial
    }
  };

  return (
    <motion.div
      className="onboarding-step"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      style={{
        padding: settings.layout === 'compact' ? '1.5rem 1rem' : '2rem 1.5rem',
        paddingTop: '2rem' // Espacio para la barra de progreso
      }}
    >
      {/* Título del paso */}
      <h2
        id="onboarding-title"
        style={{
          fontSize: settings.layout === 'compact' ? '1.25rem' : '1.5rem',
          fontWeight: '600',
          color: palette.text,
          margin: '0 0 0.5rem 0',
          textAlign: 'center'
        }}
      >
        {t(step.titleKey)}
      </h2>

      {/* Descripción del paso */}
      <p
        id="onboarding-description"
        style={{
          fontSize: settings.layout === 'compact' ? '0.875rem' : '1rem',
          color: palette.textSecondary,
          margin: '0 0 1.5rem 0',
          textAlign: 'center',
          lineHeight: '1.5'
        }}
      >
        {t(step.descriptionKey)}
      </p>

      {/* Contenido específico del paso (si es necesario) */}
      {step.id === 'gamification_intro' && (
        <div
          style={{
            backgroundColor: palette.surface,
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            border: `1px solid ${palette.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <span style={{ fontWeight: '500', color: palette.text }}>
              {t('gamification.points')}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: palette.textSecondary, margin: 0 }}>
            {t('onboarding.gamification.description')}
          </p>
        </div>
      )}

      {step.id === 'wearable_optimizations' && (
        <div
          style={{
            backgroundColor: palette.surface,
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            border: `1px solid ${palette.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📱</span>
            <span style={{ fontWeight: '500', color: palette.text }}>
              {t('onboarding.wearable.title')}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: palette.textSecondary, margin: 0 }}>
            {t('onboarding.wearable.description')}
          </p>
        </div>
      )}

      {step.id === 'pwa_offline' && (
        <div
          style={{
            backgroundColor: palette.surface,
            padding: '1rem',
            borderRadius: '8px',
            margin: '1rem 0',
            border: `1px solid ${palette.border}`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📶</span>
            <span style={{ fontWeight: '500', color: palette.text }}>
              {t('onboarding.pwa.title')}
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: palette.textSecondary, margin: 0 }}>
            {t('onboarding.pwa.description')}
          </p>
        </div>
      )}

      {/* Controles de navegación */}
      <div
        className="onboarding-controls"
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          marginTop: '1.5rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Botón anterior */}
        {hasPrevious && (
          <motion.button
            className="onboarding-btn onboarding-btn-secondary"
            onClick={onPrevious}
            whileHover={settings.animationsEnabled ? { scale: 1.05 } : {}}
            whileTap={settings.animationsEnabled ? { scale: 0.95 } : {}}
            style={{
              padding: `${settings.layout === 'compact' ? '0.5rem 1rem' : '0.75rem 1.5rem'}`,
              fontSize: settings.layout === 'compact' ? '0.875rem' : '1rem',
              backgroundColor: 'transparent',
              color: palette.primary,
              border: `1px solid ${palette.primary}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              minWidth: settings.touchTargetSize,
              minHeight: settings.touchTargetSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {t('onboarding.previous')}
          </motion.button>
        )}

        {/* Botón saltar */}
        {canSkip && (
          <motion.button
            className="onboarding-btn onboarding-btn-ghost"
            onClick={onSkip}
            whileHover={settings.animationsEnabled ? { scale: 1.05 } : {}}
            whileTap={settings.animationsEnabled ? { scale: 0.95 } : {}}
            style={{
              padding: `${settings.layout === 'compact' ? '0.5rem 1rem' : '0.75rem 1.5rem'}`,
              fontSize: settings.layout === 'compact' ? '0.875rem' : '1rem',
              backgroundColor: 'transparent',
              color: palette.textSecondary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              minWidth: settings.touchTargetSize,
              minHeight: settings.touchTargetSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'underline'
            }}
          >
            {t('onboarding.skip')}
          </motion.button>
        )}

        {/* Botón siguiente/finalizar */}
        <motion.button
          className="onboarding-btn onboarding-btn-primary"
          onClick={handlePrimaryClick}
          whileHover={settings.animationsEnabled ? { scale: 1.05 } : {}}
          whileTap={settings.animationsEnabled ? { scale: 0.95 } : {}}
          autoFocus
          style={{
            padding: `${settings.layout === 'compact' ? '0.5rem 1rem' : '0.75rem 1.5rem'}`,
            fontSize: settings.layout === 'compact' ? '0.875rem' : '1rem',
            backgroundColor: palette.primary,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            minWidth: settings.touchTargetSize,
            minHeight: settings.touchTargetSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getPrimaryButtonText()}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default OnboardingStep;