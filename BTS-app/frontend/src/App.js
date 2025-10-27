// Importar las dependencias de React y React Router
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Importar configuración de internacionalización
import './i18n';

// Importar las páginas de la aplicación
import PaginaPrincipal from './pages/PaginaPrincipal'; // Anteriormente HomePage
import PaginaDetalleMiembro from './pages/PaginaDetalleMiembro'; // Anteriormente MemberDetailPage

// Importar el contexto de accesibilidad
import { AccessibilityProvider } from './contexts/AccessibilityContext';

// Importar los estilos globales de la aplicación
import './App.css';

// Componente principal de la aplicación
function App() {
  const { t } = useTranslation();

  return (
    <AccessibilityProvider>
      <div className="App">
        {/* Contenido principal de la aplicación */}
        <main className="container pt-4">
          {/* Definición de las rutas de la aplicación */}
          <Routes>
            {/* Ruta para la página principal */}
            <Route path="/" element={<PaginaPrincipal />} />
            {/* Ruta para la página de detalle de un miembro, con un parámetro dinámico para el ID */}
            <Route path="/miembro/:id" element={<PaginaDetalleMiembro />} />
          </Routes>
        </main>

        {/* Pie de página o barra de navegación inferior */}
        <footer className="bottom-nav" role="navigation" aria-label={t('app.footer')}>
          <h1 className="app-title">{t('app.title')}</h1>
        </footer>
      </div>
    </AccessibilityProvider>
  );
}

// Exportar el componente App para ser utilizado en otras partes de la aplicación
export default App;