// Hook personalizado para gestión de preferencias de usuario
import { useState, useEffect, useCallback } from 'react';

const useUserPreferences = () => {
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('bts-user-preferences');
    return saved ? JSON.parse(saved) : {
      // Preferencias de contenido
      preferredRoles: [], // Roles preferidos (vocalista, bailarín, etc.)
      contentTypes: ['members'], // Tipos de contenido a mostrar
      language: 'es', // Idioma preferido

      // Preferencias de UI/UX
      theme: 'light', // Tema visual
      autoPlayVoice: false, // Reproducir voz automáticamente
      showRecommendations: true, // Mostrar recomendaciones
      recommendationCount: 6, // Número de recomendaciones a mostrar

      // Preferencias de accesibilidad
      highContrast: false, // Modo alto contraste
      largeText: false, // Texto grande
      reduceMotion: false, // Reducir animaciones

      // Preferencias de búsqueda
      searchHistory: true, // Guardar historial de búsqueda
      voiceSearch: true, // Habilitar búsqueda por voz
      predictiveSearch: true, // Búsqueda predictiva

      // Preferencias de navegación
      keyboardNavigation: true, // Navegación por teclado
      focusIndicators: true, // Indicadores de foco

      // Última actualización
      lastUpdated: new Date().toISOString()
    };
  });

  // Guardar preferencias en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem('bts-user-preferences', JSON.stringify({
      ...preferences,
      lastUpdated: new Date().toISOString()
    }));
  }, [preferences]);

  // Función para actualizar una preferencia específica
  const updatePreference = useCallback((key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Función para actualizar múltiples preferencias
  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({
      ...prev,
      ...newPreferences
    }));
  }, []);

  // Función para agregar un rol preferido
  const addPreferredRole = useCallback((role) => {
    setPreferences(prev => ({
      ...prev,
      preferredRoles: [...new Set([...prev.preferredRoles, role])]
    }));
  }, []);

  // Función para remover un rol preferido
  const removePreferredRole = useCallback((role) => {
    setPreferences(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.filter(r => r !== role)
    }));
  }, []);

  // Función para alternar una preferencia booleana
  const togglePreference = useCallback((key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Función para resetear preferencias a valores por defecto
  const resetPreferences = useCallback(() => {
    const defaultPreferences = {
      preferredRoles: [],
      contentTypes: ['members'],
      language: 'es',
      theme: 'light',
      autoPlayVoice: false,
      showRecommendations: true,
      recommendationCount: 6,
      highContrast: false,
      largeText: false,
      reduceMotion: false,
      searchHistory: true,
      voiceSearch: true,
      predictiveSearch: true,
      keyboardNavigation: true,
      focusIndicators: true,
      lastUpdated: new Date().toISOString()
    };
    setPreferences(defaultPreferences);
    // También limpiar localStorage
    localStorage.removeItem('bts-user-preferences');
  }, []);

  // Función para obtener preferencias filtradas por categoría
  const getPreferencesByCategory = useCallback((category) => {
    const categories = {
      content: ['preferredRoles', 'contentTypes', 'language'],
      ui: ['theme', 'autoPlayVoice', 'showRecommendations', 'recommendationCount'],
      accessibility: ['highContrast', 'largeText', 'reduceMotion'],
      search: ['searchHistory', 'voiceSearch', 'predictiveSearch'],
      navigation: ['keyboardNavigation', 'focusIndicators']
    };

    if (!categories[category]) return {};

    return Object.fromEntries(
      Object.entries(preferences).filter(([key]) => categories[category].includes(key))
    );
  }, [preferences]);

  // Función para exportar preferencias (para backup)
  const exportPreferences = useCallback(() => {
    return JSON.stringify(preferences, null, 2);
  }, [preferences]);

  // Función para importar preferencias (desde backup)
  const importPreferences = useCallback((preferencesString) => {
    try {
      const imported = JSON.parse(preferencesString);
      setPreferences(imported);
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    addPreferredRole,
    removePreferredRole,
    togglePreference,
    resetPreferences,
    getPreferencesByCategory,
    exportPreferences,
    importPreferences
  };
};

export default useUserPreferences;