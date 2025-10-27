import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useDesignTokens } from '../hooks/useDesignTokens';
import Layout from './Layout';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import Badge from './Badge';
import Avatar from './Avatar';
import Icon from './Icon';
import ProgressBar from './ProgressBar';
import Modal from './Modal';
import Tooltip from './Tooltip';
import Notification, { NotificationContainer } from './Notification';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';

// Componente de documentación interactiva del Design System
const DesignSystemDocs = () => {
  const { t } = useTranslation();
  const { getCurrentPalette } = useTheme();
  const { tokens, getColor, getSpacing, getFontSize } = useDesignTokens();

  const [activeSection, setActiveSection] = useState('overview');
  const [showModal, setShowModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const palette = getCurrentPalette();

  // Añadir notificación de ejemplo
  const addNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Secciones de documentación
  const sections = [
    { id: 'overview', label: 'Visión General', icon: 'info' },
    { id: 'colors', label: 'Colores', icon: 'settings' },
    { id: 'typography', label: 'Tipografía', icon: 'edit' },
    { id: 'spacing', label: 'Espaciado', icon: 'menu' },
    { id: 'components', label: 'Componentes', icon: 'star' },
    { id: 'patterns', label: 'Patrones', icon: 'check' }
  ];

  // Items del sidebar
  const sidebarItems = sections.map(section => ({
    id: section.id,
    label: section.label,
    icon: section.icon,
    active: activeSection === section.id,
    onClick: () => setActiveSection(section.id)
  }));

  // Renderizar sección activa
  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'colors':
        return <ColorsSection />;
      case 'typography':
        return <TypographySection />;
      case 'spacing':
        return <SpacingSection />;
      case 'components':
        return <ComponentsSection addNotification={addNotification} showModal={() => setShowModal(true)} />;
      case 'patterns':
        return <PatternsSection />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <Layout
      header={{
        title: 'Design System BTS',
        subtitle: 'Sistema de diseño completo y accesible',
        actions: [
          {
            icon: 'settings',
            label: 'Configuración',
            onClick: () => console.log('Settings')
          }
        ]
      }}
      sidebar={{
        items: sidebarItems,
        header: {
          expanded: <div>📚 Documentación</div>,
          collapsed: <div>📚</div>
        }
      }}
      footer={{
        links: [
          { label: 'GitHub', onClick: () => window.open('https://github.com', '_blank') },
          { label: 'Documentación', onClick: () => console.log('Docs') },
          { label: 'Soporte', onClick: () => console.log('Support') }
        ],
        socialLinks: [
          { platform: 'Twitter', icon: 'info', onClick: () => console.log('Twitter') },
          { platform: 'LinkedIn', icon: 'users', onClick: () => console.log('LinkedIn') }
        ]
      }}
    >
      {/* Contenedor de notificaciones */}
      <NotificationContainer
        notifications={notifications}
        placement="top-right"
        onRemove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />

      {/* Modal de ejemplo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modal de Ejemplo"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={() => setShowModal(false)}>
              Aceptar
            </Button>
          </>
        }
      >
        <p>Este es un modal de ejemplo para demostrar el componente Modal del Design System.</p>
      </Modal>

      {/* Contenido principal */}
      <div style={{ padding: getSpacing(6) }}>
        {renderSection()}
      </div>
    </Layout>
  );
};

