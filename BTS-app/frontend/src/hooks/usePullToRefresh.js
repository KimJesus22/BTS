import { useState, useCallback, useRef, useEffect } from 'react';
import { useBatteryOptimization } from './useBatteryOptimization';
import { useWearableOptimizations } from './useWearableOptimizations';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const usePullToRefresh = (options = {}) => {
  const {
    threshold = 80, // Distancia mínima para activar refresh
    onRefresh,
    disabled = false,
    maxPullDistance = 120, // Distancia máxima de pull
    refreshDuration = 1000 // Duración de la animación de refresh
  } = options;

  const { reducedAnimations, powerSavingMode } = useBatteryOptimization();
  const { isWearable, hapticFeedback } = useWearableOptimizations();
  const { animationsEnabled } = useAccessibility();

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  const refreshTimeoutRef = useRef(null);

  // Ajustes para wearables y batería
  const wearableThreshold = isWearable ? threshold * 0.7 : threshold;
  const wearableMaxDistance = isWearable ? maxPullDistance * 0.8 : maxPullDistance;
  const batteryOptimizedDuration = powerSavingMode ? refreshDuration * 1.5 : refreshDuration;

  // Función para calcular la distancia de pull con resistencia
  const calculatePullDistance = useCallback((deltaY) => {
    // Aplicar resistencia progresiva
    const resistance = deltaY > wearableMaxDistance ? 0.3 : 0.7;
    return Math.min(deltaY * resistance, wearableMaxDistance);
  }, [wearableMaxDistance]);

  // Función para determinar si se puede hacer refresh
  const shouldRefresh = useCallback((distance) => {
    return distance >= wearableThreshold;
  }, [wearableThreshold]);

  // Manejar inicio del touch
  const handleTouchStart = useCallback((event) => {
    if (disabled || isRefreshing) return;

    const touch = event.touches[0];
    setStartY(touch.clientY);
    setIsPulling(true);
  }, [disabled, isRefreshing]);

  // Manejar movimiento del touch
  const handleTouchMove = useCallback((event) => {
    if (!isPulling || disabled || isRefreshing) return;

    const touch = event.touches[0];
    const deltaY = touch.clientY - startY;

    // Solo procesar si es movimiento hacia abajo desde la parte superior
    if (deltaY > 0 && window.scrollY === 0) {
      event.preventDefault();

      const distance = calculatePullDistance(deltaY);
      setPullDistance(distance);
      setCanRefresh(shouldRefresh(distance));

      // Feedback háptico para wearables
      if (isWearable && hapticFeedback && shouldRefresh(distance) && !canRefresh) {
        navigator.vibrate?.(15);
      }
    }
  }, [isPulling, disabled, isRefreshing, startY, calculatePullDistance, shouldRefresh, isWearable, hapticFeedback, canRefresh]);

  // Manejar fin del touch
  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return;

    setIsPulling(false);

    if (canRefresh && onRefresh) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Error during pull to refresh:', error);
      } finally {
        // Animación de vuelta a posición inicial
        setTimeout(() => {
          setIsRefreshing(false);
          setCanRefresh(false);
          setPullDistance(0);
        }, batteryOptimizedDuration);
      }
    } else {
      // Volver a posición inicial sin refresh
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [isPulling, disabled, canRefresh, onRefresh, batteryOptimizedDuration]);

  // Configurar event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Calcular progreso para animaciones
  const progress = Math.min(pullDistance / wearableThreshold, 1);
  const refreshProgress = isRefreshing ? 1 : progress;

  // Estado de animación considerando optimizaciones
  const animationEnabled = animationsEnabled && !reducedAnimations;

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    canRefresh,
    progress: refreshProgress,
    // Configuración actual
    config: {
      threshold: wearableThreshold,
      maxPullDistance: wearableMaxDistance,
      animationEnabled,
      hapticEnabled: isWearable && hapticFeedback,
      batteryOptimized: powerSavingMode
    },
    // Función para forzar refresh programáticamente
    forceRefresh: useCallback(async () => {
      if (isRefreshing) return;

      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } catch (error) {
        console.error('Error during forced refresh:', error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
        }, batteryOptimizedDuration);
      }
    }, [isRefreshing, onRefresh, batteryOptimizedDuration])
  };
};