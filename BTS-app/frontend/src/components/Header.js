import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';
import Avatar from './Avatar';
import Badge from './Badge';

// Componente Header organismo reutilizable
const Header = ({
  title,
  subtitle,
  logo,
  navigation = [],
  user,
  actions = [],
  search,
  notifications,
  onMenuClick,
  sticky = false,
  transparent = false,
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

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
    height: '56px',
    fontSize: DESIGN_TOKENS.typography.fontSize.sm
  } : {
    padding: `${DESIGN_TOKENS.spacing[3]} ${DESIGN_TOKENS.spacing[5]}`,
    height: '72px',
    fontSize: DESIGN_TOKENS.typography.fontSize.base
  };

  return (
    <header
      className={`header ${sticky ? 'sticky' : ''} ${transparent ? 'transparent' : ''} ${className}`}
      style={{
        backgroundColor: transparent ? 'transparent' : palette.surfaceElevated,
        borderBottom: transparent ? 'none' : `1px solid ${palette.borderLight}`,
        boxShadow: transparent ? 'none' : DESIGN_TOKENS.shadows.sm,
        position: sticky ? 'sticky' : 'relative',
        top: 0,
        zIndex: 100,
        width: '100%',
        ...wearableAdjustments,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: animationsEnabled && !reducedAnimations
          ? `all ${DESIGN_TOKENS.animations.duration.normal}ms ${DESIGN_TOKENS.animations.easing.out}`
          : 'none',
        ...style
      }}
      {...props}
    >
      {/* Sección izquierda - Logo y navegación */}
      <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[4] }}>
        {/* Botón de menú móvil */}
        {onMenuClick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            aria-label={t('header.menu', 'Menú')}
            style={{
              display: isWearable ? 'flex' : 'none',
              padding: DESIGN_TOKENS.spacing[1],
              minHeight: 'auto'
            }}
          >
            <Icon name="menu" size="md" />
          </Button>
        )}

        {/* Logo */}
        {logo && (
          <div className="header-logo" style={{ flexShrink: 0 }}>
            {typeof logo === 'string' ? (
              <img
                src={logo}
                alt={t('header.logo', 'Logo')}
                style={{
                  height: isWearable ? '32px' : '40px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            ) : (
              logo
            )}
          </div>
        )}

        {/* Título y subtítulo */}
        {(title || subtitle) && (
          <div className="header-title-section" style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h1
                style={{
                  margin: 0,
                  fontSize: wearableAdjustments.fontSize,
                  fontWeight: DESIGN_TOKENS.typography.fontWeight.bold,
                  color: palette.text,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.snug,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  margin: `${DESIGN_TOKENS.spacing[1]} 0 0 0`,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                  color: palette.textSecondary,
                  lineHeight: DESIGN_TOKENS.typography.lineHeight.normal,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Navegación desktop */}
        {!isWearable && navigation.length > 0 && (
          <nav
            className="header-navigation"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing[2]
            }}
            role="navigation"
            aria-label={t('header.navigation', 'Navegación principal')}
          >
            {navigation.map((item, index) => (
              <Button
                key={index}
                variant={item.active ? 'primary' : 'ghost'}
                size="sm"
                onClick={item.onClick}
                disabled={item.disabled}
                style={{
                  padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
                  fontSize: DESIGN_TOKENS.typography.fontSize.sm
                }}
              >
                {item.icon && <Icon name={item.icon} size="sm" style={{ marginRight: DESIGN_TOKENS.spacing[1] }} />}
                {item.label}
              </Button>
            ))}
          </nav>
        )}
      </div>

      {/* Sección derecha - Acciones y usuario */}
      <div style={{ display: 'flex', alignItems: 'center', gap: DESIGN_TOKENS.spacing[3] }}>
        {/* Barra de búsqueda */}
        {search && (
          <div
            className="header-search"
            style={{
              flex: isWearable ? 'none' : '0 1 300px',
              maxWidth: isWearable ? '120px' : '300px'
            }}
          >
            {search}
          </div>
        )}

        {/* Acciones */}
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'ghost'}
            size={isWearable ? 'sm' : 'md'}
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.label}
            style={{
              padding: isWearable ? DESIGN_TOKENS.spacing[1] : DESIGN_TOKENS.spacing[2],
              minHeight: 'auto'
            }}
          >
            {action.icon && <Icon name={action.icon} size={isWearable ? 'sm' : 'md'} />}
            {!isWearable && action.label && !action.icon && action.label}
          </Button>
        ))}

        {/* Notificaciones */}
        {notifications && (
          <div className="header-notifications" style={{ position: 'relative' }}>
            <Button
              variant="ghost"
              size={isWearable ? 'sm' : 'md'}
              onClick={notifications.onClick}
              aria-label={t('header.notifications', 'Notificaciones')}
              style={{
                padding: isWearable ? DESIGN_TOKENS.spacing[1] : DESIGN_TOKENS.spacing[2],
                minHeight: 'auto'
              }}
            >
              <Icon name="info" size={isWearable ? 'sm' : 'md'} />
            </Button>
            {notifications.count > 0 && (
              <Badge
                variant="error"
                size="sm"
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  fontSize: DESIGN_TOKENS.typography.fontSize.xs,
                  minWidth: '18px',
                  height: '18px'
                }}
              >
                {notifications.count > 99 ? '99+' : notifications.count}
              </Badge>
            )}
          </div>
        )}

        {/* Usuario */}
        {user && (
          <div
            className="header-user"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: DESIGN_TOKENS.spacing[2],
              cursor: user.onClick ? 'pointer' : 'default'
            }}
            onClick={user.onClick}
            role={user.onClick ? 'button' : undefined}
            tabIndex={user.onClick ? 0 : -1}
          >
            <Avatar
              src={user.avatar}
              name={user.name}
              size={isWearable ? 'sm' : 'md'}
              status={user.status}
            />
            {!isWearable && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                    fontWeight: DESIGN_TOKENS.typography.fontWeight.medium,
                    color: palette.text,
                    lineHeight: DESIGN_TOKENS.typography.lineHeight.snug,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '120px'
                  }}
                >
                  {user.name}
                </div>
                {user.role && (
                  <div
                    style={{
                      fontSize: DESIGN_TOKENS.typography.fontSize.xs,
                      color: palette.textSecondary,
                      lineHeight: DESIGN_TOKENS.typography.lineHeight.normal
                    }}
                  >
                    {user.role}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;