// Contexto de Accesibilidad para manejar preferencias de usuario según WCAG 2.1
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Crear el contexto
const AccessibilityContext = createContext();

// Proveedor del contexto
export const AccessibilityProvider = ({ children }) => {
  const { i18n } = useTranslation();

  // Estado para el tamaño de fuente (12px a 24px)
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('accessibility-fontSize');
    return saved ? parseInt(saved, 10) : 16; // Tamaño por defecto 16px
  });

  // Estado para la paleta de colores (normal, deuteranopia, protanopia, tritanopia)
  const [colorPalette, setColorPalette] = useState(() => {
    const saved = localStorage.getItem('accessibility-colorPalette');
    return saved || 'normal'; // Paleta por defecto 'normal'
  });

  // Estado para el idioma
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('accessibility-language');
    return saved || i18n.language || 'es'; // Idioma por defecto español
  });

  // Estado para habilitar/deshabilitar animaciones
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('accessibility-animationsEnabled');
    return saved !== null ? JSON.parse(saved) : true; // Animaciones habilitadas por defecto
  });

  // Estado para el tema preferido (integración con ThemeContext)
  const [preferredTheme, setPreferredTheme] = useState(() => {
    const saved = localStorage.getItem('accessibility-preferredTheme');
    return saved || 'auto'; // Tema automático por defecto
  });

  // Estado para el modo de accesibilidad completo
  const [accessibilityMode, setAccessibilityMode] = useState(() => {
    const saved = localStorage.getItem('accessibility-mode');
    return saved !== null ? JSON.parse(saved) : false; // Modo desactivado por defecto
  });

  // Efecto para guardar el tamaño de fuente en localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-fontSize', fontSize.toString());
    // Aplicar el tamaño de fuente al elemento raíz
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
  }, [fontSize]);

  // Efecto para guardar la paleta de colores en localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-colorPalette', colorPalette);
    // Aplicar la paleta al elemento raíz
    document.documentElement.setAttribute('data-palette', colorPalette);
  }, [colorPalette]);

  // Efecto para guardar el idioma en localStorage y cambiar el idioma de i18n
  useEffect(() => {
    localStorage.setItem('accessibility-language', language);
    i18n.changeLanguage(language);
  }, [language, i18n]);

  // Efecto para guardar la preferencia de animaciones en localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-animationsEnabled', JSON.stringify(animationsEnabled));
  }, [animationsEnabled]);

  // Efecto para guardar la preferencia de tema en localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-preferredTheme', preferredTheme);
  }, [preferredTheme]);

  // Efecto para guardar el modo de accesibilidad en localStorage y aplicar cambios globales
  useEffect(() => {
    localStorage.setItem('accessibility-mode', JSON.stringify(accessibilityMode));
    if (accessibilityMode) {
      // Aplicar cambios para modo de accesibilidad
      document.documentElement.style.setProperty('--spacing-multiplier', '1.5'); // Aumentar espaciado 50%
      document.documentElement.style.setProperty('--font-size-multiplier', '1.25'); // Aumentar fuente 25% (20% adicional)
      document.documentElement.setAttribute('data-accessibility-mode', 'true');
      // Desactivar animaciones globalmente
      document.documentElement.style.setProperty('--animation-duration', '0s');
      // Aplicar alto contraste
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      // Restaurar valores por defecto
      document.documentElement.style.setProperty('--spacing-multiplier', '1');
      document.documentElement.style.setProperty('--font-size-multiplier', '1');
      document.documentElement.removeAttribute('data-accessibility-mode');
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }, [accessibilityMode]);

  // Función para cambiar el tamaño de fuente
  const changeFontSize = (newSize) => {
    if (newSize >= 12 && newSize <= 24) {
      setFontSize(newSize);
    }
  };

  // Función para cambiar la paleta de colores
  const changeColorPalette = (palette) => {
    const validPalettes = ['normal', 'deuteranopia', 'protanopia', 'tritanopia'];
    if (validPalettes.includes(palette)) {
      setColorPalette(palette);
    }
  };

  // Función para cambiar el idioma
  const changeLanguage = (newLanguage) => {
    const validLanguages = ['es', 'en'];
    if (validLanguages.includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  // Función para mantener el foco persistente
  const mantenerFocoPersistente = (elementId) => {
    localStorage.setItem('accessibility-lastFocusedElement', elementId);
  };

  // Función para restaurar el foco persistente
  const restaurarFocoPersistente = () => {
    const lastFocused = localStorage.getItem('accessibility-lastFocusedElement');
    if (lastFocused) {
      setTimeout(() => {
        const element = document.getElementById(lastFocused);
        if (element) {
          element.focus();
        }
      }, 100);
    }
  };

  // Función para cambiar la preferencia de animaciones
  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  // Función para cambiar el tema preferido
  const changePreferredTheme = (theme) => {
    const validThemes = ['auto', 'light', 'dark', 'highContrast', 'sepia'];
    if (validThemes.includes(theme)) {
      setPreferredTheme(theme);
    }
  };

  // Función para alternar el modo de accesibilidad completo
  const toggleAccessibilityMode = useCallback(() => {
    setAccessibilityMode(prev => !prev);
  }, []);

  // Valor del contexto memoizado para evitar re-renders innecesarios
  const value = useMemo(() => ({
    fontSize,
    colorPalette,
    language,
    animationsEnabled,
    preferredTheme,
    accessibilityMode,
    changeFontSize,
    changeColorPalette,
    changeLanguage,
    toggleAnimations,
    changePreferredTheme,
    toggleAccessibilityMode,
    mantenerFocoPersistente,
    restaurarFocoPersistente,
  }), [
    fontSize,
    colorPalette,
    language,
    animationsEnabled,
    preferredTheme,
    accessibilityMode,
    changeFontSize,
    changeColorPalette,
    changeLanguage,
    toggleAnimations,
    changePreferredTheme,
    toggleAccessibilityMode,
    mantenerFocoPersistente,
    restaurarFocoPersistente,
  ]);

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser usado dentro de un AccessibilityProvider');
  }
  return context;
};

export default AccessibilityContext;