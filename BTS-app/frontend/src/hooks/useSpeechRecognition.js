// Hook personalizado para reconocimiento de voz (SpeechRecognition)
import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useUserPreferences from './useUserPreferences';

const useSpeechRecognition = () => {
  const { i18n } = useTranslation();
  const { preferences } = useUserPreferences();
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Verificar soporte del navegador
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      const recognition = recognitionRef.current;

      // Configuración básica
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = i18n.language;

      // Eventos
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event) => {
        setError(event.error);
        setIsListening(false);

        // Manejar diferentes tipos de errores
        switch (event.error) {
          case 'not-allowed':
            setError('Permiso de micrófono denegado');
            break;
          case 'no-speech':
            setError('No se detectó habla');
            break;
          case 'audio-capture':
            setError('Error de captura de audio');
            break;
          case 'network':
            setError('Error de red');
            break;
          default:
            setError('Error de reconocimiento de voz');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

    } else {
      setIsSupported(false);
    }

    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [i18n.language]);

  // Actualizar idioma cuando cambie
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = i18n.language;
    }
  }, [i18n.language]);

  // Función para iniciar reconocimiento
  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('Reconocimiento de voz no soportado');
      return;
    }

    // Verificar si el usuario ha desactivado la búsqueda por voz
    if (!preferences.voiceSearch) {
      setError('Búsqueda por voz desactivada en configuración de privacidad');
      return;
    }

    try {
      // Solicitar permisos si es necesario
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      // Mostrar notificación de privacidad si es la primera vez
      if (!localStorage.getItem('bts-privacy-microphone-notified')) {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('BTS App - Uso del micrófono', {
            body: 'La aplicación está usando el micrófono para búsqueda por voz. Los datos de audio se procesan localmente y no se almacenan.',
            icon: '/logo192.png'
          });
        }
        localStorage.setItem('bts-privacy-microphone-notified', 'true');
      }

      setError(null);
      setTranscript('');
      recognitionRef.current.start();
    } catch (err) {
      setError('Error al acceder al micrófono');
      console.error('Error al iniciar reconocimiento:', err);
    }
  }, [isSupported, preferences.voiceSearch]);

  // Función para detener reconocimiento
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // Función para resetear
  const reset = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    reset,
  };
};

export default useSpeechRecognition;