# BTS-app

Una aplicación web sencilla dedicada a los miembros del grupo musical BTS. Este proyecto sirve como un ejemplo práctico de una aplicación full-stack con un frontend en React y un backend en Node.js.

## Características

- **Listado de Miembros**: Muestra tarjetas con la información básica de cada miembro.
- **Vista de Detalle**: Permite hacer clic en un miembro para ver información más detallada.
- **Backend Sencillo**: Utiliza un archivo `db.json` como base de datos para servir la información de los miembros.

## Tecnologías Utilizadas

- **Frontend**: React, CSS
- **Backend**: Node.js, Express
- **Enrutamiento**: React Router DOM (planeado)

## Instalación y Uso

Sigue estos pasos para levantar el proyecto en tu entorno local.

### Backend

1. Navega a la carpeta del backend:
   ```sh
   cd BTS-app/backend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia el servidor (por defecto en `http://localhost:3001`):
   ```sh
   npm start
   ```

### Frontend

1. En otra terminal, navega a la carpeta del frontend:
   ```sh
   cd BTS-app/frontend
   ```
2. Instala las dependencias:
   ```sh
   npm install
   ```
3. Inicia la aplicación de React (se abrirá en `http://localhost:3000`):
   ```sh
   npm start
   ```

## Mejoras Futuras

Este proyecto tiene un gran potencial de mejora. Algunas ideas basadas en las mejores prácticas de la industria se encuentran documentadas en el archivo [ANALISIS_Y_MEJORAS.md](ANALISIS_Y_MEJORAS.md). Las propuestas incluyen:

- Diseño responsivo y **mobile-first**.
- Funcionalidades de **búsqueda y filtrado**.
- Mejoras de **accesibilidad** (WCAG).
- **Personalización** para guardar miembros favoritos.