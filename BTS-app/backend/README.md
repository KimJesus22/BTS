# BTS-app Backend

Backend RESTful API para la aplicación BTS con arquitectura MVC completa, desarrollado con Express.js y MongoDB.

## 🚀 Características

- **Arquitectura MVC**: Separación clara de responsabilidades
- **Autenticación JWT**: Sistema seguro de autenticación y autorización
- **Gamificación**: Sistema completo de logros, niveles y recompensas
- **Accesibilidad**: Configuraciones avanzadas para usuarios con discapacidades
- **Wearables**: Integración con dispositivos portátiles
- **Optimizaciones**: Compresión, caché y optimizaciones de rendimiento
- **Seguridad**: Rate limiting, sanitización, CORS, helmet
- **Testing**: Cobertura completa con Jest
- **Documentación**: API documentada y ejemplos de uso

## 📁 Estructura del Proyecto

```
backend/
├── config/           # Configuraciones de la aplicación
│   ├── database.js   # Conexión a MongoDB
│   └── index.js      # Configuración centralizada
├── controllers/      # Controladores de la aplicación
│   ├── MembersController.js
│   ├── UsersController.js
│   ├── WearableController.js
│   └── AdminController.js
├── middlewares/      # Middlewares personalizados
│   ├── logger.js     # Logging estructurado
│   ├── security.js   # Seguridad y rate limiting
│   └── optimization.js # Optimizaciones de rendimiento
├── models/          # Modelos de datos (Mongoose)
│   ├── Member.js
│   ├── User.js
│   ├── AccessibilityConfig.js
│   └── Wearable.js
├── routes/          # Definición de rutas
│   ├── auth.js
│   ├── members.js
│   ├── users.js
│   ├── wearable.js
│   └── admin.js
├── services/        # Lógica de negocio
│   ├── AuthenticationService.js
│   ├── GamificationService.js
│   └── OptimizationService.js
├── tests/           # Pruebas unitarias
│   ├── MembersController.test.js
│   ├── AuthenticationService.test.js
│   ├── GamificationService.test.js
│   └── setup.js
├── .env             # Variables de entorno
├── .env.example     # Ejemplo de variables de entorno
├── jest.config.js   # Configuración de Jest
├── package.json     # Dependencias y scripts
├── server.js        # Punto de entrada de la aplicación
└── README.md        # Esta documentación
```

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd bts-app/backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar MongoDB**
   ```bash
   # Asegúrate de tener MongoDB corriendo en localhost:27017
   # o configura MONGODB_URI en .env
   ```

5. **Ejecutar la aplicación**
   ```bash
   # Modo desarrollo
   npm run dev

   # Modo producción
   npm start
   ```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `MONGODB_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/bts-app` |
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Ambiente de ejecución | `development` |
| `JWT_SECRET` | Clave secreta para JWT | *(requerido)* |
| `JWT_EXPIRE` | Expiración del token JWT | `7d` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

### Base de Datos

La aplicación utiliza MongoDB con los siguientes esquemas principales:

- **Members**: Información de los miembros de BTS
- **Users**: Usuarios de la aplicación con gamificación
- **AccessibilityConfig**: Configuraciones de accesibilidad por usuario
- **Wearable**: Datos de dispositivos portátiles conectados

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña

### Miembros
- `GET /api/members` - Listar miembros (con filtros y paginación)
- `GET /api/members/:id` - Obtener miembro específico
- `GET /api/members/search` - Buscar miembros
- `GET /api/members/popular` - Miembros más populares
- `GET /api/members/stats` - Estadísticas generales

### Usuarios
- `GET /api/users/profile` - Perfil del usuario autenticado
- `PUT /api/users/profile` - Actualizar perfil
- `PUT /api/users/password` - Cambiar contraseña
- `GET /api/users/accessibility` - Configuración de accesibilidad
- `PUT /api/users/accessibility` - Actualizar configuración de accesibilidad
- `GET /api/users/gamification` - Datos de gamificación
- `GET /api/users/optimizations` - Optimizaciones personalizadas
- `GET /api/users/leaderboard` - Tabla de clasificación

### Wearables
- `POST /api/wearable/connect` - Conectar dispositivo
- `POST /api/wearable/disconnect` - Desconectar dispositivo
- `GET /api/wearable/status` - Estado del dispositivo
- `POST /api/wearable/sync` - Sincronizar datos
- `PUT /api/wearable/settings` - Actualizar configuración
- `GET /api/wearable/history` - Historial de datos
- `GET /api/wearable/achievements` - Logros relacionados

### Administración (Solo Admin)
- `GET /api/admin/users` - Listar todos los usuarios
- `PUT /api/admin/users/:id/role` - Cambiar rol de usuario
- `POST /api/admin/members` - Crear nuevo miembro
- `PUT /api/admin/members/:id` - Actualizar miembro
- `DELETE /api/admin/members/:id` - Eliminar miembro
- `GET /api/admin/stats` - Estadísticas del sistema
- `GET /api/admin/logs` - Logs de actividad

## 🧪 Testing

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar pruebas en modo watch
npm run test:watch
```

## 🔒 Seguridad

- **Autenticación JWT** con expiración configurable
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Sanitización** de inputs para prevenir XSS
- **CORS** configurado para orígenes específicos
- **Helmet** para headers de seguridad HTTP
- **Validación** de datos con Joi
- **Logging** estructurado de actividades sospechosas

## 🎮 Gamificación

### Sistema de Niveles
- Los usuarios ganan experiencia (XP) por actividades
- Cada 1000 XP ≈ 1 nivel
- Niveles desbloquean contenido exclusivo

### Logros Disponibles
- **Primeros Pasos**: Iniciar sesión por primera vez
- **Perfil Completo**: Completar toda la información del perfil
- **Fan Dedicado**: Visitar perfiles de todos los miembros
- **Racha de 7/30**: Iniciar sesión diariamente
- **Wearable Conectado**: Conectar dispositivo portátil
- **Accesibilidad**: Configurar opciones avanzadas

### Leaderboards
- Por experiencia total
- Por nivel
- Por racha más larga

## ♿ Accesibilidad

Configuraciones disponibles:
- Tamaño de fuente (small, medium, large, extra-large)
- Esquema de colores (default, high-contrast, dark, light)
- Movimiento (default, reduced, none)
- Sonido (default, muted, screen-reader)
- Tecnología asistiva (screen readers, keyboard navigation)

## 📱 Wearables

Soporte para:
- **Smartwatches** (Apple Watch, Samsung Galaxy Watch)
- **Fitness Trackers** (Fitbit, Garmin)
- **Smart Rings** (Oura Ring)
- **Earbuds** (AirPods, Galaxy Buds)

### Datos Sincronizados
- Frecuencia cardíaca
- Pasos diarios
- Calorías quemadas
- Sueño (duración, calidad, etapas)
- Nivel de batería

## 📊 Monitoreo

### Health Check
- `GET /health` - Estado del servicio
- `GET /api` - Información de la API

### Logs
- Logs estructurados en JSON
- Separación por niveles (INFO, WARN, ERROR)
- Logs de rendimiento y seguridad

## 🚀 Despliegue

### Requisitos
- Node.js 16+
- MongoDB 4.4+
- NPM o Yarn

### Variables de Producción
```env
NODE_ENV=production
MONGODB_URI=mongodb://production-server:27017/bts-prod
JWT_SECRET=tu-clave-secreta-muy-segura
CORS_ORIGIN=https://tu-dominio.com
```

### Comandos de Despliegue
```bash
npm run build  # Si tienes un build step
npm start
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**Desarrollado con ❤️ para la comunidad ARMY**