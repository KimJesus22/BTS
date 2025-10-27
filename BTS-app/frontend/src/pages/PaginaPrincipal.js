
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TarjetaMiembro from '../components/TarjetaMiembro';
import AccessibilityControls from '../components/AccessibilityControls';
import { useAccessibility } from '../contexts/AccessibilityContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

// --- Funciones Auxiliares para el Estado Inicial desde localStorage ---

// Obtiene los favoritos guardados en el almacenamiento local
const obtenerFavoritosIniciales = () => {
  const guardados = localStorage.getItem('bts-favoritos');
  return guardados ? JSON.parse(guardados) : [];
};

// Obtiene los perfiles visitados guardados en el almacenamiento local
const obtenerVisitadosIniciales = () => {
  const visitados = localStorage.getItem('bts-visitados');
  return visitados ? JSON.parse(visitados) : [];
};

// --- Componente de la Página Principal ---

const PaginaPrincipal = () => {
  const { t } = useTranslation();

  // --- Estados del Componente ---
     const [miembros, setMiembros] = useState([]); // Lista completa de miembros
     const [miembrosFiltrados, setMiembrosFiltrados] = useState([]); // Miembros a mostrar después de aplicar filtros
     const [terminoBusqueda, setTerminoBusqueda] = useState(''); // Término de búsqueda introducido por el usuario
     const [cargando, setCargando] = useState(true); // Indicador de estado de carga
     const [error, setError] = useState(null); // Mensaje de error

     // Estados para personalización y gamificación
     const [favoritos, setFavoritos] = useState(obtenerFavoritosIniciales); // IDs de miembros favoritos
     const [mostrarSoloFavoritos, setMostrarSoloFavoritos] = useState(false); // Bandera para filtrar por favoritos
     const [visitados, setVisitados] = useState(obtenerVisitadosIniciales); // IDs de perfiles visitados

     // Estados para navegación por teclado (comentados por no uso actual)
     // const [focusedIndex, setFocusedIndex] = useState(-1); // Índice del elemento enfocado en la lista
     // const [isKeyboardNavigation, setIsKeyboardNavigation] = useState(false); // Indica si se está navegando con teclado

   // Estado para navegación por teclado
   const [indiceFoco, setIndiceFoco] = useState(-1); // Índice del elemento enfocado en la lista

   // Contexto de accesibilidad
   const { mantenerFocoPersistente } = useAccessibility();

   // Hook para reconocimiento de voz
   const { isSupported: speechSupported, isListening, transcript, error: speechError, startListening, stopListening } = useSpeechRecognition();

  // --- Efectos (Hooks de Efecto) ---

  // Efecto para obtener los datos iniciales de los miembros desde la API
  useEffect(() => {
    fetch('http://localhost:3001/api/members')
      .then(respuesta => {
        if (!respuesta.ok) throw new Error('La respuesta de la red no fue satisfactoria.');
        return respuesta.json();
      })
      .then(datos => {
        setMiembros(datos);
      })
      .catch(error => {
        console.error('Error al obtener los datos: ', error);
        setError(t('home.error'));
      })
      .finally(() => setCargando(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Efecto para guardar los favoritos en localStorage cada vez que cambian
  useEffect(() => {
    localStorage.setItem('bts-favoritos', JSON.stringify(favoritos));
  }, [favoritos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Efecto para actualizar el estado de "visitados" cuando la pestaña del navegador recupera el foco
  useEffect(() => {
    const manejarFoco = () => {
      setVisitados(obtenerVisitadosIniciales());
    };
    window.addEventListener('focus', manejarFoco);
    // Función de limpieza para eliminar el listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('focus', manejarFoco);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Efecto para filtrar los miembros según el término de búsqueda y el filtro de favoritos
  useEffect(() => {
    let resultados = miembros;
    if (mostrarSoloFavoritos) {
      resultados = resultados.filter(miembro => favoritos.includes(miembro.id));
    }
    if (terminoBusqueda) {
      resultados = resultados.filter(miembro =>
        miembro.name.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        miembro.role.toLowerCase().includes(terminoBusqueda.toLowerCase())
      );
    }
    setMiembrosFiltrados(resultados);
    // Resetear el índice de foco cuando cambian los filtros
    setIndiceFoco(-1);
  }, [terminoBusqueda, miembros, favoritos, mostrarSoloFavoritos]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Funciones para SpeechRecognition ---

  // Función para iniciar/detener búsqueda por voz
  const toggleVoiceSearch = () => {
    if (!speechSupported) {
      console.warn('SpeechRecognition no soportado');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    // Iniciar escucha
    startListening();
  };

  // Efecto para actualizar el término de búsqueda cuando se recibe transcript
  useEffect(() => {
    if (transcript) {
      setTerminoBusqueda(transcript);
    }
  }, [transcript]);

  // --- Manejadores de Eventos ---

  // Maneja el clic en el botón de favorito de una tarjeta
  const manejarCambioFavorito = (miembroId) => {
    setFavoritos(prevFavoritos => {
      if (prevFavoritos.includes(miembroId)) {
        // Si ya es favorito, quitarlo de la lista
        return prevFavoritos.filter(id => id !== miembroId);
      } else {
        // Si no es favorito, añadirlo a la lista
        return [...prevFavoritos, miembroId];
      }
    });
  };

  // Maneja la navegación por teclado en la lista de miembros
  const manejarNavegacionTeclado = (e) => {
    if (miembrosFiltrados.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIndiceFoco(prev => (prev + 1) % miembrosFiltrados.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIndiceFoco(prev => prev <= 0 ? miembrosFiltrados.length - 1 : prev - 1);
        break;
      case 'Home':
        e.preventDefault();
        setIndiceFoco(0);
        break;
      case 'End':
        e.preventDefault();
        setIndiceFoco(miembrosFiltrados.length - 1);
        break;
      default:
        break;
    }
  };

  // Maneja la activación de elementos con Enter o Espacio
  const manejarActivacionTeclado = (e, miembroId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Mantener el foco persistente antes de navegar
      mantenerFocoPersistente(`member-${miembroId}-name`);
      // Simular navegación al detalle del miembro
      window.location.href = `/miembro/${miembroId}`;
    }
  };

  // --- Lógica de Renderizado ---

  // Renderiza el contenido principal (loader, error, resultados o mensaje de no encontrado)
  const renderizarContenido = () => {
    if (cargando) {
      return <div className="feedback-container"><div className="loader"></div></div>;
    }
    if (error) {
      return <div className="feedback-container"><p className="error-message">{error}</p></div>;
    }
    if (miembrosFiltrados.length === 0 && terminoBusqueda) {
      return <div className="feedback-container"><p>{t('home.noResults')}</p></div>;
    }
    return (
      <div className="row" role="list" aria-label={t('home.membersList', { count: miembrosFiltrados.length })}>
        {miembrosFiltrados.map((miembro, index) => (
          <TarjetaMiembro
            key={miembro.id}
            miembro={miembro}
            esFavorito={favoritos.includes(miembro.id)}
            onToggleFavorito={manejarCambioFavorito}
            esVisitado={visitados.includes(String(miembro.id))} // Asegurar que la comparación sea correcta
            estaEnfocado={index === indiceFoco}
            onKeyDown={(e) => manejarActivacionTeclado(e, miembro.id)}
            index={index}
          />
        ))}
      </div>
    );
  };

  // --- JSX del Componente ---

  return (
    <>
      {/* Título visible solo en dispositivos móviles */}
      <div className="col-12 d-md-none">
        <h1 className="mobile-title">{t('home.title')}</h1>
      </div>

      {/* Controles de accesibilidad */}
      <AccessibilityControls />

      {/* Contenedor para los filtros de búsqueda y favoritos */}
      <div className="filters-container" role="region" aria-label={t('accessibility.filters')}>
        <div className="search-container">
          <input
            type="text"
            placeholder={t('home.searchPlaceholder')}
            className="search-bar"
            value={terminoBusqueda}
            onChange={e => setTerminoBusqueda(e.target.value)}
            aria-label={t('home.searchPlaceholder')}
            role="searchbox"
            aria-describedby="search-description"
          />
          <div id="search-description" className="sr-only">{t('home.searchDescription')}</div>

          {/* Botón de búsqueda por voz */}
          {speechSupported && (
            <button
              onClick={toggleVoiceSearch}
              className={`voice-search-btn ${isListening ? 'listening' : ''}`}
              aria-label={isListening ? t('voice.stopListening', 'Detener escucha') : t('voice.startListening', 'Buscar por voz')}
              title={isListening ? t('voice.stopListening', 'Detener escucha') : t('voice.startListening', 'Buscar por voz')}
              disabled={!speechSupported}
            >
              <span className="voice-icon" aria-hidden="true">
                {isListening ? '🎙️' : '🎤'}
              </span>
            </button>
          )}
        </div>

        {/* Mensaje de error de voz */}
        {speechError && (
          <div className="voice-error" role="alert" aria-live="polite">
            {speechError}
          </div>
        )}

        <button
          onClick={() => setMostrarSoloFavoritos(!mostrarSoloFavoritos)}
          className={`favorites-toggle-btn ${mostrarSoloFavoritos ? 'active' : ''}`}
          aria-pressed={mostrarSoloFavoritos}
          aria-label={mostrarSoloFavoritos ? t('home.showAll') : t('home.showFavorites')}
        >
          {t('home.favoritesToggle')}
        </button>
      </div>

      {/* Contenedor para mostrar el progreso de perfiles explorados (gamificación) */}
      <div className="progress-container">
        <p>{t('home.progress', { count: visitados.length, total: miembros.length, context: visitados.length === 1 ? 'one' : 'other' })}</p>
      </div>

      {/* Renderizar el contenido principal */}
      <div
        onKeyDown={manejarNavegacionTeclado}
        tabIndex={-1}
        role="application"
        aria-label={t('accessibility.membersList')}
      >
        {renderizarContenido()}
      </div>
    </>
  );
};

export default PaginaPrincipal;
