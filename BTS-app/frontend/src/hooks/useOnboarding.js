import { useCallback, useEffect } from 'react';
import { useOnboarding as useOnboardingContext } from '../contexts/OnboardingContext';
import { useBatteryOptimization } from './useBatteryOptimization';
import { useWearableOptimizations } from './useWearableOptimizations';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useOnboarding = () => {
  const onboarding = useOnboardingContext();
  const { reducedAnimations, batteryLevel } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();
  const { animationsEnabled: accessibilityAnimations } = useAccessibility();

  // Configuraciones optimizadas basadas en el dispositivo y batería
  const getOptimizedSettings = useCallback(() => {
    const animationSettings = getAnimationSettings();

    return {
      // Animaciones condicionales basadas en batería y accesibilidad
      animationsEnabled: accessibilityAnimations && !reducedAnimations && onboarding.animationsEnabled,
      // Duración de animaciones optimizada
      animationDuration: reducedAnimations ? 0.1 : animationSettings.duration,
      // Estilo de easing optimizado
      animationEase: animationSettings.ease,
      // Layout adaptativo para wearables
      layout: isWearable ? 'compact' : 'standard',
      // Tamaño de elementos táctiles optimizado
      touchTargetSize: isWearable ? 48 : 44,
      // Modo de alto contraste si batería baja
      highContrast: batteryLevel <= 15
    };
  }, [
    accessibilityAnimations,
    reducedAnimations,
    onboarding.animationsEnabled,
    getAnimationSettings,
    isWearable,
    batteryLevel
  ]);

  // Función para iniciar onboarding con optimizaciones
  const startOnboardingOptimized = useCallback(() => {
    const settings = getOptimizedSettings();

    // Configurar animaciones basadas en optimizaciones
    onboarding.toggleAnimations(settings.animationsEnabled);

    // Iniciar onboarding
    onboarding.startOnboarding();
  }, [onboarding, getOptimizedSettings]);

  // Función para navegar al siguiente paso con validaciones
  const nextStepValidated = useCallback(() => {
    // Aquí se podrían añadir validaciones específicas del paso actual
    // Por ejemplo, verificar que el usuario haya interactuado con el elemento objetivo

    onboarding.nextStep();
  }, [onboarding]);

  // Función para verificar si el onboarding debe mostrarse automáticamente
  const shouldShowOnboarding = useCallback(() => {
    return onboarding.isFirstVisit && !onboarding.isCompleted;
  }, [onboarding.isFirstVisit, onboarding.isCompleted]);

  // Función para manejar interacciones del usuario durante el onboarding
  const handleUserInteraction = useCallback((interactionType, elementId) => {
    // Registrar interacciones para analytics o gamificación
    console.log(`Onboarding interaction: ${interactionType} on ${elementId}`);

    // Aquí se podría integrar con el contexto de gamificación
    // para dar puntos por completar pasos del tutorial
  }, []);

  // Función para pausar/reanudar onboarding basado en batería
  const handleBatteryOptimization = useCallback(() => {
    if (batteryLevel <= 10 && !reducedAnimations) {
      // Pausar animaciones pesadas cuando batería crítica
      onboarding.toggleAnimations(false);
    } else if (batteryLevel > 20 && !onboarding.animationsEnabled) {
      // Reanudar animaciones cuando batería mejora
      onboarding.toggleAnimations(true);
    }
  }, [batteryLevel, reducedAnimations, onboarding]);

  // Efecto para optimizaciones basadas en batería
  useEffect(() => {
    handleBatteryOptimization();
  }, [handleBatteryOptimization]);

  // Función para obtener el estado completo del onboarding con optimizaciones
  const getOnboardingState = useCallback(() => {
    return {
      ...onboarding,
      optimizedSettings: getOptimizedSettings(),
      shouldShow: shouldShowOnboarding()
    };
  }, [onboarding, getOptimizedSettings, shouldShowOnboarding]);

  return {
    // Estado del onboarding
    ...onboarding,

    // Funciones optimizadas
    startOnboarding: startOnboardingOptimized,
    nextStep: nextStepValidated,

    // Utilidades adicionales
    shouldShowOnboarding,
    handleUserInteraction,
    getOptimizedSettings,
    getOnboardingState
  };
};