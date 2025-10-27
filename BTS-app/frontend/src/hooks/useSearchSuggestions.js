import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useBatteryOptimization } from './useBatteryOptimization';

// Sugerencias locales como fallback
const LOCAL_SUGGESTIONS = {
  en: [
    'RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook',
    'Rap Monster', 'Kim Namjoon', 'Min Yoonji', 'Jung Hoseok',
    'Park Jimin', 'Kim Taehyung', 'Jeon Jungkook',
    'rapper', 'vocalist', 'dancer', 'maknae', 'leader',
    'BTS', 'Bangtan Sonyeondan', 'Big Hit Entertainment'
  ],
  es: [
    'RM', 'Jin', 'Suga', 'J-Hope', 'Jimin', 'V', 'Jungkook',
    'Rap Monster', 'Kim Namjoon', 'Min Yoonji', 'Jung Hoseok',
    'Park Jimin', 'Kim Taehyung', 'Jeon Jungkook',
    'rapero', 'vocalista', 'bailarín', 'maknae', 'líder',
    'BTS', 'Bangtan Sonyeondan', 'Big Hit Entertainment'
  ]
};

export const useSearchSuggestions = (searchTerm, onSuggestionSelect) => {
  const { t, i18n } = useTranslation();
  const { startMonitoring, getOptimizationRecommendations } = usePerformanceMonitor();
  const { reducedAnimations, getOptimizationSettings } = useBatteryOptimization();

  // Estado de sugerencias
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Refs para debounce y cancelación
  const debounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Estado de métricas de búsqueda
  const [searchMetrics, setSearchMetrics] = useState({
    totalSearches: 0,
    averageResponseTime: 0,
    cacheHits: 0,
    apiCalls: 0,
    fallbackUsage: 0
  });

  // Cache de sugerencias
  const cacheRef = useRef(new Map());

  // Optimizaciones basadas en batería
  const optimizations = getOptimizationSettings();

  // Función para obtener sugerencias de la API
  const fetchSuggestionsFromAPI = useCallback(async (term) => {
    if (!term || term.length < 2) return [];

    const startTime = performance.now();

    try {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Simular llamada API (reemplazar con endpoint real)
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(term)}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept-Language': i18n.language
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = performance.now() - startTime;

      // Actualizar métricas
      setSearchMetrics(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + 1,
        averageResponseTime: (prev.averageResponseTime + responseTime) / 2
      }));

      return data.suggestions || [];
    } catch (err) {
      if (err.name === 'AbortError') {
        // Petición cancelada, ignorar
        return [];
      }

      console.warn('API suggestions failed, using local fallback:', err);
      setSearchMetrics(prev => ({
        ...prev,
        fallbackUsage: prev.fallbackUsage + 1
      }));

      // Usar sugerencias locales como fallback
      return getLocalSuggestions(term);
    }
  }, [i18n.language]);

  // Función para obtener sugerencias locales
  const getLocalSuggestions = useCallback((term) => {
    const currentLang = i18n.language.startsWith('es') ? 'es' : 'en';
    const localSuggestions = LOCAL_SUGGESTIONS[currentLang] || LOCAL_SUGGESTIONS.en;

    return localSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 8); // Limitar a 8 sugerencias
  }, [i18n.language]);

  // Función para obtener sugerencias con cache
  const getSuggestions = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setSuggestions([]);
      return;
    }

    // Verificar cache primero
    const cacheKey = `${i18n.language}-${term.toLowerCase()}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setSuggestions(cached);
      setSearchMetrics(prev => ({
        ...prev,
        cacheHits: prev.cacheHits + 1
      }));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let suggestions = [];

      // Intentar API primero
      suggestions = await fetchSuggestionsFromAPI(term);

      // Si no hay resultados de API, usar locales
      if (suggestions.length === 0) {
        suggestions = getLocalSuggestions(term);
      }

      // Filtrar y ordenar sugerencias
      const filtered = suggestions
        .filter(suggestion => suggestion && suggestion.trim())
        .map(suggestion => ({
          text: suggestion,
          type: 'suggestion',
          relevance: calculateRelevance(suggestion, term)
        }))
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 6); // Limitar a 6 sugerencias

      // Cachear resultado
      cacheRef.current.set(cacheKey, filtered);
      setSuggestions(filtered);

    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(t('search.error', 'Error loading suggestions'));
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchSuggestionsFromAPI, getLocalSuggestions, i18n.language, t]);

  // Calcular relevancia de sugerencia
  const calculateRelevance = (suggestion, term) => {
    const suggestionLower = suggestion.toLowerCase();
    const termLower = term.toLowerCase();

    if (suggestionLower === termLower) return 100;
    if (suggestionLower.startsWith(termLower)) return 80;
    if (suggestionLower.includes(termLower)) return 60;

    // Calcular similitud de Levenshtein simple
    return Math.max(0, 40 - getLevenshteinDistance(suggestionLower, termLower));
  };

  // Distancia de Levenshtein simplificada
  const getLevenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  // Función debounced para búsqueda
  const debouncedSearch = useCallback((term) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Ajustar delay basado en optimizaciones de batería
    const delay = optimizations.powerSavingMode ? 500 : 300;

    debounceRef.current = setTimeout(() => {
      getSuggestions(term);
      setSearchMetrics(prev => ({
        ...prev,
        totalSearches: prev.totalSearches + 1
      }));
    }, delay);
  }, [getSuggestions, optimizations.powerSavingMode]);

  // Efecto para manejar cambios en el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSuggestions([]);
      setSelectedIndex(-1);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  // Limpiar cache periódicamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      if (cacheRef.current.size > 50) {
        // Mantener solo las 25 entradas más recientes
        const entries = Array.from(cacheRef.current.entries());
        const recentEntries = entries.slice(-25);
        cacheRef.current.clear();
        recentEntries.forEach(([key, value]) => cacheRef.current.set(key, value));
      }
    }, 300000); // Cada 5 minutos

    return () => clearInterval(cleanup);
  }, []);

  // Función para seleccionar sugerencia
  const selectSuggestion = useCallback((index) => {
    if (suggestions[index]) {
      onSuggestionSelect?.(suggestions[index].text);
      setSelectedIndex(-1);
      setSuggestions([]);
    }
  }, [suggestions, onSuggestionSelect]);

  // Navegación por teclado
  const handleKeyDown = useCallback((event) => {
    if (suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(selectedIndex);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        setSuggestions([]);
        break;
      default:
        break;
    }
  }, [suggestions.length, selectedIndex, selectSuggestion]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    selectedIndex,
    searchMetrics,
    handleKeyDown,
    selectSuggestion,
    clearSuggestions: () => {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };
};