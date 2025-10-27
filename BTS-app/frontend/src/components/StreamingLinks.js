import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useGamification } from '../hooks/useGamification';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';
import Modal from './Modal';

// Componente StreamingLinks para enlaces a plataformas de streaming
const StreamingLinks = ({
  memberId,
  memberName,
  variant = 'grid', // 'grid', 'list', 'carousel', 'compact'
  size = 'md',
  showLabels = true,
  showDescriptions = false,
  platforms = null, // null = todas las plataformas
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();
  const { addPoints } = useGamification();

  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const { theme, resolvedTheme } = useTheme();
  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();

  // Configuración de plataformas de streaming
  const streamingPlatforms = useMemo(() => ({
    spotify: {
      name: 'Spotify',
      icon: 'music',
      color: '#1DB954',
      url: `https://open.spotify.com/artist/3Nrfpe0tUJi4K4DXYWgMUX`, // BTS Spotify ID
      description: t('streaming.spotifyDesc', 'Escucha música de BTS'),
      category: 'music',
      priority: 1
    },
    appleMusic: {
      name: 'Apple Music',
      icon: 'music',
      color: '#FC3C44',
      url: `https://music.apple.com/artist/bts/883131348`,
      description: t('streaming.appleMusicDesc', 'Música de BTS en Apple Music'),
      category: 'music',
      priority: 1
    },
    youtube: {
      name: 'YouTube',
      icon: 'video',
      color: '#FF0000',
      url: `https://www.youtube.com/@BTS`,
      description: t('streaming.youtubeDesc', 'Videos oficiales de BTS'),
      category: 'video',
      priority: 1
    },
    youtubeMusic: {
      name: 'YouTube Music',
      icon: 'music',
      color: '#FF0000',
      url: `https://music.youtube.com/channel/UC9vrvNSL3xcWGSkVNXlmKPw`,
      description: t('streaming.youtubeMusicDesc', 'Música de BTS en YouTube Music'),
      category: 'music',
      priority: 2
    },
    melon: {
      name: 'Melon',
      icon: 'music',
      color: '#00D474',
      url: `https://www.melon.com/artist/detail.htm?artistId=672375`,
      description: t('streaming.melonDesc', 'Plataforma coreana de música'),
      category: 'music',
      priority: 2,
      region: 'kr'
    },
    genie: {
      name: 'Genie Music',
      icon: 'music',
      color: '#00A0E9',
      url: `https://www.genie.co.kr/detail/artistInfo?xxnm=14945853`,
      description: t('streaming.genieDesc', 'Música coreana'),
      category: 'music',
      priority: 2,
      region: 'kr'
    },
    tidal: {
      name: 'Tidal',
      icon: 'music',
      color: '#000000',
      url: `https://tidal.com/artist/5318784`,
      description: t('streaming.tidalDesc', 'Audio de alta calidad'),
      category: 'music',
      priority: 3
    },
    deezer: {
      name: 'Deezer',
      icon: 'music',
      color: '#FF0092',
      url: `https://www.deezer.com/artist/5313805`,
      description: t('streaming.deezerDesc', 'Música internacional'),
      category: 'music',
      priority: 3
    },
    amazonMusic: {
      name: 'Amazon Music',
      icon: 'music',
      color: '#FF9900',
      url: `https://www.amazon.com/music/player/artists/B000QKO3ZS`,
      description: t('streaming.amazonMusicDesc', 'Música en Amazon'),
      category: 'music',
      priority: 3
    },
    soundcloud: {
      name: 'SoundCloud',
      icon: 'music',
      color: '#FF5500',
      url: `https://soundcloud.com/bangtan`,
      description: t('streaming.soundcloudDesc', 'Audio y podcasts'),
      category: 'audio',
      priority: 3
    },
    vimeo: {
      name: 'Vimeo',
      icon: 'video',
      color: '#1AB7EA',
      url: `https://vimeo.com/bangtan`,
      description: t('streaming.vimeoDesc', 'Videos de alta calidad'),
      category: 'video',
      priority: 3
    }
  }), [t]);

  // Filtrar plataformas por prioridad y región
  const filteredPlatforms = useMemo(() => {
    let availablePlatforms = Object.entries(streamingPlatforms);

    // Filtrar por plataformas especificadas
    if (platforms) {
      availablePlatforms = availablePlatforms.filter(([key]) => platforms.includes(key));
    }

    // Ordenar por prioridad
    availablePlatforms.sort(([, a], [, b]) => a.priority - b.priority);

    // Limitar cantidad para vista compacta
    if (variant === 'compact' && !showAll) {
      availablePlatforms = availablePlatforms.slice(0, 4);
    }

    return availablePlatforms;
  }, [streamingPlatforms, platforms, variant, showAll]);

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

  // Manejar clic en enlace de streaming
  const handleStreamingLink = useCallback((platformKey, platformData) => {
    setSelectedPlatform(platformKey);

    // Abrir enlace en nueva pestaña
    window.open(platformData.url, '_blank', 'noopener,noreferrer');

    // Otorgar puntos por visitar plataforma de streaming
    addPoints(3, `Visitó ${platformData.name} para escuchar BTS`);

    // Reset selección después de un delay
    setTimeout(() => setSelectedPlatform(null), 1000);
  }, [addPoints]);

  // Manejar navegación por teclado
  const handleKeyDown = useCallback((event) => {
    const totalButtons = filteredPlatforms.length + (variant === 'compact' && !showAll && filteredPlatforms.length > 4 ? 1 : 0);

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
        if (focusedIndex < filteredPlatforms.length) {
          const [platformKey, platformData] = filteredPlatforms[focusedIndex];
          handleStreamingLink(platformKey, platformData);
        } else if (variant === 'compact' && !showAll) {
          setShowAll(true);
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
  }, [filteredPlatforms, focusedIndex, variant, showAll, handleStreamingLink]);
  
    // Función para ajustar colores según el tema
    const themeAdjustedColors = useCallback((platformData) => {
      // Ajustar colores para temas oscuros si es necesario
      if (resolvedTheme === 'dark' || resolvedTheme === 'highContrast') {
        return {
          borderColor: platformData.color,
          color: platformData.color,
          // Asegurar contraste suficiente
          backgroundColor: resolvedTheme === 'highContrast' ? platformData.color : 'transparent'
        };
      }
  
      return {
        borderColor: platformData.color,
        color: platformData.color
      };
    }, [resolvedTheme]);

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animationsEnabled && !reducedAnimations ? 0.1 : 0
      }
    }
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: animationsEnabled && !reducedAnimations ? 20 : 0,
      scale: animationsEnabled && !reducedAnimations ? 0.9 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: animationSettings.ease
      }
    },
    hover: {
      scale: animationsEnabled && !reducedAnimations ? 1.02 : 1,
      y: animationsEnabled && !reducedAnimations ? -2 : 0,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  // Variantes de layout
  const layoutVariants = {
    grid: {
      display: 'grid',
      gridTemplateColumns: isWearable
        ? 'repeat(2, 1fr)'
        : 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: currentSize.gap,
      maxWidth: isWearable ? '280px' : 'none'
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: currentSize.gap
    },
    carousel: {
      display: 'flex',
      gap: currentSize.gap,
      overflowX: 'auto',
      scrollSnapType: 'x mandatory',
      paddingBottom: DESIGN_TOKENS.spacing[2]
    },
    compact: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: currentSize.gap,
      justifyContent: 'center'
    }
  };

  // Renderizar botón de plataforma
  const renderPlatformButton = ([platformKey, platformData]) => {
    const isSelected = selectedPlatform === platformKey;

    return (
      <motion.div
        key={platformKey}
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
        style={{
          scrollSnapAlign: variant === 'carousel' ? 'start' : 'unset'
        }}
      >
        <Button
          variant="outline"
          size={currentSize.buttonSize}
          onClick={() => handleStreamingLink(platformKey, platformData)}
          fullWidth={variant === 'list'}
          style={{
            ...themeAdjustedColors(platformData),
            minHeight: isWearable ? '48px' : 'auto',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: isSelected ? `${platformData.color}20` : 'transparent'
          }}
          aria-label={`${t('streaming.listenOn', 'Escuchar en')} ${platformData.name}`}
          tabIndex={focusedIndex === filteredPlatforms.findIndex(([key]) => key === platformKey) ? 0 : -1}
          aria-describedby={`streaming-${platformKey}-description`}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: DESIGN_TOKENS.spacing[2],
            width: '100%',
            flexDirection: variant === 'list' ? 'row' : 'column'
          }}>
            <Icon
              name={platformData.icon}
              size={currentSize.iconSize}
              color={platformData.color}
            />
            {showLabels && (
              <div style={{
                flex: 1,
                textAlign: 'center',
                fontSize: isWearable ? '11px' : '13px',
                lineHeight: 1.2
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {isWearable ? platformData.name.substring(0, 10) + (platformData.name.length > 10 ? '...' : '') : platformData.name}
                </div>
                {showDescriptions && platformData.description && !isWearable && (
                  <div style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    marginTop: '2px'
                  }}>
                    {platformData.description}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Indicador de carga */}
          {isSelected && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                backgroundColor: platformData.color
              }}
            />
          )}
        </Button>
        <div id={`streaming-${platformKey}-description`} className="sr-only">
          {platformData.description || t('streaming.platformDescription', 'Accede a {{platform}} para escuchar música', { platform: platformData.name })}
          {platformData.region && ` ${t('streaming.regionalNote', 'Disponible principalmente en {{region}}', { region: platformData.region === 'kr' ? 'Corea del Sur' : platformData.region })}`}
        </div>
      </motion.div>
    );
  };

  // Renderizar botón "Ver más"
  const renderShowMoreButton = () => {
    if (variant !== 'compact' || showAll || filteredPlatforms.length <= 4) return null;

    return (
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Button
          variant="ghost"
          size={currentSize.buttonSize}
          onClick={() => setShowAll(true)}
          icon={<Icon name="add" size={currentSize.iconSize} />}
          style={{
            minHeight: isWearable ? '48px' : 'auto',
            border: `1px dashed ${palette.border}`
          }}
          aria-label={t('streaming.showMore', 'Ver más plataformas')}
        >
          {t('streaming.showMore', 'Ver más')}
        </Button>
      </motion.div>
    );
  };

  return (
    <motion.div
      className={`streaming-links streaming-links-${variant} ${className}`}
      style={{
        ...layoutVariants[variant],
        ...style
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="group"
      aria-label={t('streaming.streamingPlatforms', 'Plataformas de streaming')}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Título opcional */}
      {variant !== 'compact' && (
        <motion.div
          variants={itemVariants}
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            marginBottom: DESIGN_TOKENS.spacing[2]
          }}
        >
          <h3 style={{
            margin: 0,
            fontSize: isWearable ? '14px' : '18px',
            color: palette.text,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
            textAlign: isWearable ? 'center' : 'left'
          }}>
            {isWearable
              ? (memberName ? memberName.substring(0, 12) + (memberName.length > 12 ? '...' : '') : 'BTS')
              : `${t('streaming.listenTo', 'Escuchar a')} ${memberName || 'BTS'}`
            }
          </h3>
        </motion.div>
      )}

      {/* Botones de plataformas */}
      {filteredPlatforms.map(renderPlatformButton)}

      {/* Botón "Ver más" */}
      {renderShowMoreButton()}

      {/* Indicador de región para plataformas coreanas */}
      {filteredPlatforms.some(([, platform]) => platform.region === 'kr') && (
        <motion.div
          variants={itemVariants}
          style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            fontSize: '11px',
            color: palette.textMuted,
            marginTop: DESIGN_TOKENS.spacing[2]
          }}
        >
          {t('streaming.koreanPlatforms', 'Plataformas disponibles principalmente en Corea del Sur')}
        </motion.div>
      )}

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
        .streaming-links button:focus-visible {
          outline: 2px solid ${palette.primary};
          outline-offset: 2px;
        }

        /* Asegurar contraste suficiente */
        .streaming-links button {
          transition: all 0.2s ease;
        }

        /* Soporte para alto contraste */
        @media (prefers-contrast: high) {
          .streaming-links button {
            border-width: 2px;
          }
        }

        /* Soporte para movimiento reducido */
        @media (prefers-reduced-motion: reduce) {
          .streaming-links * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default StreamingLinks;