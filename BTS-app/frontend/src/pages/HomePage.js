
import React, { useState, useEffect } from 'react';
import MemberCard from '../components/MemberCard';

// Helper functions to get initial state from localStorage
const getInitialFavorites = () => {
  const saved = localStorage.getItem('bts-favorites');
  return saved ? JSON.parse(saved) : [];
};

const getInitialVisited = () => {
  const visited = localStorage.getItem('bts-visited');
  return visited ? JSON.parse(visited) : [];
};

const HomePage = () => {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Personalization & Gamification State
  const [favorites, setFavorites] = useState(getInitialFavorites);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [visited, setVisited] = useState(getInitialVisited);

  // Effect for fetching initial data
  useEffect(() => {
    fetch('http://localhost:3001/api/members')
      .then(response => {
        if (!response.ok) throw new Error('La respuesta de la red no fue satisfactoria.');
        return response.json();
      })
      .then(data => {
        setMembers(data);
      })
      .catch(error => {
        console.error('Error al obtener los datos: ', error);
        setError('No se pudieron cargar los miembros. Por favor, inténtalo de nuevo más tarde.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Effect for saving favorites to localStorage
  useEffect(() => {
    localStorage.setItem('bts-favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Effect to refresh visited status when the tab gets focus (e.g., after navigating back)
  useEffect(() => {
    const handleFocus = () => {
      setVisited(getInitialVisited());
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Effect for filtering members
  useEffect(() => {
    let results = members;
    if (showOnlyFavorites) {
      results = results.filter(member => favorites.includes(member.id));
    }
    if (searchTerm) {
      results = results.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredMembers(results);
  }, [searchTerm, members, favorites, showOnlyFavorites]);

  const handleToggleFavorite = (memberId) => {
    setFavorites(prevFavorites => {
      if (prevFavorites.includes(memberId)) {
        return prevFavorites.filter(id => id !== memberId);
      } else {
        return [...prevFavorites, memberId];
      }
    });
  };

  const renderContent = () => {
    if (loading) {
      return <div className="feedback-container"><div className="loader"></div></div>;
    }
    if (error) {
      return <div className="feedback-container"><p className="error-message">{error}</p></div>;
    }
    if (filteredMembers.length === 0 && searchTerm) {
      return <div className="feedback-container"><p>No se encontraron miembros que coincidan con la búsqueda.</p></div>;
    }
    return (
      <div className="row" role="list">
        {filteredMembers.map(member => (
          <MemberCard 
            key={member.id} 
            member={member} 
            isFavorite={favorites.includes(member.id)}
            onToggleFavorite={handleToggleFavorite}
            isVisited={visited.includes(String(member.id))} // Ensure comparison is correct (localStorage stores strings)
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="col-12 d-md-none">
        <h1 className="mobile-title">BTS Members</h1>
      </div>

      <div className="filters-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre o rol..."
            className="search-bar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={() => setShowOnlyFavorites(!showOnlyFavorites)} className={`favorites-toggle-btn ${showOnlyFavorites ? 'active' : ''}`}>
          ★ Solo Favoritos
        </button>
      </div>

      <div className="progress-container">
        <p>Has explorado {visited.length} de {members.length} perfiles.</p>
      </div>

      {renderContent()}
    </>
  );
};

export default HomePage;
