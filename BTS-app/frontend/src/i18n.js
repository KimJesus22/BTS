// Configuración de internacionalización con react-i18next
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

// Configuración de recursos de traducción
const resources = {
  es: {
    translation: esTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

// Configuración de detección de idioma
const languageDetectorOptions = {
  // Orden de detección: localStorage, navegador, fallback
  order: ['localStorage', 'navigator', 'htmlTag'],

  // Claves para localStorage
  lookupLocalStorage: 'i18nextLng',

  // Caché de localStorage
  caches: ['localStorage'],

  // Detección de idioma del navegador
  checkWhitelist: true,

  // Priorizar español para usuarios en México
  lookupFromPathIndex: 0,
  lookupFromSubdomainIndex: 0,
};

// Configuración de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es', // Español como idioma por defecto

    // Configuración de detección de idioma
    detection: languageDetectorOptions,

    // Configuración de interpolación
    interpolation: {
      escapeValue: false, // React ya hace escape
    },

    // Configuración de react
    react: {
      useSuspense: false, // Deshabilitar suspense para evitar problemas de carga
    },

    // Configuración adicional para México
    lng: 'es', // Forzar español inicialmente
    load: 'languageOnly', // Solo cargar el idioma, no la región
  });

// Función para cambiar idioma manualmente
export const changeLanguage = (language) => {
  i18n.changeLanguage(language);
};

export default i18n;