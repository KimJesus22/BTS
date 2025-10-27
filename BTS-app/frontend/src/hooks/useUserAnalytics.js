// Hook personalizado para análisis de datos de usuario
import { useState, useEffect, useCallback } from 'react';

const useUserAnalytics = () => {
  // Estado para datos analíticos del usuario
  const [analytics, setAnalytics] = useState(() => {
    // Verificar si el usuario ha optado por no participar en análisis
    const optOut = localStorage.getItem('bts-privacy-optout-analytics') === 'true';
    if (optOut) {
      return {
        visits: {},
        searches: [],
        favorites: [],
        timeSpent: {},
        lastActivity: null,
        sessionStart: Date.now(),
        preferences: {
          preferredRoles: [],
          preferredLanguage: 'es',
          accessibilitySettings: {}
        },
        optOut: true
      };
    }

    const saved = localStorage.getItem('bts-user-analytics');
    return saved ? JSON.parse(saved) : {
      visits: {}, // { memberId: count }
      searches: [], // Array de términos buscados
      favorites: [], // Array de IDs favoritos
      timeSpent: {}, // { page: seconds }
      lastActivity: null,
      sessionStart: Date.now(),
      preferences: {
        preferredRoles: [],
        preferredLanguage: 'es',
        accessibilitySettings: {}
      },
      optOut: false
    };
  });

  // Guardar analytics en localStorage (solo si no ha optado por no participar)
  useEffect(() => {
    if (!analytics.optOut) {
      localStorage.setItem('bts-user-analytics', JSON.stringify(analytics));
    }
  }, [analytics]);

  // Registrar visita a un perfil de miembro
  const trackVisit = useCallback((memberId) => {
    if (analytics.optOut) return; // No registrar si ha optado por no participar

    setAnalytics(prev => ({
      ...prev,
      visits: {
        ...prev.visits,
        [memberId]: (prev.visits[memberId] || 0) + 1
      },
      lastActivity: Date.now()
    }));
  }, [analytics.optOut]);

  // Registrar búsqueda
  const trackSearch = useCallback((searchTerm) => {
    if (analytics.optOut) return; // No registrar si ha optado por no participar

    setAnalytics(prev => ({
      ...prev,
      searches: [searchTerm, ...prev.searches.filter(s => s !== searchTerm)].slice(0, 10), // Mantener últimas 10 búsquedas únicas
      lastActivity: Date.now()
    }));
  }, [analytics.optOut]);

  // Actualizar favoritos
  const updateFavorites = useCallback((favorites) => {
    setAnalytics(prev => ({
      ...prev,
      favorites: favorites,
      lastActivity: Date.now()
    }));
  }, []);

  // Registrar tiempo en página
  const trackTimeSpent = useCallback((page, seconds) => {
    setAnalytics(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [page]: (prev.timeSpent[page] || 0) + seconds
      }
    }));
  }, []);

  // Actualizar preferencias
  const updatePreferences = useCallback((newPreferences) => {
    setAnalytics(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...newPreferences },
      lastActivity: Date.now()
    }));
  }, []);

  // Obtener estadísticas calculadas
  const getStats = useCallback(() => {
    const totalVisits = Object.values(analytics.visits).reduce((sum, count) => sum + count, 0);
    const uniqueMembersVisited = Object.keys(analytics.visits).length;
    const mostVisitedMember = Object.entries(analytics.visits)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
    const favoriteRoles = analytics.favorites.length > 0 ?
      analytics.favorites.map(id => `member_${id}_role`).filter(Boolean) : [];

    return {
      totalVisits,
      uniqueMembersVisited,
      mostVisitedMember,
      favoriteRoles,
      recentSearches: analytics.searches.slice(0, 5),
      totalTimeSpent: Object.values(analytics.timeSpent).reduce((sum, time) => sum + time, 0)
    };
  }, [analytics]);

  // Función para gestionar opt-out de análisis
  const setAnalyticsOptOut = useCallback((optOut) => {
    localStorage.setItem('bts-privacy-optout-analytics', optOut.toString());
    if (optOut) {
      // Si opta por no participar, limpiar datos existentes
      setAnalytics({
        visits: {},
        searches: [],
        favorites: [],
        timeSpent: {},
        lastActivity: null,
        sessionStart: Date.now(),
        preferences: {
          preferredRoles: [],
          preferredLanguage: 'es',
          accessibilitySettings: {}
        },
        optOut: true
      });
      localStorage.removeItem('bts-user-analytics');
    } else {
      // Si vuelve a participar, reiniciar con datos vacíos
      setAnalytics({
        visits: {},
        searches: [],
        favorites: [],
        timeSpent: {},
        lastActivity: null,
        sessionStart: Date.now(),
        preferences: {
          preferredRoles: [],
          preferredLanguage: 'es',
          accessibilitySettings: {}
        },
        optOut: false
      });
    }
  }, []);

  // Limpiar datos (para testing o reset)
  const clearAnalytics = useCallback(() => {
    setAnalytics({
      visits: {},
      searches: [],
      favorites: [],
      timeSpent: {},
      lastActivity: null,
      sessionStart: Date.now(),
      preferences: {
        preferredRoles: [],
        preferredLanguage: 'es',
        accessibilitySettings: {}
      },
      optOut: analytics.optOut
    });
    // También limpiar localStorage
    localStorage.removeItem('bts-user-analytics');
  }, [analytics.optOut]);

  return {
    analytics,
    trackVisit,
    trackSearch,
    updateFavorites,
    trackTimeSpent,
    updatePreferences,
    getStats,
    clearAnalytics,
    setAnalyticsOptOut
  };
};

export default useUserAnalytics;