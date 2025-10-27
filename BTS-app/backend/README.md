# BTS-app Backend

Backend RESTful API para la aplicación BTS con arquitectura MVC completa, desarrollado con Express.js y PostgreSQL.

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
│   ├── database.js   # Conexión a PostgreSQL con Sequelize
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
├── models/          # Modelos de datos (Sequelize)
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

4. **Iniciar PostgreSQL**
   ```bash
   # Asegúrate de tener PostgreSQL corriendo en localhost:5432
   # o configura las variables de entorno DB_* en .env
   # Para desarrollo rápido, puedes usar Docker:
   # docker run --name postgres-bts -e POSTGRES_DB=bts_app -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=admin123 -p 5432:5432 -d postgres:15
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

Copia el archivo `.env.example` a `.env` y configura las variables necesarias:

```bash
cp .env.example .env
```

#### Variables Requeridas
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `JWT_SECRET` | Clave secreta para JWT (mínimo 32 caracteres) | `tu-clave-secreta-muy-segura-aqui-32-chars` |

#### Variables de Base de Datos
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_NAME` | Nombre de la base de datos | `bts_app` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `admin123` |
| `DB_DIALECT` | Dialecto de base de datos | `postgres` |

#### Variables del Servidor
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Ambiente de ejecución | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |

#### Variables de Seguridad
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `JWT_EXPIRE` | Expiración del token JWT | `7d` |
| `JWT_REFRESH_EXPIRE` | Expiración del refresh token | `30d` |
| `BCRYPT_ROUNDS` | Rondas de hashing para contraseñas | `12` |
| `SESSION_TIMEOUT` | Timeout de sesión (ms) | `86400000` |
| `MAX_LOGIN_ATTEMPTS` | Máximo intentos de login | `5` |
| `LOCKOUT_DURATION` | Duración del bloqueo (ms) | `7200000` |

