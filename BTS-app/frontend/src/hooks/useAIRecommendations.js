// Hook personalizado para recomendaciones basadas en IA ligera
import { useState, useEffect, useCallback, useMemo } from 'react';
import useUserAnalytics from './useUserAnalytics';

const useAIRecommendations = (members) => {
  const { analytics } = useUserAnalytics();
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Algoritmos simples de recomendación
  const recommendationAlgorithms = useMemo(() => ({
    // Recomendación basada en roles similares
    roleBased: (member, allMembers, preferences) => {
      const similarRoleMembers = allMembers.filter(m =>
        m.role === member.role && m.id !== member.id
      );
      return similarRoleMembers.map(m => ({
        ...m,
        score: 0.8,
        reason: 'similar_role'
      }));
    },

    // Recomendación basada en patrones de uso
    usageBased: (allMembers, userData) => {
      const visitedIds = Object.keys(userData.visits);

      // Encontrar miembros no visitados pero con roles similares a los visitados
      const visitedMembers = allMembers.filter(m => visitedIds.includes(m.id.toString()));
      const visitedRoles = [...new Set(visitedMembers.map(m => m.role))];

      return allMembers
        .filter(m => !visitedIds.includes(m.id.toString()))
        .filter(m => visitedRoles.includes(m.role))
        .map(m => ({
          ...m,
          score: 0.6,
          reason: 'similar_to_visited'
        }));
    },

    // Recomendación basada en favoritos
    favoritesBased: (allMembers, preferences) => {
      if (preferences.favorites.length === 0) return [];

      const favoriteMembers = allMembers.filter(m => preferences.favorites.includes(m.id));
      const favoriteRoles = [...new Set(favoriteMembers.map(m => m.role))];

      return allMembers
        .filter(m => !preferences.favorites.includes(m.id))
        .filter(m => favoriteRoles.includes(m.role))
        .map(m => ({
          ...m,
          score: 0.9,
          reason: 'similar_to_favorites'
        }));
    },

    // Recomendación basada en búsquedas recientes
    searchBased: (allMembers, userData) => {
      if (userData.searches.length === 0) return [];

      const recentSearches = userData.searches.slice(-5); // Últimas 5 búsquedas
      const searchTerms = recentSearches.map(s => s.term);

      return allMembers
        .filter(m =>
          searchTerms.some(term =>
            m.name.toLowerCase().includes(term) ||
            m.role.toLowerCase().includes(term) ||
            m.real_name.toLowerCase().includes(term)
          )
        )
        .map(m => ({
          ...m,
          score: 0.7,
          reason: 'matches_recent_searches'
        }));
    },

    // Recomendación de descubrimiento (miembros menos visitados)
    discovery: (allMembers, userData) => {
      const visitedIds = Object.keys(userData.visits);
      const unvisitedMembers = allMembers.filter(m => !visitedIds.includes(m.id.toString()));

      // Ordenar por popularidad inversa (simular "descubrimiento")
      return unvisitedMembers
        .sort(() => Math.random() - 0.5) // Aleatorio simple
        .slice(0, 3)
        .map(m => ({
          ...m,
          score: 0.4,
          reason: 'discovery'
        }));
    }
  }), []);

  // Función para generar recomendaciones
  const generateRecommendations = useCallback(async () => {
    if (!members || members.length === 0) return;

    setIsLoading(true);

    try {
      let allRecommendations = [];

      // Aplicar algoritmos de recomendación
      const roleBasedRecs = recommendationAlgorithms.roleBased(members[0] || {}, members, analytics);
      const usageBasedRecs = recommendationAlgorithms.usageBased(members, analytics);
      const favoritesBasedRecs = recommendationAlgorithms.favoritesBased(members, analytics);
      const searchBasedRecs = recommendationAlgorithms.searchBased(members, analytics);
      const discoveryRecs = recommendationAlgorithms.discovery(members, analytics);

      allRecommendations = [
        ...roleBasedRecs,
        ...usageBasedRecs,
        ...favoritesBasedRecs,
        ...searchBasedRecs,
        ...discoveryRecs
      ];

      // Eliminar duplicados y ordenar por score
      const uniqueRecommendations = allRecommendations
        .filter((rec, index, self) =>
          index === self.findIndex(r => r.id === rec.id)
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 6); // Limitar a 6 recomendaciones

      setRecommendations(uniqueRecommendations);
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [members, analytics, recommendationAlgorithms]);

  // Generar recomendaciones cuando cambian los miembros o datos de usuario
  useEffect(() => {
    // Solo generar recomendaciones si el usuario no ha optado por no participar
    if (!analytics.optOut) {
      generateRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [generateRecommendations, analytics.optOut]);

  // Función para obtener texto explicativo de la recomendación
  const getRecommendationReason = useCallback((reason) => {
    const reasons = {
      similar_role: 'Miembro con rol similar',
      similar_to_visited: 'Similar a miembros que has visitado',
      similar_to_favorites: 'Similar a tus favoritos',
      matches_recent_searches: 'Coincide con tus búsquedas recientes',
      discovery: 'Descubre nuevos miembros'
    };
    return reasons[reason] || 'Recomendado para ti';
  }, []);

  // Función para actualizar recomendaciones manualmente
  const refreshRecommendations = useCallback(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  return {
    recommendations,
    isLoading,
    getRecommendationReason,
    refreshRecommendations
  };
};

export default useAIRecommendations;