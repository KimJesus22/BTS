import React, { memo, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import TarjetaMiembro from './TarjetaMiembro';

// Componente optimizado para listas de miembros
const ListaMiembros = memo(({
  miembros = [],
  favoritos = [],
  miembrosVisitados = [],
  onToggleFavorito,
  miembroEnfocado,
  onKeyDown
}) => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const palette = getCurrentPalette();

  // Memoizar el conjunto de favoritos para búsqueda O(1)
  const favoritosSet = useMemo(() =>
    new Set(favoritos.map(fav => typeof fav === 'object' ? fav.id : fav)),
    [favoritos]
  );

  // Memoizar el conjunto de miembros visitados
  const visitadosSet = useMemo(() =>
    new Set(miembrosVisitados.map(visit => typeof visit === 'object' ? visit.id : visit)),
    [miembrosVisitados]
  );

  // Memoizar el callback de toggle favorito
  const handleToggleFavorito = useCallback((miembroId) => {
    onToggleFavorito?.(miembroId);
  }, [onToggleFavorito]);

  // Memoizar el callback de navegación por teclado
  const handleKeyDown = useCallback((event) => {
    onKeyDown?.(event);
  }, [onKeyDown]);

  // Memoizar el render de cada tarjeta para evitar re-renders
  const tarjetasMemoizadas = useMemo(() =>
    miembros.map((miembro, index) => (
      <TarjetaMiembro
        key={miembro.id}
        miembro={miembro}
        esFavorito={favoritosSet.has(miembro.id)}
        onToggleFavorito={handleToggleFavorito}
        esVisitado={visitadosSet.has(miembro.id)}
        estaEnfocado={miembroEnfocado === miembro.id}
        onKeyDown={handleKeyDown}
        index={index}
      />
    )),
    [miembros, favoritosSet, visitadosSet, miembroEnfocado, handleToggleFavorito, handleKeyDown]
  );

  // Memoizar estilos del contenedor
  const containerStyle = useMemo(() => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: palette.background,
    minHeight: '200px'
  }), [palette.background]);

  if (!miembros.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: palette.textSecondary,
        fontSize: '1.1rem'
      }}>
        {t('members.noMembers', 'No hay miembros disponibles')}
      </div>
    );
  }

  return (
    <div
      className="row miembros-lista"
      style={containerStyle}
      role="grid"
      aria-label={t('members.list', 'Lista de miembros')}
    >
      {tarjetasMemoizadas}
    </div>
  );
});

ListaMiembros.displayName = 'ListaMiembros';

export default ListaMiembros;