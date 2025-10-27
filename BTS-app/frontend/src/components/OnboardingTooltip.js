import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../hooks/useOnboarding';
import { useTheme } from '../contexts/ThemeContext';

const OnboardingTooltip = ({ step, onNext, onPrevious, onSkip, settings }) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const palette = getCurrentPalette();

  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0, arrowPosition: 'top' });
  const [isVisible, setIsVisible] = useState(false);

  // Calcular posición del tooltip basada en el elemento objetivo
  useEffect(() => {
    if (!step.target) return;

    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 300; // Ancho aproximado del tooltip
      const tooltipHeight = 150; // Alto aproximado del tooltip
      const arrowSize = 8;

      let top = 0;
      let left = 0;
      let arrowPosition = step.position || 'top';

      switch (step.position) {
        case 'top':
          top = rect.top - tooltipHeight - arrowSize;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'bottom':
          top = rect.bottom + arrowSize;
          left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
          break;
        case 'left':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.left - tooltipWidth - arrowSize;
          break;
        case 'right':
          top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
          left = rect.right + arrowSize;
          break;
        default:
          // Centro de la pantalla para modales
          top = window.innerHeight / 2 - tooltipHeight / 2;
          left = window.innerWidth / 2 - tooltipWidth / 2;
          arrowPosition = 'center';
      }

      // Ajustar para mantener dentro de los límites de la pantalla
      const margin = 10;
      left = Math.max(margin, Math.min(left, window.innerWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, window.innerHeight - tooltipHeight - margin));

      setPosition({ top, left, arrowPosition });
      setIsVisible(true);
    };

    // Pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(updatePosition, 100);

    // Listener para cambios de tamaño de ventana
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updatePosition);
    };
  }, [step.target, step.position]);

  // Variantes de animación
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: settings.animationsEnabled ? 0.8 : 1,
      y: settings.animationsEnabled ? 10 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: settings.animationDuration,
        ease: settings.animationEase
      }
    },
    exit: {
      opacity: 0,
      scale: settings.animationsEnabled ? 0.9 : 1,
      y: settings.animationsEnabled ? -5 : 0,
      transition: {
        duration: settings.animationDuration * 0.8,
        ease: settings.animationEase
      }
    }
  };

  // Función para renderizar la flecha
  const renderArrow = () => {
    const arrowStyle = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };

    switch (position.arrowPosition) {
      case 'top':
        return (
          <div
            style={{
              ...arrowStyle,
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '8px 8px 0 8px',
              borderColor: `${palette.surfaceElevated} transparent transparent transparent`
            }}
          />
        );
      case 'bottom':
        return (
          <div
            style={{
              ...arrowStyle,
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              borderWidth: '0 8px 8px 8px',
              borderColor: `transparent transparent ${palette.surfaceElevated} transparent`
            }}
          />
        );
      case 'left':
        return (
          <div
            style={{
              ...arrowStyle,
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '8px 0 8px 8px',
              borderColor: `transparent transparent transparent ${palette.surfaceElevated}`
            }}
          />
        );
      case 'right':
        return (
          <div
            style={{
              ...arrowStyle,
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderWidth: '8px 8px 8px 0',
              borderColor: `transparent ${palette.surfaceElevated} transparent transparent`
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          className="onboarding-tooltip"
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 10000,
            backgroundColor: palette.surfaceElevated,
            borderRadius: '8px',
            boxShadow: palette.shadow,
            border: `1px solid ${palette.border}`,
            maxWidth: settings.layout === 'compact' ? '280px' : '320px',
            padding: settings.layout === 'compact' ? '1rem' : '1.25rem',
            pointerEvents: 'auto'
          }}
        >
          {/* Flecha del tooltip */}
          {renderArrow()}

          {/* Título */}
          <h3
            style={{
              fontSize: settings.layout === 'compact' ? '1rem' : '1.125rem',
              fontWeight: '600',
              color: palette.text,
              margin: '0 0 0.5rem 0'
            }}
          >
            {t(step.titleKey)}
          </h3>

          {/* Descripción */}
          <p
            style={{
              fontSize: settings.layout === 'compact' ? '0.875rem' : '1rem',
              color: palette.textSecondary,
              margin: '0 0 1rem 0',
              lineHeight: '1.4'
            }}
          >
            {t(step.descriptionKey)}
          </p>

          {/* Controles */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}
          >
            {onPrevious && (
              <button
                onClick={onPrevious}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  color: palette.primary,
                  border: `1px solid ${palette.primary}`,
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t('onboarding.previous')}
              </button>
            )}

            {onSkip && (
              <button
                onClick={onSkip}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  color: palette.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {t('onboarding.skip')}
              </button>
            )}

            <button
              onClick={onNext}
              autoFocus
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                backgroundColor: palette.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              {t('onboarding.next')}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTooltip;