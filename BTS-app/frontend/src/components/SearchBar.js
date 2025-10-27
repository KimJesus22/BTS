import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';
import { DESIGN_TOKENS } from '../design-tokens';
import Input from './Input';

// Iconos SVG inline para mejor rendimiento
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 15-6-6-6 6"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const SearchBar = ({
  value = '',
  onChange,
  onSearch,
  placeholder,
  disabled = false,
  className = '',
  style = {},
  ...props
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled, highContrast, accessibilityMode } = useAccessibility();
  const { reducedAnimations, getOptimizationSettings } = useBatteryOptimization();
  const { isWearable, getAnimationSettings } = useWearableOptimizations();
  const { startMonitoring } = usePerformanceMonitor();

  const palette = getCurrentPalette();
  const animationSettings = getAnimationSettings();
  const optimizations = getOptimizationSettings();

  // Estado local
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Refs
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const containerRef = useRef(null);

  // Hook de sugerencias
  const {
    suggestions,
    isLoading,
    error,
    selectedIndex,
    searchMetrics,
    handleKeyDown,
    selectSuggestion,
    clearSuggestions
  } = useSearchSuggestions(value, (suggestion) => {
    onChange?.(suggestion);
    onSearch?.(suggestion);
    setShowSuggestions(false);
  });

  // Configuraciones de animación
  const shouldAnimate = animationsEnabled && !reducedAnimations && !optimizations.disableHeavyEffects && !accessibilityMode;

  // Variantes de animación
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: shouldAnimate ? 10 : 0,
      scale: shouldAnimate ? 0.95 : 1
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: animationSettings.duration,
        ease: animationSettings.ease
      }
    }
  };

  const suggestionsVariants = {
    hidden: {
      opacity: 0,
      height: 0,
      scale: shouldAnimate ? 0.95 : 1
    },
    visible: {
      opacity: 1,
      height: 'auto',
      scale: 1,
      transition: {
        duration: animationSettings.duration * 0.8,
        ease: animationSettings.ease,
        staggerChildren: shouldAnimate ? 0.05 : 0
      }
    }
  };

  const suggestionItemVariants = {
    hidden: { opacity: 0, x: shouldAnimate ? -10 : 0 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: animationSettings.duration * 0.6,
        ease: animationSettings.ease
      }
    }
  };

  // Manejar cambios en el input
  const handleInputChange = useCallback((event) => {
    const newValue = event.target.value;
    onChange?.(newValue);

    if (newValue.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      clearSuggestions();
    }
  }, [onChange, clearSuggestions]);

  // Manejar foco
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (value.trim()) {
      setShowSuggestions(true);
    }
  }, [value]);

  // Manejar desenfoque
  const handleBlur = useCallback(() => {
    // Delay para permitir clics en sugerencias
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 150);
  }, []);

  // Manejar envío de búsqueda
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    if (value.trim()) {
      onSearch?.(value);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [value, onSearch]);

  // Manejar teclado extendido
  const handleKeyDownExtended = useCallback((event) => {
    if (event.key === 'Enter' && !showSuggestions) {
      handleSubmit(event);
    } else {
      handleKeyDown(event);
    }
  }, [handleKeyDown, handleSubmit, showSuggestions]);

  // Limpiar búsqueda
  const handleClear = useCallback(() => {
    onChange?.('');
    clearSuggestions();
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, [onChange, clearSuggestions]);

  // Manejar clic en sugerencia
  const handleSuggestionClick = useCallback((suggestion) => {
    selectSuggestion(suggestions.findIndex(s => s.text === suggestion.text));
  }, [selectSuggestion, suggestions]);

  // Efecto para manejar clics fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Efecto para scroll a sugerencia seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: shouldAnimate ? 'smooth' : 'auto',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, shouldAnimate]);

  // Iniciar monitoreo de rendimiento
  useEffect(() => {
    startMonitoring();
  }, [startMonitoring]);

  // Placeholder por defecto
  const defaultPlaceholder = placeholder || t('search.placeholder', 'Buscar por nombre o rol...');

  // Estilos del contenedor
  const containerStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: isWearable ? '100%' : '600px',
    ...style
  };

  // Estilos de sugerencias
  const suggestionsStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: palette.background,
    border: `1px solid ${palette.border}`,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    boxShadow: highContrast
      ? `0 4px 12px ${palette.shadow}40`
      : `0 4px 12px ${palette.shadow}20`,
    maxHeight: isWearable ? '120px' : '200px',
    overflowY: 'auto',
    marginTop: DESIGN_TOKENS.spacing[1]
  };

  return (
    <motion.div
      ref={containerRef}
      style={containerStyle}
      className={`search-bar ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="search"
      aria-label={t('search.description', 'Buscar miembros de BTS')}
    >
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div style={{ position: 'relative' }}>
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDownExtended}
            placeholder={defaultPlaceholder}
            disabled={disabled}
            icon={<SearchIcon />}
            iconPosition="left"
            size={isWearable ? 'md' : 'lg'}
            fullWidth
            aria-expanded={showSuggestions}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-describedby={showSuggestions ? 'search-suggestions' : undefined}
            style={{
              paddingRight: value ? DESIGN_TOKENS.spacing[12] : DESIGN_TOKENS.spacing[10]
            }}
            {...props}
          />

          {/* Botón de limpiar */}
          <AnimatePresence>
            {value && (
              <motion.button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: DESIGN_TOKENS.spacing[3],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: palette.textSecondary,
                  cursor: 'pointer',
                  padding: DESIGN_TOKENS.spacing[1],
                  borderRadius: DESIGN_TOKENS.borderRadius.sm,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}
                whileHover={{ scale: shouldAnimate ? 1.1 : 1 }}
                whileTap={{ scale: shouldAnimate ? 0.95 : 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                aria-label={t('search.clear', 'Limpiar búsqueda')}
                disabled={disabled}
              >
                <CloseIcon />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>

      {/* Lista de sugerencias */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || isLoading || error) && (
          <motion.div
            style={suggestionsStyle}
            variants={suggestionsVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            id="search-suggestions"
            role="listbox"
            aria-label={t('search.suggestions', 'Sugerencias de búsqueda')}
          >
            {isLoading && (
              <div
                style={{
                  padding: DESIGN_TOKENS.spacing[3],
                  textAlign: 'center',
                  color: palette.textSecondary,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm
                }}
                aria-live="polite"
              >
                {t('search.loading', 'Cargando sugerencias...')}
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: DESIGN_TOKENS.spacing[3],
                  textAlign: 'center',
                  color: palette.error,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm
                }}
                role="alert"
              >
                {error}
              </div>
            )}

            {!isLoading && !error && suggestions.length > 0 && (
              <ul
                ref={suggestionsRef}
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <motion.li
                    key={`${suggestion.text}-${index}`}
                    variants={suggestionItemVariants}
                    style={{
                      borderBottom: index < suggestions.length - 1
                        ? `1px solid ${palette.divider}`
                        : 'none'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      style={{
                        width: '100%',
                        padding: `${DESIGN_TOKENS.spacing[3]} ${DESIGN_TOKENS.spacing[4]}`,
                        backgroundColor: selectedIndex === index
                          ? palette.primary + '10'
                          : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: selectedIndex === index
                          ? palette.primary
                          : palette.text,
                        fontSize: DESIGN_TOKENS.typography.fontSize.base,
                        fontWeight: selectedIndex === index
                          ? DESIGN_TOKENS.typography.fontWeight.medium
                          : DESIGN_TOKENS.typography.fontWeight.normal,
                        borderRadius: selectedIndex === index
                          ? DESIGN_TOKENS.borderRadius.sm
                          : 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: shouldAnimate
                          ? `all ${animationSettings.duration}ms ${animationSettings.ease}`
                          : 'none'
                      }}
                      onMouseEnter={() => {
                        // setSelectedIndex is not available here, we need to handle hover differently
                        // For now, we'll just ignore hover since keyboard navigation is primary
                      }}
                      role="option"
                      aria-selected={selectedIndex === index}
                    >
                      <span>{suggestion.text}</span>
                      {selectedIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: DESIGN_TOKENS.spacing[2]
                          }}
                        >
                          <ArrowUpIcon />
                          <ArrowDownIcon />
                        </motion.div>
                      )}
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}

            {/* Indicador de navegación por teclado */}
            {suggestions.length > 0 && (
              <div
                style={{
                  padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
                  backgroundColor: palette.surface,
                  borderTop: `1px solid ${palette.divider}`,
                  fontSize: DESIGN_TOKENS.typography.fontSize.xs,
                  color: palette.textSecondary,
                  textAlign: 'center'
                }}
                aria-hidden="true"
              >
                {t('search.keyboardNavigation', 'Usa ↑↓ para navegar, Enter para seleccionar')}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Información de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && searchMetrics.totalSearches > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '-30px',
            right: 0,
            fontSize: '10px',
            color: palette.textSecondary,
            backgroundColor: palette.background,
            padding: '2px 4px',
            borderRadius: '2px',
            border: `1px solid ${palette.border}`
          }}
          aria-hidden="true"
        >
          Searches: {searchMetrics.totalSearches} |
          Cache: {searchMetrics.cacheHits}/{searchMetrics.apiCalls} |
          Fallback: {searchMetrics.fallbackUsage}
        </div>
      )}
    </motion.div>
  );
};

export default SearchBar;