import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useSocialSharing } from '../hooks/useSocialSharing';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';
import Modal from './Modal';

// Componente SocialShare para compartir en redes sociales
const SocialShare = ({
  data = {},
  variant = 'grid', // 'grid', 'horizontal', 'vertical', 'floating'
  size = 'md',
  showLabels = true,
  showNativeShare = true,
  platforms = ['twitter', 'facebook', 'whatsapp', 'instagram'],
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings, hapticFeedback } = useWearableOptimizations();
  const {
    share,
    shareWithGesture,
    isSharing,
    isWebShareSupported,
    socialPlatforms
  } = useSocialSharing();

  const [showModal, setShowModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [gestureMode, setGestureMode] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const { theme, resolvedTheme } = useTheme();
  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();

  // Configuraciones de tamaño con ajustes para wearables
  const sizes = {
    xs: {
      buttonSize: 'sm',
      iconSize: 'sm',
      gap: isWearable ? DESIGN_TOKENS.spacing[1] : DESIGN_TOKENS.spacing[2],
      fontSize: isWearable ? '10px' : '12px'
    },
    sm: {
      buttonSize: 'sm',
      iconSize: 'sm',
      gap: isWearable ? DESIGN_TOKENS.spacing[2] : DESIGN_TOKENS.spacing[3],
      fontSize: isWearable ? '11px' : '13px'
    },
    md: {
      buttonSize: 'md',
      iconSize: 'md',
      gap: isWearable ? DESIGN_TOKENS.spacing[3] : DESIGN_TOKENS.spacing[4],
      fontSize: isWearable ? '12px' : '14px'
    },
    lg: {
      buttonSize: 'lg',
      iconSize: 'lg',
      gap: isWearable ? DESIGN_TOKENS.spacing[4] : DESIGN_TOKENS.spacing[5],
      fontSize: isWearable ? '14px' : '16px'
    }
  };

  const currentSize = sizes[size] || sizes.md;

  // Hook para gestos táctiles
  const { elementRef, isSwiping, currentOffset } = useSwipeGestures({
    onSwipeLeft: (gestureData) => gestureMode && shareWithGesture('left', { ...data, gestureData }),
    onSwipeRight: (gestureData) => gestureMode && shareWithGesture('right', { ...data, gestureData }),
    onSwipeUp: (gestureData) => gestureMode && shareWithGesture('up', { ...data, gestureData }),
    onSwipeDown: (gestureData) => gestureMode && shareWithGesture('down', { ...data, gestureData }),
    threshold: isWearable ? 30 : 50,
    disabled: !gestureMode,
    velocityThreshold: isWearable ? 0.2 : 0.3
  });

  // Manejar compartir
  const handleShare = useCallback(async (platform) => {
    setSelectedPlatform(platform);

    const result = await share(platform, data);

    if (result.success) {
      // Feedback visual de éxito
      setSelectedPlatform(null);
    } else {
      // Mostrar modal de error si falla
      setShowModal(true);
    }
  }, [share, data]);

  // Manejar compartir nativo
  const handleNativeShare = useCallback(async () => {
    const result = await share(null, data);

    if (!result.success) {
      setShowModal(true);
    }
  }, [share, data]);

  // Activar modo gesto
  const toggleGestureMode = useCallback(() => {
    setGestureMode(!gestureMode);
    if (isWearable && hapticFeedback) {
      navigator.vibrate(gestureMode ? [10] : [20, 10, 20]);
    }
  }, [gestureMode, isWearable, hapticFeedback]);

  // Manejar navegación por teclado
  const handleKeyDown = useCallback((event) => {
    const totalButtons = (showNativeShare && isWebShareSupported ? 1 : 0) + platforms.length;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex(prev => (prev + 1) % totalButtons);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex(prev => prev <= 0 ? totalButtons - 1 : prev - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex === 0 && showNativeShare && isWebShareSupported) {
          handleNativeShare();
        } else {
          const platformIndex = showNativeShare && isWebShareSupported ? focusedIndex - 1 : focusedIndex;
          if (platformIndex >= 0 && platformIndex < platforms.length) {
            handleShare(platforms[platformIndex]);
          }
        }
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(totalButtons - 1);
        break;
    }
  }, [focusedIndex, platforms, showNativeShare, isWebShareSupported, handleShare, handleNativeShare]);

  // Efecto para manejar foco inicial
  useEffect(() => {
    if (focusedIndex >= 0) {
      // Anunciar cambio de foco para lectores de pantalla
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';

      const totalButtons = (showNativeShare && isWebShareSupported ? 1 : 0) + platforms.length;
      let focusedItem = '';

      if (focusedIndex === 0 && showNativeShare && isWebShareSupported) {
        focusedItem = t('social.share', 'Compartir');
      } else {
        const platformIndex = showNativeShare && isWebShareSupported ? focusedIndex - 1 : focusedIndex;
        if (platformIndex >= 0 && platformIndex < platforms.length) {
          focusedItem = socialPlatforms[platforms[platformIndex]]?.name || '';
        }
      }

      announcement.textContent = t('accessibility.focusedItem', 'Enfocado: {{item}}', { item: focusedItem });
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  }, [focusedIndex, platforms, showNativeShare, isWebShareSupported, socialPlatforms, t]);

  // Efecto para ajustar colores según el tema
  const themeAdjustedColors = useCallback((platform) => {
    const config = socialPlatforms[platform];
    if (!config) return {};

    // Ajustar colores para temas oscuros si es necesario
    if (resolvedTheme === 'dark' || resolvedTheme === 'highContrast') {
      return {
        borderColor: config.color,
        color: config.color,
        // Asegurar contraste suficiente
        backgroundColor: resolvedTheme === 'highContrast' ? config.color : 'transparent'
      };
    }

    return {
      borderColor: config.color,
      color: config.color
    };
  }, [resolvedTheme, socialPlatforms]);

  // Variantes de animación para botones
  const buttonVariants = {
    idle: {
      scale: 1,
      opacity: 1,
      y: 0
    },
    hover: {
      scale: animationsEnabled && !reducedAnimations ? 1.05 : 1,
      y: animationsEnabled && !reducedAnimations ? -2 : 0,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    sharing: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Variantes de layout
  const layoutVariants = {
    grid: {
      display: 'grid',
      gridTemplateColumns: isWearable
        ? 'repeat(2, 1fr)'
        : variant === 'floating'
          ? 'repeat(2, 1fr)'
          : 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: currentSize.gap,
      maxWidth: isWearable ? '280px' : 'none'
    },
    horizontal: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: currentSize.gap,
      justifyContent: 'center'
    },
    vertical: {
      display: 'flex',
      flexDirection: 'column',
      gap: currentSize.gap,
      alignItems: 'stretch'
    },
    floating: {
      position: 'fixed',
      bottom: DESIGN_TOKENS.spacing[6],
      right: DESIGN_TOKENS.spacing[6],
      zIndex: 1000
    }
  };

  // Renderizar botón de plataforma
  const renderPlatformButton = (platform) => {
    const config = socialPlatforms[platform];
    if (!config) return null;

    const isSelected = selectedPlatform === platform;
    const isThisSharing = isSharing && isSelected;

    return (
      <motion.div
        key={platform}
        variants={buttonVariants}
        initial="idle"
        animate={isThisSharing ? "sharing" : "idle"}
        whileHover="hover"
        whileTap="tap"
        style={{
          position: 'relative'
        }}
      >
        <Button
          variant="outline"
          size={currentSize.buttonSize}
          onClick={() => handleShare(platform)}
          disabled={isSharing}
          loading={isThisSharing}
          fullWidth={variant === 'vertical'}
          style={{
            ...themeAdjustedColors(platform),
            minHeight: isWearable ? '48px' : 'auto',
            position: 'relative',
            overflow: 'hidden'
          }}
          aria-label={`${t('social.shareOn', 'Compartir en')} ${config.name}`}
          tabIndex={
            showNativeShare && isWebShareSupported
              ? (focusedIndex === platforms.indexOf(platform) + 1 ? 0 : -1)
              : (focusedIndex === platforms.indexOf(platform) ? 0 : -1)
          }
          aria-describedby={`platform-${platform}-description`}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[2],
            width: '100%'
          }}>
            <Icon
              name={config.icon}
              size={currentSize.iconSize}
              color={config.color}
            />
            {showLabels && (
              <span style={{
                flex: 1,
                textAlign: 'center',
                fontSize: currentSize.fontSize,
                fontWeight: isWearable ? '500' : '400'
              }}>
                {isWearable ? config.name.substring(0, 8) + (config.name.length > 8 ? '...' : '') : config.name}
              </span>
            )}
          </div>
        </Button>
        <div id={`platform-${platform}-description`} className="sr-only">
          {config.note || t('social.shareDescription', 'Comparte contenido en {{platform}}', { platform: config.name })}
        </div>

        {/* Indicador de gesto para modo gesto */}
        {gestureMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: config.color,
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              boxShadow: DESIGN_TOKENS.shadows.sm
            }}
          >
            {platform === 'twitter' ? '←' :
             platform === 'facebook' ? '→' :
             platform === 'whatsapp' ? '↑' : '↓'}
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Renderizar botón de compartir nativo
  const renderNativeShareButton = () => {
    if (!showNativeShare || !isWebShareSupported) return null;

    return (
      <motion.div
        variants={buttonVariants}
        initial="idle"
        animate={isSharing && !selectedPlatform ? "sharing" : "idle"}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="primary"
          size={currentSize.buttonSize}
          onClick={handleNativeShare}
          disabled={isSharing}
          loading={isSharing && !selectedPlatform}
          fullWidth={variant === 'vertical'}
          icon={<Icon name="share" size={currentSize.iconSize} />}
          style={{
            minHeight: isWearable ? '48px' : 'auto'
          }}
          aria-label={t('social.share', 'Compartir')}
          tabIndex={focusedIndex === 0 ? 0 : -1}
          aria-describedby="native-share-description"
        >
          {showLabels && t('social.share', 'Compartir')}
        </Button>
        <div id="native-share-description" className="sr-only">
          {t('social.nativeShareDescription', 'Comparte usando las opciones nativas de tu dispositivo')}
        </div>
      </motion.div>
    );
  };

  // Renderizar botón de modo gesto
  const renderGestureModeButton = () => {
    if (!isWearable && variant !== 'floating') return null;

    return (
      <motion.div
        variants={buttonVariants}
        initial="idle"
        animate="idle"
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant={gestureMode ? "success" : "outline"}
          size={isWearable ? "xs" : "sm"}
          onClick={toggleGestureMode}
          icon={<Icon name="gesture" size={isWearable ? "xs" : "sm"} />}
          style={{
            position: 'absolute',
            top: isWearable ? '-35px' : '-40px',
            right: 0,
            minHeight: isWearable ? '28px' : '32px',
            fontSize: isWearable ? '10px' : '12px'
          }}
          aria-label={gestureMode ? t('social.gestureModeOff', 'Desactivar modo gesto') : t('social.gestureModeOn', 'Activar modo gesto')}
        >
          {gestureMode ? (isWearable ? 'OFF' : t('social.gestureOff', 'Gestos OFF')) : (isWearable ? 'ON' : t('social.gestureOn', 'Gestos ON'))}
        </Button>
      </motion.div>
    );
  };

  return (
    <>
      <motion.div
        ref={elementRef}
        className={`social-share social-share-${variant} ${className}`}
        style={{
          ...layoutVariants[variant],
          ...style,
          position: 'relative'
        }}
        animate={isSwiping ? { x: currentOffset.x, y: currentOffset.y } : { x: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        role="group"
        aria-label={t('social.shareOptions', 'Opciones para compartir')}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {/* Botón de compartir nativo */}
        {renderNativeShareButton()}

        {/* Botones de plataformas */}
        {platforms.map(renderPlatformButton)}

        {/* Botón de modo gesto para wearables */}
        {renderGestureModeButton()}

        {/* Indicador de modo gesto activo */}
        <AnimatePresence>
          {gestureMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'absolute',
                top: '-60px',
                left: 0,
                right: 0,
                textAlign: 'center',
                backgroundColor: palette.surfaceElevated,
                padding: DESIGN_TOKENS.spacing[2],
                borderRadius: DESIGN_TOKENS.borderRadius.md,
                boxShadow: DESIGN_TOKENS.shadows.md,
                fontSize: '12px',
                color: palette.textSecondary,
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: DESIGN_TOKENS.spacing[3], flexWrap: 'wrap' }}>
                <span>← {t('social.twitter', 'Twitter')}</span>
                <span>→ {t('social.facebook', 'Facebook')}</span>
                <span>↑ {t('social.whatsapp', 'WhatsApp')}</span>
                <span>↓ {t('social.instagram', 'Instagram')}</span>
              </div>
              <div style={{ fontSize: '10px', marginTop: DESIGN_TOKENS.spacing[1], opacity: 0.7 }}>
                {t('social.gestureHint', 'Desliza en cualquier dirección para compartir')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicador visual de swipe */}
        <AnimatePresence>
          {isSwiping && gestureMode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: palette.primary,
                color: palette.background,
                padding: DESIGN_TOKENS.spacing[2],
                borderRadius: DESIGN_TOKENS.borderRadius.md,
                fontSize: '14px',
                fontWeight: 'bold',
                pointerEvents: 'none',
                zIndex: 20
              }}
            >
              {currentOffset.x > 50 && t('social.sharingTo', 'Compartiendo en Twitter...')}
              {currentOffset.x < -50 && t('social.sharingTo', 'Compartiendo en Facebook...')}
              {currentOffset.y > 50 && t('social.sharingTo', 'Compartiendo en Instagram...')}
              {currentOffset.y < -50 && t('social.sharingTo', 'Compartiendo en WhatsApp...')}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal de error */}
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={t('social.shareError', 'Error al compartir')}
      size="sm"
    >
      <p style={{ color: palette.textSecondary, margin: 0 }}>
        {t('social.shareErrorMessage', 'No se pudo compartir el contenido. Inténtalo de nuevo.')}
      </p>
      <div className="sr-only" aria-live="assertive">
        {t('accessibility.errorOccurred', 'Ha ocurrido un error al compartir')}
      </div>
    </Modal>

    {/* Estilos para accesibilidad */}
    <style jsx>{`
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }

      /* Mejorar foco para navegación por teclado */
      .social-share button:focus-visible {
        outline: 2px solid ${palette.primary};
        outline-offset: 2px;
      }

      /* Asegurar contraste suficiente */
      .social-share button {
        transition: all 0.2s ease;
      }

      /* Soporte para alto contraste */
      @media (prefers-contrast: high) {
        .social-share button {
          border-width: 2px;
        }
      }

      /* Soporte para movimiento reducido */
      @media (prefers-reduced-motion: reduce) {
        .social-share * {
          animation: none !important;
          transition: none !important;
        }
      }
    `}</style>
    </>
  );
};

export default SocialShare;