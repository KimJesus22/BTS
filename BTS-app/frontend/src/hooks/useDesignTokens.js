// Hook personalizado para acceder a los design tokens con contexto
import { useMemo } from 'react';
import { useDesign } from '../contexts/DesignContext';
import { DESIGN_TOKENS } from '../design-tokens';

export const useDesignTokens = (overrides = {}) => {
  const { getDesignTokens, designConfig } = useDesign();

  // Memoizar los tokens para evitar recalculaciones innecesarias
  const tokens = useMemo(() => {
    return getDesignTokens(overrides);
  }, [getDesignTokens, overrides]);

  // Función helper para acceder a tokens anidados
  const getToken = (path, fallback = null) => {
    return path.split('.').reduce((obj, key) => obj?.[key], tokens) || fallback;
  };

  // Función para obtener valor de color con contexto
  const getColor = (colorKey, variant = 500) => {
    const colorGroup = tokens.colors[colorKey];
    if (!colorGroup) return tokens.colors.text.primary;

    if (typeof colorGroup === 'string') return colorGroup;
    return colorGroup[variant] || colorGroup[500] || tokens.colors.text.primary;
  };

  // Función para obtener espaciado con contexto
  const getSpacing = (size) => {
    return tokens.spacing[size] || tokens.spacing[4];
  };

  // Función para obtener tamaño de fuente con contexto
  const getFontSize = (size) => {
    return tokens.typography.fontSize[size] || tokens.typography.fontSize.base;
  };

  // Función para obtener radio de borde con contexto
  const getBorderRadius = (size) => {
    return tokens.borderRadius[size] || tokens.borderRadius.md;
  };

  // Función para obtener sombra con contexto
  const getShadow = (size) => {
    return tokens.shadows[size] || tokens.shadows.sm;
  };

  // Función para obtener duración de animación con contexto
  const getAnimationDuration = (speed = 'normal') => {
    return tokens.animations.duration[speed] || tokens.animations.duration.normal;
  };

  // Función para obtener función de temporización con contexto
  const getAnimationEasing = (type = 'out') => {
    return tokens.animations.easing[type] || tokens.animations.easing.out;
  };

  return {
    // Tokens completos
    tokens,

    // Funciones helper
    getToken,
    getColor,
    getSpacing,
    getFontSize,
    getBorderRadius,
    getShadow,
    getAnimationDuration,
    getAnimationEasing,

    // Configuración actual
    designConfig,

    // Tokens directos para conveniencia
    colors: tokens.colors,
    typography: tokens.typography,
    spacing: tokens.spacing,
    borderRadius: tokens.borderRadius,
    shadows: tokens.shadows,
    animations: tokens.animations,
    breakpoints: tokens.breakpoints,
    zIndex: tokens.zIndex,
    opacity: tokens.opacity
  };
};

export default useDesignTokens;