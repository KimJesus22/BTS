
import React, { useState, useEffect, useCallback, lazy, Suspense, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { List } from 'react-window';

// Componentes con carga perezosa
const TarjetaMiembro = lazy(() => import('../components/TarjetaMiembro'));
const SwipeableCard = lazy(() => import('../components/SwipeableCard'));
const AccessibilityControls = lazy(() => import('../components/AccessibilityControls'));
const ThemeToggle = lazy(() => import('../components/ThemeToggle'));
const SeccionRecomendaciones = lazy(() => import('../components/SeccionRecomendaciones'));
const SearchBar = lazy(() => import('../components/SearchBar'));

// Hooks y contextos
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import useUserAnalytics from '../hooks/useUserAnalytics';
import usePersonalizedSpeech from '../hooks/usePersonalizedSpeech';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useGamification } from '../hooks/useGamification';
import { usePWA } from '../hooks/usePWA';
import { DESIGN_TOKENS } from '../design-tokens';

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

   // Hooks para análisis de usuario y recomendaciones
   const { trackSearch, updateFavorites } = useUserAnalytics();
   const { speakFilterChange } = usePersonalizedSpeech();

   // Hook para gamificación
   const { addPoints } = useGamification();

   // Hook para PWA y pull-to-refresh
   const { isOnline } = usePWA();

   // Hook para onboarding
   const { isCompleted: onboardingCompleted, getCurrentStepData } = useOnboarding();

   // Hook para pull-to-refresh
   const handleRefresh = useCallback(async () => {
     try {
       // Refrescar datos desde la API
       const response = await fetch('http://localhost:3001/api/members');
       if (!response.ok) throw new Error('Error al refrescar datos');

       const datos = await response.json();
       setMiembros(datos);

       // Reset filtros después del refresh
       setTerminoBusqueda('');
       setMostrarSoloFavoritos(false);

       // Gamificación: puntos por refresh exitoso
       addPoints(1, 'Contenido actualizado');

       // Feedback visual (opcional)
       console.log('Contenido actualizado exitosamente');
     } catch (error) {
       console.error('Error durante refresh:', error);
       setError(t('home.refreshError', 'Error al actualizar contenido'));
     }
   }, [addPoints, t]);

   const { containerRef, isRefreshing, progress, config } = usePullToRefresh({
     onRefresh: handleRefresh,
     disabled: !isOnline
   });

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

   // Efecto para actualizar favoritos en analytics cuando cambian
   useEffect(() => {
     updateFavorites(favoritos);
   }, [favoritos, updateFavorites]);

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
       trackSearch(transcript);
     }
   }, [transcript, trackSearch]);

  // --- Manejadores de Eventos ---

  // Maneja el clic en el botón de favorito de una tarjeta
   const manejarCambioFavorito = (miembroId) => {
     setFavoritos(prevFavoritos => {
       const newFavoritos = prevFavoritos.includes(miembroId)
         ? prevFavoritos.filter(id => id !== miembroId)
         : [...prevFavoritos, miembroId];

       // Actualizar analytics
       updateFavorites(newFavoritos);

       // Anunciar cambio si está habilitado
       speakFilterChange('favorites', newFavoritos.includes(miembroId));

       return newFavoritos;
     });
   };

   // Hook para gamificación con trackSwipeGesture
   const { trackSwipeGesture } = useGamification();

   // Manejadores para SwipeableCard
   const manejarSwipeFavorito = useCallback((miembroId) => {
     manejarCambioFavorito(miembroId);
     // Gamificación adicional por gesto táctil
     trackSwipeGesture('swipe_favorite', miembroId);
   }, [manejarCambioFavorito, trackSwipeGesture]);

   const manejarSwipeEliminar = useCallback((miembroId) => {
     // Para eliminación, podríamos mostrar confirmación o simplemente quitar de vista
     // Por ahora, solo logueamos
     console.log('Swipe eliminar:', miembroId);
     trackSwipeGesture('swipe_delete', miembroId);
   }, [trackSwipeGesture]);

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

  // Configuración de virtualización
  const VIRTUALIZATION_THRESHOLD = 50; // Umbral para activar virtualización
  const ITEM_HEIGHT = 250; // Altura estimada de cada elemento

  // Componente para renderizar cada elemento en la lista virtualizada
  const MiembroVirtualizado = useCallback(({ index, style }) => {
    const miembro = miembrosFiltrados[index];
    return (
      <div style={style}>
        <Suspense fallback={<div className="card-loading-placeholder" />}>
          <SwipeableCard
            title={miembro.name}
            subtitle={miembro.role}
            itemId={miembro.id}
            onFavorite={manejarSwipeFavorito}
            onDelete={manejarSwipeEliminar}
            gamificationEnabled={true}
            style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}
          >
            <TarjetaMiembro
              miembro={miembro}
              esFavorito={favoritos.includes(miembro.id)}
              onToggleFavorito={manejarCambioFavorito}
              esVisitado={visitados.includes(String(miembro.id))}
              estaEnfocado={index === indiceFoco}
              onKeyDown={(e) => manejarActivacionTeclado(e, miembro.id)}
              index={index}
            />
          </SwipeableCard>
        </Suspense>
      </div>
    );
  }, [miembrosFiltrados, favoritos, visitados, indiceFoco, manejarSwipeFavorito, manejarSwipeEliminar, manejarCambioFavorito, manejarActivacionTeclado]);

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

    // Usar virtualización para listas grandes
    if (miembrosFiltrados.length > VIRTUALIZATION_THRESHOLD) {
      return (
        <div
          className="virtualized-list-container"
          role="list"
          aria-label={t('home.membersList', { count: miembrosFiltrados.length })}
        >
          <List
            height={600} // Altura del contenedor visible
            itemCount={miembrosFiltrados.length}
            itemSize={ITEM_HEIGHT}
            width="100%"
            overscanCount={5} // Elementos adicionales para renderizar
          >
            {MiembroVirtualizado}
          </List>
        </div>
      );
    }

    // Renderizado normal para listas pequeñas
    return (
      <div className="row" role="list" aria-label={t('home.membersList', { count: miembrosFiltrados.length })}>
        {miembrosFiltrados.map((miembro, index) => (
          <Suspense key={miembro.id} fallback={<div className="card-loading-placeholder" />}>
            <SwipeableCard
              title={miembro.name}
              subtitle={miembro.role}
              itemId={miembro.id}
              onFavorite={manejarSwipeFavorito}
              onDelete={manejarSwipeEliminar}
              gamificationEnabled={true}
              style={{ marginBottom: DESIGN_TOKENS.spacing[4] }}
            >
              <TarjetaMiembro
                miembro={miembro}
                esFavorito={favoritos.includes(miembro.id)}
                onToggleFavorito={manejarCambioFavorito}
                esVisitado={visitados.includes(String(miembro.id))}
                estaEnfocado={index === indiceFoco}
                onKeyDown={(e) => manejarActivacionTeclado(e, miembro.id)}
                index={index}
              />
            </SwipeableCard>
          </Suspense>
        ))}
      </div>
    );
  };

  // --- JSX del Componente ---

    return (
      <div ref={containerRef} style={{ minHeight: '100vh' }}>
        {/* Indicador de pull-to-refresh */}
        <AnimatePresence>
          {isRefreshing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                top: DESIGN_TOKENS.spacing[4],
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: `${DESIGN_TOKENS.spacing[2]} ${DESIGN_TOKENS.spacing[4]}`,
                borderRadius: DESIGN_TOKENS.borderRadius.md,
                fontSize: DESIGN_TOKENS.typography.fontSize.sm,
                display: 'flex',
                alignItems: 'center',
                gap: DESIGN_TOKENS.spacing[2]
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%'
                }}
              />
              {t('home.refreshing', 'Actualizando...')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de progreso de pull */}
        <AnimatePresence>
          {progress > 0 && !isRefreshing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: DESIGN_TOKENS.colors.primary,
                zIndex: 1000
              }}
            >
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: DESIGN_TOKENS.colors.primaryLight,
                  width: `${progress * 100}%`
                }}
                transition={{ duration: 0.1 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Título visible solo en dispositivos móviles */}
        <div className="col-12 d-md-none">
          <h1 className="mobile-title">{t('home.title')}</h1>
        </div>

       {/* Controles de accesibilidad y tema */}
       <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
         <AccessibilityControls />
         <ThemeToggle />
       </div>

       {/* Enlace a privacidad */}
       <div className="text-center mb-3">
         <Link to="/privacidad" className="btn btn-link btn-sm text-muted">
           🛡️ {t('privacy.privacyLink')}
         </Link>
       </div>

       {/* Sección de recomendaciones personalizadas */}
       <SeccionRecomendaciones
         miembros={miembros}
         favoritos={favoritos}
         onToggleFavorito={manejarCambioFavorito}
         visitados={visitados}
       />

      {/* Contenedor para los filtros de búsqueda y favoritos */}
     <div className="filters-container" role="region" aria-label={t('accessibility.filters')}>
       {/* Enlace a privacidad */}
       <div className="privacy-link-container">
         <Link to="/privacidad" className="privacy-link-btn" aria-label={t('privacy.backToApp')}>
           🛡️ {t('privacy.pageTitle')}
         </Link>
       </div>

       {/* Barra de búsqueda avanzada - mostrar solo si onboarding completado */}
       {onboardingCompleted && (
         <div className="search-container">
           <SearchBar
             value={terminoBusqueda}
             onChange={setTerminoBusqueda}
             onSearch={(term) => {
               setTerminoBusqueda(term);
               trackSearch(term);
             }}
             placeholder={t('home.searchPlaceholder')}
           />

           {/* Mensaje de error de voz */}
           {speechError && (
             <div className="voice-error" role="alert" aria-live="polite">
               {speechError}
             </div>
           )}
         </div>
       )}

       {/* Barra de búsqueda básica - mostrar durante onboarding */}
       {!onboardingCompleted && (
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
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t('home.progress', { count: visitados.length, total: miembros.length, context: visitados.length === 1 ? 'one' : 'other' })}</span>
          <span className="text-xs text-gray-500">{Math.round((visitados.length / miembros.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(visitados.length / miembros.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Sección de recomendaciones personalizadas */}
      <SeccionRecomendaciones
        miembros={miembros}
        favoritos={favoritos}
        onToggleFavorito={manejarCambioFavorito}
        visitados={visitados}
      />

      {/* Renderizar el contenido principal */}
      <div
        onKeyDown={manejarNavegacionTeclado}
        tabIndex={-1}
        role="application"
        aria-label={t('accessibility.membersList')}
      >
        {renderizarContenido()}
      </div>
     </div>
  );
};

export default PaginaPrincipal;
