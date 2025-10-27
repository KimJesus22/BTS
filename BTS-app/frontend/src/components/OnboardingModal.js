import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../hooks/useOnboarding';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import OnboardingStep from './OnboardingStep';

const OnboardingModal = () => {
  const { t } = useTranslation();
  const {
    isActive,
    getCurrentStepData,
    nextStep,
    previousStep,
    skipOnboarding,
    hasNextStep,
    hasPreviousStep,
    progress,
    canSkip,
    getOptimizedSettings
  } = useOnboarding();

  const { getCurrentPalette } = useTheme();
  const { accessibilityMode } = useAccessibility();

  const modalRef = useRef(null);
  const settings = getOptimizedSettings();
  const currentStep = getCurrentStepData();
  const palette = getCurrentPalette();

  // Manejar navegación por teclado
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isActive) return;

      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          if (hasNextStep()) nextStep();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (hasPreviousStep()) previousStep();
          break;
        case 'Escape':
          event.preventDefault();
          if (canSkip) skipOnboarding();
          break;
        case 'Enter':
          event.preventDefault();
          if (hasNextStep()) nextStep();
          else skipOnboarding();
          break;
        default:
          break;
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isActive, hasNextStep, hasPreviousStep, nextStep, previousStep, skipOnboarding, canSkip]);

  // Auto-focus en el modal
  useEffect(() => {
    if (isActive && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isActive, currentStep.id]);

  // Variantes de animación optimizadas
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: (settings.animationsEnabled && !accessibilityMode) ? 0.8 : 1,
      y: (settings.animationsEnabled && !accessibilityMode) ? 20 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: accessibilityMode ? 0 : settings.animationDuration,
        ease: settings.animationEase
      }
    },
    exit: {
      opacity: 0,
      scale: (settings.animationsEnabled && !accessibilityMode) ? 0.9 : 1,
      y: (settings.animationsEnabled && !accessibilityMode) ? -10 : 0,
      transition: {
        duration: accessibilityMode ? 0 : settings.animationDuration * 0.8,
        ease: settings.animationEase
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: settings.animationDuration * 0.5 }
    },
    exit: {
      opacity: 0,
      transition: { duration: settings.animationDuration * 0.5 }
    }
  };

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="onboarding-overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: settings.layout === 'compact' ? '1rem' : '2rem'
        }}
      >
        <motion.div
          ref={modalRef}
          className="onboarding-modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
          aria-describedby="onboarding-description"
          style={{
            backgroundColor: palette.surfaceElevated,
            borderRadius: '12px',
            boxShadow: palette.shadow,
            maxWidth: settings.layout === 'compact' ? '90vw' : '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            outline: 'none'
          }}
        >
          {/* Barra de progreso */}
          <div
            className="onboarding-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: palette.borderLight,
              borderRadius: '12px 12px 0 0'
            }}
          >
            <motion.div
              className="onboarding-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: (settings.animationsEnabled && !accessibilityMode) ? 0.5 : 0,
                ease: settings.animationEase
              }}
              style={{
                height: '100%',
                backgroundColor: palette.primary,
                borderRadius: '12px 0 0 0'
              }}
            />
          </div>

          {/* Contenido del paso actual */}
          <OnboardingStep
            step={currentStep}
            onNext={nextStep}
            onPrevious={previousStep}
            onSkip={canSkip ? skipOnboarding : null}
            hasNext={hasNextStep()}
            hasPrevious={hasPreviousStep()}
            canSkip={canSkip}
            settings={settings}
          />

          {/* Instrucciones de navegación por teclado */}
          <div
            className="onboarding-keyboard-hints"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: palette.surface,
              borderTop: `1px solid ${palette.border}`,
              fontSize: '0.75rem',
              color: palette.textSecondary,
              textAlign: 'center'
            }}
          >
            {t('onboarding.keyboardHints', {
              next: hasNextStep() ? t('onboarding.next') : t('onboarding.finish'),
              previous: hasPreviousStep() ? t('onboarding.previous') : '',
              skip: canSkip ? t('onboarding.skip') : ''
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingModal;