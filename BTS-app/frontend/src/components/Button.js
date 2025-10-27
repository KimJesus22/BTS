import React, { forwardRef, memo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Button atómico reutilizable
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  style = {},
  ...props
}, ref) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled, accessibilityMode } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();

  // Configuraciones de variante
  const variants = {
    primary: {
      backgroundColor: palette.primary,
      color: palette.background,
      borderColor: palette.primary,
      hover: {
        backgroundColor: palette.primary,
        opacity: 0.9,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      },
      active: {
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(0px)' : 'none'
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: palette.primary,
      borderColor: palette.primary,
      hover: {
        backgroundColor: palette.primary,
        color: palette.background,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      },
      active: {
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(0px)' : 'none'
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: palette.text,
      borderColor: palette.border,
      hover: {
        backgroundColor: palette.surface,
        borderColor: palette.primary,
        color: palette.primary,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      },
      active: {
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(0px)' : 'none'
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: palette.text,
      borderColor: 'transparent',
      hover: {
        backgroundColor: palette.hover,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      },
      active: {
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(0px)' : 'none'
      }
    },
    success: {
      backgroundColor: palette.success,
      color: palette.background,
      borderColor: palette.success,
      hover: {
        backgroundColor: palette.success,
        opacity: 0.9,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      }
    },
    danger: {
      backgroundColor: palette.error,
      color: palette.background,
      borderColor: palette.error,
      hover: {
        backgroundColor: palette.error,
        opacity: 0.9,
        transform: (animationsEnabled && !reducedAnimations && !accessibilityMode) ? 'translateY(-1px)' : 'none'
      }
    }
  };

  // Configuraciones de tamaño
  const sizes = {
    xs: {
      padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
      borderRadius: DESIGN_TOKENS.borderRadius.sm,
      minHeight: '28px'
    },
    sm: {
      padding: `${DESIGN_TOKENS.spacing[1.5]} ${DESIGN_TOKENS.spacing[3]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      borderRadius: DESIGN_TOKENS.borderRadius.base,
      minHeight: '32px'
    },
    md: {
      padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[4]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.base,
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      minHeight: '40px'
    },
    lg: {
      padding: `${DESIGN_TOKENS.spacing[2.5]} ${DESIGN_TOKENS.spacing[5]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.lg,
      borderRadius: DESIGN_TOKENS.borderRadius.lg,
      minHeight: '48px'
    },
    xl: {
      padding: `${DESIGN_TOKENS.spacing[3]} ${DESIGN_TOKENS.spacing[6]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.xl,
      borderRadius: DESIGN_TOKENS.borderRadius.xl,
      minHeight: '56px'
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    minHeight: size === 'xs' ? '36px' : size === 'sm' ? '44px' : '52px',
    fontSize: size === 'xs' ? DESIGN_TOKENS.typography.fontSize.sm : sizes[size].fontSize,
    padding: size === 'xs' ? `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}` : sizes[size].padding
  } : {};

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Variantes de animación
  const buttonVariants = {
    idle: {
      backgroundColor: currentVariant.backgroundColor,
      color: currentVariant.color,
      borderColor: currentVariant.borderColor,
      scale: 1,
      y: 0
    },
    hover: currentVariant.hover,
    tap: currentVariant.active,
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      scale: 1,
      y: 0
    },
    loading: {
      scale: 0.98,
      opacity: 0.8
    }
  };

  // Manejar clic
  const handleClick = (event) => {
    if (disabled || loading) return;
    onClick?.(event);
  };

  // Estado del botón
  const buttonState = disabled ? 'disabled' : loading ? 'loading' : 'idle';

  return (
    <motion.button
      ref={ref}
      type={type}
      className={`btn btn-${variant} ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{
        ...currentSize,
        border: '1px solid',
        fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
        fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
        lineHeight: DESIGN_TOKENS.typography.lineHeight.snug,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: DESIGN_TOKENS.spacing[2],
        transition: (animationsEnabled && !reducedAnimations && !accessibilityMode)
          ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
          : 'none',
        boxShadow: disabled ? 'none' : DESIGN_TOKENS.shadows.sm,
        ...style
      }}
      variants={buttonVariants}
      initial="idle"
      animate={buttonState}
      whileHover={!disabled && !loading && animationsEnabled && !reducedAnimations && !accessibilityMode ? "hover" : undefined}
      whileTap={!disabled && !loading && animationsEnabled && !reducedAnimations && !accessibilityMode ? "tap" : undefined}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={loading ? t('button.loading', 'Cargando...') : props['aria-label']}
      {...props}
    >
      {/* Indicador de carga */}
      {loading && (
        <motion.div
          animate={accessibilityMode ? { rotate: 0 } : { rotate: 360 }}
          transition={accessibilityMode ? { duration: 0 } : {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${currentVariant.color}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%'
          }}
        />
      )}

      {/* Icono izquierdo */}
      {icon && iconPosition === 'left' && !loading && (
        <span
          style={{
            fontSize: currentSize.fontSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Contenido del botón */}
      <span style={{ flex: 1, textAlign: 'center' }}>
        {children}
      </span>

      {/* Icono derecho */}
      {icon && iconPosition === 'right' && !loading && (
        <span
          style={{
            fontSize: currentSize.fontSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default memo(Button);