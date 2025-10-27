import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Avatar atómico reutilizable
const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  variant = 'circular',
  status,
  showBorder = false,
  fallbackIcon,
  onClick,
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

  // Estado para manejar errores de carga de imagen
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Configuraciones de tamaño
  const sizes = {
    xs: {
      width: '24px',
      height: '24px',
      fontSize: DESIGN_TOKENS.typography.fontSize.xs
    },
    sm: {
      width: '32px',
      height: '32px',
      fontSize: DESIGN_TOKENS.typography.fontSize.sm
    },
    md: {
      width: '40px',
      height: '40px',
      fontSize: DESIGN_TOKENS.typography.fontSize.base
    },
    lg: {
      width: '56px',
      height: '56px',
      fontSize: DESIGN_TOKENS.typography.fontSize.lg
    },
    xl: {
      width: '72px',
      height: '72px',
      fontSize: DESIGN_TOKENS.typography.fontSize.xl
    },
    '2xl': {
      width: '96px',
      height: '96px',
      fontSize: DESIGN_TOKENS.typography.fontSize['2xl']
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    width: size === 'xs' ? '32px' : size === 'sm' ? '40px' : sizes[size].width,
    height: size === 'xs' ? '32px' : size === 'sm' ? '40px' : sizes[size].height
  } : {};

  const currentSize = { ...sizes[size], ...wearableAdjustments };

  // Configuraciones de variante
  const variants = {
    circular: {
      borderRadius: DESIGN_TOKENS.borderRadius.full
    },
    rounded: {
      borderRadius: DESIGN_TOKENS.borderRadius.lg
    },
    square: {
      borderRadius: DESIGN_TOKENS.borderRadius.md
    }
  };

  const currentVariant = variants[variant] || variants.circular;

  // Configuraciones de estado
  const statusConfig = {
    online: {
      color: palette.success,
      label: t('avatar.status.online', 'En línea')
    },
    offline: {
      color: palette.textMuted,
      label: t('avatar.status.offline', 'Desconectado')
    },
    away: {
      color: palette.warning,
      label: t('avatar.status.away', 'Ausente')
    },
    busy: {
      color: palette.error,
      label: t('avatar.status.busy', 'Ocupado')
    }
  };

  // Función para generar iniciales
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Función para generar color de fondo basado en el nombre
  const getBackgroundColor = (name) => {
    if (!name) return palette.surface;
    const colors = [
      palette.primary,
      palette.secondary,
      palette.accent,
      palette.success,
      palette.warning,
      palette.info
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Manejar carga de imagen
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Manejar error de imagen
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Manejar clic
  const handleClick = (event) => {
    onClick?.(event);
  };

  // Variantes de animación
  const avatarVariants = {
    idle: {
      scale: 1,
      boxShadow: showBorder ? DESIGN_TOKENS.shadows.sm : 'none'
    },
    hover: {
      scale: onClick && animationsEnabled && !reducedAnimations ? 1.05 : 1,
      boxShadow: showBorder && onClick ? DESIGN_TOKENS.shadows.md : showBorder ? DESIGN_TOKENS.shadows.sm : 'none',
      transition: { duration: 0.2 }
    },
    loading: {
      opacity: 0.7,
      scale: 0.95
    }
  };

  const showImage = src && !imageError;
  const backgroundColor = showImage ? 'transparent' : getBackgroundColor(name);
  const textColor = showImage ? 'transparent' : palette.background;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <motion.div
        className={`avatar avatar-${size} ${className}`}
        style={{
          ...currentSize,
          ...currentVariant,
          backgroundColor: backgroundColor,
          color: textColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
          fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
          lineHeight: DESIGN_TOKENS.typography.lineHeight.none,
          cursor: onClick ? 'pointer' : 'default',
          border: showBorder ? `2px solid ${palette.border}` : 'none',
          overflow: 'hidden',
          position: 'relative',
          transition: animationsEnabled && !reducedAnimations
            ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
            : 'none',
          ...style
        }}
        variants={avatarVariants}
        initial="idle"
        whileHover="hover"
        onClick={handleClick}
        role={onClick ? 'button' : 'img'}
        tabIndex={onClick ? 0 : -1}
        aria-label={alt || name || t('avatar.defaultAlt', 'Avatar de usuario')}
        onKeyDown={(event) => {
          if (onClick && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            handleClick(event);
          }
        }}
        {...props}
      >
        {/* Imagen */}
        {showImage && (
          <motion.img
            src={src}
            alt={alt || name || t('avatar.imageAlt', 'Foto de perfil')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        )}

        {/* Fallback: iniciales o icono */}
        {(!showImage || imageError) && (
          <motion.span
            style={{
              fontSize: currentSize.fontSize,
              color: textColor,
              userSelect: 'none'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {fallbackIcon || getInitials(name)}
          </motion.span>
        )}
      </motion.div>

      {/* Indicador de estado */}
      {status && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            width: size === 'xs' ? '8px' : size === 'sm' ? '10px' : '12px',
            height: size === 'xs' ? '8px' : size === 'sm' ? '10px' : '12px',
            borderRadius: DESIGN_TOKENS.borderRadius.full,
            backgroundColor: statusConfig[status]?.color || palette.textMuted,
            border: `2px solid ${palette.background}`,
            boxShadow: DESIGN_TOKENS.shadows.xs
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          aria-label={statusConfig[status]?.label}
        />
      )}
    </div>
  );
};

export default Avatar;