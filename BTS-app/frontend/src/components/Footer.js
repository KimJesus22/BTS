import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useBatteryOptimization } from '../hooks/useBatteryOptimization';
import { useWearableOptimizations } from '../hooks/useWearableOptimizations';
import { DESIGN_TOKENS } from '../design-tokens';
import Button from './Button';
import Icon from './Icon';

// Componente Footer organismo reutilizable
const Footer = ({
  links = [],
  socialLinks = [],
  copyright,
  showBackToTop = false,
  onBackToTop,
  variant = 'default',
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

  // Configuraciones de variante
  const variants = {
    default: {
      backgroundColor: palette.surface,
      borderTopColor: palette.borderLight
    },
    dark: {
      backgroundColor: palette.surfaceElevated,
      borderTopColor: palette.border
    },
    transparent: {
      backgroundColor: 'transparent',
      borderTopColor: 'transparent'
    }
  };

  const currentVariant = variants[variant] || variants.default;

  // Ajustes para wearables
  const wearableAdjustments = isWearable ? {
    padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[3]}`,
    fontSize: DESIGN_TOKENS.typography.fontSize.xs
  } : {
    padding: `${DESIGN_TOKENS.spacing[4]} ${DESIGN_TOKENS.spacing[5]}`,
    fontSize: DESIGN_TOKENS.typography.fontSize.sm
  };

  // Manejar volver arriba
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: animationsEnabled && !reducedAnimations ? 'smooth' : 'auto'
    });
    onBackToTop?.();
  };

  return (
    <footer
      className={`footer footer-${variant} ${className}`}
      style={{
        backgroundColor: currentVariant.backgroundColor,
        borderTop: `1px solid ${currentVariant.borderTopColor}`,
        width: '100%',
        fontFamily: DESIGN_TOKENS.typography.fontFamily.primary,
        fontSize: wearableAdjustments.fontSize,
        color: palette.textSecondary,
        transition: animationsEnabled && !reducedAnimations
          ? `all ${DESIGN_TOKENS.animations.duration.normal}ms ${DESIGN_TOKENS.animations.easing.out}`
          : 'none',
        ...style
      }}
      {...props}
    >
      <div
        style={{
          ...wearableAdjustments,
          display: 'flex',
          flexDirection: 'column',
          gap: DESIGN_TOKENS.spacing[4]
        }}
      >
        {/* Contenido principal */}
        <div
          style={{
            display: 'flex',
            flexDirection: isWearable ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isWearable ? 'stretch' : 'center',
            gap: DESIGN_TOKENS.spacing[4]
          }}
        >
          {/* Enlaces */}
          {links.length > 0 && (
            <nav
              className="footer-links"
              style={{
                display: 'flex',
                flexDirection: isWearable ? 'column' : 'row',
                gap: isWearable ? DESIGN_TOKENS.spacing[2] : DESIGN_TOKENS.spacing[4],
                alignItems: isWearable ? 'stretch' : 'center'
              }}
              role="navigation"
              aria-label={t('footer.links', 'Enlaces del footer')}
            >
              {links.map((link, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={link.onClick}
                  disabled={link.disabled}
                  style={{
                    color: palette.textSecondary,
                    padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
                    fontSize: wearableAdjustments.fontSize,
                    minHeight: 'auto',
                    justifyContent: isWearable ? 'flex-start' : 'center',
                    width: isWearable ? '100%' : 'auto'
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </nav>
          )}

          {/* Redes sociales */}
          {socialLinks.length > 0 && (
            <div
              className="footer-social"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[2]
              }}
            >
              <span
                style={{
                  fontSize: wearableAdjustments.fontSize,
                  color: palette.textMuted,
                  marginRight: DESIGN_TOKENS.spacing[2]
                }}
              >
                {t('footer.followUs', 'Síguenos:')}
              </span>
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={social.onClick}
                  aria-label={t('footer.socialLink', 'Enlace a {{platform}}', { platform: social.platform })}
                  style={{
                    padding: DESIGN_TOKENS.spacing[1],
                    minHeight: 'auto',
                    width: 'auto'
                  }}
                >
                  <Icon name={social.icon} size="sm" />
                </Button>
              ))}
            </div>
          )}

          {/* Botón volver arriba */}
          {showBackToTop && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToTop}
              aria-label={t('footer.backToTop', 'Volver arriba')}
              style={{
                padding: `${DESIGN_TOKENS.spacing[1]} ${DESIGN_TOKENS.spacing[2]}`,
                fontSize: wearableAdjustments.fontSize,
                minHeight: 'auto',
                alignSelf: isWearable ? 'flex-end' : 'center'
              }}
            >
              <Icon name="back" size="sm" style={{ marginRight: DESIGN_TOKENS.spacing[1] }} />
              {!isWearable && t('footer.backToTop', 'Volver arriba')}
            </Button>
          )}
        </div>

        {/* Copyright y información adicional */}
        <div
          style={{
            borderTop: `1px solid ${palette.borderLight}`,
            paddingTop: DESIGN_TOKENS.spacing[3],
            display: 'flex',
            flexDirection: isWearable ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isWearable ? 'stretch' : 'center',
            gap: DESIGN_TOKENS.spacing[2]
          }}
        >
          {/* Copyright */}
          <div
            className="footer-copyright"
            style={{
              fontSize: wearableAdjustments.fontSize,
              color: palette.textMuted,
              flex: 1
            }}
          >
            {copyright || (
              <span>
                © {new Date().getFullYear()} BTS App. {t('footer.rights', 'Todos los derechos reservados.')}
              </span>
            )}
          </div>

          {/* Información adicional */}
          {!isWearable && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[4],
                fontSize: wearableAdjustments.fontSize,
                color: palette.textMuted
              }}
            >
              <span>v{process.env.REACT_APP_VERSION || '1.0.0'}</span>
              <span>•</span>
              <span>{t('footer.poweredBy', 'Desarrollado con ❤️')}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;