#### Variables de Rate Limiting
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `RATE_LIMIT_WINDOW_MS` | Ventana de rate limiting (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo requests generales | `100` |
| `RATE_LIMIT_AUTH_MAX` | Máximo requests de auth | `5` |
| `RATE_LIMIT_API_MAX` | Máximo requests de API | `1000` |

#### Variables de Gamificación
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `GAMIFICATION_ENABLED` | Habilitar gamificación | `true` |
| `LEVEL_THRESHOLD_BASE` | XP base por nivel | `1000` |
| `LEVEL_THRESHOLD_MULTIPLIER` | Multiplicador de nivel | `1.2` |

#### Variables de Wearables
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `WEARABLE_SYNC_INTERVAL` | Intervalo de sincronización (ms) | `900000` |
| `WEARABLE_DATA_RETENTION_DAYS` | Días de retención de datos | `365` |
| `WEARABLE_BATTERY_WARNING` | Umbral de batería baja | `20` |
| `WEARABLE_MAX_READINGS_PER_SYNC` | Máximo lecturas por sync | `100` |

#### Variables de Accesibilidad
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `ACCESSIBILITY_SUPPORTED_LANGUAGES` | Idiomas soportados | `es,en` |
| `ACCESSIBILITY_FONT_SIZES` | Tamaños de fuente disponibles | `small,medium,large,extra-large` |
| `ACCESSIBILITY_COLOR_SCHEMES` | Esquemas de color | `default,high-contrast,dark,light,colorblind-friendly` |

#### Variables de Logging y Monitoreo
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `LOG_LEVEL` | Nivel de logging (error, warn, info, debug) | `info` |
| `LOG_DIR` | Directorio para archivos de log | `logs` |
| `ALERT_WEBHOOK_URL` | Webhook para alertas (Slack, etc.) | - |
| `ALERT_EMAIL_TO` | Email para alertas críticas | - |

#### Variables de Optimización
| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `CACHE_TIMEOUT` | Timeout de caché (ms) | `300000` |
| `COMPRESSION_LEVEL` | Nivel de compresión GZIP | `6` |
| `QUERY_TIMEOUT` | Timeout de queries (ms) | `5000` |

#### Variables de Servicios Externos (Opcionales)
| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `REDIS_URL` | URL de Redis para caché | `redis://localhost:6379` |
| `EMAIL_SERVICE_API_KEY` | API key para servicio de email | `tu-api-key-aqui` |
| `PUSH_NOTIFICATION_KEY` | Clave para notificaciones push | `tu-clave-push-aqui` |

### Base de Datos

La aplicación utiliza PostgreSQL con Sequelize ORM y los siguientes modelos principales:

- **Members**: Información de los miembros de BTS
- **Users**: Usuarios de la aplicación con gamificación
- **AccessibilityConfig**: Configuraciones de accesibilidad por usuario
- **Wearable**: Datos de dispositivos portátiles conectados

#### Migración desde db.json

Para poblar la base de datos inicial con datos de `db.json`, ejecuta:

```bash
node scripts/seed.js
```

Este script creará las tablas automáticamente y poblará los datos de los miembros de BTS.

## 📚 API Endpoints

### Cambios Importantes en la Migración

Con la migración a PostgreSQL, se han realizado los siguientes cambios en la API:

- **Campos de biografía**: `biography.es` y `biography.en` ahora son `biography_es` y `biography_en`
- **Campos de estadísticas**: Los campos `stats.followers`, `stats.likes`, `stats.views` ahora son campos directos: `followers`, `likes`, `views`
- **Campos de accesibilidad**: Los campos anidados ahora usan snake_case (ej: `screenReader.enabled` → `screenReader_enabled`)
- **Campos de gamificación**: Los campos anidados ahora usan snake_case (ej: `gamification.level` → `gamification_level`)

Los endpoints mantienen la misma funcionalidad pero ahora utilizan PostgreSQL como backend de base de datos.

### Autenticación
- `POST /api/auth/register` - Registro de usuario (público)
- `POST /api/auth/login` - Inicio de sesión (público)
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña (público)
- `POST /api/auth/reset-password` - Resetear contraseña con token (público)

### Miembros
- `GET /api/members` - Listar miembros (con filtros y paginación)
- `GET /api/members/:id` - Obtener miembro específico
- `GET /api/members/search` - Buscar miembros
- `GET /api/members/popular` - Miembros más populares
- `GET /api/members/stats` - Estadísticas generales

### Usuarios (Requiere autenticación JWT)
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

### Administración (Requiere rol 'admin')
- `GET /api/admin/users` - Listar todos los usuarios
- `GET /api/admin/users/:id` - Obtener usuario específico
- `PUT /api/admin/users/:id/role` - Cambiar rol de usuario
- `PUT /api/admin/users/:id/suspend` - Suspender usuario temporalmente
- `PUT /api/admin/users/:id/reactivate` - Reactivar usuario
- `GET /api/admin/users/:id/export` - Exportar datos de usuario
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

- **Autenticación JWT** con expiración configurable y roles de usuario
- **Autorización basada en roles** (user, admin, moderator) para proteger operaciones de escritura
- **Rate limiting** para prevenir ataques de fuerza bruta
- **Sanitización** de inputs para prevenir XSS
- **CORS** configurado para orígenes específicos
- **Helmet** para headers de seguridad HTTP avanzados:
  - Content Security Policy (CSP) para prevenir XSS
  - HSTS para forzar conexiones HTTPS
  - X-Frame-Options para prevenir clickjacking
  - X-Content-Type-Options para prevenir MIME sniffing
  - Referrer Policy para controlar información de referrer
- **Validación** de datos con Joi
- **Logging avanzado** con Winston:
  - Logs rotativos diarios por tipo (errores, general, seguridad)
  - Niveles configurables (error, warn, info, debug)
  - Formato JSON estructurado con timestamps
  - Morgan integrado para logging HTTP
  - Logs de autenticación y actividades de seguridad
- **Middleware de autenticación** en rutas protegidas

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

### Logs y Monitoreo
- **Winston Logger** con rotación diaria de archivos
- **Logs separados** por tipo: errores, general, seguridad, excepciones
- **Morgan integrado** para logging HTTP detallado
- **Niveles configurables**: error, warn, info, debug
- **Logs de autenticación**: registros de login/logout exitosos y fallidos
- **Logs de seguridad**: actividades sospechosas y ataques detectados
- **Logs de rendimiento**: tiempos de respuesta y consultas lentas
- **Alertas opcionales**: integración con Slack/email para errores críticos

## 🚀 Despliegue

### Requisitos
- Node.js 16+
- PostgreSQL 13+
- NPM o Yarn

### Variables de Producción
```env
NODE_ENV=production
DB_HOST=tu-servidor-postgres
DB_PORT=5432
DB_NAME=bts_prod
DB_USER=tu_usuario_prod
DB_PASSWORD=tu_contraseña_segura
DB_DIALECT=postgres
JWT_SECRET=tu-clave-secreta-muy-segura-min-32-caracteres
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
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