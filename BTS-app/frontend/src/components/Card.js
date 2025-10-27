import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Card molecular reutilizable
const Card = forwardRef(({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  variant = 'elevated',
  size = 'md',
  padding = 'md',
  hoverable = false,
  clickable = false,
  loading = false,
  onClick,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();

  // Configuraciones de variante
  const variants = {
    elevated: {
      backgroundColor: palette.surfaceElevated,
      borderColor: 'transparent',
      boxShadow: DESIGN_TOKENS.shadows.md
    },
    outlined: {
      backgroundColor: palette.surface,
      borderColor: palette.border,
      boxShadow: 'none'
    },
    filled: {
      backgroundColor: palette.surface,
      borderColor: 'transparent',
      boxShadow: 'none'
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      boxShadow: 'none'
    }
  };

  // Configuraciones de tamaño
  const sizes = {
    sm: {
      borderRadius: DESIGN_TOKENS.borderRadius.md,
      fontSize: DESIGN_TOKENS.typography.fontSize.sm
    },
    md: {
      borderRadius: DESIGN_TOKENS.borderRadius.lg,
      fontSize: DESIGN_TOKENS.typography.fontSize.base
    },
    lg: {
      borderRadius: DESIGN_TOKENS.borderRadius.xl,
      fontSize: DESIGN_TOKENS.typography.fontSize.lg
    }
  };

  // Configuraciones de padding
  const paddings = {
    none: '0',
    sm: DESIGN_TOKENS.spacing[3],
    md: DESIGN_TOKENS.spacing[4],
    lg: DESIGN_TOKENS.spacing[6],
    xl: DESIGN_TOKENS.spacing[8]
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    padding: padding === 'sm' ? DESIGN_TOKENS.spacing[2] : paddings[padding],
    borderRadius: DESIGN_TOKENS.borderRadius.md
  } : {};

  const currentVariant = variants[variant] || variants.elevated;
  const currentSize = sizes[size] || sizes.md;
  const currentPadding = wearableAdjustments.padding || paddings[padding] || paddings.md;

  // Variantes de animación
  const cardVariants = {
    idle: {
      ...currentVariant,
      scale: 1,
      y: 0
    },
    hover: {
      scale: hoverable && animationsEnabled && !reducedAnimations ? 1.02 : 1,
      y: hoverable && animationsEnabled && !reducedAnimations ? -2 : 0,
      boxShadow: hoverable ? DESIGN_TOKENS.shadows.lg : currentVariant.boxShadow,
      transition: { duration: 0.2 }
    },
    loading: {
      opacity: 0.7,
      scale: 0.98
    }
  };

  // Manejar clic
  const handleClick = (event) => {
    if (clickable && !loading) {
      onClick?.(event);
    }
  };

  // Estado de la card
  const cardState = loading ? 'loading' : 'idle';

  return (
    <motion.div
      ref={ref}
      className={`card card-${variant} ${clickable ? 'clickable' : ''} ${className}`}
      style={{
        backgroundColor: currentVariant.backgroundColor,
        border: variant === 'outlined' ? `1px solid ${currentVariant.borderColor}` : 'none',
        borderRadius: wearableAdjustments.borderRadius || currentSize.borderRadius,
        padding: currentPadding,
        cursor: clickable ? 'pointer' : 'default',
        fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
        fontSize: currentSize.fontSize,
        lineHeight: DESIGN_TOKENS.typography.lineHeight.normal,
        transition: animationsEnabled && !reducedAnimations
          ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
          : 'none',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
      variants={cardVariants}
      initial="idle"
      animate={cardState}
      whileHover={hoverable || clickable ? "hover" : undefined}
      onClick={handleClick}
      role={clickable ? 'button' : 'region'}
      tabIndex={clickable ? 0 : -1}
      aria-label={title ? `${t('card.title', 'Tarjeta')}: ${title}` : t('card.content', 'Contenido de tarjeta')}
      onKeyDown={(event) => {
        if (clickable && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          handleClick(event);
        }
      }}
      {...props}
    >
      {/* Indicador de carga */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              width: '24px',
              height: '24px',
              border: `2px solid ${palette.primary}`,
              borderTop: `2px solid transparent`,
              borderRadius: '50%'
            }}
          />
        </div>
      )}

      {/* Header de la card */}
      {(title || subtitle || headerActions) && (
        <div
          className="card-header"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: currentPadding,
            gap: DESIGN_TOKENS.spacing[3]
          }}
        >
          <div style={{ flex: 1 }}>
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: currentSize.fontSize,
                  fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
                  color: palette.text,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.snug
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  margin: title ? `${DESIGN_TOKENS.spacing[1]} 0 0 0` : 0,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                  color: palette.textSecondary,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {headerActions && (
            <div
              className="card-header-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[2],
                flexShrink: 0
              }}
            >
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Contenido principal */}
      <div
        className="card-content"
        style={{
          color: palette.text,
          lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
        }}
      >
        {children}
      </div>

      {/* Footer de la card */}
      {footer && (
        <div
          className="card-footer"
          style={{
            marginTop: currentPadding,
            paddingTop: currentPadding,
            borderTop: variant === 'outlined' ? `1px solid ${palette.borderLight}` : 'none'
          }}
        >
          {footer}
        </div>
      )}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;