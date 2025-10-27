# API Documentation - BTS-app Backend

Documentación completa de la API RESTful para BTS-app.

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Miembros](#miembros)
- [Usuarios](#usuarios)
- [Wearables](#wearables)
- [Administración](#administración)
- [Códigos de Error](#códigos-de-error)
- [Ejemplos](#ejemplos)

## 🔐 Autenticación

### Registro de Usuario

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "language": "es"
  },
  "accessibility": {
    "fontSize": "medium",
    "highContrast": false
  }
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Inicio de Sesión

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "securepassword123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "profile": {...},
    "gamification": {
      "level": 1,
      "experience": 100,
      "currentStreak": 1
    }
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 Miembros

### Listar Miembros

```http
GET /api/members?page=1&limit=10&search=rm&role=Rapper
Authorization: Bearer <token>
```

**Parámetros de Query:**
- `page` (number): Página actual (default: 1)
- `limit` (number): Elementos por página (default: 10, max: 100)
- `search` (string): Término de búsqueda
- `role` (string): Filtrar por rol
- `sortBy` (string): Campo para ordenar (name, role, id)
- `sortOrder` (string): Orden (asc, desc)

**Respuesta Exitosa (200):**
```json
{
  "members": [
    {
      "id": 1,
      "name": "RM",
      "real_name": "Kim Nam-joon",
      "role": "Leader, Rapper",
      "biography": {
        "es": "Kim Nam-joon, conocido como RM...",
        "en": "Kim Nam-joon, known as RM..."
      },
      "stats": {
        "followers": 15000000,
        "likes": 5000000,
        "views": 10000000
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalMembers": 7,
    "hasNext": false,
    "hasPrev": false
  },
  "filters": {
    "search": "rm",
    "role": null
  }
}
```

### Obtener Miembro Específico

```http
GET /api/members/1
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "name": "RM",
  "real_name": "Kim Nam-joon",
  "role": "Leader, Rapper",
  "biography": {
    "es": "Kim Nam-joon, conocido como RM...",
    "en": "Kim Nam-joon, known as RM..."
  },
  "birth_date": "1994-09-12T00:00:00.000Z",
  "stats": {
    "followers": 15000000,
    "likes": 5000000,
    "views": 10000000
  }
}
```

### Buscar Miembros

```http
GET /api/members/search?q=jin
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "query": "jin",
  "results": 1,
  "members": [
    {
      "id": 2,
      "name": "Jin",
      "real_name": "Kim Seok-jin",
      "role": "Vocalist, Visual"
    }
  ]
}
```

## 👤 Usuarios

### Obtener Perfil

```http
GET /api/users/profile
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Fan de BTS",
      "avatar": "https://example.com/avatar.jpg",
      "language": "es",
      "favoriteMembers": ["507f1f77bcf86cd799439012"]
    },
    "accessibility": {
      "fontSize": "medium",
      "highContrast": false,
      "reducedMotion": false
    },
    "gamification": {
      "level": 5,
      "experience": 4500,
      "achievements": [
        {
          "badgeId": "first_login",
          "earnedAt": "2024-01-15T10:30:00.000Z",
          "progress": 100
        }
      ],
      "streak": {
        "current": 7,
        "longest": 12,
        "lastActivity": "2024-01-20T09:00:00.000Z"
      }
    }
  }
}
```

### Actualizar Perfil

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Actualización de biografía",
    "language": "en"
  },
  "accessibility": {
    "fontSize": "large",
    "highContrast": true
  }
}
```

### Obtener Leaderboard

```http
GET /api/users/leaderboard?type=experience&limit=10
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg",
      "gamification": {
        "level": 10,
        "experience": 9500,
        "streak": {
          "current": 15,
          "longest": 20
        }
      }
    }
  ]
}
```

## ⌚ Wearables

### Conectar Dispositivo

```http
POST /api/wearable/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "device": {
    "type": "smartwatch",
    "brand": "apple",
    "model": "Watch Series 8",
    "firmwareVersion": "9.1"
  },
  "settings": {
    "units": "metric",
    "timezone": "America/Mexico_City"
  }
}
```

**Respuesta Exitosa (201):**
```json
{
  "message": "Dispositivo conectado exitosamente",
  "wearable": {
    "id": "507f1f77bcf86cd799439013",
    "device": {
      "type": "smartwatch",
      "brand": "apple",
      "model": "Watch Series 8"
    },
    "connection": {
      "isConnected": true,
      "lastSync": "2024-01-20T10:00:00.000Z"
    }
  }
}
```

### Sincronizar Datos

```http
POST /api/wearable/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "sensorData": {
    "heartRate": 72,
    "steps": 8500,
    "calories": 320,
    "sleep": {
      "duration": 8.5,
      "quality": 85,
      "stages": {
        "deep": 1.5,
        "light": 5.0,
        "rem": 2.0,
        "awake": 0.5
      }
    },
    "battery": 78
  }
}
```

## 🛡️ Administración

### Obtener Estadísticas del Sistema

```http
GET /api/admin/stats
Authorization: Bearer <token_admin>
```

**Respuesta Exitosa (200):**
```json
{
  "systemStats": {
    "users": {
      "total": 1250,
      "active": 1180,
      "admins": 3
    },
    "members": {
      "total": 7
    },
    "wearables": {
      "connected": 45
    },
    "accessibility": {
      "configs": 234
    },
    "gamification": {
      "totalUsers": 1180,
      "avgLevel": 8.5,
      "avgExperience": 7500,
      "totalAchievements": 3450,
      "avgStreak": 12.3
    }
  }
}
```

### Crear Miembro

```http
POST /api/admin/members
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "id": 8,
  "name": "NewMember",
  "real_name": "Real Name",
  "role": "New Role",
  "biography": {
    "es": "Biografía en español",
    "en": "Biography in English"
  },
  "birth_date": "1995-01-01",
  "birth_place": "Seoul, South Korea"
}
```

## ❌ Códigos de Error

### Errores Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Datos inválidos o solicitud malformada |
| 401 | No autorizado (token faltante o inválido) |
| 403 | Prohibido (permisos insuficientes) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (recurso ya existe) |
| 422 | Entidad no procesable (validación fallida) |
| 429 | Demasiadas solicitudes (rate limit) |
| 500 | Error interno del servidor |

### Ejemplo de Error

```json
{
  "error": "Credenciales inválidas",
  "timestamp": "2024-01-20T10:00:00.000Z"
}
```

## 📝 Ejemplos de Uso

### Flujo Completo de Usuario

1. **Registro**
```javascript
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'newuser',
    email: 'user@example.com',
    password: 'securepass123'
  })
});
const { token } = await registerResponse.json();
```

2. **Obtener Miembros**
```javascript
const membersResponse = await fetch('/api/members?page=1&limit=5', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { members, pagination } = await membersResponse.json();
```

3. **Actualizar Perfil**
```javascript
await fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    profile: {
      bio: '¡Hola! Soy fan de BTS',
      favoriteMembers: [members[0]._id]
    }
  })
});
```

### Manejo de Errores

```javascript
try {
  const response = await fetch('/api/members/999');
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### Autenticación Persistente

```javascript
// Almacenar token
localStorage.setItem('authToken', token);

// Usar en requests
const authHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
};
```

## 🔧 Headers Requeridos

- `Content-Type: application/json` para requests POST/PUT
- `Authorization: Bearer <token>` para rutas protegidas

## 📊 Rate Limiting

- **General**: 100 requests por 15 minutos
- **Autenticación**: 5 requests por 15 minutos
- **API**: 1000 requests por 15 minutos (por usuario)

## 🔒 Seguridad

- Todos los passwords son hasheados con bcrypt
- JWT tokens expiran en 7 días por defecto
- CORS configurado para orígenes específicos
- Inputs sanitizados para prevenir XSS
- Rate limiting para prevenir ataques de fuerza bruta

---

Para más detalles sobre endpoints específicos, consulta la documentación del código fuente o crea un issue en el repositorio.