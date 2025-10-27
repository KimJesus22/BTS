// Componente de interruptor de tema con soporte completo de accesibilidad
import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

const ThemeToggle = () => {
  const { t } = useTranslation();
  const { theme, resolvedTheme, toggleTheme, changeTheme, palettes } = useTheme();
  const { animationsEnabled } = useAccessibility();

  // Función para manejar el cambio de tema
  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Función para seleccionar tema específico
  const handleThemeSelect = (selectedTheme) => {
    changeTheme(selectedTheme);
  };

  // Determinar el ícono basado en el tema actual
  const getThemeIcon = () => {
    switch (resolvedTheme) {
      case 'dark':
        return '🌙';
      case 'light':
        return '☀️';
      case 'highContrast':
        return '⚡';
      case 'sepia':
        return '📖';
      default:
        return '🎨';
    }
  };

  // Determinar el texto del botón basado en el tema
  const getThemeText = () => {
    switch (resolvedTheme) {
      case 'dark':
        return t('theme.darkMode', 'Modo oscuro');
      case 'light':
        return t('theme.lightMode', 'Modo claro');
      case 'highContrast':
        return t('theme.highContrast', 'Alto contraste');
      case 'sepia':
        return t('theme.sepia', 'Modo sepia');
      default:
        return t('theme.autoMode', 'Modo automático');
    }
  };

  // Variantes de animación para el botón principal
  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Variantes de animación para el menú desplegable
  const menuVariants = {
    closed: {
      opacity: 0,
      scale: 0.8,
      y: -10,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Estado para controlar el menú desplegable
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.theme-toggle-container')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Opciones de tema disponibles
  const themeOptions = [
    { key: 'auto', label: t('theme.auto', 'Automático'), icon: '🎨' },
    { key: 'light', label: t('theme.light', 'Claro'), icon: '☀️' },
    { key: 'dark', label: t('theme.dark', 'Oscuro'), icon: '🌙' },
    { key: 'highContrast', label: t('theme.highContrast', 'Alto contraste'), icon: '⚡' },
    { key: 'sepia', label: t('theme.sepia', 'Sepia'), icon: '📖' }
  ];

  return (
    <div className="theme-toggle-container" style={{ position: 'relative' }}>
      {/* Botón principal de alternancia rápida */}
      <motion.button
        className="theme-toggle-btn btn btn-outline-secondary"
        onClick={handleThemeToggle}
        aria-label={t('theme.toggleTheme', 'Alternar tema')}
        aria-pressed={resolvedTheme === 'dark'}
        variants={buttonVariants}
        initial="initial"
        whileHover={animationsEnabled ? "hover" : undefined}
        whileTap={animationsEnabled ? "tap" : undefined}
        title={getThemeText()}
      >
        <span className="theme-icon" role="img" aria-hidden="true">
          {getThemeIcon()}
        </span>
        <span className="sr-only">{getThemeText()}</span>
      </motion.button>

      {/* Botón para abrir menú de opciones avanzadas */}
      <motion.button
        className="theme-menu-btn btn btn-sm btn-outline-secondary ms-2"
        onClick={toggleMenu}
        aria-label={t('theme.themeOptions', 'Opciones de tema')}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        variants={buttonVariants}
        initial="initial"
        whileHover={animationsEnabled ? "hover" : undefined}
        whileTap={animationsEnabled ? "tap" : undefined}
      >
        <span aria-hidden="true">⚙️</span>
        <span className="sr-only">{t('theme.settings', 'Configuración')}</span>
      </motion.button>

      {/* Menú desplegable de opciones de tema */}
      <motion.div
        className="theme-menu"
        role="menu"
        aria-label={t('theme.selectTheme', 'Seleccionar tema')}
        variants={menuVariants}
        initial="closed"
        animate={isMenuOpen ? "open" : "closed"}
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          zIndex: 1000,
          background: 'var(--theme-surfaceElevated)',
          border: '1px solid var(--theme-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px var(--theme-shadow)',
          minWidth: '200px',
          marginTop: '8px',
          overflow: 'hidden'
        }}
      >
        {themeOptions.map((option) => (
          <motion.button
            key={option.key}
            className={`theme-option ${theme === option.key ? 'active' : ''}`}
            onClick={() => {
              handleThemeSelect(option.key);
              setIsMenuOpen(false);
            }}
            role="menuitem"
            aria-current={theme === option.key ? 'true' : undefined}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: theme === option.key ? 'var(--theme-primary)' : 'transparent',
              color: theme === option.key ? 'var(--theme-background)' : 'var(--theme-text)',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            whileHover={{
              backgroundColor: theme === option.key ? 'var(--theme-primary)' : 'var(--theme-hover)',
              scale: 1.02
            }}
            whileTap={{ scale: 0.98 }}
          >
            <span role="img" aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
            {theme === option.key && (
              <span
                className="ms-auto"
                role="img"
                aria-hidden="true"
                style={{ fontSize: '12px' }}
              >
                ✓
              </span>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Estilos CSS en línea para el componente */}
      <style jsx>{`
        .theme-toggle-container {
          display: inline-flex;
          align-items: center;
        }

        .theme-toggle-btn,
        .theme-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .theme-toggle-btn:hover,
        .theme-menu-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 2px 8px var(--theme-shadow);
        }

        .theme-icon {
          font-size: 18px;
        }

        .theme-menu {
          backdrop-filter: blur(8px);
        }

        .theme-option:hover {
          background-color: var(--theme-hover) !important;
        }

        .theme-option.active {
          background-color: var(--theme-primary) !important;
          color: var(--theme-background) !important;
        }

        /* Soporte para reducción de movimiento */
        @media (prefers-reduced-motion: reduce) {
          .theme-toggle-btn,
          .theme-menu-btn,
          .theme-option {
            transition: none !important;
          }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .theme-menu {
            min-width: 180px;
          }

          .theme-option {
            padding: 10px 12px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default ThemeToggle;