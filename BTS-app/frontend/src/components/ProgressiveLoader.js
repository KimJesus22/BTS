import React, { useState, useEffect, Suspense } from 'react';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';

// Componente de carga progresiva inteligente
export const ProgressiveLoader = ({
  children,
  fallback,
  priority = 'normal',
  chunkName
}) => {
  const { isWearable, getProgressiveLoadingSettings } = useWearableOptimizations();
  const { powerSavingMode } = useBatteryOptimization();
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  const settings = getProgressiveLoadingSettings();

  // Determinar si cargar inmediatamente o diferir
  useEffect(() => {
    if (priority === 'critical') {
      setShouldLoad(true);
      return;
    }

    if (powerSavingMode && priority !== 'high') {
      // En modo ahorro, solo cargar componentes críticos y high priority
      setShouldLoad(false);
      return;
    }

    if (isWearable && settings.deferredComponents.includes(chunkName)) {
      // En wearables, diferir componentes no esenciales
      const timer = setTimeout(() => setShouldLoad(true), 2000);
      return () => clearTimeout(timer);
    }

    // Carga normal con pequeña demora para mejor UX
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, [priority, powerSavingMode, isWearable, chunkName, settings.deferredComponents]);

  // Simular carga del componente
  useEffect(() => {
    if (shouldLoad && !isLoaded) {
      // Simular tiempo de carga
      const loadTime = powerSavingMode ? 50 : 100;
      const timer = setTimeout(() => setIsLoaded(true), loadTime);
      return () => clearTimeout(timer);
    }
  }, [shouldLoad, isLoaded, powerSavingMode]);

  if (!shouldLoad) {
    return fallback || <div className="loading-placeholder" />;
  }

  if (!isLoaded) {
    return fallback || <div className="loading-placeholder" />;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Hook para carga lazy de componentes
export const useLazyComponent = (importFunc, options = {}) => {
  const [Component, setComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { powerSavingMode } = useBatteryOptimization();
  const { isWearable } = useWearableOptimizations();

  const loadComponent = async () => {
    if (Component || loading) return;

    try {
      setLoading(true);

      // Añadir delay en modo ahorro
      if (powerSavingMode || isWearable) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const module = await importFunc();
      setComponent(() => module.default || module);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga automática basada en opciones
  useEffect(() => {
    if (options.loadOnMount) {
      loadComponent();
    }
  }, [options.loadOnMount]);

  return {
    Component,
    loading,
    error,
    loadComponent
  };
};

// Componente para carga de imágenes optimizada
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { isWearable, getProgressiveLoadingSettings } = useWearableOptimizations();
  const { powerSavingMode } = useBatteryOptimization();

  const settings = getProgressiveLoadingSettings();

  // Determinar estrategia de carga
  const loadingStrategy = priority ? 'eager' :
    (powerSavingMode || isWearable) ? 'lazy' : 'lazy';

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  // Placeholder mientras carga
  if (!isLoaded && !hasError) {
    return (
      <div
        className="image-placeholder"
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: 'var(--theme-surface)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--theme-textMuted)'
        }}
        {...props}
      >
        <span style={{ fontSize: '14px' }}>Cargando...</span>
      </div>
    );
  }

  if (hasError) {
    return (
      <div
        className="image-error"
        style={{
          width: width || '100%',
          height: height || '200px',
          backgroundColor: 'var(--theme-error)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
        {...props}
      >
        <span style={{ fontSize: '14px' }}>Error al cargar</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loadingStrategy}
      onLoad={handleLoad}
      onError={handleError}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
        ...props.style
      }}
      {...props}
    />
  );
};

// Componente para carga de datos optimizada
export const OptimizedDataLoader = ({
  fetchFunc,
  children,
  fallback,
  errorFallback,
  cacheKey
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { powerSavingMode } = useBatteryOptimization();
  const { isWearable } = useWearableOptimizations();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar cache primero
        const cacheKeyFull = `data_${cacheKey}`;
        const cached = sessionStorage.getItem(cacheKeyFull);

        if (cached && !powerSavingMode) {
          setData(JSON.parse(cached));
          setLoading(false);
          return;
        }

        // Añadir delay en modo ahorro para reducir peticiones
        if (powerSavingMode || isWearable) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        const result = await fetchFunc();
        setData(result);

        // Cachear si no está en modo ahorro
        if (!powerSavingMode) {
          sessionStorage.setItem(cacheKeyFull, JSON.stringify(result));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [fetchFunc, cacheKey, powerSavingMode, isWearable]);

  if (loading) {
    return fallback || <div className="data-loading">Cargando datos...</div>;
  }

  if (error) {
    return errorFallback || <div className="data-error">Error al cargar datos</div>;
  }

  return children(data);
};

export default {
  ProgressiveLoader,
  useLazyComponent,
  OptimizedImage,
  OptimizedDataLoader
};