// Importar las dependencias de React y React Router
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Importar hooks de optimización
import { useWearableOptimizations } from './hooks/useWearableOptimizations';
import { useBatteryOptimization } from './hooks/useBatteryOptimization';
import { usePerformanceMonitor } from './hooks/usePerformanceMonitor';
import { useOnboarding } from './hooks/useOnboarding';

// Importar configuración de internacionalización
import './i18n';

// Importar páginas con carga perezosa (code splitting)
const PaginaPrincipal = lazy(() => import('./pages/PaginaPrincipal'));
const PaginaDetalleMiembro = lazy(() => import('./pages/PaginaDetalleMiembro'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

// Importar componentes con carga perezosa
const OfflineIndicator = lazy(() => import('./components/OfflineIndicator'));
const InstallPrompt = lazy(() => import('./components/InstallPrompt'));
const SyncStatus = lazy(() => import('./components/SyncStatus'));
const OnboardingModal = lazy(() => import('./components/OnboardingModal'));
const SearchBar = lazy(() => import('./components/SearchBar'));
const AccessibilityToggle = lazy(() => import('./components/AccessibilityToggle'));

// Importar el contexto de accesibilidad
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Importar el contexto de tema
import { ThemeProvider } from './contexts/ThemeContext';

// Importar el contexto de diseño
import { DesignProvider } from './contexts/DesignContext';

// Importar el contexto de gamificación
import { GamificationProvider } from './contexts/GamificationContext';

// Importar el contexto de onboarding
import { OnboardingProvider } from './contexts/OnboardingContext';

// Importar los estilos globales de la aplicación
import './App.css';

// Componente principal de la aplicación
function App() {
  return (
    <ThemeProvider>
      <ThemeInnerApp />
    </ThemeProvider>
  );
}

// Componente interno que puede usar hooks del ThemeProvider
function ThemeInnerApp() {
  return (
    <DesignProvider>
      <GamificationProvider>
        <AccessibilityProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </AccessibilityProvider>
      </GamificationProvider>
    </DesignProvider>
  );
}

// Componente de contenido principal que puede usar todos los hooks
function AppContent() {
  const { t } = useTranslation();
  const location = useLocation();

  // Hooks de optimización (ahora dentro de sus respectivos proveedores)
  const { isWearable, getAnimationSettings } = useWearableOptimizations();
  const { reducedAnimations } = useBatteryOptimization();
  const { startMonitoring } = usePerformanceMonitor();

  // Hook de onboarding para mostrar SearchBar durante tutorial
  const { isActive: onboardingActive, getCurrentStepData } = useOnboarding();

  // Iniciar monitoreo de rendimiento
  React.useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  // Iniciar onboarding en primera visita
  React.useEffect(() => {
    // Onboarding se maneja dentro del OnboardingProvider
    // No necesitamos lógica adicional aquí
  }, []);

  // Configuraciones de animación optimizadas
  const animationSettings = getAnimationSettings();

  // Variantes de animación para las transiciones de página
  const pageVariants = {
    initial: { opacity: 0, x: reducedAnimations ? 0 : 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: reducedAnimations ? 0 : -20 }
  };

  const pageTransition = {
    type: reducedAnimations ? "tween" : "tween",
    ease: animationSettings.ease,
    duration: animationSettings.duration
  };

  return (
    <div className="App">
      {/* Componentes con carga perezosa y Suspense */}
      <Suspense fallback={<div className="loading-spinner" />}>
        {/* Indicador de estado offline optimizado */}
        <OfflineIndicator />
      </Suspense>

      <Suspense fallback={<div className="loading-spinner" />}>
        {/* Prompt de instalación PWA optimizado */}
        <InstallPrompt />
      </Suspense>

      <Suspense fallback={<div className="loading-spinner" />}>
        {/* Estado de sincronización optimizado */}
        <SyncStatus />
      </Suspense>

      <Suspense fallback={<div className="loading-spinner" />}>
        {/* Modal de onboarding */}
        <OnboardingModal />
      </Suspense>

      {/* Skip links para navegación por teclado */}
      <a href="#main-content" className="skip-link">
        {t('accessibility.skipToContent', 'Saltar al contenido principal')}
      </a>
      <a href="#accessibility-toggle" className="skip-to-accessibility">
        {t('accessibility.skipToAccessibility', 'Saltar a controles de accesibilidad')}
      </a>

      <Suspense fallback={<div className="loading-spinner" />}>
        {/* Botón flotante de accesibilidad */}
        <AccessibilityToggle />
      </Suspense>

      {/* Barra de búsqueda durante onboarding - mostrar solo en paso SEARCH_FEATURE */}
      {onboardingActive && getCurrentStepData().id === 'search_feature' && (
        <Suspense fallback={<div className="search-loading" />}>
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: '20px',
              borderRadius: '12px',
              maxWidth: '90vw',
              width: '400px'
            }}
            role="dialog"
            aria-labelledby="search-demo-title"
            aria-describedby="search-demo-description"
          >
            <h3 id="search-demo-title" style={{ color: 'white', marginBottom: '10px' }}>
              {t('onboarding.search.title')}
            </h3>
            <p id="search-demo-description" style={{ color: 'white', marginBottom: '15px', fontSize: '14px' }}>
              {t('onboarding.search.description')}
            </p>
            <SearchBar
              placeholder={t('search.placeholder')}
              onChange={() => {}} // No-op durante demo
              onSearch={() => {}} // No-op durante demo
              style={{ width: '100%' }}
            />
          </div>
        </Suspense>
      )}

      {/* Contenido principal de la aplicación con layout adaptativo */}
      <main id="main-content" className="container pt-4" role="main">
        {/* Definición de las rutas de la aplicación con animaciones optimizadas y code splitting */}
        <AnimatePresence mode="wait" custom={reducedAnimations}>
          <Routes location={location} key={location.pathname}>
            {/* Ruta para la página principal */}
            <Route
              path="/"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{
                    willChange: reducedAnimations ? 'auto' : 'transform, opacity'
                  }}
                >
                  <Suspense fallback={<div className="page-loading-spinner" />}>
                    <PaginaPrincipal />
                  </Suspense>
                </motion.div>
              }
            />
            {/* Ruta para la página de detalle de un miembro, con un parámetro dinámico para el ID */}
            <Route
              path="/miembro/:id"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{
                    willChange: reducedAnimations ? 'auto' : 'transform, opacity'
                  }}
                >
                  <Suspense fallback={<div className="page-loading-spinner" />}>
                    <PaginaDetalleMiembro />
                  </Suspense>
                </motion.div>
              }
            />
            {/* Ruta para la página de privacidad */}
            <Route
              path="/privacidad"
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                  style={{
                    willChange: reducedAnimations ? 'auto' : 'transform, opacity'
                  }}
                >
                  <Suspense fallback={<div className="page-loading-spinner" />}>
                    <PrivacyPage />
                  </Suspense>
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Pie de página o barra de navegación inferior - oculto en wearables pequeños */}
      {!isWearable && (
        <footer className="bottom-nav" role="navigation" aria-label={t('app.footer')}>
          <h1 className="app-title">{t('app.title')}</h1>
        </footer>
      )}
    </div>
  );
}

// Exportar el componente App para ser utilizado en otras partes de la aplicación
export default App;