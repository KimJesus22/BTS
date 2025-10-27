import React, { forwardRef, useState, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Input atómico reutilizable
const Input = memo(forwardRef(({
  label,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  loading = false,
  icon,
  iconPosition = 'left',
  size = 'md',
  variant = 'outlined',
  fullWidth = false,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
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

  // Estado interno para foco
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  // Memoizar configuraciones de variante
  const variants = useMemo(() => ({
    outlined: {
      borderColor: error ? palette.error : isFocused ? palette.primary : palette.border,
      backgroundColor: disabled ? palette.surface : palette.background,
      boxShadow: isFocused && !error ? `0 0 0 2px ${palette.primary}20` : 'none'
    },
    filled: {
      borderColor: 'transparent',
      backgroundColor: disabled ? palette.surface : isFocused ? palette.surface : palette.surface,
      boxShadow: isFocused && !error ? `0 0 0 2px ${palette.primary}20` : 'none'
    },
    underlined: {
      borderColor: 'transparent',
      borderBottomColor: error ? palette.error : isFocused ? palette.primary : palette.border,
      backgroundColor: 'transparent',
      borderRadius: 0,
      borderBottomWidth: '2px',
      boxShadow: 'none'
    }
  }), [palette, error, isFocused, disabled]);

  // Memoizar configuraciones de tamaño
  const sizes = useMemo(() => ({
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
    }
  }), []);

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    minHeight: size === 'sm' ? '44px' : size === 'md' ? '52px' : '60px',
    fontSize: size === 'sm' ? DESIGN_TOKENS.typography.fontSize.base : sizes[size].fontSize,
    padding: size === 'sm' ? `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[4]}` : sizes[size].padding
  } : {};

  const currentVariant = variants[variant] || variants.outlined;
  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Calcular padding con iconos
  const iconPadding = icon ? DESIGN_TOKENS.spacing[8] : 0;
  const paddingLeft = icon && iconPosition === 'left' ? iconPadding : currentSize.padding.split(' ')[1];
  const paddingRight = icon && iconPosition === 'right' ? iconPadding : currentSize.padding.split(' ')[1];

  // Variantes de animación
  const inputVariants = {
    idle: {
      borderColor: currentVariant.borderColor,
      backgroundColor: currentVariant.backgroundColor,
      boxShadow: currentVariant.boxShadow,
      scale: 1
    },
    focus: {
      borderColor: error ? palette.error : palette.primary,
      backgroundColor: currentVariant.backgroundColor,
      boxShadow: error ? `0 0 0 2px ${palette.error}20` : `0 0 0 2px ${palette.primary}20`,
      scale: 1
    },
    error: {
      borderColor: palette.error,
      backgroundColor: currentVariant.backgroundColor,
      boxShadow: `0 0 0 2px ${palette.error}20`,
      scale: 1
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      scale: 1
    }
  };

  // Memoizar manejadores de eventos
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    setHasValue(!!newValue);
    onChange?.(event);
  }, [onChange]);

  const handleFocus = useCallback((event) => {
    setIsFocused(true);
    onFocus?.(event);
  }, [onFocus]);

  const handleBlur = useCallback((event) => {
    setIsFocused(false);
    onBlur?.(event);
  }, [onBlur]);

  // Estado del input
  const inputState = disabled ? 'disabled' : error ? 'error' : isFocused ? 'focus' : 'idle';

  return (
    <div
      className={`input-wrapper ${fullWidth ? 'w-100' : ''} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: DESIGN_TOKENS.spacing[1],
        position: 'relative',
        ...style
      }}
    >
      {/* Label */}
      {label && (
        <label
          style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.sm,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
            color: disabled ? palette.textSecondary : palette.text,
            marginBottom: DESIGN_TOKENS.spacing[1]
          }}
        >
          {label}
          {required && (
            <span
              style={{ color: palette.error, marginLeft: DESIGN_TOKENS.spacing[1] }}
              aria-label={t('input.required', 'requerido')}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Contenedor del input */}
      <div style={{ position: 'relative' }}>
        <motion.input
          ref={ref}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled || loading}
          readOnly={readOnly}
          required={required}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="form-control"
          style={{
            ...currentSize,
            width: '100%',
            border: variant === 'underlined' ? 'none' : `1px solid`,
            borderBottom: variant === 'underlined' ? `2px solid` : undefined,
            borderRadius: currentVariant.borderRadius || currentSize.borderRadius,
            fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
            fontSize: currentSize.fontSize,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.normal,
            lineHeight: DESIGN_TOKENS.typography.lineHeight.normal,
            color: disabled ? palette.textSecondary : palette.text,
            backgroundColor: currentVariant.backgroundColor,
            paddingLeft: paddingLeft,
            paddingRight: paddingRight,
            paddingTop: currentSize.padding.split(' ')[0],
            paddingBottom: currentSize.padding.split(' ')[0],
            outline: 'none',
            cursor: disabled || loading ? 'not-allowed' : 'text',
            transition: animationsEnabled && !reducedAnimations
              ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
              : 'none',
            ...currentVariant
          }}
          variants={inputVariants}
          animate={inputState}
          aria-invalid={!!error}
          aria-describedby={error ? 'input-error' : helperText ? 'input-helper' : undefined}
          {...props}
        />

        {/* Icono izquierdo */}
        {icon && iconPosition === 'left' && (
          <div
            style={{
              position: 'absolute',
              left: DESIGN_TOKENS.spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              color: disabled ? palette.textSecondary : isFocused ? palette.primary : palette.textSecondary,
              fontSize: currentSize.fontSize,
              pointerEvents: 'none',
              zIndex: 1
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* Icono derecho */}
        {icon && iconPosition === 'right' && (
          <div
            style={{
              position: 'absolute',
              right: DESIGN_TOKENS.spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
              color: disabled ? palette.textSecondary : isFocused ? palette.primary : palette.textSecondary,
              fontSize: currentSize.fontSize,
              pointerEvents: 'none',
              zIndex: 1
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        {/* Indicador de carga */}
        {loading && (
          <div
            style={{
              position: 'absolute',
              right: DESIGN_TOKENS.spacing[3],
              top: '50%',
              transform: 'translateY(-50%)',
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
                width: '16px',
                height: '16px',
                border: `2px solid ${palette.primary}`,
                borderTop: `2px solid transparent`,
                borderRadius: '50%'
              }}
            />
          </div>
        )}
      </div>

      {/* Texto de ayuda o error */}
      {(helperText || error) && (
        <div
          id={error ? 'input-error' : 'input-helper'}
          style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.sm,
            color: error ? palette.error : palette.textSecondary,
            marginTop: DESIGN_TOKENS.spacing[1]
          }}
          role={error ? 'alert' : undefined}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
}));

Input.displayName = 'Input';

export default Input;