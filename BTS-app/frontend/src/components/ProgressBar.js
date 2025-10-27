import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente ProgressBar molecular reutilizable
const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  showPercentage = false,
  animated = true,
  striped = false,
  indeterminate = false,
  label,
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

  // Calcular porcentaje
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Configuraciones de variante
  const variants = {
    default: {
      backgroundColor: palette.primary,
      trackColor: palette.surface
    },
    success: {
      backgroundColor: palette.success,
      trackColor: palette.surface
    },
    warning: {
      backgroundColor: palette.warning,
      trackColor: palette.surface
    },
    error: {
      backgroundColor: palette.error,
      trackColor: palette.surface
    },
    info: {
      backgroundColor: palette.info,
      trackColor: palette.surface
    }
  };

  // Configuraciones de tamaño
  const sizes = {
    xs: {
      height: '4px',
      borderRadius: DESIGN_TOKENS.borderRadius.sm,
      fontSize: DESIGN_TOKENS.typography.fontSize.xs
    },
    sm: {
      height: '6px',
      borderRadius: DESIGN_TOKENS.borderRadius.sm,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm
    },
    md: {
      height: '8px',
      borderRadius: DESIGN_TOKENS.borderRadius.base,
      fontSize: DESIGN_TOKENS.typography.fontSize.base
    },
    lg: {
      height: '12px',
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      fontSize: DESIGN_TOKENS.typography.fontSize.lg
    },
    xl: {
      height: '16px',
      borderRadius: DESIGN_TOKENS.borderRadius.lg,
      fontSize: DESIGN_TOKENS.typography.fontSize.xl
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    height: size === 'xs' ? '6px' : size === 'sm' ? '8px' : sizes[size].height
  } : {};

  const currentVariant = variants[variant] || variants.default;
  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Variantes de animación
  const progressVariants = {
    determinate: {
      width: indeterminate ? '100%' : `${percentage}%`,
      transition: animated && animationsEnabled && !reducedAnimations ? {
        duration: 0.5,
        ease: "easeOut"
      } : { duration: 0 }
    },
    indeterminate: {
      width: '30%',
      x: ['0%', '70%', '0%'],
      transition: {
        x: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    }
  };

  // Generar patrón de rayas
  const stripePattern = striped ? `
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(255, 255, 255, 0.1) 10px,
      rgba(255, 255, 255, 0.1) 20px
    )
  ` : 'none';

  return (
    <div
      className={`progress-bar-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: DESIGN_TOKENS.spacing[2],
        width: '100%',
        ...style
      }}
      role="progressbar"
      aria-valuenow={indeterminate ? undefined : Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label || t('progressBar.label', 'Barra de progreso')}
      {...props}
    >
      {/* Label */}
      {(showLabel || showPercentage) && (
        <div
          className="progress-bar-label"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: currentSize.fontSize,
            color: palette.textSecondary,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.medium
          }}
        >
          {showLabel && label && (
            <span>{label}</span>
          )}
          {showPercentage && !indeterminate && (
            <span>{Math.round(percentage)}%</span>
          )}
        </div>
      )}

      {/* Barra de progreso */}
      <div
        className="progress-bar-track"
        style={{
          width: '100%',
          height: currentSize.height,
          backgroundColor: currentVariant.trackColor,
          borderRadius: currentSize.borderRadius,
          overflow: 'hidden',
          border: `1px solid ${palette.borderLight}`,
          boxShadow: `inset 0 1px 2px ${palette.shadowLight}`
        }}
      >
        <motion.div
          className="progress-bar-fill"
          style={{
            height: '100%',
            backgroundColor: currentVariant.backgroundColor,
            borderRadius: currentSize.borderRadius,
            backgroundImage: stripePattern,
            backgroundSize: striped ? '20px 20px' : 'none',
            boxShadow: `0 0 4px ${currentVariant.backgroundColor}40`
          }}
          variants={progressVariants}
          animate={indeterminate ? 'indeterminate' : 'determinate'}
          initial={false}
        />
      </div>

      {/* Información adicional para accesibilidad */}
      <div className="sr-only">
        {indeterminate
          ? t('progressBar.indeterminate', 'Progreso indeterminado')
          : t('progressBar.status', '{{percentage}}% completado', { percentage: Math.round(percentage) })
        }
      </div>
    </div>
  );
};

export default ProgressBar;