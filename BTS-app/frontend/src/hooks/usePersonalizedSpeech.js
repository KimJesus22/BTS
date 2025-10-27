// Hook personalizado para lecturas en voz alta personalizadas
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useSpeechSynthesis from './useSpeechSynthesis';
import useUserPreferences from './useUserPreferences';
import useUserAnalytics from './useUserAnalytics';

const usePersonalizedSpeech = () => {
  const { t } = useTranslation();
  const { speak, stop, isSpeaking, voices } = useSpeechSynthesis();
  const { preferences } = useUserPreferences();
  const { trackVisit } = useUserAnalytics();

  // Función para generar texto personalizado para recomendaciones
  const generateRecommendationText = useCallback((recommendation, reason) => {
    const { name, real_name, role } = recommendation;

    let text = '';

    switch (reason) {
      case 'similar_role':
        text = t('speech.recommendation.similarRole', {
          name,
          real_name,
          role: role.toLowerCase()
        });
        break;
      case 'similar_to_visited':
        text = t('speech.recommendation.similarToVisited', {
          name,
          real_name
        });
        break;
      case 'similar_to_favorites':
        text = t('speech.recommendation.similarToFavorites', {
          name,
          real_name
        });
        break;
      case 'matches_recent_searches':
        text = t('speech.recommendation.matchesSearches', {
          name,
          real_name
        });
        break;
      case 'discovery':
        text = t('speech.recommendation.discovery', {
          name,
          real_name
        });
        break;
      default:
        text = t('speech.recommendation.default', {
          name,
          real_name,
          role: role.toLowerCase()
        });
    }

    return text;
  }, [t]);

  // Función para leer recomendaciones en voz alta
  const speakRecommendations = useCallback((recommendations) => {
    if (!preferences.autoPlayVoice && !preferences.showRecommendations) return;

    if (recommendations.length === 0) {
      speak(t('speech.noRecommendations'));
      return;
    }

    // Introducción
    const introText = t('speech.recommendationsIntro', { count: recommendations.length });
    speak(introText, { rate: 0.9, pitch: 1.1 });

    // Leer cada recomendación con pausa
    recommendations.forEach((rec, index) => {
      setTimeout(() => {
        const recText = generateRecommendationText(rec, rec.reason);
        speak(recText, {
          rate: 0.8,
          pitch: 1.0,
          onEnd: () => {
            // Pausa entre recomendaciones
            if (index < recommendations.length - 1) {
              setTimeout(() => {
                speak(t('speech.nextRecommendation'), { rate: 1.0, pitch: 1.2 });
              }, 500);
            }
          }
        });
      }, (index + 1) * 3000); // 3 segundos entre recomendaciones
    });
  }, [preferences, speak, t, generateRecommendationText]);

  // Función para leer detalles de un miembro
  const speakMemberDetails = useCallback((member) => {
    const text = t('speech.memberDetails', {
      name: member.name,
      real_name: member.real_name,
      role: member.role.toLowerCase()
    });

    speak(text, {
      rate: 0.85,
      pitch: 1.0,
      onStart: () => trackVisit(member.id)
    });
  }, [speak, t, trackVisit]);

  // Función para leer resultados de búsqueda
  const speakSearchResults = useCallback((results, searchTerm) => {
    if (results.length === 0) {
      speak(t('speech.noSearchResults', { term: searchTerm }));
      return;
    }

    const introText = t('speech.searchResults', {
      count: results.length,
      term: searchTerm
    });
    speak(introText, { rate: 0.9 });

    // Leer primeros 3 resultados
    results.slice(0, 3).forEach((member, index) => {
      setTimeout(() => {
        const resultText = t('speech.searchResult', {
          index: index + 1,
          name: member.name,
          role: member.role.toLowerCase()
        });
        speak(resultText, { rate: 0.8 });
      }, (index + 1) * 2000);
    });
  }, [speak, t]);

  // Función para leer navegación por teclado
  const speakKeyboardNavigation = useCallback((member, position, total) => {
    const text = t('speech.keyboardNavigation', {
      name: member.name,
      position,
      total
    });

    speak(text, {
      rate: 1.0,
      pitch: 1.1,
      volume: 0.8
    });
  }, [speak, t]);

  // Función para leer cambios en filtros
  const speakFilterChange = useCallback((filterType, value) => {
    let text = '';

    switch (filterType) {
      case 'favorites':
        text = value ? t('speech.filter.favoritesOn') : t('speech.filter.favoritesOff');
        break;
      case 'search':
        text = t('speech.filter.searchActive', { term: value });
        break;
      case 'role':
        text = t('speech.filter.roleFilter', { role: value });
        break;
      default:
        text = t('speech.filter.genericChange');
    }

    speak(text, { rate: 0.9, pitch: 1.0 });
  }, [speak, t]);

  // Función para leer estadísticas de usuario
  const speakUserStats = useCallback((stats) => {
    const text = t('speech.userStats', {
      visits: stats.totalVisits,
      favorites: stats.favoriteCount,
      searches: stats.totalSearches
    });

    speak(text, { rate: 0.85, pitch: 1.0 });
  }, [speak, t]);

  // Función para configurar voz preferida según idioma
  const setPreferredVoice = useCallback((language) => {
    const preferredVoice = voices.find(voice =>
      voice.lang.startsWith(language) && voice.localService
    );

    if (preferredVoice) {
      // Configurar voz por defecto (esto depende de la implementación del navegador)
      speechSynthesis.defaultVoice = preferredVoice;
    }
  }, [voices]);

  // Efecto para cambiar voz cuando cambia el idioma
  useEffect(() => {
    setPreferredVoice(preferences.language);
  }, [preferences.language, setPreferredVoice]);

  return {
    speakRecommendations,
    speakMemberDetails,
    speakSearchResults,
    speakKeyboardNavigation,
    speakFilterChange,
    speakUserStats,
    stopSpeaking: stop,
    isSpeaking,
    voices
  };
};

export default usePersonalizedSpeech;