// Sección de visión general
const OverviewSection = () => {
  const { tokens } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['4xl'], marginBottom: tokens.spacing[6] }}>
        Sistema de Diseño BTS
      </h1>

      <div style={{ display: 'grid', gap: tokens.spacing[6], gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Card title="🎨 Design Tokens" subtitle="Variables de diseño centralizadas">
          <p>Sistema completo de tokens para colores, tipografía, espaciado y más.</p>
          <ul>
            <li>Colores semánticos y temáticos</li>
            <li>Escalas tipográficas escalables</li>
            <li>Sistema de espaciado modular</li>
            <li>Animaciones consistentes</li>
          </ul>
        </Card>

        <Card title="🧩 Componentes" subtitle="Biblioteca de componentes reutilizables">
          <p>Componentes atómicos, moleculares y organismos optimizados.</p>
          <ul>
            <li>Accesibilidad integrada</li>
            <li>Optimizaciones PWA</li>
            <li>Soporte para wearables</li>
            <li>Animaciones fluidas</li>
          </ul>
        </Card>

        <Card title="⚡ Optimizaciones" subtitle="Rendimiento y accesibilidad">
          <p>Optimizaciones automáticas basadas en contexto.</p>
          <ul>
            <li>Ahorro de batería inteligente</li>
            <li>Adaptación automática a wearables</li>
            <li>Modos de alto contraste</li>
            <li>Reducción de movimiento</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

// Sección de colores
const ColorsSection = () => {
  const { tokens, getColor } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[6] }}>
        Sistema de Colores
      </h1>

      <div style={{ display: 'grid', gap: tokens.spacing[6] }}>
        {/* Colores primarios */}
        <Card title="Colores Primarios">
          <div style={{ display: 'grid', gap: tokens.spacing[4], gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {Object.entries(tokens.colors.primary).map(([shade, color]) => (
              <ColorSwatch key={shade} name={`Primary ${shade}`} color={color} />
            ))}
          </div>
        </Card>

        {/* Colores semánticos */}
        <Card title="Colores Semánticos">
          <div style={{ display: 'grid', gap: tokens.spacing[4], gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {Object.entries(tokens.colors.semantic).map(([name, color]) => (
              <ColorSwatch key={name} name={name} color={color} />
            ))}
          </div>
        </Card>

        {/* Colores de superficie */}
        <Card title="Colores de Superficie">
          <div style={{ display: 'grid', gap: tokens.spacing[4], gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {Object.entries(tokens.colors.surface).map(([name, color]) => (
              <ColorSwatch key={name} name={name} color={color} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Componente auxiliar para muestras de color
const ColorSwatch = ({ name, color }) => {
  const { tokens } = useDesignTokens();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[3],
      padding: tokens.spacing[3],
      borderRadius: tokens.borderRadius.md,
      backgroundColor: tokens.colors.surface.primary,
      border: `1px solid ${tokens.colors.border.light}`
    }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: color,
          border: `1px solid ${tokens.colors.border.light}`,
          flexShrink: 0
        }}
      />
      <div>
        <div style={{ fontWeight: tokens.typography.fontWeight.medium, fontSize: tokens.typography.fontSize.sm }}>
          {name}
        </div>
        <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.secondary }}>
          {color}
        </div>
      </div>
    </div>
  );
};

// Sección de tipografía
const TypographySection = () => {
  const { tokens } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[6] }}>
        Sistema Tipográfico
      </h1>

      <Card title="Escala Tipográfica">
        <div style={{ display: 'grid', gap: tokens.spacing[4] }}>
          {Object.entries(tokens.typography.fontSize).map(([size, value]) => (
            <div key={size} style={{ padding: tokens.spacing[2], borderBottom: `1px solid ${tokens.colors.border.light}` }}>
              <div style={{ fontSize: value, fontWeight: tokens.typography.fontWeight.medium }}>
                {size}: The quick brown fox jumps over the lazy dog
              </div>
              <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.secondary, marginTop: tokens.spacing[1] }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Sección de espaciado
const SpacingSection = () => {
  const { tokens } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[6] }}>
        Sistema de Espaciado
      </h1>

      <Card title="Escala de Espaciado">
        <div style={{ display: 'grid', gap: tokens.spacing[4] }}>
          {Object.entries(tokens.spacing).map(([size, value]) => (
            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              <div style={{ minWidth: '60px', fontSize: tokens.typography.fontSize.sm }}>
                {size}
              </div>
              <div
                style={{
                  height: '20px',
                  backgroundColor: tokens.colors.primary[500],
                  width: value,
                  borderRadius: tokens.borderRadius.sm
                }}
              />
              <div style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.secondary }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Sección de componentes
const ComponentsSection = ({ addNotification, showModal }) => {
  const { tokens } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[6] }}>
        Biblioteca de Componentes
      </h1>

      <div style={{ display: 'grid', gap: tokens.spacing[6] }}>
        {/* Botones */}
        <Card title="Botones">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[3] }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card title="Campos de Entrada">
          <div style={{ display: 'grid', gap: tokens.spacing[4], maxWidth: '400px' }}>
            <Input label="Campo de texto" placeholder="Escribe algo..." />
            <Input label="Campo con icono" placeholder="Buscar..." icon="🔍" />
            <Input label="Campo de email" type="email" placeholder="usuario@email.com" />
            <Input label="Campo con error" error="Este campo es requerido" />
          </div>
        </Card>

        {/* Badges y Avatares */}
        <Card title="Badges y Avatares">
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4] }}>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Avatar name="Juan Pérez" size="md" />
            <Avatar name="María García" size="md" status="online" />
          </div>
        </Card>

        {/* Barra de progreso */}
        <Card title="Barra de Progreso">
          <div style={{ display: 'grid', gap: tokens.spacing[4] }}>
            <ProgressBar value={75} showLabel showPercentage />
            <ProgressBar value={50} variant="success" striped />
            <ProgressBar indeterminate />
          </div>
        </Card>

        {/* Acciones */}
        <Card title="Acciones Interactivas">
          <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
            <Button variant="primary" onClick={() => addNotification('success', '¡Éxito!', 'Operación completada correctamente')}>
              Mostrar Notificación
            </Button>
            <Button variant="secondary" onClick={showModal}>
              Abrir Modal
            </Button>
            <Tooltip content="Este es un tooltip de ejemplo">
              <Button variant="outline">Tooltip</Button>
            </Tooltip>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Sección de patrones
const PatternsSection = () => {
  const { tokens } = useDesignTokens();

  return (
    <div>
      <h1 style={{ fontSize: tokens.typography.fontSize['3xl'], marginBottom: tokens.spacing[6] }}>
        Patrones de Diseño
      </h1>

      <div style={{ display: 'grid', gap: tokens.spacing[6] }}>
        <Card title="Patrón de Tarjeta con Acciones">
          <div style={{
            padding: tokens.spacing[4],
            border: `1px solid ${tokens.colors.border.light}`,
            borderRadius: tokens.borderRadius.lg
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[3] }}>
              <div>
                <h3 style={{ margin: 0, fontSize: tokens.typography.fontSize.lg }}>Título de la Tarjeta</h3>
                <p style={{ margin: `${tokens.spacing[1]} 0 0 0`, color: tokens.colors.text.secondary }}>
                  Descripción breve del contenido de la tarjeta.
                </p>
              </div>
              <Badge variant="info">Nuevo</Badge>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
              <Button variant="primary" size="sm">Acción Principal</Button>
              <Button variant="outline" size="sm">Acción Secundaria</Button>
            </div>
          </div>
        </Card>

        <Card title="Patrón de Formulario">
          <div style={{ maxWidth: '400px' }}>
            <div style={{ display: 'grid', gap: tokens.spacing[4] }}>
              <Input label="Nombre completo" placeholder="Juan Pérez" />
              <Input label="Correo electrónico" type="email" placeholder="juan@email.com" />
              <Input label="Mensaje" placeholder="Escribe tu mensaje..." />
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <Button variant="primary" fullWidth>Enviar</Button>
                <Button variant="outline" fullWidth>Cancelar</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDocs;