import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Badge atómico reutilizable
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  dot = false,
  removable = false,
  onRemove,
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

  // Configuraciones de variante
  const variants = {
    primary: {
      backgroundColor: palette.primary,
      color: palette.background,
      borderColor: palette.primary
    },
    secondary: {
      backgroundColor: palette.secondary,
      color: palette.background,
      borderColor: palette.secondary
    },
    success: {
      backgroundColor: palette.success,
      color: palette.background,
      borderColor: palette.success
    },
    warning: {
      backgroundColor: palette.warning,
      color: palette.background,
      borderColor: palette.warning
    },
    error: {
      backgroundColor: palette.error,
      color: palette.background,
      borderColor: palette.error
    },
    info: {
      backgroundColor: palette.info,
      color: palette.background,
      borderColor: palette.info
    },
    outline: {
      backgroundColor: 'transparent',
      color: palette.primary,
      borderColor: palette.primary
    },
    ghost: {
      backgroundColor: 'transparent',
      color: palette.text,
      borderColor: 'transparent'
    }
  };

  // Configuraciones de tamaño
  const sizes = {
    xs: {
      padding: dot ? '0' : `${DESIGN_TOKENS.spacing[0.5]} ${DESIGN_TOKENS.spacing[1]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
      minWidth: dot ? '8px' : 'auto',
      height: dot ? '8px' : 'auto',
      borderRadius: shape === 'pill' ? DESIGN_TOKENS.borderRadius.full : DESIGN_TOKENS.borderRadius.sm
    },
    sm: {
      padding: dot ? '0' : `${DESIGN_TOKENS.spacing[0.5]} ${DESIGN_TOKENS.spacing[1.5]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
      minWidth: dot ? '10px' : 'auto',
      height: dot ? '10px' : 'auto',
      borderRadius: shape === 'pill' ? DESIGN_TOKENS.borderRadius.full : DESIGN_TOKENS.borderRadius.base
    },
    md: {
      padding: dot ? '0' : `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm,
      minWidth: dot ? '12px' : 'auto',
      height: dot ? '12px' : 'auto',
      borderRadius: shape === 'pill' ? DESIGN_TOKENS.borderRadius.full : DESIGN_TOKENS.borderRadius.md
    },
    lg: {
      padding: dot ? '0' : `${DESIGN_TOKENS.spacing[1.5]} ${DESIGN_TOKENS.spacing[3]}`,
      fontSize: DESIGN_TOKENS.typography.fontSize.base,
      minWidth: dot ? '14px' : 'auto',
      height: dot ? '14px' : 'auto',
      borderRadius: shape === 'pill' ? DESIGN_TOKENS.borderRadius.full : DESIGN_TOKENS.borderRadius.lg
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    fontSize: size === 'xs' ? DESIGN_TOKENS.typography.fontSize.sm : sizes[size].fontSize,
    padding: size === 'xs' ? `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}` : sizes[size].padding
  } : {};

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Variantes de animación
  const badgeVariants = {
    idle: {
      backgroundColor: currentVariant.backgroundColor,
      color: currentVariant.color,
      borderColor: currentVariant.borderColor,
      scale: 1
    },
    hover: {
      scale: animationsEnabled && !reducedAnimations ? 1.05 : 1,
      transition: { duration: 0.2 }
    },
    removable: {
      scale: animationsEnabled && !reducedAnimations ? 1.02 : 1,
      transition: { duration: 0.2 }
    }
  };

  // Manejar remoción
  const handleRemove = (event) => {
    event.stopPropagation();
    onRemove?.();
  };

  return (
    <motion.span
      className={`badge badge-${variant} ${className}`}
      style={{
        ...currentSize,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
        fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
        lineHeight: DESIGN_TOKENS.typography.lineHeight.none,
        whiteSpace: 'nowrap',
        cursor: removable ? 'pointer' : 'default',
        transition: animationsEnabled && !reducedAnimations
          ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
          : 'none',
        boxShadow: DESIGN_TOKENS.shadows.xs,
        ...style
      }}
      variants={badgeVariants}
      initial="idle"
      whileHover={removable ? "removable" : "hover"}
      role={dot ? "status" : "status"}
      aria-label={dot ? t('badge.indicator', 'Indicador') : undefined}
      {...props}
    >
      {/* Contenido del badge */}
      {!dot && children}

      {/* Botón de remoción */}
      {removable && (
        <motion.button
          onClick={handleRemove}
          style={{
            marginLeft: DESIGN_TOKENS.spacing[1],
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            lineHeight: 1,
            borderRadius: DESIGN_TOKENS.borderRadius.full,
            width: '16px',
            height: '16px'
          }}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            scale: 1.1
          }}
          whileTap={{ scale: 0.9 }}
          aria-label={t('badge.remove', 'Remover badge')}
        >
          ×
        </motion.button>
      )}
    </motion.span>
  );
};

export default Badge;