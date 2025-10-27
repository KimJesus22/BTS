
// Importar las dependencias de React y React Router
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// --- Componente de la Tarjeta de Miembro ---

const TarjetaMiembro = ({ miembro, esFavorito, onToggleFavorito, esVisitado, estaEnfocado, onKeyDown, index }) => {
  const { t } = useTranslation();

  // Maneja el clic en el botón de favorito
  const manejarClicFavorito = (e) => {
    e.preventDefault(); // Prevenir la navegación al hacer clic en la estrella
    e.stopPropagation(); // Detener la propagación del evento para no activar el Link principal
    onToggleFavorito(miembro.id); // Llamar a la función para cambiar el estado de favorito
  };

  return (
    <div className="col-12 col-md-6 col-lg-4" role="listitem" aria-labelledby={`member-${miembro.id}-name`}>
      {/* Enlazar toda la tarjeta a la página de detalle del miembro */}
      <Link
        to={`/miembro/${miembro.id}`}
        className={`card-link ${estaEnfocado ? 'focused' : ''}`}
        aria-label={t('member.viewDetails', { name: miembro.name, realName: miembro.real_name, role: miembro.role })}
        onKeyDown={onKeyDown}
        tabIndex={estaEnfocado ? 0 : -1}
        aria-current={estaEnfocado ? 'true' : undefined}
      >
        <div className={`card mb-4 ${esVisitado ? 'is-visited' : ''} ${estaEnfocado ? 'keyboard-focused' : ''}`}>
          <div className="card-icons">
            {/* Mostrar un ícono si el perfil ha sido visitado */}
            {esVisitado && <span className="visited-icon" title={t('member.visited')} aria-label={t('member.visited')} role="img" alt={t('member.visited')}>✔</span>}

            {/* Botón para marcar/desmarcar como favorito */}
            <button
              className={`favorite-btn ${esFavorito ? 'is-favorite' : ''}`}
              onClick={manejarClicFavorito}
              aria-label={esFavorito ? t('member.removeFavorite', { name: miembro.name }) : t('member.addFavorite', { name: miembro.name })}
              aria-pressed={esFavorito}
              tabIndex={0}
            >
              ★
            </button>
          </div>
          <div className="card-body">
            <h5 className="card-title" id={`member-${miembro.id}-name`}>{miembro.name}</h5>
            <h6 className="card-subtitle mb-2 text-muted">{miembro.real_name}</h6>
            <p className="card-text" aria-label={t('member.role', { role: miembro.role })}>{miembro.role}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Exportar el componente para su uso en otras partes de la aplicación
export default TarjetaMiembro;
