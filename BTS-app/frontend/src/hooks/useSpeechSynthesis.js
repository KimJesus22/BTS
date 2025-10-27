// Hook personalizado para síntesis de voz (SpeechSynthesis)
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const useSpeechSynthesis = () => {
  const { i18n } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  // Verificar soporte del navegador
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);

      // Obtener voces disponibles
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Función para obtener la voz apropiada según el idioma
  const getVoiceForLanguage = useCallback((language) => {
    const lang = language || i18n.language;

    // Priorizar voces nativas del idioma
    const nativeVoices = voices.filter(voice =>
      voice.lang.startsWith(lang) && voice.localService
    );

    if (nativeVoices.length > 0) {
      return nativeVoices[0];
    }

    // Fallback a cualquier voz del idioma
    const fallbackVoices = voices.filter(voice =>
      voice.lang.startsWith(lang)
    );

    if (fallbackVoices.length > 0) {
      return fallbackVoices[0];
    }

    // Último fallback: primera voz disponible
    return voices[0];
  }, [voices, i18n.language]);

  // Función para hablar texto
  const speak = useCallback((text, options = {}) => {
    if (!isSupported) {
      console.warn('SpeechSynthesis no está soportado en este navegador');
      return;
    }

    // Detener cualquier síntesis anterior
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurar opciones
    const voice = getVoiceForLanguage(options.language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = options.language || i18n.language;
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    // Eventos
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Error en síntesis de voz:', event);
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, getVoiceForLanguage, i18n.language]);

  // Función para detener la síntesis
  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  // Función para pausar/reanudar
  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
    }
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (isSupported) {
      speechSynthesis.resume();
    }
  }, [isSupported]);

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume,
  };
};

export default useSpeechSynthesis;