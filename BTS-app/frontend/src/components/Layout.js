import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

// Componente Layout organismo reutilizable
const Layout = ({
  children,
  header,
  footer,
  sidebar,
  loading = false,
  error,
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable } = useWearableOptimizations();

  const palette = getCurrentPalette();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Manejar apertura/cierre del sidebar
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Cerrar sidebar en móviles al cambiar de ruta
  useEffect(() => {
    if (isWearable && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [window.location.pathname]); // Esto debería ser el pathname actual

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    headerHeight: '56px',
    footerHeight: 'auto',
    sidebarWidth: sidebarCollapsed ? 48 : 240,
    contentPadding: DESIGN_TOKENS.spacing[2]
  } : {
    headerHeight: '72px',
    footerHeight: 'auto',
    sidebarWidth: sidebarCollapsed ? 64 : 280,
    contentPadding: DESIGN_TOKENS.spacing[4]
  };

  // Calcular márgenes para el contenido
  const contentMargin = {
    top: header ? wearableAdjustments.headerHeight : 0,
    bottom: footer ? wearableAdjustments.footerHeight : 0,
    left: sidebar && !isWearable ? wearableAdjustments.sidebarWidth : 0
  };

  return (
    <div
      className={`layout ${className}`}
      style={{
        minHeight: '100vh',
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
      {...props}
    >
      {/* Header */}
      {header && (
        <Header
          {...header}
          onMenuClick={sidebar ? handleSidebarToggle : undefined}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            ...header.style
          }}
        />
      )}

      {/* Sidebar */}
      {sidebar && (
        <Sidebar
          {...sidebar}
          isOpen={sidebarOpen}
          onClose={handleSidebarClose}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleSidebarCollapse}
          width={wearableAdjustments.sidebarWidth}
        />
      )}

      {/* Contenido principal */}
      <main
        className="layout-content"
        style={{
          flex: 1,
          marginTop: contentMargin.top,
          marginBottom: contentMargin.bottom,
          marginLeft: contentMargin.left,
          padding: wearableAdjustments.contentPadding,
          transition: animationsEnabled && !reducedAnimations
            ? `margin-left ${DESIGN_TOKENS.animations.duration.normal}ms ${DESIGN_TOKENS.animations.easing.out}`
            : 'none'
        }}
      >
        {/* Estado de carga */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              flexDirection: 'column',
              gap: DESIGN_TOKENS.spacing[4]
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${palette.primary}`,
                borderTop: `3px solid transparent`,
                borderRadius: '50%'
              }}
            />
            <p style={{ color: palette.textSecondary, margin: 0 }}>
              {t('layout.loading', 'Cargando...')}
            </p>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              flexDirection: 'column',
              gap: DESIGN_TOKENS.spacing[4],
              textAlign: 'center',
              padding: DESIGN_TOKENS.spacing[4]
            }}
          >
            <div
              style={{
                fontSize: '48px',
                color: palette.error,
                marginBottom: DESIGN_TOKENS.spacing[2]
              }}
            >
              ⚠️
            </div>
            <h3 style={{ color: palette.text, margin: 0 }}>
              {t('layout.error.title', 'Algo salió mal')}
            </h3>
            <p style={{ color: palette.textSecondary, margin: 0 }}>
              {error.message || t('layout.error.message', 'Ocurrió un error inesperado')}
            </p>
            {error.onRetry && (
              <button
                onClick={error.onRetry}
                style={{
                  marginTop: DESIGN_TOKENS.spacing[4],
                  padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[4]}`,
                  backgroundColor: palette.primary,
                  color: palette.background,
                  border: 'none',
                  borderRadius: DESIGN_TOKENS.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: DESIGN_TOKENS.typography.fontSize.base
                }}
              >
                {t('layout.error.retry', 'Reintentar')}
              </button>
            )}
          </div>
        )}

        {/* Contenido */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
              ease: "easeOut"
            }}
          >
            {children}
          </motion.div>
        )}
      </main>

      {/* Footer */}
      {footer && (
        <Footer
          {...footer}
          style={{
            marginLeft: contentMargin.left,
            transition: animationsEnabled && !reducedAnimations
              ? `margin-left ${DESIGN_TOKENS.animations.duration.normal}ms ${DESIGN_TOKENS.animations.easing.out}`
              : 'none',
            ...footer.style
          }}
        />
      )}

      {/* Overlay para sidebar móvil */}
      {sidebar && sidebarOpen && isWearable && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998
          }}
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
};

export default Layout;