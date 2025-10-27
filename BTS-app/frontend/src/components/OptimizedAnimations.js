import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';

// Componente de animación optimizada para bajo consumo
export const OptimizedMotion = ({
  children,
  animationType = 'fade',
  duration,
  delay = 0,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { getAnimationSettings } = useWearableOptimizations();
  const { reducedAnimations } = useBatteryOptimization();

  const settings = getAnimationSettings();

  // Desactivar animaciones si es necesario
  if (shouldReduceMotion || reducedAnimations) {
    return <div {...props}>{children}</div>;
  }

  // Configuraciones de animación optimizadas
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 }
    },
    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    }
  };

  const animation = animations[animationType] || animations.fade;

  return (
    <motion.div
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{
        duration: duration || settings.duration,
        ease: settings.ease,
        delay
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Componente de botón optimizado
export const OptimizedButton = ({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled,
  ...props
}) => {
  const { getWearableOptimizations } = useWearableOptimizations();
  const { reducedAnimations } = useBatteryOptimization();
  const shouldReduceMotion = useReducedMotion();

  const optimizations = getWearableOptimizations();

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const sizes = {
    small: { padding: '6px 12px', fontSize: '14px' },
    medium: { padding: '8px 16px', fontSize: '16px' },
    large: { padding: '12px 24px', fontSize: '18px' },
    wearable: { padding: '10px', fontSize: optimizations.fontSize, minWidth: optimizations.buttonSize, minHeight: optimizations.buttonSize }
  };

  const buttonSize = optimizations.layout === 'compact' ? 'wearable' : size;

  return (
    <motion.button
      className={`optimized-btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
      variants={buttonVariants}
      initial="idle"
      whileHover={shouldReduceMotion || reducedAnimations ? undefined : "hover"}
      whileTap={shouldReduceMotion || reducedAnimations ? undefined : "tap"}
      style={{
        ...sizes[buttonSize],
        border: 'none',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
        backgroundColor: `var(--theme-${variant === 'primary' ? 'primary' : 'surface'})`,
        color: `var(--theme-${variant === 'primary' ? 'background' : 'text'})`,
        opacity: disabled ? 0.6 : 1
      }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Componente de lista optimizada con virtualización
export const OptimizedList = ({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400
}) => {
  const { isWearable } = useWearableOptimizations();
  const { powerSavingMode } = useBatteryOptimization();

  // Virtualización simple para listas largas
  const [scrollTop, setScrollTop] = React.useState(0);

  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 2,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  // Desactivar virtualización en modo ahorro o wearables pequeños
  if (powerSavingMode || isWearable) {
    return (
      <div
        className="optimized-list"
        style={{
          height: containerHeight,
          overflowY: 'auto',
          padding: '8px'
        }}
      >
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="optimized-list"
      style={{
        height: containerHeight,
        overflowY: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          transform: `translateY(${offsetY}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }}
      >
        {visibleItems.map((item, index) => (
          <div
            key={startIndex + index}
            style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default {
  OptimizedMotion,
  OptimizedButton,
  OptimizedList
};