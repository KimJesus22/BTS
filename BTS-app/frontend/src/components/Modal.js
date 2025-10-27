import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';

// Componente Modal molecular reutilizable
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closable = true,
  maskClosable = true,
  centered = true,
  destroyOnClose = false,
  zIndex = 1000,
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();
  const modalRef = useRef(null);

  // Configuraciones de tamaño
  const sizes = {
    xs: {
      maxWidth: '300px',
      width: '90vw'
    },
    sm: {
      maxWidth: '400px',
      width: '90vw'
    },
    md: {
      maxWidth: '500px',
      width: '90vw'
    },
    lg: {
      maxWidth: '700px',
      width: '90vw'
    },
    xl: {
      maxWidth: '900px',
      width: '95vw'
    },
    full: {
      maxWidth: '100vw',
      width: '100vw',
      height: '100vh',
      margin: 0
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    maxWidth: '95vw',
    width: '95vw',
    padding: DESIGN_TOKENS.spacing[3]
  } : {};

  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Variantes de animación
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: animationSettings.ease
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: animationSettings.ease
      }
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.8 : 1,
      y: animationsEnabled && !reducedAnimations ? 20 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: animationSettings.ease,
        delay: animationsEnabled && !reducedAnimations ? 0.1 : 0
      }
    },
    exit: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.9 : 1,
      y: animationsEnabled && !reducedAnimations ? -10 : 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: animationSettings.ease
      }
    }
  };

  // Manejar escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && closable && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closable, onClose]);

  // Auto-focus en el modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Manejar clic en el overlay
  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget && maskClosable) {
      onClose();
    }
  };

  // Si no está abierto y destroyOnClose es true, no renderizar
  if (!isOpen && destroyOnClose) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-overlay ${className}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: centered ? 'center' : 'flex-start',
            justifyContent: 'center',
            padding: wearableAdjustments.padding || DESIGN_TOKENS.spacing[4],
            zIndex: zIndex,
            ...style
          }}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleOverlayClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby="modal-content"
        >
          <motion.div
            ref={modalRef}
            className="modal-content"
            style={{
              backgroundColor: palette.surfaceElevated,
              borderRadius: DESIGN_TOKENS.borderRadius.xl,
              boxShadow: DESIGN_TOKENS.shadows.xl,
              ...currentSize,
              maxHeight: size === 'full' ? '100vh' : '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              outline: 'none'
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            tabIndex={-1}
          >
            {/* Header del modal */}
            {(title || closable) && (
              <div
                className="modal-header"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[5]}`,
                  borderBottom: `1px solid ${palette.borderLight}`,
                  flexShrink: 0
                }}
              >
                {title && (
                  <h2
                    id="modal-title"
                    style={{
                      margin: 0,
                      fontSize: DESIGN_TOKENS.typography.fontSize.xl,
                      fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                      color: palette.text,
                      lineHeight: DESIGN_TOKENS.typography.lineHeight.snug
                    }}
                  >
                    {title}
                  </h2>
                )}
                {closable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    aria-label={t('modal.close', 'Cerrar modal')}
                    style={{
                      padding: DESIGN_TOKENS.spacing[1],
                      minHeight: 'auto',
                      width: 'auto'
                    }}
                  >
                    <Icon name="close" size="sm" />
                  </Button>
                )}
              </div>
            )}

            {/* Contenido del modal */}
            <div
              id="modal-content"
              className="modal-body"
              style={{
                padding: `${DESIGN_TOKENS.spacing[5]} ${DESIGN_TOKENS.spacing[5]}`,
                flex: 1,
                overflow: 'auto',
                color: palette.text,
                lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
              }}
            >
              {children}
            </div>

            {/* Footer del modal */}
            {footer && (
              <div
                className="modal-footer"
                style={{
                  padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[5]}`,
                  borderTop: `1px solid ${palette.borderLight}`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: DESIGN_TOKENS.spacing[3],
                  flexShrink: 0
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;