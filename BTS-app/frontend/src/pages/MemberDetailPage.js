
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const MemberDetailPage = () => {
  const { id } = useParams(); // Get the ID from the URL
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Effect to track visited members
  useEffect(() => {
    const visited = JSON.parse(localStorage.getItem('bts-visited')) || [];
    if (!visited.includes(id)) {
      visited.push(id);
      localStorage.setItem('bts-visited', JSON.stringify(visited));
    }
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/members/${id}`)
      .then(response => {
        if (!response.ok) throw new Error('Miembro no encontrado.');
        return response.json();
      })
      .then(data => {
        setMember(data);
      })
      .catch(error => {
        console.error('Error al obtener los datos del miembro: ', error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="feedback-container"><div className="loader"></div></div>;
  }

  if (error) {
    return <div className="feedback-container"><p className="error-message">{error}</p></div>;
  }

  if (!member) return null; // Should not happen if error handling is correct

  return (
    <div className="detail-container">
      <Link to="/" className="back-link">← Volver a la lista</Link>
      <div className="detail-card">
        <h1 className="detail-title">{member.name}</h1>
        <h2 className="detail-subtitle">{member.real_name}</h2>
        <p className="detail-role">{member.role}</p>
        {/* You can add more details here, like an image, bio, etc. */}
      </div>
    </div>
  );
};

export default MemberDetailPage;
