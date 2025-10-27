import { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useWearableOptimizations = () => {
  const { accessibilityMode } = useAccessibility();
  const [deviceType, setDeviceType] = useState('desktop');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [isWearable, setIsWearable] = useState(false);
  const [touchCapabilities, setTouchCapabilities] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(false);

  // Detectar tipo de dispositivo
  const detectDeviceType = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    const userAgent = navigator.userAgent.toLowerCase();

    setScreenSize({ width, height });

    // Detectar wearables (smartwatches, dispositivos pequeños)
    const isWatch = width <= 300 && height <= 300;
    const isSmallMobile = width <= 480 && height <= 800;
    const isWearableDevice = isWatch || (isSmallMobile && pixelRatio > 2);

    // Detectar por user agent
    const isWatchOS = /watch os/i.test(userAgent);
    const isWearableUA = /wear/i.test(userAgent) || isWatchOS;

    const wearable = isWearableDevice || isWearableUA;
    setIsWearable(wearable);

    // Determinar tipo de dispositivo
    if (wearable) {
      setDeviceType('wearable');
    } else if (width <= 768) {
      setDeviceType('mobile');
    } else if (width <= 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  }, []);

  // Detectar capacidades táctiles y hápticas
  const detectTouchCapabilities = useCallback(() => {
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setTouchCapabilities(hasTouch);

    // Detectar soporte para vibración (feedback háptico)
    const hasHaptic = 'vibrate' in navigator;
    setHapticFeedback(hasHaptic);
  }, []);

  // Detectar preferencia de movimiento reducido
  const detectReducedMotion = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Inicializar detección
  useEffect(() => {
    detectDeviceType();
    detectTouchCapabilities();
    detectReducedMotion();

    const handleResize = () => detectDeviceType();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [detectDeviceType, detectTouchCapabilities, detectReducedMotion]);

  // Obtener configuraciones optimizadas para wearables
  const getWearableOptimizations = useCallback(() => {
    if (!isWearable) {
      return {
        fontSize: accessibilityMode ? '20px' : '16px',
        padding: accessibilityMode ? '24px' : '16px',
        buttonSize: accessibilityMode ? '52px' : '44px',
        animationsEnabled: !accessibilityMode,
        layout: accessibilityMode ? 'accessibility' : 'standard'
      };
    }

    return {
      // Tipografía optimizada para pantallas pequeñas con accesibilidad
      fontSize: accessibilityMode
        ? (deviceType === 'wearable' ? '18px' : '20px')
        : (deviceType === 'wearable' ? '14px' : '15px'),
      // Espaciado aumentado para accesibilidad
      padding: accessibilityMode
        ? (deviceType === 'wearable' ? '16px' : '20px')
        : (deviceType === 'wearable' ? '8px' : '12px'),
      // Botones más grandes para mejor usabilidad táctil y accesibilidad
      buttonSize: accessibilityMode
        ? (deviceType === 'wearable' ? '56px' : '52px')
        : (deviceType === 'wearable' ? '48px' : '44px'),
      // Animaciones desactivadas en modo accesibilidad
      animationsEnabled: !reducedMotion && deviceType !== 'wearable' && !accessibilityMode,
      // Layout optimizado
      layout: accessibilityMode
        ? 'accessibility-compact'
        : (deviceType === 'wearable' ? 'compact' : 'mobile-optimized'),
      // Navegación simplificada
      navigation: deviceType === 'wearable' ? 'gesture-based' : 'touch-friendly',
      // Contenido priorizado
      contentPriority: deviceType === 'wearable' ? 'essential-only' : 'full',
      // Interacciones táctiles optimizadas con accesibilidad
      touchTargets: {
        minSize: accessibilityMode
          ? (deviceType === 'wearable' ? 52 : 48)
          : (deviceType === 'wearable' ? 44 : 40),
        spacing: accessibilityMode
          ? (deviceType === 'wearable' ? 16 : 20)
          : (deviceType === 'wearable' ? 8 : 12)
      }
    };
  }, [isWearable, deviceType, reducedMotion, accessibilityMode]);

  // Obtener configuraciones de animación optimizadas
  const getAnimationSettings = useCallback(() => {
    const baseSettings = {
      duration: accessibilityMode ? 0 : 0.3,
      ease: 'easeOut'
    };

    if (reducedMotion || accessibilityMode) {
      return {
        ...baseSettings,
        duration: 0,
        reduced: true
      };
    }

    if (isWearable) {
      return {
        ...baseSettings,
        duration: 0.2,
        ease: 'linear',
        wearable: true
      };
    }

    return baseSettings;
  }, [isWearable, reducedMotion, accessibilityMode]);

  // Obtener configuraciones de carga progresiva
  const getProgressiveLoadingSettings = useCallback(() => {
    return {
      // Cargar componentes críticos primero
      criticalComponents: ['navigation', 'main-content'],
      // Componentes diferidos para wearables
      deferredComponents: isWearable ? ['sidebar', 'footer', 'ads'] : ['ads'],
      // Imágenes con lazy loading agresivo en wearables
      imageLoading: isWearable ? 'lazy-aggressive' : 'lazy',
      // Scripts diferidos
      scriptLoading: isWearable ? 'defer-all' : 'async-critical'
    };
  }, [isWearable]);

  // Función para ejecutar feedback háptico
  const triggerHapticFeedback = useCallback((pattern = [50]) => {
    if (hapticFeedback) {
      navigator.vibrate(pattern);
    }
  }, [hapticFeedback]);

  // Función para feedback háptico contextual
  const hapticFeedbackForAction = useCallback((actionType) => {
    if (!hapticFeedback) return;

    const patterns = {
      success: [20, 10, 20], // Éxito
      error: [100, 50, 100], // Error
      warning: [50, 25, 50, 25, 50], // Advertencia
      light: [10], // Feedback ligero
      medium: [30], // Feedback medio
      heavy: [50] // Feedback fuerte
    };

    const pattern = patterns[actionType] || patterns.light;
    navigator.vibrate(pattern);
  }, [hapticFeedback]);

  return {
    deviceType,
    screenSize,
    isWearable,
    touchCapabilities,
    reducedMotion,
    hapticFeedback,
    getWearableOptimizations,
    getAnimationSettings,
    getProgressiveLoadingSettings,
    triggerHapticFeedback,
    hapticFeedbackForAction
  };
};