
// Importar las dependencias de React y React Router
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../contexts/AccessibilityContext';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import { motion } from 'framer-motion';

// --- Componente de la Página de Detalle del Miembro ---

const PaginaDetalleMiembro = () => {
  const { t } = useTranslation();

  // --- Hooks y Estado ---
  const { id } = useParams(); // Obtener el parámetro 'id' de la URL
  const [miembro, setMiembro] = useState(null); // Estado para almacenar los datos del miembro
  const [cargando, setCargando] = useState(true); // Estado para el indicador de carga
  const [error, setError] = useState(null); // Estado para el mensaje de error
  const [progresoExploracion, setProgresoExploracion] = useState(0); // Estado para el progreso de exploración
  // Contexto de accesibilidad
  const { language, restaurarFocoPersistente, animationsEnabled } = useAccessibility();

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

        // Animar la barra de progreso al cargar el perfil
        if (animationsEnabled) {
          setTimeout(() => {
            setProgresoExploracion(100);
          }, 500);
        } else {
          setProgresoExploracion(100);
        }
      })
      .catch(error => {
        console.error('Error al obtener los datos del miembro: ', error);
        setError(t('member.error'));
      })
      .finally(() => setCargando(false));
  }, [id, restaurarFocoPersistente, animationsEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <motion.div
      className="detail-container"
      role="main"
      aria-labelledby="member-name"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Barra de progreso de exploración */}
      <motion.div
        className="progress-container mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="progress" style={{ height: '6px' }}>
          <motion.div
            className="progress-bar bg-primary"
            style={{ width: `${progresoExploracion}%` }}
            initial={{ width: '0%' }}
            animate={{ width: `${progresoExploracion}%` }}
            transition={{ duration: animationsEnabled ? 1.5 : 0, ease: "easeOut" }}
            aria-label={`Progreso de exploración del perfil: ${progresoExploracion}%`}
          />
        </div>
        <small className="text-muted mt-1">{t('progress.exploringProfile', 'Explorando perfil...')}</small>
      </motion.div>

      {/* Enlace para volver a la página principal */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Link to="/" className="back-link" aria-label={t('member.backToList')} role="link">{t('member.backToList')}</Link>
      </motion.div>

      {/* Tarjeta con los detalles del miembro */}
      <motion.div
        className="detail-card"
        role="region"
        aria-labelledby="member-name"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.h1
          id="member-name"
          className="detail-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {miembro.name}
        </motion.h1>
        <motion.h2
          className="detail-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          {miembro.real_name}
        </motion.h2>
        <motion.p
          className="detail-role"
          aria-label={t('member.role', { role: miembro.role })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          {miembro.role}
        </motion.p>

        {/* Biografía */}
        {miembro.biography && (
          <motion.div
            className="biography-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.3 }}
          >
            <h3 className="biography-title">{t('member.biography', 'Biografía')}</h3>
            <motion.p
              className="biography-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              {miembro.biography[language] || miembro.biography['es']}
            </motion.p>

            {/* Botón de narración por voz */}
            {speechSupported && (
              <motion.button
                onClick={narrarBiografia}
                className={`voice-button ${isSpeaking ? 'speaking' : ''}`}
                aria-label={isSpeaking ? t('accessibility.voiceStop', 'Detener narración') : t('accessibility.voicePlay', 'Narrar biografía')}
                title={isSpeaking ? t('accessibility.voiceStop', 'Detener narración') : t('accessibility.voicePlay', 'Narrar biografía')}
                whileHover={animationsEnabled ? { scale: 1.05 } : undefined}
                whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.1 }}
              >
                <span className="voice-icon" aria-hidden="true">
                  {isSpeaking ? '🔊' : '🔈'}
                </span>
                {isSpeaking ? t('accessibility.voiceStop', 'Detener') : t('accessibility.voicePlay', 'Escuchar')}
              </motion.button>
            )}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Exportar el componente para su uso en otras partes de la aplicación
export default PaginaDetalleMiembro;
