import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Icon atómico reutilizable
const Icon = forwardRef(({
  name,
  size = 'md',
  color,
  variant = 'solid',
  animated = false,
  spin = false,
  pulse = false,
  bounce = false,
  onClick,
  className = '',
  style = {},
  ...props
}, ref) => {
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();

  // Configuraciones de tamaño
  const sizes = {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
    '2xl': '40px',
    '3xl': '48px'
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    size: size === 'xs' ? '16px' : size === 'sm' ? '20px' : sizes[size]
  } : {};

  const currentSize = wearableAdjustments.size || sizes[size] || sizes.md;

  // Configuraciones de color
  const getColor = () => {
    if (color) return color;
    return palette.text;
  };

  // Biblioteca de iconos (simplificada - en producción usar librería como Heroicons)
  const iconLibrary = {
    // Iconos de navegación
    home: {
      solid: '🏠',
      outline: '🏠'
    },
    search: {
      solid: '🔍',
      outline: '🔍'
    },
    menu: {
      solid: '☰',
      outline: '☰'
    },
    close: {
      solid: '✕',
      outline: '✕'
    },
    back: {
      solid: '←',
      outline: '←'
    },
    forward: {
      solid: '→',
      outline: '→'
    },

    // Iconos de usuario
    user: {
      solid: '👤',
      outline: '👤'
    },
    users: {
      solid: '👥',
      outline: '👥'
    },
    settings: {
      solid: '⚙️',
      outline: '⚙️'
    },
    profile: {
      solid: '👤',
      outline: '👤'
    },

    // Iconos de acciones
    edit: {
      solid: '✏️',
      outline: '✏️'
    },
    delete: {
      solid: '🗑️',
      outline: '🗑️'
    },
    add: {
      solid: '➕',
      outline: '➕'
    },
    remove: {
      solid: '➖',
      outline: '➖'
    },
    save: {
      solid: '💾',
      outline: '💾'
    },
    download: {
      solid: '⬇️',
      outline: '⬇️'
    },
    upload: {
      solid: '⬆️',
      outline: '⬆️'
    },

    // Iconos de estado
    check: {
      solid: '✓',
      outline: '✓'
    },
    error: {
      solid: '✗',
      outline: '✗'
    },
    warning: {
      solid: '⚠️',
      outline: '⚠️'
    },
    info: {
      solid: 'ℹ️',
      outline: 'ℹ️'
    },
    loading: {
      solid: '⏳',
      outline: '⏳'
    },

    // Iconos de gamificación
    star: {
      solid: '⭐',
      outline: '⭐'
    },
    trophy: {
      solid: '🏆',
      outline: '🏆'
    },
    medal: {
      solid: '🏅',
      outline: '🏅'
    },
    points: {
      solid: '💎',
      outline: '💎'
    },

    // Iconos de dispositivo
    battery: {
      solid: '🔋',
      outline: '🔋'
    },
    wifi: {
      solid: '📶',
      outline: '📶'
    },
    bluetooth: {
      solid: '📶',
      outline: '📶'
    },
    offline: {
      solid: '📴',
      outline: '📴'
    },

    // Iconos de accesibilidad
    accessibility: {
      solid: '♿',
      outline: '♿'
    },
    eye: {
      solid: '👁️',
      outline: '👁️'
    },
    ear: {
      solid: '👂',
      outline: '👂'
    },
    volume: {
      solid: '🔊',
      outline: '🔊'
    }
  };

  // Obtener el icono
  const getIcon = () => {
    const iconData = iconLibrary[name];
    if (!iconData) return '?';
    return iconData[variant] || iconData.solid;
  };

  // Variantes de animación
  const iconVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      opacity: 1
    },
    hover: {
      scale: onClick && animationsEnabled && !reducedAnimations ? 1.1 : 1,
      transition: { duration: 0.2 }
    },
    spin: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    bounce: {
      y: [0, -2, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Determinar estado de animación
  const getAnimationState = () => {
    if (spin) return 'spin';
    if (pulse) return 'pulse';
    if (bounce) return 'bounce';
    return 'idle';
  };

  // Manejar clic
  const handleClick = (event) => {
    onClick?.(event);
  };

  return (
    <motion.span
      ref={ref}
      className={`icon icon-${name} ${className}`}
      style={{
        fontSize: currentSize,
        color: getColor(),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        transition: animationsEnabled && !reducedAnimations
          ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
          : 'none',
        ...style
      }}
      variants={iconVariants}
      initial="idle"
      animate={getAnimationState()}
      whileHover={onClick ? "hover" : undefined}
      onClick={handleClick}
      role={onClick ? 'button' : 'img'}
      tabIndex={onClick ? 0 : -1}
      aria-label={name}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          handleClick(event);
        }
      }}
      {...props}
    >
      {getIcon()}
    </motion.span>
  );
});

Icon.displayName = 'Icon';

export default Icon;