
import React from 'react';
import { Link } from 'react-router-dom';

const MemberCard = ({ member, isFavorite, onToggleFavorite, isVisited }) => {

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking the star
    e.stopPropagation();
    onToggleFavorite(member.id);
  };

  return (
    <div className="col-12 col-md-6 col-lg-4" role="listitem">
      <Link to={`/member/${member.id}`} className="card-link">
        <div className={`card mb-4 ${isVisited ? 'is-visited' : ''}`}>
          <div className="card-icons">
            {isVisited && <span className="visited-icon" title="Visitado">✔</span>}
            <button 
              className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
              onClick={handleFavoriteClick}
              aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            >
              ★
            </button>
          </div>
          <div className="card-body">
            <h5 className="card-title">{member.name}</h5>
            <h6 className="card-subtitle mb-2 text-muted">{member.real_name}</h6>
            <p className="card-text">{member.role}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MemberCard;
