// Componente para mostrar recomendaciones personalizadas
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import useAIRecommendations from '../hooks/useAIRecommendations';
import usePersonalizedSpeech from '../hooks/usePersonalizedSpeech';
import useUserPreferences from '../hooks/useUserPreferences';
import TarjetaMiembro from './TarjetaMiembro';

const SeccionRecomendaciones = ({ miembros, favoritos, onToggleFavorito, visitados }) => {
  const { t } = useTranslation();
  const { animationsEnabled } = useAccessibility();
  const { preferences } = useUserPreferences();
  const { recommendations, isLoading, getRecommendationReason, refreshRecommendations } = useAIRecommendations(miembros);
  const { speakRecommendations, isSpeaking } = usePersonalizedSpeech();
  const [isExpanded, setIsExpanded] = useState(false);

  // Leer recomendaciones automáticamente si está habilitado
  useEffect(() => {
    if (recommendations.length > 0 && preferences.autoPlayVoice && !isSpeaking) {
      const timer = setTimeout(() => {
        speakRecommendations(recommendations.slice(0, 3)); // Leer solo las primeras 3
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [recommendations, preferences.autoPlayVoice, speakRecommendations, isSpeaking]);

  if (!preferences.showRecommendations || recommendations.length === 0) {
    return null;
  }

  const displayedRecommendations = isExpanded ? recommendations : recommendations.slice(0, 3);

  // Variantes de animación para las recomendaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.section
      className="recommendations-section mb-5"
      aria-labelledby="recommendations-title"
      initial={animationsEnabled ? "hidden" : "visible"}
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="recommendations-header d-flex justify-content-between align-items-center mb-3"
        variants={itemVariants}
      >
        <motion.h2
          id="recommendations-title"
          className="h4 mb-0"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {t('recommendations.title')}
          <motion.span
            className="badge bg-primary ms-2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 500 }}
          >
            {recommendations.length}
          </motion.span>
        </motion.h2>

        <motion.div
          className="recommendations-controls"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <motion.button
            onClick={refreshRecommendations}
            className="btn btn-outline-secondary btn-sm me-2"
            aria-label={t('recommendations.refresh')}
            disabled={isLoading}
            whileHover={animationsEnabled ? { scale: 1.05, rotate: 180 } : undefined}
            whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
            transition={{ duration: 0.2 }}
          >
            <span aria-hidden="true">🔄</span>
            {isLoading && <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>}
          </motion.button>

          {recommendations.length > 3 && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-outline-primary btn-sm"
              aria-expanded={isExpanded}
              aria-controls="recommendations-list"
              whileHover={animationsEnabled ? { scale: 1.05 } : undefined}
              whileTap={animationsEnabled ? { scale: 0.95 } : undefined}
              transition={{ duration: 0.1 }}
            >
              {isExpanded ? t('recommendations.hide') : t('recommendations.viewAll')}
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
          <p className="mt-2 text-muted">{t('recommendations.loading')}</p>
        </div>
      ) : (
        <motion.div
          id="recommendations-list"
          className="recommendations-grid"
          role="list"
          aria-label={t('recommendations.title')}
          variants={containerVariants}
          initial={animationsEnabled ? "hidden" : "visible"}
          animate="visible"
        >
          {displayedRecommendations.map((recomendacion, index) => (
            <motion.div
              key={`${recomendacion.id}-${index}`}
              className="recommendation-item"
              role="listitem"
              variants={itemVariants}
              whileHover={animationsEnabled ? { scale: 1.02 } : undefined}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="recommendation-card card h-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                {/* Indicador de recomendación */}
                <motion.div
                  className="recommendation-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 500 }}
                >
                  <span className="badge bg-success">
                    💡 {getRecommendationReason(recomendacion.reason)}
                  </span>
                </motion.div>

                {/* Tarjeta del miembro recomendado */}
                <TarjetaMiembro
                  miembro={recomendacion}
                  esFavorito={favoritos.includes(recomendacion.id)}
                  onToggleFavorito={onToggleFavorito}
                  esVisitado={visitados.includes(String(recomendacion.id))}
                  index={index}
                />

                {/* Información adicional de recomendación */}
                <motion.div
                  className="card-footer bg-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.4, duration: 0.3 }}
                >
                  <small className="text-muted">
                    {t(`recommendations.reasons.${recomendacion.reason}`)}
                  </small>
                  <div className="recommendation-score mt-1">
                    <motion.div
                      className="progress"
                      style={{ height: '4px' }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                    >
                      <motion.div
                        className="progress-bar bg-primary"
                        style={{ width: `${recomendacion.score * 100}%` }}
                        aria-label={`Puntuación de recomendación: ${Math.round(recomendacion.score * 100)}%`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${recomendacion.score * 100}%` }}
                        transition={{ delay: index * 0.1 + 0.6, duration: 0.8, ease: "easeOut" }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Mensaje cuando no hay recomendaciones */}
      {!isLoading && recommendations.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted mb-3">{t('recommendations.noRecommendations')}</p>
          <button
            onClick={refreshRecommendations}
            className="btn btn-primary"
            aria-label={t('recommendations.refresh')}
          >
            {t('recommendations.refresh')}
          </button>
        </div>
      )}
    </motion.section>
  );
};

export default SeccionRecomendaciones;