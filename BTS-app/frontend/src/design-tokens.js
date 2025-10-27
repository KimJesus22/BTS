// Design Tokens - Sistema de diseño unificado para BTS App
// Variables de diseño escalables y consistentes

export const DESIGN_TOKENS = {
  // === COLORES ===

  // Paletas de colores primarios y secundarios
  colors: {
    // Colores primarios
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3', // Color principal
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1'
    },

    // Colores secundarios
    secondary: {
      50: '#fce4ec',
      100: '#f8bbd9',
      200: '#f48fb1',
      300: '#f06292',
      400: '#ec407a',
      500: '#e91e63', // Color secundario
      600: '#d81b60',
      700: '#c2185b',
      800: '#ad1457',
      900: '#880e4f'
    },

    // Colores de acento
    accent: {
      50: '#fff3e0',
      100: '#ffe0b2',
      200: '#ffcc02',
      300: '#ffb74d',
      400: '#ffa726',
      500: '#ff9800', // Color de acento
      600: '#fb8c00',
      700: '#f57c00',
      800: '#ef6c00',
      900: '#e65100'
    },

    // Colores semánticos
    semantic: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
      neutral: '#9e9e9e'
    },

    // Colores de fondo
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      tertiary: '#eeeeee',
      overlay: 'rgba(0, 0, 0, 0.5)'
    },

    // Colores de superficie
    surface: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      elevated: '#ffffff',
      overlay: 'rgba(255, 255, 255, 0.9)'
    },

    // Colores de texto
    text: {
      primary: '#212121',
      secondary: '#757575',
      tertiary: '#bdbdbd',
      inverse: '#ffffff',
      disabled: '#9e9e9e'
    },

    // Colores de borde
    border: {
      light: '#e0e0e0',
      medium: '#bdbdbd',
      dark: '#757575',
      focus: '#2196f3'
    }
  },

  // === TIPOGRAFÍA ===

  // Jerarquía tipográfica escalable
  typography: {
    // Familias de fuente
    fontFamily: {
      primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      secondary: "'Poppins', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', monospace"
    },

    // Escalas de tamaño
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
      '6xl': '3.75rem'  // 60px
    },

    // Pesos de fuente
    fontWeight: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    },

    // Altura de línea
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    },

    // Espaciado de letras
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em'
    }
  },

  // === ESPACIADO ===

  // Sistema de espaciado modular
  spacing: {
    // Espaciados básicos (multiplicados por 0.25rem = 4px)
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    18: '4.5rem',     // 72px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem'       // 384px
  },

  // === RADII DE BORDE ===

  // Radios de borde consistentes
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'    // Completamente redondo
  },

  // === SOMBRAS ===

  // Sistema de sombras escalable
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 40px 80px -20px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    outline: '0 0 0 3px rgba(66, 153, 225, 0.5)'
  },

  // === ANIMACIONES ===

  // Duraciones y funciones de temporización
  animations: {
    duration: {
      instant: '0ms',
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      slower: '700ms'
    },

    easing: {
      linear: 'linear',
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  },

  // === BREAKPOINTS ===

  // Puntos de quiebre responsivos
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  // === Z-INDEX ===

  // Niveles de apilamiento
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    60: 60,
    70: 70,
    80: 80,
    90: 90,
    100: 100
  },

  // === OPACIDAD ===

  // Valores de opacidad
  opacity: {
    0: 0,
    5: 0.05,
    10: 0.1,
    20: 0.2,
    25: 0.25,
    30: 0.3,
    40: 0.4,
    50: 0.5,
    60: 0.6,
    70: 0.7,
    75: 0.75,
    80: 0.8,
    90: 0.9,
    95: 0.95,
    100: 1
  }
};

// Función helper para acceder a tokens anidados
export const getToken = (path, fallback = null) => {
  return path.split('.').reduce((obj, key) => obj?.[key], DESIGN_TOKENS) || fallback;
};

// Función para generar clases CSS dinámicas
export const generateTokenClasses = () => {
  const classes = {};

  // Generar clases de color
  Object.entries(DESIGN_TOKENS.colors).forEach(([category, shades]) => {
    if (typeof shades === 'object') {
      Object.entries(shades).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          classes[`color-${category}-${shade}`] = { color: value };
          classes[`bg-${category}-${shade}`] = { backgroundColor: value };
          classes[`border-${category}-${shade}`] = { borderColor: value };
        }
      });
    }
  });

  // Generar clases de espaciado
  Object.entries(DESIGN_TOKENS.spacing).forEach(([key, value]) => {
    classes[`p-${key}`] = { padding: value };
    classes[`m-${key}`] = { margin: value };
    classes[`px-${key}`] = { paddingLeft: value, paddingRight: value };
    classes[`py-${key}`] = { paddingTop: value, paddingBottom: value };
    classes[`mx-${key}`] = { marginLeft: value, marginRight: value };
    classes[`my-${key}`] = { marginTop: value, marginBottom: value };
  });

  return classes;
};

export default DESIGN_TOKENS;