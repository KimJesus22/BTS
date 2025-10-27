import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const useBatteryOptimization = () => {
  const { activateBatterySaver, theme } = useTheme();
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [batterySupported, setBatterySupported] = useState(false);
  const [powerSavingMode, setPowerSavingMode] = useState(false);
  const [reducedAnimations, setReducedAnimations] = useState(false);

  // Detectar soporte de Battery API
  useEffect(() => {
    if ('getBattery' in navigator) {
      setBatterySupported(true);
      navigator.getBattery().then((battery) => {
        // Estado inicial
        updateBatteryState(battery);

        // Listeners para cambios
        battery.addEventListener('levelchange', () => updateBatteryState(battery));
        battery.addEventListener('chargingchange', () => updateBatteryState(battery));
      });
    }
  }, []);

  // Actualizar estado de batería
  const updateBatteryState = useCallback((battery) => {
    const level = Math.round(battery.level * 100);
    setBatteryLevel(level);
    setIsCharging(battery.charging);

    // Activar modo ahorro cuando batería baja
    const shouldSavePower = level <= 20 && !battery.charging;
    setPowerSavingMode(shouldSavePower);

    // Activar tema de ahorro de batería cuando batería muy baja
    if (level <= 15 && !battery.charging && theme !== 'batterySaver') {
      activateBatterySaver();
    }

    // Reducir animaciones cuando batería crítica
    const shouldReduceAnimations = level <= 10 && !battery.charging;
    setReducedAnimations(shouldReduceAnimations);
  }, [activateBatterySaver, theme]);

  // Optimizaciones basadas en nivel de batería
  const getOptimizationSettings = useCallback(() => {
    return {
      // Animaciones reducidas
      animationsEnabled: !reducedAnimations,
      // Intervalos de actualización más largos
      updateInterval: powerSavingMode ? 30000 : 5000, // 30s vs 5s
      // Carga diferida más agresiva
      lazyLoadThreshold: powerSavingMode ? 0.1 : 0.5,
      // Cache más agresivo
      cacheStrategy: powerSavingMode ? 'cache-first' : 'network-first',
      // Reducir frecuencia de sincronización
      syncInterval: powerSavingMode ? 300000 : 60000, // 5min vs 1min
      // Desactivar efectos visuales pesados
      disableHeavyEffects: powerSavingMode,
      // Tema optimizado para batería
      forceDarkTheme: powerSavingMode && batteryLevel <= 15
    };
  }, [batteryLevel, powerSavingMode, reducedAnimations]);

  // Función para forzar optimizaciones manuales
  const forcePowerSaving = useCallback(() => {
    setPowerSavingMode(true);
    setReducedAnimations(true);
  }, []);

  // Restaurar optimizaciones normales
  const restoreNormalMode = useCallback(() => {
    setPowerSavingMode(false);
    setReducedAnimations(false);
  }, []);

  return {
    batteryLevel,
    isCharging,
    batterySupported,
    powerSavingMode,
    reducedAnimations,
    getOptimizationSettings,
    forcePowerSaving,
    restoreNormalMode
  };
};