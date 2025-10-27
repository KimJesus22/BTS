import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';

// Componente wrapper para lazy loading con fallback optimizado
const LazyWrapper = ({
  component: ComponentPromise,
  fallback: FallbackComponent,
  loadingProps = {},
  animationProps = {},
  ...props
}) => {
  const { accessibilityMode } = useAccessibility();

  // Lazy load del componente
  const LazyComponent = lazy(ComponentPromise);

  // Fallback por defecto optimizado
  const DefaultFallback = () => (
    <motion.div
      initial={accessibilityMode ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      animate={accessibilityMode ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
      exit={accessibilityMode ? { opacity: 0, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={accessibilityMode ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px'
      }}
      {...animationProps}
    >
      <div style={{ textAlign: 'center' }}>
        <motion.div
          animate={accessibilityMode ? { rotate: 0 } : { rotate: 360 }}
          transition={accessibilityMode ? { duration: 0 } : {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #2196f3',
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            margin: '0 auto 1rem auto'
          }}
        />
        <p style={{ margin: 0, color: '#666' }}>Cargando...</p>
      </div>
    </motion.div>
  );

  const Fallback = FallbackComponent || DefaultFallback;

  return (
    <Suspense fallback={<Fallback {...loadingProps} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Función helper para crear componentes lazy
export const createLazyComponent = (importFunc, fallbackComponent = null) => {
  return (props) => (
    <LazyWrapper
      component={importFunc}
      fallback={fallbackComponent}
      {...props}
    />
  );
};

// Función helper para lazy loading con preload
export const createLazyComponentWithPreload = (importFunc, fallbackComponent = null) => {
  let loaded = false;
  let component = null;

  const preload = () => {
    if (!loaded) {
      loaded = true;
      importFunc().then((module) => {
        component = module.default;
      });
    }
  };

  const LazyComponent = (props) => {
    if (component) {
      const Component = component;
      return <Component {...props} />;
    }

    return (
      <LazyWrapper
        component={() => importFunc()}
        fallback={fallbackComponent}
        {...props}
      />
    );
  };

  LazyComponent.preload = preload;

  return LazyComponent;
};

// Hook personalizado para lazy loading inteligente
export const useLazyLoading = () => {
  const [loadingStates, setLoadingStates] = React.useState({});

  const loadComponent = React.useCallback(async (key, importFunc) => {
    if (loadingStates[key]?.status === 'loaded') {
      return loadingStates[key].component;
    }

    setLoadingStates(prev => ({
      ...prev,
      [key]: { status: 'loading', component: null }
    }));

    try {
      const module = await importFunc();
      const component = module.default;

      setLoadingStates(prev => ({
        ...prev,
        [key]: { status: 'loaded', component }
      }));

      return component;
    } catch (error) {
      setLoadingStates(prev => ({
        ...prev,
        [key]: { status: 'error', component: null, error }
      }));

      throw error;
    }
  }, [loadingStates]);

  const preloadComponent = React.useCallback((key, importFunc) => {
    if (!loadingStates[key]) {
      loadComponent(key, importFunc).catch(() => {
        // Silenciar errores de preload
      });
    }
  }, [loadingStates, loadComponent]);

  return {
    loadingStates,
    loadComponent,
    preloadComponent
  };
};

export default LazyWrapper;