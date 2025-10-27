
// Importar las dependencias de React y React Router
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';

// --- Componente de la Página de Detalle del Miembro ---

const PaginaDetalleMiembro = () => {
  const { t } = useTranslation();

  // --- Hooks y Estado ---
  const { id } = useParams(); // Obtener el parámetro 'id' de la URL
  const [miembro, setMiembro] = useState(null); // Estado para almacenar los datos del miembro
  const [cargando, setCargando] = useState(true); // Estado para el indicador de carga
  const [error, setError] = useState(null); // Estado para el mensaje de error
  // Contexto de accesibilidad
  const { language, restaurarFocoPersistente } = useAccessibility();

  // Hook para síntesis de voz
  const { isSupported: speechSupported, isSpeaking, speak, stop } = useSpeechSynthesis();

  // --- Efectos ---

  // Efecto para registrar que el perfil de este miembro ha sido visitado
  useEffect(() => {
    // Obtener la lista de visitados desde localStorage
    const visitados = JSON.parse(localStorage.getItem('bts-visitados')) || [];
    // Si el ID actual no está en la lista, añadirlo
    if (!visitados.includes(id)) {
      visitados.push(id);
      // Guardar la lista actualizada en localStorage
      localStorage.setItem('bts-visitados', JSON.stringify(visitados));
    }
  }, [id]); // Se ejecuta cada vez que el ID del miembro cambia

  // Efecto para obtener los datos del miembro desde la API
  useEffect(() => {
    fetch(`http://localhost:3001/api/members/${id}`)
      .then(respuesta => {
        if (!respuesta.ok) throw new Error('Miembro no encontrado.');
        return respuesta.json();
      })
      .then(datos => {
        setMiembro(datos);
        // Restaurar el foco persistente después de cargar los datos
        setTimeout(() => restaurarFocoPersistente(), 100);
      })
      .catch(error => {
        console.error('Error al obtener los datos del miembro: ', error);
        setError(t('member.error'));
      })
      .finally(() => setCargando(false));
  }, [id, restaurarFocoPersistente]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Funciones para SpeechSynthesis ---

  // Función para narrar la biografía
  const narrarBiografia = () => {
    if (!speechSupported || !miembro?.biography) {
      console.warn('SpeechSynthesis no soportado o biografía no disponible');
      return;
    }

    if (isSpeaking) {
      stop();
      return;
    }

    const biografia = miembro.biography[language] || miembro.biography['es'] || 'Biografía no disponible en este idioma.';
    speak(biografia, { language: language === 'es' ? 'es-ES' : 'en-US', rate: 0.9 });
  };

  // --- Lógica de Renderizado Condicional ---

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (cargando) {
    return <div className="feedback-container"><div className="loader"></div></div>;
  }

  // Mostrar un mensaje de error si la obtención de datos falla
  if (error) {
    return <div className="feedback-container"><p className="error-message">{error}</p></div>;
  }

  // No renderizar nada si el miembro no se ha cargado (aunque el manejo de errores debería cubrir esto)
  if (!miembro) return null;

  // --- JSX del Componente ---

  return (
    <div className="detail-container" role="main" aria-labelledby="member-name">
      {/* Enlace para volver a la página principal */}
      <Link to="/" className="back-link" aria-label={t('member.backToList')} role="link">{t('member.backToList')}</Link>

      {/* Tarjeta con los detalles del miembro */}
      <div className="detail-card" role="region" aria-labelledby="member-name">
        <h1 id="member-name" className="detail-title">{miembro.name}</h1>
        <h2 className="detail-subtitle">{miembro.real_name}</h2>
        <p className="detail-role" aria-label={t('member.role', { role: miembro.role })}>{miembro.role}</p>

        {/* Biografía */}
        {miembro.biography && (
          <div className="biography-section">
            <h3 className="biography-title">{t('member.biography', 'Biografía')}</h3>
            <p className="biography-text">{miembro.biography[language] || miembro.biography['es']}</p>

            {/* Botón de narración por voz */}
            {speechSupported && (
              <button
                onClick={narrarBiografia}
                className={`voice-button ${isSpeaking ? 'speaking' : ''}`}
                aria-label={isSpeaking ? t('accessibility.voiceStop', 'Detener narración') : t('accessibility.voicePlay', 'Narrar biografía')}
                title={isSpeaking ? t('accessibility.voiceStop', 'Detener narración') : t('accessibility.voicePlay', 'Narrar biografía')}
              >
                <span className="voice-icon" aria-hidden="true">
                  {isSpeaking ? '🔊' : '🔈'}
                </span>
                {isSpeaking ? t('accessibility.voiceStop', 'Detener') : t('accessibility.voicePlay', 'Escuchar')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Exportar el componente para su uso en otras partes de la aplicación
export default PaginaDetalleMiembro;
