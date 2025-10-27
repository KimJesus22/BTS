import { useState, useEffect, useCallback, useRef } from 'react';
import { useBatteryOptimization } from './useBatteryOptimization';
import { useWearableOptimizations } from './useWearableOptimizations';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useSwipeGestures = (options = {}) => {
  const {
    threshold = 50, // Distancia mínima para considerar swipe
    velocityThreshold = 0.3, // Velocidad mínima para swipe
    maxTime = 300, // Tiempo máximo para swipe
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    disabled = false
  } = options;

  const { reducedAnimations, powerSavingMode } = useBatteryOptimization();
  const { isWearable, hapticFeedback } = useWearableOptimizations();
  const { animationsEnabled } = useAccessibility();

  const [isSwiping, setIsSwiping] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const elementRef = useRef(null);

  // Ajustes para wearables y batería
  const wearableThreshold = isWearable ? threshold * 0.7 : threshold;
  const wearableVelocity = isWearable ? velocityThreshold * 0.8 : velocityThreshold;
  const batteryOptimizedThreshold = powerSavingMode ? wearableThreshold * 1.2 : wearableThreshold;
  const batteryOptimizedVelocity = powerSavingMode ? wearableVelocity * 1.1 : wearableVelocity;

  // Función para calcular distancia
  const getDistance = useCallback((pos1, pos2) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }, []);

  // Función para calcular velocidad
  const getVelocity = useCallback((distance, time) => {
    return distance / time;
  }, []);

  // Función para determinar dirección
  const getDirection = useCallback((start, end) => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Manejar inicio del toque
  const handleTouchStart = useCallback((event) => {
    if (disabled) return;

    const touch = event.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };

    setStartPos(pos);
    setCurrentPos(pos);
    setStartTime(Date.now());
    setIsSwiping(true);

    onSwipeStart?.(pos);

    // Feedback háptico para wearables
    if (isWearable && hapticFeedback) {
      navigator.vibrate?.(10);
    }
  }, [disabled, onSwipeStart, isWearable, hapticFeedback]);

  // Manejar movimiento del toque
  const handleTouchMove = useCallback((event) => {
    if (!isSwiping || disabled) return;

    event.preventDefault(); // Prevenir scroll por defecto

    const touch = event.touches[0];
    const pos = { x: touch.clientX, y: touch.clientY };

    setCurrentPos(pos);
    onSwipeMove?.(pos, startPos);
  }, [isSwiping, disabled, startPos, onSwipeMove]);

  // Manejar fin del toque
  const handleTouchEnd = useCallback((event) => {
    if (!isSwiping || disabled) return;

    const endTime = Date.now();
    const duration = endTime - startTime;
    const distance = getDistance(startPos, currentPos);
    const velocity = getVelocity(distance, duration);
    const direction = getDirection(startPos, currentPos);

    setIsSwiping(false);

    // Verificar si cumple criterios de swipe (con ajustes de batería)
    const isValidSwipe = distance >= batteryOptimizedThreshold &&
                        velocity >= batteryOptimizedVelocity &&
                        duration <= maxTime;

    if (isValidSwipe) {
      // Ejecutar callback correspondiente
      switch (direction) {
        case 'left':
          onSwipeLeft?.({ distance, velocity, duration, direction });
          break;
        case 'right':
          onSwipeRight?.({ distance, velocity, duration, direction });
          break;
        case 'up':
          onSwipeUp?.({ distance, velocity, duration, direction });
          break;
        case 'down':
          onSwipeDown?.({ distance, velocity, duration, direction });
          break;
      }

      // Feedback háptico para swipe exitoso
      if (isWearable && hapticFeedback) {
        navigator.vibrate?.([20, 10, 20]);
      }
    }

    onSwipeEnd?.({ distance, velocity, duration, direction, isValidSwipe });
  }, [
    isSwiping,
    disabled,
    startTime,
    startPos,
    currentPos,
    getDistance,
    getVelocity,
    getDirection,
    wearableThreshold,
    wearableVelocity,
    maxTime,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeEnd,
    isWearable,
    hapticFeedback
  ]);

  // Manejar eventos de mouse para desktop (útil para testing)
  const handleMouseDown = useCallback((event) => {
    if (disabled) return;

    const pos = { x: event.clientX, y: event.clientY };
    setStartPos(pos);
    setCurrentPos(pos);
    setStartTime(Date.now());
    setIsSwiping(true);

    onSwipeStart?.(pos);
  }, [disabled, onSwipeStart]);

  const handleMouseMove = useCallback((event) => {
    if (!isSwiping || disabled) return;

    const pos = { x: event.clientX, y: event.clientY };
    setCurrentPos(pos);
    onSwipeMove?.(pos, startPos);
  }, [isSwiping, disabled, startPos, onSwipeMove]);

  const handleMouseUp = useCallback(() => {
    if (!isSwiping || disabled) return;

    const endTime = Date.now();
    const duration = endTime - startTime;
    const distance = getDistance(startPos, currentPos);
    const velocity = getVelocity(distance, duration);
    const direction = getDirection(startPos, currentPos);

    setIsSwiping(false);

    const isValidSwipe = distance >= threshold &&
                        velocity >= velocityThreshold &&
                        duration <= maxTime;

    if (isValidSwipe) {
      switch (direction) {
        case 'left':
          onSwipeLeft?.({ distance, velocity, duration, direction });
          break;
        case 'right':
          onSwipeRight?.({ distance, velocity, duration, direction });
          break;
        case 'up':
          onSwipeUp?.({ distance, velocity, duration, direction });
          break;
        case 'down':
          onSwipeDown?.({ distance, velocity, duration, direction });
          break;
      }
    }

    onSwipeEnd?.({ distance, velocity, duration, direction, isValidSwipe });
  }, [
    isSwiping,
    disabled,
    startTime,
    startPos,
    currentPos,
    getDistance,
    getVelocity,
    getDirection,
    threshold,
    velocityThreshold,
    maxTime,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeEnd
  ]);

  // Configurar event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Mouse events (para desktop/testing)
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  ]);

  // Calcular offset actual para animaciones
  const getCurrentOffset = useCallback(() => {
    if (!isSwiping) return { x: 0, y: 0 };

    return {
      x: currentPos.x - startPos.x,
      y: currentPos.y - startPos.y
    };
  }, [isSwiping, currentPos, startPos]);

  return {
    elementRef,
    isSwiping,
    currentOffset: getCurrentOffset(),
    startPos,
    currentPos,
    // Configuración actual considerando optimizaciones
    config: {
      threshold: batteryOptimizedThreshold,
      velocityThreshold: batteryOptimizedVelocity,
      animationsEnabled: animationsEnabled && !reducedAnimations,
      hapticEnabled: isWearable && hapticFeedback,
      powerSavingMode
    }
  };
};