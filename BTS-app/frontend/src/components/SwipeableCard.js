import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Card from './Card';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { useGamification } from '../hooks/useGamification';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useTheme } from '../contexts/ThemeContext';
import { DESIGN_TOKENS } from '../design-tokens';
import Icon from './Icon';

// Componente SwipeableCard que extiende Card con soporte para gestos
const SwipeableCard = ({
  children,
  onFavorite,
  onDelete,
  onSwipeLeft,
  onSwipeRight,
  favoriteEnabled = true,
  deleteEnabled = true,
  gamificationEnabled = true,
  itemId,
  ...cardProps
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, hapticFeedback } = useWearableOptimizations();
  const { trackFavorite, trackSwipeGesture } = useGamification();

  const palette = getCurrentPalette();

  const [swipeDirection, setSwipeDirection] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Configuración de gestos
  const swipeConfig = {
    threshold: isWearable ? 40 : 60,
    velocityThreshold: isWearable ? 0.2 : 0.3,
    onSwipeStart: useCallback(() => {
      setShowActions(true);
    }, []),
    onSwipeMove: useCallback((currentPos, startPos) => {
      const deltaX = currentPos.x - startPos.x;
      if (Math.abs(deltaX) > 30) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      }
    }, []),
    onSwipeLeft: useCallback((swipeData) => {
      if (deleteEnabled) {
        setSwipeDirection('left');
        setIsAnimating(true);

        // Feedback háptico
        if (isWearable && hapticFeedback) {
          navigator.vibrate?.([30, 10, 30]);
        }

        // Gamificación
        if (gamificationEnabled && itemId) {
          trackSwipeGesture('swipe_delete', itemId);
        }

        // Ejecutar callback personalizado o default
        if (onSwipeLeft) {
          onSwipeLeft(swipeData);
        } else {
          onDelete?.(itemId);
        }

        // Reset después de animación
        setTimeout(() => {
          setSwipeDirection(null);
          setIsAnimating(false);
          setShowActions(false);
        }, 300);
      }
    }, [deleteEnabled, onSwipeLeft, onDelete, itemId, gamificationEnabled, isWearable, hapticFeedback]),
    onSwipeRight: useCallback((swipeData) => {
      if (favoriteEnabled) {
        setSwipeDirection('right');
        setIsAnimating(true);

        // Feedback háptico
        if (isWearable && hapticFeedback) {
          navigator.vibrate?.([20, 10, 20, 10, 20]);
        }

        // Gamificación
        if (gamificationEnabled && itemId) {
          trackFavorite(itemId);
          trackSwipeGesture('swipe_favorite', itemId);
        }

        // Ejecutar callback personalizado o default
        if (onSwipeRight) {
          onSwipeRight(swipeData);
        } else {
          onFavorite?.(itemId);
        }

        // Reset después de animación
        setTimeout(() => {
          setSwipeDirection(null);
          setIsAnimating(false);
          setShowActions(false);
        }, 300);
      }
    }, [favoriteEnabled, onSwipeRight, onFavorite, itemId, gamificationEnabled, trackFavorite, isWearable, hapticFeedback]),
    onSwipeEnd: useCallback(() => {
      if (!isAnimating) {
        setSwipeDirection(null);
        setShowActions(false);
      }
    }, [isAnimating])
  };

  const { elementRef, isSwiping, currentOffset, config } = useSwipeGestures(swipeConfig);

  // Variantes de animación para la card (optimizadas para batería)
  const animationDuration = reducedAnimations ? 0.1 : 0.3;
  const cardVariants = {
    idle: {
      x: 0,
      rotate: 0,
      scale: 1
    },
    swiping: {
      x: currentOffset.x,
      rotate: reducedAnimations ? 0 : currentOffset.x * 0.02, // Rotación sutil
      scale: reducedAnimations ? 1 : 1 - Math.abs(currentOffset.x) * 0.001 // Escala sutil
    },
    favorite: {
      x: 300,
      rotate: reducedAnimations ? 0 : 15,
      scale: reducedAnimations ? 0.95 : 0.9,
      opacity: 0,
      transition: { duration: animationDuration, ease: "easeOut" }
    },
    delete: {
      x: -300,
      rotate: reducedAnimations ? 0 : -15,
      scale: reducedAnimations ? 0.95 : 0.9,
      opacity: 0,
      transition: { duration: animationDuration, ease: "easeOut" }
    }
  };

  // Variantes para las acciones
  const actionVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  // Determinar estado actual
  const getCurrentState = () => {
    if (isAnimating) {
      return swipeDirection === 'right' ? 'favorite' : 'delete';
    }
    if (isSwiping) {
      return 'swiping';
    }
    return 'idle';
  };

  const currentState = getCurrentState();

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Acciones de fondo */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={actionVariants}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `0 ${DESIGN_TOKENS.spacing[4]}`,
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {/* Acción izquierda (eliminar) */}
            {deleteEnabled && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_TOKENS.spacing[2],
                  color: palette.error,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                  fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold
                }}
              >
                <Icon name="trash" size="md" color={palette.error} />
                <span>{t('swipe.delete', 'Eliminar')}</span>
              </div>
            )}

            {/* Acción derecha (favorito) */}
            {favoriteEnabled && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: DESIGN_TOKENS.spacing[2],
                  color: palette.success,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                  fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold
                }}
              >
                <span>{t('swipe.favorite', 'Favorito')}</span>
                <Icon name="heart" size="md" color={palette.success} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card principal */}
      <motion.div
        ref={elementRef}
        variants={cardVariants}
        animate={currentState}
        style={{
          position: 'relative',
          zIndex: 2,
          cursor: isSwiping ? 'grabbing' : 'grab'
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          {...cardProps}
          style={{
            ...cardProps.style,
            userSelect: 'none',
            touchAction: 'pan-y pinch-zoom' // Permitir scroll vertical pero no horizontal
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft' && deleteEnabled) {
              swipeConfig.onSwipeLeft?.({ direction: 'left', velocity: 1 });
            } else if (e.key === 'ArrowRight' && favoriteEnabled) {
              swipeConfig.onSwipeRight?.({ direction: 'right', velocity: 1 });
            }
          }}
          tabIndex={cardProps.clickable ? 0 : -1}
          role={cardProps.clickable ? 'button' : undefined}
          aria-label={cardProps.title ? `${t('card.title', 'Tarjeta')}: ${cardProps.title}` : t('card.content', 'Contenido de tarjeta')}
        >
          {children}
        </Card>
      </motion.div>

      {/* Indicador de progreso para wearables */}
      {isWearable && isSwiping && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: DESIGN_TOKENS.spacing[2],
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            backgroundColor: palette.surface,
            borderRadius: DESIGN_TOKENS.borderRadius.sm,
            overflow: 'hidden',
            zIndex: 3
          }}
        >
          <motion.div
            style={{
              height: '100%',
              backgroundColor: swipeDirection === 'right' ? palette.success : palette.error,
              borderRadius: DESIGN_TOKENS.borderRadius.sm
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(Math.abs(currentOffset.x) / config.threshold * 100, 100)}%`
            }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableCard;