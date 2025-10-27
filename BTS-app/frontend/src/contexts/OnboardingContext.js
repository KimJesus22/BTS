// Contexto de Onboarding para gestión del tutorial interactivo avanzado
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Definir los pasos del tutorial
const ONBOARDING_STEPS = {
  WELCOME: {
    id: 'welcome',
    titleKey: 'onboarding.welcome.title',
    descriptionKey: 'onboarding.welcome.description',
    target: null, // Modal centrado
    position: 'center',
    action: 'next'
  },
  SEARCH_FEATURE: {
    id: 'search_feature',
    titleKey: 'onboarding.search.title',
    descriptionKey: 'onboarding.search.description',
    target: '.search-input', // Selector CSS del elemento
    position: 'bottom',
    action: 'next'
  },
  FAVORITES_FEATURE: {
    id: 'favorites_feature',
    titleKey: 'onboarding.favorites.title',
    descriptionKey: 'onboarding.favorites.description',
    target: '.favorites-button',
    position: 'top',
    action: 'next'
  },
  GAMIFICATION_INTRO: {
    id: 'gamification_intro',
    titleKey: 'onboarding.gamification.title',
    descriptionKey: 'onboarding.gamification.description',
    target: '.gamification-panel',
    position: 'left',
    action: 'next'
  },
  WEARABLE_OPTIMIZATIONS: {
    id: 'wearable_optimizations',
    titleKey: 'onboarding.wearable.title',
    descriptionKey: 'onboarding.wearable.description',
    target: '.wearable-indicator',
    position: 'right',
    action: 'next'
  },
  PWA_OFFLINE: {
    id: 'pwa_offline',
    titleKey: 'onboarding.pwa.title',
    descriptionKey: 'onboarding.pwa.description',
    target: '.offline-indicator',
    position: 'bottom',
    action: 'next'
  },
  COMPLETION: {
    id: 'completion',
    titleKey: 'onboarding.completion.title',
    descriptionKey: 'onboarding.completion.description',
    target: null,
    position: 'center',
    action: 'finish'
  }
};

// Crear el contexto
const OnboardingContext = createContext();

// Proveedor del contexto
export const OnboardingProvider = ({ children }) => {

  // Estado del onboarding
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('onboarding-active');
    return saved ? JSON.parse(saved) : false;
  });

  // Estado de primera visita
  const [isFirstVisit, setIsFirstVisit] = useState(() => {
    const saved = localStorage.getItem('onboarding-first-visit');
    return saved === null; // Si no existe, es primera visita
  });

  // Paso actual del tutorial
  const [currentStep, setCurrentStep] = useState(() => {
    const saved = localStorage.getItem('onboarding-current-step');
    return saved || 'welcome';
  });

  // Estado de si el tutorial está completado
  const [isCompleted, setIsCompleted] = useState(() => {
    const saved = localStorage.getItem('onboarding-completed');
    return saved ? JSON.parse(saved) : false;
  });

  // Estado de progreso del tutorial
  const [progress, setProgress] = useState(0);

  // Estado de si se puede saltar el tutorial
  const [canSkip, setCanSkip] = useState(true);

  // Estado de animaciones del onboarding
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Efecto para marcar primera visita como completada
  useEffect(() => {
    if (isFirstVisit) {
      localStorage.setItem('onboarding-first-visit', 'false');
      setIsFirstVisit(false);
    }
  }, [isFirstVisit]);

  // Efecto para guardar estado en localStorage
  useEffect(() => {
    localStorage.setItem('onboarding-active', JSON.stringify(isActive));
  }, [isActive]);

  useEffect(() => {
    localStorage.setItem('onboarding-current-step', currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem('onboarding-completed', JSON.stringify(isCompleted));
  }, [isCompleted]);

  // Calcular progreso basado en el paso actual
  useEffect(() => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    const newProgress = ((currentIndex + 1) / steps.length) * 100;
    setProgress(Math.round(newProgress));
  }, [currentStep]);

  // Función para iniciar el onboarding
  const startOnboarding = useCallback(() => {
    setIsActive(true);
    setCurrentStep('welcome');
    setIsCompleted(false);
    setProgress(0);
  }, []);

  // Función para detener el onboarding
  const stopOnboarding = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
  }, []);

  // Función para ir al siguiente paso
  const nextStep = useCallback(() => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      const nextStepId = steps[currentIndex + 1];
      setCurrentStep(nextStepId);
    } else {
      // Último paso, completar tutorial
      stopOnboarding();
    }
  }, [currentStep, stopOnboarding]);

  // Función para ir al paso anterior
  const previousStep = useCallback(() => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      const prevStepId = steps[currentIndex - 1];
      setCurrentStep(prevStepId);
    }
  }, [currentStep]);

  // Función para saltar al paso específico
  const goToStep = useCallback((stepId) => {
    if (ONBOARDING_STEPS[stepId]) {
      setCurrentStep(stepId);
    }
  }, []);

  // Función para reiniciar el tutorial
  const restartOnboarding = useCallback(() => {
    setCurrentStep('welcome');
    setIsCompleted(false);
    setProgress(0);
    setIsActive(true);
  }, []);

  // Función para saltar el tutorial completamente
  const skipOnboarding = useCallback(() => {
    if (canSkip) {
      stopOnboarding();
    }
  }, [canSkip, stopOnboarding]);

  // Función para obtener el paso actual
  const getCurrentStepData = useCallback(() => {
    return ONBOARDING_STEPS[currentStep] || ONBOARDING_STEPS.WELCOME;
  }, [currentStep]);

  // Función para verificar si hay un paso siguiente
  const hasNextStep = useCallback(() => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1;
  }, [currentStep]);

  // Función para verificar si hay un paso anterior
  const hasPreviousStep = useCallback(() => {
    const steps = Object.keys(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex > 0;
  }, [currentStep]);

  // Función para activar/desactivar animaciones
  const toggleAnimations = useCallback((enabled) => {
    setAnimationsEnabled(enabled);
  }, []);

  // Función para configurar si se puede saltar
  const setSkippable = useCallback((skippable) => {
    setCanSkip(skippable);
  }, []);

  // Valor del contexto
  const value = {
    // Estado
    isActive,
    isFirstVisit,
    currentStep,
    isCompleted,
    progress,
    canSkip,
    animationsEnabled,

    // Datos estáticos
    steps: ONBOARDING_STEPS,

    // Funciones de control
    startOnboarding,
    stopOnboarding,
    nextStep,
    previousStep,
    goToStep,
    restartOnboarding,
    skipOnboarding,
    getCurrentStepData,
    hasNextStep,
    hasPreviousStep,
    toggleAnimations,
    setSkippable
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding debe ser usado dentro de un OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;