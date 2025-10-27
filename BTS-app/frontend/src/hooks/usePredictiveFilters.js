// Hook personalizado para filtros predictivos dinámicos
import { useState, useEffect, useCallback, useMemo } from 'react';
import useUserAnalytics from './useUserAnalytics';
import useUserPreferences from './useUserPreferences';

const usePredictiveFilters = (members) => {
  const { analytics } = useUserAnalytics();
  const { preferences } = useUserPreferences();

  const [predictiveSuggestions, setPredictiveSuggestions] = useState([]);
  const [filterPredictions, setFilterPredictions] = useState({
    roles: [],
    names: [],
    searchTerms: []
  });

  // Generar sugerencias predictivas basadas en patrones de uso
  const generatePredictiveSuggestions = useCallback(() => {
    if (!members || members.length === 0) return;

    const suggestions = [];

    // Sugerencias basadas en roles preferidos
    if (analytics.preferences.preferredRoles && analytics.preferences.preferredRoles.length > 0) {
      analytics.preferences.preferredRoles.slice(0, 3).forEach(role => {
        const roleMembers = members.filter(m => m.role === role && !analytics.favorites.includes(m.id));
        if (roleMembers.length > 0) {
          suggestions.push({
            type: 'role',
            value: role,
            label: `Más ${role.toLowerCase()}s como los que te gustan`,
            members: roleMembers.slice(0, 3),
            confidence: 0.8
          });
        }
      });
    }

    // Sugerencias basadas en búsquedas recientes
    if (analytics.searches.length > 0) {
      analytics.searches.slice(0, 3).forEach(search => {
        const matchingMembers = members.filter(m =>
          m.name.toLowerCase().includes(search.term) ||
          m.role.toLowerCase().includes(search.term) ||
          m.real_name.toLowerCase().includes(search.term)
        );

        if (matchingMembers.length > 0) {
          suggestions.push({
            type: 'search',
            value: search.term,
            label: `Búsquedas relacionadas con "${search.term}"`,
            members: matchingMembers.slice(0, 3),
            confidence: 0.7
          });
        }
      });
    }

    // Sugerencias de descubrimiento
    const visitedIds = Object.keys(analytics.visits);
    const unvisitedMembers = members.filter(m => !visitedIds.includes(m.id.toString()));

    if (unvisitedMembers.length > 3) {
      const randomDiscoveries = unvisitedMembers
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      suggestions.push({
        type: 'discovery',
        value: 'discovery',
        label: 'Descubre nuevos miembros',
        members: randomDiscoveries,
        confidence: 0.5
      });
    }

    // Ordenar por confianza y limitar a 5 sugerencias
    suggestions.sort((a, b) => b.confidence - a.confidence);
    setPredictiveSuggestions(suggestions.slice(0, 5));
  }, [members, analytics]);

  // Generar predicciones de filtros
  const generateFilterPredictions = useCallback(() => {
    if (!members || members.length === 0) return;

    const roles = [...new Set(members.map(m => m.role))];
    const names = members.map(m => m.name.toLowerCase());
    const searchTerms = analytics.searches.map(s => s.term);

    // Predicciones de roles basadas en uso
    const rolePredictions = roles.map(role => {
      const roleCount = members.filter(m => m.role === role).length;
      const userPreference = analytics.preferences.preferredRoles?.includes(role) ? 1 : 0;
      const score = (userPreference * 0.7) + (roleCount / members.length * 0.3);

      return { role, score, count: roleCount };
    }).sort((a, b) => b.score - a.score);

    // Predicciones de nombres basadas en búsquedas
    const namePredictions = names.filter(name =>
      searchTerms.some(term => name.includes(term))
    ).slice(0, 10);

    // Predicciones de términos de búsqueda
    const termPredictions = [...new Set(searchTerms)]
      .map(term => ({
        term,
        frequency: searchTerms.filter(t => t === term).length
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    setFilterPredictions({
      roles: rolePredictions,
      names: namePredictions,
      searchTerms: termPredictions
    });
  }, [members, analytics]);

  // Aplicar filtro predictivo
  const applyPredictiveFilter = useCallback((type, value) => {
    if (!members) return [];

    switch (type) {
      case 'role':
        return members.filter(m => m.role === value);
      case 'name':
        return members.filter(m =>
          m.name.toLowerCase().includes(value.toLowerCase()) ||
          m.real_name.toLowerCase().includes(value.toLowerCase())
        );
      case 'search':
        return members.filter(m =>
          m.name.toLowerCase().includes(value) ||
          m.role.toLowerCase().includes(value) ||
          m.real_name.toLowerCase().includes(value)
        );
      default:
        return members;
    }
  }, [members]);

  // Obtener sugerencias de autocompletado
  const getAutocompleteSuggestions = useCallback((input) => {
    if (!input || input.length < 2) return [];

    const inputLower = input.toLowerCase();
    const suggestions = [];

    // Sugerencias de nombres
    members.forEach(member => {
      if (member.name.toLowerCase().includes(inputLower)) {
        suggestions.push({
          type: 'name',
          value: member.name,
          label: `${member.name} (${member.role})`,
          member
        });
      }
      if (member.real_name.toLowerCase().includes(inputLower)) {
        suggestions.push({
          type: 'real_name',
          value: member.real_name,
          label: `${member.real_name} (${member.name})`,
          member
        });
      }
    });

    // Sugerencias de roles
    const matchingRoles = [...new Set(members.map(m => m.role))]
      .filter(role => role.toLowerCase().includes(inputLower))
      .map(role => ({
        type: 'role',
        value: role,
        label: `Todos los ${role.toLowerCase()}s`,
        member: null
      }));

    suggestions.push(...matchingRoles);

    // Sugerencias de búsquedas anteriores
    const matchingSearches = analytics.searches
      .filter(s => s.term.includes(inputLower))
      .map(s => ({
        type: 'search',
        value: s.term,
        label: `Búsqueda anterior: "${s.term}"`,
        member: null
      }));

    suggestions.push(...matchingSearches);

    // Eliminar duplicados y limitar
    const uniqueSuggestions = suggestions.filter((s, index, self) =>
      index === self.findIndex(s2 => s2.value === s2.value && s2.type === s2.type)
    );

    return uniqueSuggestions.slice(0, 8);
  }, [members, analytics.searches]);

  // Efectos para generar predicciones cuando cambian los datos
  useEffect(() => {
    generatePredictiveSuggestions();
    generateFilterPredictions();
  }, [generatePredictiveSuggestions, generateFilterPredictions]);

  return {
    predictiveSuggestions,
    filterPredictions,
    applyPredictiveFilter,
    getAutocompleteSuggestions,
    refreshPredictions: generatePredictiveSuggestions
  };
};

export default usePredictiveFilters;