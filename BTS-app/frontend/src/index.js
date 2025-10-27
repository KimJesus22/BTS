import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './i18n'; // Importar configuración de i18n
import App from './App';
import reportWebVitals from './reportWebVitals';

// Función para registrar el service worker
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado exitosamente:', registration.scope);

      // Manejar actualizaciones del service worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nuevo service worker disponible
              console.log('Nuevo service worker disponible, recargando...');
              window.location.reload();
            }
          });
        }
      });

      // Escuchar mensajes del service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CONTENT_UPDATED') {
          console.log('Contenido actualizado desde service worker');
          // Aquí se podría mostrar una notificación al usuario
        }
      });

    } catch (error) {
      console.error('Error registrando service worker:', error);
    }
  } else {
    console.warn('Service Worker no soportado en este navegador');
  }
};

// Solicitar permisos para notificaciones push
const requestNotificationPermission = async () => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Permisos de notificación concedidos');
      } else {
        console.log('Permisos de notificación denegados');
      }
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
    }
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Registrar service worker y solicitar permisos después del renderizado
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
  requestNotificationPermission();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
