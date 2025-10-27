// Contexto de Accesibilidad para manejar preferencias de usuario según WCAG 2.1
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Valor del contexto
  const value = {
    fontSize,
    colorPalette,
    language,
    changeFontSize,
    changeColorPalette,
    changeLanguage,
    mantenerFocoPersistente,
    restaurarFocoPersistente,
  };

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