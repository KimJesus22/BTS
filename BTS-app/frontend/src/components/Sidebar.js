import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';
import Badge from './Badge';

// Componente Sidebar organismo reutilizable
const Sidebar = ({
  isOpen,
  onClose,
  items = [],
  header,
  footer,
  width = 280,
  position = 'left',
  variant = 'default',
  collapsible = true,
  collapsed = false,
  onToggleCollapse,
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
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  // Actualizar estado colapsado cuando cambia la prop
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  // Configuraciones de variante
  const variants = {
    default: {
      backgroundColor: palette.surfaceElevated,
      borderColor: palette.borderLight
    },
    dark: {
      backgroundColor: palette.surface,
      borderColor: palette.border
    },
    colored: {
      backgroundColor: palette.primary,
      borderColor: palette.primary
    }
  };

  const currentVariant = variants[variant] || variants.default;

  // Ancho efectivo
  const effectiveWidth = isCollapsed ? 64 : width;

  // Variantes de animación
  const sidebarVariants = {
    open: {
      x: 0,
      width: effectiveWidth,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: "easeOut"
      }
    },
    closed: {
      x: position === 'left' ? -effectiveWidth : effectiveWidth,
      width: effectiveWidth,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.3 : 0,
        ease: "easeIn"
      }
    },
    collapsed: {
      width: 64,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: "easeOut"
      }
    },
    expanded: {
      width: width,
      transition: {
        duration: animationsEnabled && !reducedAnimations ? 0.2 : 0,
        ease: "easeOut"
      }
    }
  };

  // Manejar toggle de colapso
  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onToggleCollapse?.(newCollapsed);
  };

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    width: isCollapsed ? 48 : 240,
    padding: DESIGN_TOKENS.spacing[2]
  } : {
    width: effectiveWidth,
    padding: DESIGN_TOKENS.spacing[4]
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay para móviles */}
          {!isWearable && (
            <motion.div
              className="sidebar-overlay"
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 998
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}

          {/* Sidebar */}
          <motion.aside
            className={`sidebar sidebar-${position} ${isCollapsed ? 'collapsed' : 'expanded'} ${className}`}
            style={{
              position: 'fixed',
              top: 0,
              [position]: 0,
              height: '100vh',
              backgroundColor: currentVariant.backgroundColor,
              borderRight: position === 'left' ? `1px solid ${currentVariant.borderColor}` : 'none',
              borderLeft: position === 'right' ? `1px solid ${currentVariant.borderColor}` : 'none',
              boxShadow: position === 'left' ? DESIGN_TOKENS.shadows.lg : `-${DESIGN_TOKENS.shadows.lg}`,
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ...style
            }}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
            {...props}
          >
            {/* Header */}
            {header && (
              <div
                className="sidebar-header"
                style={{
                  padding: wearableAdjustments.padding,
                  borderBottom: `1px solid ${palette.borderLight}`,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {isCollapsed ? header.collapsed : header.expanded}
                </div>

                {/* Botones de control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[1] }}>
                  {collapsible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleCollapse}
                      aria-label={isCollapsed ? t('sidebar.expand', 'Expandir') : t('sidebar.collapse', 'Colapsar')}
                      style={{
                        padding: DESIGN_TOKENS.spacing[1],
                        minHeight: 'auto',
                        width: 'auto'
                      }}
                    >
                      <Icon name={isCollapsed ? 'forward' : 'back'} size="sm" />
                    </Button>
                  )}

                  {!isWearable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClose}
                      aria-label={t('sidebar.close', 'Cerrar')}
                      style={{
                        padding: DESIGN_TOKENS.spacing[1],
                        minHeight: 'auto',
                        width: 'auto'
                      }}
                    >
                      <Icon name="close" size="sm" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Contenido principal */}
            <div
              className="sidebar-content"
              style={{
                flex: 1,
                overflow: 'auto',
                padding: wearableAdjustments.padding
              }}
            >
              <nav
                role="navigation"
                aria-label={t('sidebar.navigation', 'Navegación')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: DESIGN_TOKENS.spacing[1]
                }}
              >
                {items.map((item, index) => (
                  <SidebarItem
                    key={index}
                    item={item}
                    isCollapsed={isCollapsed}
                    variant={variant}
                    isWearable={isWearable}
                  />
                ))}
              </nav>
            </div>

            {/* Footer */}
            {footer && (
              <div
                className="sidebar-footer"
                style={{
                  padding: wearableAdjustments.padding,
                  borderTop: `1px solid ${palette.borderLight}`,
                  flexShrink: 0
                }}
              >
                {isCollapsed ? footer.collapsed : footer.expanded}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// Componente auxiliar para items del sidebar
const SidebarItem = ({ item, isCollapsed, variant, isWearable }) => {
  const { getCurrentPalette } = useTheme();
  const { animationsEnabled } = useAccessibility();
  const { reducedAnimations } = useBatteryOptimization();

  const palette = getCurrentPalette();

  const isActive = item.active;
  const hasChildren = item.children && item.children.length > 0;
  const [isExpanded, setIsExpanded] = useState(item.expanded || false);

  // Estilos del item
  const itemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: DESIGN_TOKENS.spacing[3],
    padding: isWearable ? DESIGN_TOKENS.spacing[2] : DESIGN_TOKENS.spacing[3],
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    cursor: item.disabled ? 'not-allowed' : 'pointer',
    opacity: item.disabled ? 0.5 : 1,
    backgroundColor: isActive ? palette.primary : 'transparent',
    color: isActive ? palette.background : palette.text,
    transition: animationsEnabled && !reducedAnimations
      ? `all ${DESIGN_TOKENS.animations.duration.fast}ms ${DESIGN_TOKENS.animations.easing.out}`
      : 'none',
    minHeight: isWearable ? '44px' : '48px'
  };

  // Hover styles
  const hoverStyles = !item.disabled && {
    backgroundColor: isActive ? palette.primary : palette.hover
  };

  // Manejar clic
  const handleClick = () => {
    if (item.disabled) return;

    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      item.onClick?.();
    }
  };

  return (
    <div>
      <motion.div
        style={itemStyles}
        whileHover={hoverStyles}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={item.disabled}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
          }
        }}
      >
        {/* Icono */}
        {item.icon && (
          <Icon
            name={item.icon}
            size={isWearable ? 'sm' : 'md'}
            color={isActive ? palette.background : palette.text}
          />
        )}

        {/* Texto */}
        {!isCollapsed && (
          <span
            style={{
              flex: 1,
              fontSize: isWearable ? DESIGN_TOKENS.typography.fontSize.sm : DESIGN_TOKENS.typography.fontSize.base,
              fontWeight: isActive ? DESIGN_TOKENS.typography.fontWeight.medium : DESIGN_TOKENS.typography.fontWeight.normal,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {item.label}
          </span>
        )}

        {/* Badge */}
        {item.badge && !isCollapsed && (
          <Badge
            variant={item.badge.variant || 'primary'}
            size="sm"
            style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs }}
          >
            {item.badge.text}
          </Badge>
        )}

        {/* Indicador de expansión */}
        {hasChildren && !isCollapsed && (
          <Icon
            name={isExpanded ? 'back' : 'forward'}
            size="sm"
            color={palette.textSecondary}
            style={{
              transform: 'rotate(-90deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        )}
      </motion.div>

      {/* Sub-items */}
      {hasChildren && isExpanded && !isCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            marginLeft: DESIGN_TOKENS.spacing[4],
            marginTop: DESIGN_TOKENS.spacing[1]
          }}
        >
          {item.children.map((child, childIndex) => (
            <SidebarItem
              key={childIndex}
              item={child}
              isCollapsed={false}
              variant={variant}
              isWearable={isWearable}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Sidebar;