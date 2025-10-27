import React from 'react';
import { motion } from 'framer-motion';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';

const WearableLayout = ({ children, title, showBack = false, onBack }) => {
  const { isWearable, getWearableOptimizations, getAnimationSettings } = useWearableOptimizations();
  const { powerSavingMode } = useBatteryOptimization();

  const optimizations = getWearableOptimizations();
  const animationSettings = getAnimationSettings();

  // Layout compacto para wearables
  if (isWearable) {
    return (
      <motion.div
        className="wearable-layout"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={animationSettings}
        style={{
          minHeight: '100vh',
          padding: optimizations.padding,
          fontSize: optimizations.fontSize,
          backgroundColor: 'var(--theme-background)',
          color: 'var(--theme-text)'
        }}
      >
        {/* Header minimalista */}
        <header className="wearable-header" style={{ marginBottom: '8px' }}>
          {showBack && (
            <motion.button
              className="back-btn"
              onClick={onBack}
              whileTap={{ scale: 0.9 }}
              style={{
                width: optimizations.buttonSize,
                height: optimizations.buttonSize,
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--theme-surface)',
                color: 'var(--theme-text)',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '8px'
              }}
            >
              ←
            </motion.button>
          )}
          <h1 style={{
            fontSize: '16px',
            fontWeight: '600',
            margin: 0,
            flex: 1
          }}>
            {title}
          </h1>
        </header>

        {/* Contenido principal */}
        <main className="wearable-content" style={{ flex: 1 }}>
          {children}
        </main>

        {/* Indicador de modo ahorro si está activo */}
        {powerSavingMode && (
          <motion.div
            className="power-saving-indicator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'fixed',
              bottom: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--theme-warning)',
              opacity: 0.7
            }}
          />
        )}

        <style jsx>{`
          .wearable-layout {
            display: flex;
            flex-direction: column;
            max-width: 280px;
            margin: 0 auto;
          }

          .wearable-header {
            display: flex;
            align-items: center;
            padding: 4px 0;
            border-bottom: 1px solid var(--theme-border);
          }

          .wearable-content {
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .back-btn:focus {
            outline: 2px solid var(--theme-primary);
            outline-offset: 2px;
          }

          /* Optimizaciones para batería baja */
          .power-saving-indicator {
            animation: ${powerSavingMode ? 'pulse 2s infinite' : 'none'};
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.8; }
          }

          /* Soporte para movimiento reducido */
          @media (prefers-reduced-motion: reduce) {
            .wearable-layout * {
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>
      </motion.div>
    );
  }

  // Layout estándar para otros dispositivos
  return (
    <div className="standard-layout" style={{
      minHeight: '100vh',
      backgroundColor: 'var(--theme-background)',
      color: 'var(--theme-text)'
    }}>
      {children}
    </div>
  );
};

export default WearableLayout;