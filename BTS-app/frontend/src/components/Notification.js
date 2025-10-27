import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Icon from './Icon';
import Button from './Button';

// Componente Notification molecular reutilizable
const Notification = ({
  type = 'info',
  title,
  message,
  duration = 5000,
  closable = true,
  onClose,
  action,
  placement = 'top-right',
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  // Configuraciones de tipo
  const types = {
    success: {
      icon: 'check',
      color: palette.success,
      backgroundColor: `${palette.success}10`,
      borderColor: palette.success
    },
    error: {
      icon: 'error',
      color: palette.error,
      backgroundColor: `${palette.error}10`,
      borderColor: palette.error
    },
    warning: {
      icon: 'warning',
      color: palette.warning,
      backgroundColor: `${palette.warning}10`,
      borderColor: palette.warning
    },
    info: {
      icon: 'info',
      color: palette.info,
      backgroundColor: `${palette.info}10`,
      borderColor: palette.info
    }
  };

  const currentType = types[type] || types.info;

  // Auto-cerrar después de duration
  useEffect(() => {
    if (duration > 0 && isVisible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      const timeout = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [duration, isVisible]);

  // Manejar cierre
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, animationsEnabled && !reducedAnimations ? 300 : 0);
  };

  // Variantes de animación
  const notificationVariants = {
    hidden: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.8 : 1,
      x: placement.includes('right') ? 20 : placement.includes('left') ? -20 : 0,
      y: placement.includes('top') ? -20 : placement.includes('bottom') ? 20 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.9 : 1,
      x: placement.includes('right') ? 20 : placement.includes('left') ? -20 : 0,
      y: placement.includes('top') ? -20 : placement.includes('bottom') ? 20 : 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: "easeIn"
      }
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    padding: DESIGN_TOKENS.spacing[3],
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    maxWidth: '90vw'
  } : {};

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`notification notification-${type} ${className}`}
        style={{
          backgroundColor: currentType.backgroundColor,
          border: `1px solid ${currentType.borderColor}`,
          borderRadius: DESIGN_TOKENS.borderRadius.lg,
          boxShadow: DESIGN_TOKENS.shadows.lg,
          padding: wearableAdjustments.padding || DESIGN_TOKENS.spacing[4],
          maxWidth: wearableAdjustments.maxWidth || '400px',
          minWidth: '300px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
          ...style
        }}
        variants={notificationVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="alert"
        aria-live="assertive"
        {...props}
      >
        {/* Barra de progreso */}
        {duration > 0 && (
          <motion.div
            className="notification-progress"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: currentType.color,
              transformOrigin: 'left'
            }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.1 }}
          />
        )}

        {/* Contenido */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: DESIGN_TOKENS.spacing[3] }}>
          {/* Icono */}
          <div
            style={{
              flexShrink: 0,
              color: currentType.color,
              fontSize: wearableAdjustments.fontSize || DESIGN_TOKENS.typography.fontSize.lg,
              marginTop: '2px'
            }}
          >
            <Icon name={currentType.icon} size="lg" color={currentType.color} />
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <div
                className="notification-title"
                style={{
                  fontSize: wearableAdjustments.fontSize || DESIGN_TOKENS.typography.fontSize.base,
                  fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                  color: palette.text,
                  marginBottom: title ? DESIGN_TOKENS.spacing[1] : 0,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.snug
                }}
              >
                {title}
              </div>
            )}
            {message && (
              <div
                className="notification-message"
                style={{
                  fontSize: wearableAdjustments.fontSize || DESIGN_TOKENS.typography.fontSize.sm,
                  color: palette.textSecondary,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
                }}
              >
                {message}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[2], flexShrink: 0 }}>
            {action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
                style={{
                  padding: DESIGN_TOKENS.spacing[1],
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                  minHeight: 'auto'
                }}
              >
                {action.label}
              </Button>
            )}
            {closable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                aria-label={t('notification.close', 'Cerrar notificación')}
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
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente contenedor para múltiples notificaciones
export const NotificationContainer = ({
  notifications = [],
  placement = 'top-right',
  onRemove,
  className = '',
  style = {}
}) => {
  const { isWearable } = useWearableOptimizations();

  // Estilos de posicionamiento
  const placementStyles = {
    'top-right': {
      top: DESIGN_TOKENS.spacing[4],
      right: DESIGN_TOKENS.spacing[4]
    },
    'top-left': {
      top: DESIGN_TOKENS.spacing[4],
      left: DESIGN_TOKENS.spacing[4]
    },
    'bottom-right': {
      bottom: DESIGN_TOKENS.spacing[4],
      right: DESIGN_TOKENS.spacing[4]
    },
    'bottom-left': {
      bottom: DESIGN_TOKENS.spacing[4],
      left: DESIGN_TOKENS.spacing[4]
    },
    'top-center': {
      top: DESIGN_TOKENS.spacing[4],
      left: '50%',
      transform: 'translateX(-50%)'
    },
    'bottom-center': {
      bottom: DESIGN_TOKENS.spacing[4],
      left: '50%',
      transform: 'translateX(-50%)'
    }
  };

  const wearableAdjustments = isWearable ? {
    top: DESIGN_TOKENS.spacing[2],
    right: DESIGN_TOKENS.spacing[2],
    left: DESIGN_TOKENS.spacing[2],
    bottom: DESIGN_TOKENS.spacing[2]
  } : {};

  return (
    <div
      className={`notification-container ${className}`}
      style={{
        position: 'fixed',
        zIndex: 9999,
        pointerEvents: 'none',
        ...placementStyles[placement],
        ...wearableAdjustments,
        ...style
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: placement.includes('top') ? 'column' : 'column-reverse',
          gap: DESIGN_TOKENS.spacing[3],
          alignItems: placement.includes('center') ? 'center' : 'flex-end'
        }}
      >
        <AnimatePresence>
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              {...notification}
              placement={placement}
              onClose={() => onRemove?.(notification.id)}
              style={{ pointerEvents: 'auto' }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Notification;