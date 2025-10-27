
// Importar las dependencias de React y React Router
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from 'react-i18next';

// --- Componente de la Tarjeta de Miembro ---

const TarjetaMiembro = ({ miembro, esFavorito, onToggleFavorito, esVisitado, estaEnfocado, onKeyDown, index }) => {
  const { t } = useTranslation();
  const { animationsEnabled } = useAccessibility();

  // Maneja el clic en el botón de favorito
  const manejarClicFavorito = (e) => {
    e.preventDefault(); // Prevenir la navegación al hacer clic en la estrella
    e.stopPropagation(); // Detener la propagación del evento para no activar el Link principal
    onToggleFavorito(miembro.id); // Llamar a la función para cambiar el estado de favorito
  };

  // Variantes de animación para la tarjeta
  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: index * 0.1 }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  // Variantes de animación para el botón de favorito
  const favoriteVariants = {
    initial: { scale: 1 },
    animate: { scale: 1 },
    tap: { scale: 0.9 },
    favorite: {
      scale: [1, 1.2, 1],
      color: ['#ffd700', '#ffed4e', '#ffd700'],
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      className="col-12 col-md-6 col-lg-4"
      role="listitem"
      aria-labelledby={`member-${miembro.id}-name`}
      variants={cardVariants}
      initial={animationsEnabled ? "initial" : "animate"}
      animate="animate"
      whileHover={animationsEnabled ? "hover" : undefined}
    >
      {/* Enlazar toda la tarjeta a la página de detalle del miembro */}
      <Link
        to={`/miembro/${miembro.id}`}
        className={`card-link ${estaEnfocado ? 'focused' : ''}`}
        aria-label={t('member.viewDetails', { name: miembro.name, realName: miembro.real_name, role: miembro.role })}
        onKeyDown={onKeyDown}
        tabIndex={estaEnfocado ? 0 : -1}
        aria-current={estaEnfocado ? 'true' : undefined}
      >
        <motion.div
          className={`card mb-4 ${esVisitado ? 'is-visited' : ''} ${estaEnfocado ? 'keyboard-focused' : ''}`}
          whileHover={animationsEnabled ? { y: -5 } : undefined}
          transition={{ duration: 0.2 }}
        >
          <div className="card-icons">
            {/* Mostrar un ícono si el perfil ha sido visitado */}
            {esVisitado && <span className="visited-icon" title={t('member.visited')} aria-label={t('member.visited')} role="img" alt={t('member.visited')}>✔</span>}

            {/* Botón para marcar/desmarcar como favorito */}
            <motion.button
              className={`favorite-btn ${esFavorito ? 'is-favorite' : ''}`}
              onClick={manejarClicFavorito}
              aria-label={esFavorito ? t('member.removeFavorite', { name: miembro.name }) : t('member.addFavorite', { name: miembro.name })}
              aria-pressed={esFavorito}
              tabIndex={0}
              variants={favoriteVariants}
              initial="initial"
              animate={esFavorito ? "favorite" : "animate"}
              whileTap="tap"
              style={{
                color: esFavorito ? '#ffd700' : '#ccc',
                transition: animationsEnabled ? 'color 0.3s ease' : 'none'
              }}
            >
              ★
            </motion.button>
          </div>
          <div className="card-body">
            <h5 className="card-title" id={`member-${miembro.id}-name`}>{miembro.name}</h5>
            <h6 className="card-subtitle mb-2 text-muted">{miembro.real_name}</h6>
            <p className="card-text" aria-label={t('member.role', { role: miembro.role })}>{miembro.role}</p>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

// Exportar el componente para su uso en otras partes de la aplicación
export default TarjetaMiembro;
