# BTS App - Aplicación de Miembros de BTS

Esta aplicación React muestra información sobre los miembros del grupo K-pop BTS, con características de accesibilidad y internacionalización completa.

## Características

- **Internacionalización completa**: Soporte para español e inglés usando react-i18next
- **Detección automática de idioma**: Detecta automáticamente español para usuarios en México
- **Controles de accesibilidad**: Tamaño de fuente ajustable, paletas de colores para daltonismo
- **Almacenamiento persistente**: Preferencias guardadas en localStorage
- **Navegación por teclado**: Soporte completo para accesibilidad WCAG 2.1
- **Gamificación**: Seguimiento de perfiles visitados y sistema de favoritos

## Internacionalización (i18n)

La aplicación incluye soporte completo de internacionalización:

### Idiomas soportados
- **Español (es)**: Idioma por defecto, especialmente optimizado para México
- **Inglés (en)**: Traducción completa

### Archivos de traducción
- `src/locales/es.json`: Traducciones al español
- `src/locales/en.json`: Traducciones al inglés

### Características de i18n
- Detección automática del idioma del navegador
- Priorización de español para usuarios en México
- Almacenamiento de preferencias de idioma en localStorage
- Interpolación de variables en textos
- Manejo de plurales
- Integración con controles de accesibilidad

## Dependencias de i18n

```json
{
  "react-i18next": "^13.x",
  "i18next": "^23.x",
  "i18next-browser-languagedetector": "^7.x"
}
```

## Estructura del proyecto

```
src/
├── locales/           # Archivos de traducción
│   ├── es.json       # Español
│   └── en.json       # Inglés
├── components/        # Componentes React
│   ├── TarjetaMiembro.js
│   └── AccessibilityControls.js
├── contexts/          # Contextos de React
│   └── AccessibilityContext.js
├── pages/            # Páginas principales
│   ├── PaginaPrincipal.js
│   └── PaginaDetalleMiembro.js
├── i18n.js           # Configuración de internacionalización
└── App.js            # Componente principal
```

## Scripts disponibles

### `npm start`

Ejecuta la aplicación en modo desarrollo.\
Abre [http://localhost:3000](http://localhost:3000) para verla en el navegador.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`.\
La construcción se minifica y los nombres de archivos incluyen hashes.\
¡Tu aplicación está lista para desplegarse!

### `npm test`

Lanza el corredor de pruebas en modo interactivo de observación.

### `npm run eject`

**Nota: esta es una operación de un solo sentido. ¡Una vez que ejecutes `eject`, no puedes volver atrás!**

Si no estás satisfecho con la herramienta de construcción y las opciones de configuración, puedes ejecutar `eject` en cualquier momento. Este comando eliminará la dependencia de construcción única del proyecto.

## Configuración de i18n

La configuración de internacionalización se encuentra en `src/i18n.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es, en },
    fallbackLng: 'es',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });
```

## Uso de traducciones en componentes

```javascript
import { useTranslation } from 'react-i18next';

const MiComponente = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('home.welcome', { name: userName })}</p>
    </div>
  );
};
```

## Contribuciones

Para contribuir con nuevas traducciones o mejoras en la internacionalización:

1. Agrega las nuevas claves de traducción a `src/locales/es.json` y `src/locales/en.json`
2. Usa el hook `useTranslation` en los componentes
3. Asegúrate de que las traducciones funcionen correctamente en ambos idiomas
4. Ejecuta `npm run build` para verificar que no hay errores

---

*Proyecto original bootstrapped con [Create React App](https://github.com/facebook/create-react-app).*

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
