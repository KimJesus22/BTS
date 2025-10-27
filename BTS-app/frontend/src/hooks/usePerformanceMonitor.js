import { useState, useEffect, useCallback } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memoryUsage: 0,
    networkRequests: 0,
    batteryImpact: 0,
    animationFrameTime: 0,
    renderTime: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Monitoreo de FPS
  const monitorFPS = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }

      if (isMonitoring) {
        animationId = requestAnimationFrame(measureFPS);
      }
    };

    if (isMonitoring) {
      animationId = requestAnimationFrame(measureFPS);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isMonitoring]);

  // Monitoreo de memoria
  const monitorMemory = useCallback(() => {
    if ('memory' in performance) {
      const memInfo = performance.memory;
      const memoryMB = Math.round(memInfo.usedJSHeapSize / 1048576);
      setMetrics(prev => ({ ...prev, memoryUsage: memoryMB }));
    }
  }, []);

  // Monitoreo de red
  const monitorNetwork = useCallback(() => {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const entries = performance.getEntriesByType('resource');
      const networkRequests = entries.filter(entry =>
        entry.initiatorType !== 'local' && entry.duration > 0
      ).length;

      setMetrics(prev => ({ ...prev, networkRequests }));
    }
  }, []);

  // Calcular impacto en batería basado en métricas
  const calculateBatteryImpact = useCallback(() => {
    const { fps, memoryUsage, networkRequests } = metrics;

    // Estimación simplificada del impacto en batería
    let impact = 0;

    // FPS bajo aumenta consumo
    if (fps < 30) impact += 30;
    else if (fps < 50) impact += 15;

    // Memoria alta aumenta consumo
    if (memoryUsage > 50) impact += 20;
    else if (memoryUsage > 100) impact += 40;

    // Muchas peticiones de red aumentan consumo
    if (networkRequests > 10) impact += 25;

    const batteryImpact = Math.min(impact, 100);
    setMetrics(prev => ({ ...prev, batteryImpact }));
  }, [metrics]);

  // Iniciar monitoreo
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
  }, []);

  // Detener monitoreo
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Obtener recomendaciones de optimización
  const getOptimizationRecommendations = useCallback(() => {
    const recommendations = [];

    if (metrics.fps < 30) {
      recommendations.push({
        type: 'animation',
        message: 'FPS bajo detectado. Considera reducir animaciones complejas.',
        severity: 'high'
      });
    }

    if (metrics.memoryUsage > 100) {
      recommendations.push({
        type: 'memory',
        message: 'Uso alto de memoria. Implementa limpieza de componentes no utilizados.',
        severity: 'high'
      });
    }

    if (metrics.networkRequests > 20) {
      recommendations.push({
        type: 'network',
        message: 'Muchas peticiones de red. Optimiza carga de recursos.',
        severity: 'medium'
      });
    }

    if (metrics.batteryImpact > 50) {
      recommendations.push({
        type: 'battery',
        message: 'Alto impacto en batería. Activa modo ahorro de energía.',
        severity: 'high'
      });
    }

    return recommendations;
  }, [metrics]);

  // Guardar métricas en historial
  const saveMetricsToHistory = useCallback(() => {
    const timestamp = Date.now();
    setPerformanceHistory(prev => [
      ...prev.slice(-9), // Mantener últimas 10 entradas
      { ...metrics, timestamp }
    ]);
  }, [metrics]);

  // Efectos de monitoreo
  useEffect(() => {
    if (!isMonitoring) return;

    const cleanupFPS = monitorFPS();

    const intervalId = setInterval(() => {
      monitorMemory();
      monitorNetwork();
      calculateBatteryImpact();
      saveMetricsToHistory();
    }, 5000); // Cada 5 segundos

    return () => {
      cleanupFPS();
      clearInterval(intervalId);
    };
  }, [isMonitoring, monitorFPS, monitorMemory, monitorNetwork, calculateBatteryImpact, saveMetricsToHistory]);

  return {
    metrics,
    performanceHistory,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getOptimizationRecommendations
  };
};