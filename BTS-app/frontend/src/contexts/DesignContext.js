// DesignContext - Contexto centralizado para gestión avanzada del sistema de diseño
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from './ThemeContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Crear el contexto
const DesignContext = createContext();

// Proveedor del contexto
export const DesignProvider = ({ children }) => {
  const { getCurrentPalette, theme, resolvedTheme } = useTheme();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();

  // Estado para configuraciones de diseño dinámicas
  const [designConfig, setDesignConfig] = useState({
    // Configuraciones de accesibilidad
    highContrast: false,
    reducedMotion: false,

    // Configuraciones de dispositivo
    isWearable: false,
    batterySaver: false,

    // Configuraciones de tema
    theme: 'light',
    resolvedTheme: 'light',

    // Configuraciones de animaciones
    animationsEnabled: true,
    animationSettings: {
      duration: '300ms',
      ease: 'ease-out'
    }
  });

  // Estado para métricas de rendimiento
  const [performanceMetrics, setPerformanceMetrics] = useState({
    componentRenders: 0,
    animationFrames: 0,
    memoryUsage: 0,
    loadTime: 0
  });

  // Actualizar configuración cuando cambien las dependencias
  useEffect(() => {
    setDesignConfig(prev => ({
      ...prev,
      isWearable,
      batterySaver: reducedAnimations,
      theme,
      resolvedTheme,
      animationsEnabled: !reducedAnimations,
      animationSettings: getAnimationSettings(),
      reducedMotion: reducedAnimations
    }));
  }, [isWearable, reducedAnimations, theme, resolvedTheme, getAnimationSettings]);

  // Función para obtener tokens de diseño con contexto
  const getDesignTokens = useCallback((overrides = {}) => {
    const palette = getCurrentPalette();

    return {
      ...DESIGN_TOKENS,
      // Aplicar overrides dinámicos basados en el contexto
      colors: {
        ...DESIGN_TOKENS.colors,
        // Override colores basado en el tema actual
        primary: {
          ...DESIGN_TOKENS.colors.primary,
          500: palette.primary
        },
        semantic: {
          success: palette.success,
          warning: palette.warning,
          error: palette.error,
          info: palette.info
        }
      },
      // Ajustes para accesibilidad
      typography: {
        ...DESIGN_TOKENS.typography,
        fontSize: designConfig.highContrast ? {
          ...DESIGN_TOKENS.typography.fontSize,
          base: '1.125rem', // 18px para mejor legibilidad
          lg: '1.375rem'   // 22px
        } : DESIGN_TOKENS.typography.fontSize
      },
      // Ajustes para wearables
      spacing: isWearable ? {
        ...DESIGN_TOKENS.spacing,
        4: '0.75rem', // 12px en lugar de 16px
        6: '1rem',    // 16px en lugar de 24px
        8: '1.25rem'  // 20px en lugar de 32px
      } : DESIGN_TOKENS.spacing,
      // Override animaciones
      animations: {
        ...DESIGN_TOKENS.animations,
        duration: designConfig.animationSettings.duration,
        easing: designConfig.animationSettings.ease
      },
      ...overrides
    };
  }, [getCurrentPalette, designConfig, isWearable]);

  // Función para obtener clases CSS optimizadas
  const getOptimizedClasses = useCallback((component, variant = 'default', size = 'md') => {
    const baseClasses = {
      button: {
        primary: 'btn btn-primary',
        secondary: 'btn btn-secondary',
        outline: 'btn btn-outline-primary',
        ghost: 'btn btn-ghost'
      },
      input: {
        default: 'form-control',
        filled: 'form-control form-control-filled',
        underlined: 'form-control form-control-underlined'
      },
      card: {
        default: 'card',
        elevated: 'card card-elevated',
        outlined: 'card card-outlined'
      }
    };

    const componentClasses = baseClasses[component] || {};
    const variantClass = componentClasses[variant] || componentClasses.default;

    // Añadir clases de tamaño si aplica
    const sizeClass = size !== 'md' ? `${component}-${size}` : '';

    // Añadir clases de optimización
    const optimizationClasses = [];
    if (isWearable) optimizationClasses.push('wearable-optimized');
    if (designConfig.batterySaver) optimizationClasses.push('battery-saver');
    if (designConfig.highContrast) optimizationClasses.push('high-contrast');

    return [variantClass, sizeClass, ...optimizationClasses].filter(Boolean).join(' ');
  }, [isWearable, designConfig]);

  // Función para aplicar estilos inline optimizados
  const getOptimizedStyles = useCallback((component, props = {}) => {
    const tokens = getDesignTokens();
    const palette = getCurrentPalette();

    const baseStyles = {
      button: {
        fontFamily: tokens.typography.fontFamily.primary,
        fontWeight: tokens.typography.fontWeight.medium,
        borderRadius: tokens.borderRadius.md,
        transition: designConfig.animationsEnabled
          ? `all ${tokens.animations.duration.normal}ms ${tokens.animations.easing.out}`
          : 'none'
      },
      input: {
        fontFamily: tokens.typography.fontFamily.primary,
        borderRadius: tokens.borderRadius.md,
        transition: designConfig.animationsEnabled
          ? `all ${tokens.animations.duration.fast}ms ${tokens.animations.easing.out}`
          : 'none'
      },
      card: {
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.shadows.sm,
        transition: designConfig.animationsEnabled
          ? `all ${tokens.animations.duration.normal}ms ${tokens.animations.easing.out}`
          : 'none'
      }
    };

    const componentStyles = baseStyles[component] || {};

    // Aplicar ajustes de accesibilidad
    if (designConfig.highContrast) {
      componentStyles.borderWidth = '2px';
      componentStyles.fontWeight = tokens.typography.fontWeight.semibold;
    }

    // Aplicar ajustes para wearables
    if (isWearable) {
      componentStyles.minHeight = component === 'button' ? '44px' : '40px';
      componentStyles.padding = tokens.spacing[3];
    }

    return { ...componentStyles, ...props };
  }, [getDesignTokens, getCurrentPalette, designConfig, isWearable]);

  // Función para métricas de rendimiento
  const trackPerformance = useCallback((metric, value) => {
    setPerformanceMetrics(prev => ({
      ...prev,
      [metric]: value
    }));
  }, []);

  // Función para optimizaciones automáticas
  const getAutomaticOptimizations = useCallback(() => {
    const optimizations = {
      // Optimizaciones basadas en batería
      battery: designConfig.batterySaver ? {
        animations: false,
        images: 'low-quality',
        polling: 'reduced'
      } : {
        animations: true,
        images: 'high-quality',
        polling: 'normal'
      },

      // Optimizaciones para wearables
      wearable: isWearable ? {
        layout: 'compact',
        touchTargets: 'enlarged',
        text: 'readable'
      } : {
        layout: 'standard',
        touchTargets: 'normal',
        text: 'normal'
      },

      // Optimizaciones de accesibilidad
      accessibility: designConfig.highContrast ? {
        contrast: 'high',
        focus: 'visible',
        motion: 'reduced'
      } : {
        contrast: 'normal',
        focus: 'standard',
        motion: 'normal'
      }
    };

    return optimizations;
  }, [designConfig, isWearable]);

  // Función para validar combinaciones de diseño
  const validateDesignCombination = useCallback((component, props) => {
    const warnings = [];
    const errors = [];

    // Validar combinaciones problemáticas
    if (component === 'button' && props.variant === 'ghost' && designConfig.highContrast) {
      warnings.push('Botón ghost en modo alto contraste puede tener poca visibilidad');
    }

    if (component === 'input' && props.size === 'xs' && isWearable) {
      errors.push('Tamaño xs no recomendado para wearables por problemas de usabilidad');
    }

    if (props.animation && designConfig.batterySaver) {
      warnings.push('Animaciones deshabilitadas en modo ahorro de batería');
    }

    return { warnings, errors };
  }, [designConfig, isWearable]);

  // Memoizar valores computados
  const contextValue = useMemo(() => ({
    // Estado
    designConfig,
    performanceMetrics,

    // Funciones principales
    getDesignTokens,
    getOptimizedClasses,
    getOptimizedStyles,
    getAutomaticOptimizations,
    validateDesignCombination,

    // Utilidades
    trackPerformance,

    // Configuraciones derivadas
    tokens: getDesignTokens(),
    palette: getCurrentPalette(),
    isWearable,
    batterySaver: designConfig.batterySaver,
    highContrast: designConfig.highContrast,
    animationsEnabled: designConfig.animationsEnabled
  }), [
    designConfig,
    performanceMetrics,
    getDesignTokens,
    getOptimizedClasses,
    getOptimizedStyles,
    getAutomaticOptimizations,
    validateDesignCombination,
    trackPerformance,
    getCurrentPalette,
    isWearable
  ]);

  return (
    <DesignContext.Provider value={contextValue}>
      {children}
    </DesignContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign debe ser usado dentro de un DesignProvider');
  }
  return context;
};

export default DesignContext;