import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';

// Componente Tooltip molecular reutilizable
const Tooltip = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  delay = 300,
  disabled = false,
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
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const timeoutRef = useRef(null);

  // Calcular posición del tooltip
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + 8;
        break;
      default:
        break;
    }

    // Ajustar para mantener dentro de la ventana
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - 8;
    if (top < 0) top = 8;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - 8;

    setPosition({ top, left });
  };

  // Manejar mostrar tooltip
  const showTooltip = () => {
    if (disabled || !content) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calcular posición después de que el tooltip esté visible
      setTimeout(calculatePosition, 0);
    }, delay);
  };

  // Manejar ocultar tooltip
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Manejar eventos según el trigger
  const handleMouseEnter = () => {
    if (trigger === 'hover') showTooltip();
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') hideTooltip();
  };

  const handleFocus = () => {
    if (trigger === 'focus') showTooltip();
  };

  const handleBlur = () => {
    if (trigger === 'focus') hideTooltip();
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  // Recalcular posición en resize
  useEffect(() => {
    if (isVisible) {
      const handleResize = () => calculatePosition();
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize);
      };
    }
  }, [isVisible]);

  // Limpiar timeouts
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Variantes de animación
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.8 : 1,
      y: animationsEnabled && !reducedAnimations ? -4 : 0
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: animationsEnabled && !reducedAnimations ? 0.9 : 1,
      y: animationsEnabled && !reducedAnimations ? -2 : 0,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.15 : 0,
        ease: "easeIn"
      }
    }
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
    padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`
  } : {};

  return (
    <>
      {/* Elemento trigger */}
      <div
        ref={triggerRef}
        className={`tooltip-trigger ${className}`}
        style={{
          display: 'inline-block',
          cursor: trigger === 'click' ? 'pointer' : 'default',
          ...style
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        tabIndex={trigger === 'focus' ? 0 : undefined}
        role={trigger === 'click' ? 'button' : undefined}
        aria-describedby={isVisible ? 'tooltip-content' : undefined}
        {...props}
      >
        {children}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            ref={tooltipRef}
            id="tooltip-content"
            className="tooltip-content"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              backgroundColor: palette.surfaceElevated,
              color: palette.text,
              padding: wearableAdjustments.padding || `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
              borderRadius: DESIGN_TOKENS.borderRadius.md,
              boxShadow: DESIGN_TOKENS.shadows.lg,
              fontSize: wearableAdjustments.fontSize || DESIGN_TOKENS.typography.fontSize.sm,
              fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
              fontWeight: DESIGN_TOKENS.typography.fontWeight.normal,
              lineHeight: DESIGN_TOKENS.typography.lineHeight.normal,
              maxWidth: isWearable ? '200px' : '300px',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              zIndex: 9999,
              pointerEvents: 'none',
              border: `1px solid ${palette.border}`
            }}
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="tooltip"
          >
            {content}

            {/* Flecha del tooltip */}
            <div
              style={{
                position: 'absolute',
                width: 0,
                height: 0,
                borderStyle: 'solid',
                borderWidth: '6px',
                borderColor: 'transparent',
                ...getArrowStyles(placement, palette)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Función helper para estilos de flecha
const getArrowStyles = (placement, palette) => {
  const baseStyles = {
    borderColor: palette.surfaceElevated,
    filter: `drop-shadow(0 1px 2px ${palette.shadow})`
  };

  switch (placement) {
    case 'top':
      return {
        ...baseStyles,
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderTopColor: palette.surfaceElevated,
        borderBottomWidth: 0
      };
    case 'bottom':
      return {
        ...baseStyles,
        top: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        borderBottomColor: palette.surfaceElevated,
        borderTopWidth: 0
      };
    case 'left':
      return {
        ...baseStyles,
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderLeftColor: palette.surfaceElevated,
        borderRightWidth: 0
      };
    case 'right':
      return {
        ...baseStyles,
        left: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRightColor: palette.surfaceElevated,
        borderLeftWidth: 0
      };
    default:
      return baseStyles;
  }
};

export default Tooltip;