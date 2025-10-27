// Contexto de Tema para gestión avanzada de modos oscuro y claro
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Definir paletas de colores optimizadas para diferentes temas
const THEME_PALETTES = {
  light: {
    // Tema claro optimizado para legibilidad y jerarquía visual
    primary: '#1a73e8',
    secondary: '#34a853',
    accent: '#ea4335',
    background: '#ffffff',
    surface: '#f8f9fa',
    surfaceElevated: '#ffffff',
    text: '#202124',
    textSecondary: '#5f6368',
    textMuted: '#80868b',
    border: '#dadce0',
    borderLight: '#e8eaed',
    shadow: 'rgba(60, 64, 67, 0.3)',
    shadowLight: 'rgba(60, 64, 67, 0.15)',
    // Colores optimizados para OLED (ahorro de batería)
    oledBg: '#ffffff',
    oledSurface: '#f8f9fa',
    // Estados de interacción
    hover: '#f1f3f4',
    active: '#e8eaed',
    focus: '#e8f0fe',
    // Colores semánticos
    success: '#34a853',
    warning: '#fbbc04',
    error: '#ea4335',
    info: '#4285f4'
  },
  dark: {
    // Tema oscuro optimizado para reducción de fatiga visual
    primary: '#8ab4f8',
    secondary: '#81c995',
    accent: '#f28b82',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceElevated: '#2d2d2d',
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    textMuted: '#5f6368',
    border: '#5f6368',
    borderLight: '#3c4043',
    shadow: 'rgba(0, 0, 0, 0.6)',
    shadowLight: 'rgba(0, 0, 0, 0.3)',
    // Colores optimizados para OLED (ahorro de batería máximo)
    oledBg: '#000000',
    oledSurface: '#0d0d0d',
    // Estados de interacción
    hover: '#2d2d2d',
    active: '#3c4043',
    focus: '#1a237e',
    // Colores semánticos
    success: '#81c995',
    warning: '#fdd663',
    error: '#f28b82',
    info: '#8ab4f8'
  },
  auto: {
    // Tema automático basado en preferencias del sistema
    // Se resolverá dinámicamente basado en prefers-color-scheme
  },
  batterySaver: {
    // Tema optimizado para ahorro de batería
    primary: '#666666',
    secondary: '#888888',
    accent: '#aaaaaa',
    background: '#000000',
    surface: '#111111',
    surfaceElevated: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
    border: '#333333',
    borderLight: '#444444',
    shadow: 'none',
    shadowLight: 'none',
    oledBg: '#000000',
    oledSurface: '#000000',
    hover: '#1a1a1a',
    active: '#222222',
    focus: '#555555',
    success: '#888888',
    warning: '#aaaaaa',
    error: '#cccccc',
    info: '#777777'
  },
  highContrast: {
    // Tema de alto contraste para accesibilidad
    primary: '#ffffff',
    secondary: '#ffff00',
    accent: '#ff0000',
    background: '#000000',
    surface: '#000000',
    surfaceElevated: '#000000',
    text: '#ffffff',
    textSecondary: '#ffff00',
    textMuted: '#ffffff',
    border: '#ffffff',
    borderLight: '#ffffff',
    shadow: 'rgba(255, 255, 255, 0.5)',
    shadowLight: 'rgba(255, 255, 255, 0.3)',
    oledBg: '#000000',
    oledSurface: '#000000',
    hover: '#333333',
    active: '#666666',
    focus: '#ffffff',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0000',
    info: '#0080ff'
  },
  sepia: {
    // Tema sepia para reducción adicional de luz azul
    primary: '#8b4513',
    secondary: '#daa520',
    accent: '#cd853f',
    background: '#f4ecd8',
    surface: '#f5f5dc',
    surfaceElevated: '#faf0e6',
    text: '#5c4033',
    textSecondary: '#8b7355',
    textMuted: '#a0522d',
    border: '#daa520',
    borderLight: '#f5deb3',
    shadow: 'rgba(139, 69, 19, 0.3)',
    shadowLight: 'rgba(139, 69, 19, 0.15)',
    oledBg: '#f4ecd8',
    oledSurface: '#f5f5dc',
    hover: '#faf0e6',
    active: '#f5deb3',
    focus: '#ffe4b5',
    success: '#daa520',
    warning: '#cd853f',
    error: '#8b4513',
    info: '#a0522d'
  }
};

// Crear el contexto
const ThemeContext = createContext();

// Proveedor del contexto
export const ThemeProvider = ({ children }) => {
  // Estado para el tema actual
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    return saved || 'auto'; // Tema por defecto automático
  });

  // Estado para el tema resuelto (light/dark basado en preferencias)
  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Estado para detectar si el usuario prefiere modo oscuro
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Estado para controlar animaciones de transición de tema
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Función para detectar preferencias del sistema
  const updateSystemPreference = () => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setPrefersDark(mediaQuery.matches);

      // Listener para cambios en las preferencias del sistema
      const handleChange = (e) => {
        setPrefersDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  };

  // Resolver el tema actual basado en la preferencia del usuario y del sistema
  useEffect(() => {
    if (theme === 'auto') {
      setResolvedTheme(prefersDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
    }
  }, [theme, prefersDark]);

  // Aplicar el tema al elemento raíz y variables CSS
  useEffect(() => {
    const root = document.documentElement;
    const palette = THEME_PALETTES[resolvedTheme];

    if (palette) {
      // Aplicar clase de transición si está cambiando
      if (isTransitioning) {
        root.classList.add('theme-transitioning');
      } else {
        root.classList.remove('theme-transitioning');
      }

      // Aplicar atributo de tema
      root.setAttribute('data-theme', resolvedTheme);

      // Aplicar variables CSS para colores
      Object.entries(palette).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value);
      });

      // Aplicar clase para compatibilidad con Bootstrap
      root.className = root.className.replace(/\btheme-\w+/g, '');
      root.classList.add(`theme-${resolvedTheme}`);
    }
  }, [resolvedTheme, isTransitioning]);

  // Inicializar detector de preferencias del sistema
  useEffect(() => {
    updateSystemPreference();
  }, []);

  // Guardar preferencia de tema en localStorage
  useEffect(() => {
    localStorage.setItem('theme-preference', theme);
  }, [theme]);

  // Función para cambiar el tema
  const changeTheme = (newTheme) => {
    const validThemes = ['light', 'dark', 'auto', 'highContrast', 'sepia', 'batterySaver'];
    if (validThemes.includes(newTheme)) {
      setIsTransitioning(true);
      setTheme(newTheme);
      // Reset transition state after animation completes
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Función para alternar entre claro y oscuro
  const toggleTheme = () => {
    if (theme === 'auto') {
      // Si está en auto, cambiar a la preferencia opuesta del sistema
      setTheme(prefersDark ? 'light' : 'dark');
    } else if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      // Para temas personalizados, volver a auto
      setTheme('auto');
    }
  };

  // Función para activar tema de ahorro de batería
  const activateBatterySaver = useCallback(() => {
    setIsTransitioning(true);
    setTheme('batterySaver');
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  // Función para obtener la paleta actual
  const getCurrentPalette = () => {
    return THEME_PALETTES[resolvedTheme] || THEME_PALETTES.light;
  };

  // Valor del contexto
  const value = {
    theme,
    resolvedTheme,
    prefersDark,
    isTransitioning,
    changeTheme,
    toggleTheme,
    activateBatterySaver,
    getCurrentPalette,
    palettes: THEME_PALETTES
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export default ThemeContext;