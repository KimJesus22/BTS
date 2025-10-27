const Joi = require('joi');
const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationError = new Error('Datos de entrada inválidos');
    validationError.statusCode = 400;
    validationError.code = 'VALIDATION_ERROR';
    validationError.details = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    return next(validationError);
  }
  next();
};

// Esquemas de validación con Joi para diferentes áreas

// Autenticación
const authSchemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required()
      .messages({
        'string.empty': 'El nombre de usuario es requerido',
        'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
        'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
        'string.max': 'El nombre de usuario no puede exceder 50 caracteres'
      }),
    email: Joi.string().email().required()
      .messages({
        'string.empty': 'El email es requerido',
        'string.email': 'El email debe tener un formato válido'
      }),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.empty': 'La contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'
      }),
    profile: Joi.object({
      firstName: Joi.string().trim().max(50).allow(''),
      lastName: Joi.string().trim().max(50).allow(''),
      bio: Joi.string().trim().max(500).allow(''),
      language: Joi.string().valid('es', 'en').default('es'),
      avatar: Joi.string().uri().allow('')
    }).default({}),
    accessibility: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large').default('medium'),
      highContrast: Joi.boolean().default(false),
      reducedMotion: Joi.boolean().default(false),
      screenReader: Joi.boolean().default(false)
    }).default({})
  }),

  login: Joi.object({
    identifier: Joi.string().required()
      .messages({
        'string.empty': 'El email o nombre de usuario es requerido'
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'La contraseña es requerida'
      })
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
      .messages({
        'string.empty': 'El email es requerido',
        'string.email': 'El email debe tener un formato válido'
      })
  }),

  resetPassword: Joi.object({
    token: Joi.string().required()
      .messages({
        'string.empty': 'El token es requerido'
      }),
    newPassword: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.empty': 'La nueva contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'
      })
  })
};

// Usuarios
const userSchemas = {
  updateProfile: Joi.object({
    profile: Joi.object({
      firstName: Joi.string().trim().max(50).allow(''),
      lastName: Joi.string().trim().max(50).allow(''),
      bio: Joi.string().trim().max(500).allow(''),
      avatar: Joi.string().uri().allow(''),
      language: Joi.string().valid('es', 'en'),
      favoriteMembers: Joi.array().items(Joi.number().integer().min(1).max(7))
    }),
    accessibility: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large'),
      highContrast: Joi.boolean(),
      reducedMotion: Joi.boolean(),
      screenReader: Joi.boolean()
    })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required()
      .messages({
        'string.empty': 'La contraseña actual es requerida'
      }),
    newPassword: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .messages({
        'string.empty': 'La nueva contraseña es requerida',
        'string.min': 'La contraseña debe tener al menos 8 caracteres',
        'string.max': 'La contraseña no puede exceder 128 caracteres',
        'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'
      })
  }),

  updateAccessibility: Joi.object({
    preferences: Joi.object({
      fontSize: Joi.string().valid('small', 'medium', 'large', 'extra-large'),
      fontFamily: Joi.string().valid('default', 'dyslexic', 'sans-serif', 'serif'),
      colorScheme: Joi.string().valid('default', 'high-contrast', 'dark', 'light', 'colorblind-friendly'),
      motion: Joi.string().valid('default', 'reduced', 'none'),
      sound: Joi.string().valid('default', 'muted', 'screen-reader')
    }),
    assistiveTechnologies: Joi.object({
      screenReader: Joi.object({
        enabled: Joi.boolean(),
        type: Joi.string().valid('none', 'nvda', 'jaaws', 'voiceover', 'talkback', 'other')
      }),
      keyboardNavigation: Joi.boolean(),
      focusManagement: Joi.boolean(),
      skipLinks: Joi.boolean()
    }),
    contentAdaptations: Joi.object({
      simplifiedLanguage: Joi.boolean(),
      largePrint: Joi.boolean(),
      audioDescriptions: Joi.boolean(),
      signLanguage: Joi.boolean()
    }),
    deviceSettings: Joi.object({
      touchTargets: Joi.string().valid('default', 'large', 'extra-large'),
      gestureSupport: Joi.boolean(),
      voiceCommands: Joi.boolean()
    }),
    notifications: Joi.object({
      accessibilityAlerts: Joi.boolean(),
      guidanceMessages: Joi.boolean(),
      errorAnnouncements: Joi.boolean()
    })
  })
};

// Miembros
const memberSchemas = {
  getMembers: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().allow(''),
    role: Joi.string().valid('Leader', 'Rapper', 'Dancer', 'Vocalist', 'Visual', 'Main Vocalist', 'Center').allow(''),
    sortBy: Joi.string().valid('name', 'role', 'id').default('id'),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),

  getMemberById: Joi.object({
    id: Joi.number().integer().min(1).max(7).required()
      .messages({
        'number.base': 'El ID del miembro debe ser un número',
        'number.min': 'El ID del miembro debe ser al menos 1',
        'number.max': 'El ID del miembro no puede ser mayor a 7',
        'any.required': 'El ID del miembro es requerido'
      })
  }),

  updateStats: Joi.object({
    memberId: Joi.number().integer().min(1).max(7).required(),
    stats: Joi.object({
      followers: Joi.number().integer().min(0),
      likes: Joi.number().integer().min(0),
      views: Joi.number().integer().min(0)
    }).required()
  }),

  addAchievement: Joi.object({
    memberId: Joi.number().integer().min(1).max(7).required(),
    achievement: Joi.object({
      title: Joi.string().trim().min(1).max(100).required(),
      year: Joi.number().integer().min(2013).max(new Date().getFullYear()).required(),
      description: Joi.string().trim().min(1).max(500).required()
    }).required()
  }),

  searchMembers: Joi.object({
    q: Joi.string().trim().min(2).max(100).required()
      .messages({
        'string.empty': 'El término de búsqueda es requerido',
        'string.min': 'El término de búsqueda debe tener al menos 2 caracteres',
        'string.max': 'El término de búsqueda no puede exceder 100 caracteres'
      })
  })
};

// Wearables
const wearableSchemas = {
  connectDevice: Joi.object({
    device: Joi.object({
      type: Joi.string().valid('smartwatch', 'fitness_tracker', 'smart_ring', 'smart_glasses', 'earbuds').required(),
      brand: Joi.string().valid('apple', 'samsung', 'fitbit', 'garmin', 'xiaomi', 'huawei', 'other').required(),
      model: Joi.string().trim().min(1).max(100).required(),
      firmwareVersion: Joi.string().trim(),
      serialNumber: Joi.string().trim()
    }).required(),
    settings: Joi.object({
      units: Joi.string().valid('metric', 'imperial').default('metric'),
      timezone: Joi.string().default('America/Mexico_City'),
      language: Joi.string().valid('es', 'en').default('es')
    })
  }),

  syncData: Joi.object({
    sensorData: Joi.object({
      heartRate: Joi.number().integer().min(40).max(200),
      steps: Joi.number().integer().min(0),
      calories: Joi.number().integer().min(0),
      sleep: Joi.object({
        duration: Joi.number().min(0).max(24),
        quality: Joi.number().min(0).max(100),
        stages: Joi.object({
          deep: Joi.number().min(0),
          light: Joi.number().min(0),
          rem: Joi.number().min(0),
          awake: Joi.number().min(0)
        })
      }),
      battery: Joi.number().min(0).max(100)
    }).required()
  }),

  updateSettings: Joi.object({
    notifications: Joi.object({
      enabled: Joi.boolean(),
      types: Joi.object({
        achievements: Joi.boolean(),
        reminders: Joi.boolean(),
        challenges: Joi.boolean(),
        social: Joi.boolean()
      }),
      schedule: Joi.object({
        quietHours: Joi.object({
          start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
          end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        }),
        vibration: Joi.boolean(),
        sound: Joi.boolean()
      })
    }),
    gamification: Joi.object({
      enabled: Joi.boolean(),
      syncFrequency: Joi.string().valid('realtime', 'hourly', 'daily', 'manual')
    }),
    dataRetention: Joi.object({
      keepDataDays: Joi.number().integer().min(30).max(3650)
    })
  })
};

// Administración
const adminSchemas = {
  createMember: Joi.object({
    id: Joi.number().integer().min(1).max(7).required(),
    name: Joi.string().trim().min(1).max(50).required(),
    real_name: Joi.string().trim().min(1).max(100).required(),
    role: Joi.string().trim().min(1).max(100).required(),
    biography_es: Joi.string().trim().min(1).required(),
    biography_en: Joi.string().trim().min(1).required(),
    birth_date: Joi.date().required(),
    birth_place: Joi.string().trim().min(1).required(),
    debut_date: Joi.date().default(() => new Date('2013-06-13')),
    social_media: Joi.object({
      instagram: Joi.string().uri(),
      twitter: Joi.string().uri(),
      weverse: Joi.string().uri()
    }),
    achievements: Joi.array().items(Joi.object({
      title: Joi.string().trim().min(1).max(200).required(),
      year: Joi.number().integer().min(2013).max(new Date().getFullYear()).required(),
      description: Joi.string().trim().min(1).max(500).required()
    }))
  }),

  updateUserRole: Joi.object({
    role: Joi.string().valid('user', 'admin', 'moderator').required()
      .messages({
        'any.only': 'El rol debe ser uno de: user, admin, moderator',
        'any.required': 'El rol es requerido'
      })
  }),

  suspendUser: Joi.object({
    duration: Joi.number().integer().min(1).max(168).required() // máximo 1 semana
      .messages({
        'number.base': 'La duración debe ser un número',
        'number.min': 'La duración mínima es 1 hora',
        'number.max': 'La duración máxima es 168 horas (1 semana)',
        'any.required': 'La duración es requerida'
      }),
    reason: Joi.string().trim().max(500).allow('')
  }),

  getActivityLogs: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    type: Joi.string().valid('all', 'auth', 'gamification', 'wearable').default('all')
  })
};

// Middleware de validación con Joi
const validateWithJoi = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const joiError = new Error('Datos de entrada inválidos');
      joiError.isJoi = true;
      joiError.details = error.details.map(detail => ({
        path: detail.path,
        message: detail.message,
        context: detail.context
      }));
      return next(joiError);
    }

    // Reemplazar req.body con los datos validados y sanitizados
    req.body = value;
    next();
  };
};

// Middleware de validación con express-validator para sanitización XSS
const sanitizeInput = [
  body('*').trim().escape(),
  param('*').trim().escape(),
  query('*').trim().escape()
];

// Validadores específicos para rutas críticas
const authValidators = {
  register: [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres')
      .isAlphanumeric()
      .withMessage('El nombre de usuario solo puede contener letras y números'),
    body('email')
      .isEmail()
      .withMessage('Debe proporcionar un email válido')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    handleValidationErrors
  ],

  login: [
    body('identifier')
      .notEmpty()
      .withMessage('El email o nombre de usuario es requerido'),
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida'),
    handleValidationErrors
  ]
};

const userValidators = {
  updateProfile: [
    body('profile.firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El nombre no puede exceder 50 caracteres'),
    body('profile.lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('El apellido no puede exceder 50 caracteres'),
    body('profile.bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('La biografía no puede exceder 500 caracteres'),
    body('profile.avatar')
      .optional()
      .isURL()
      .withMessage('El avatar debe ser una URL válida'),
    handleValidationErrors
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('La contraseña actual es requerida'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('La nueva contraseña debe tener entre 8 y 128 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial'),
    handleValidationErrors
  ]
};

const memberValidators = {
  getMembers: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La página debe ser un número entero mayor a 0'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe estar entre 1 y 100'),
    query('search')
      .optional()
      .isLength({ min: 2 })
      .withMessage('La búsqueda debe tener al menos 2 caracteres'),
    handleValidationErrors
  ],

  getMemberById: [
    param('id')
      .isInt({ min: 1, max: 7 })
      .withMessage('El ID del miembro debe estar entre 1 y 7'),
    handleValidationErrors
  ]
};

const wearableValidators = {
  connectDevice: [
    body('device.type')
      .isIn(['smartwatch', 'fitness_tracker', 'smart_ring', 'smart_glasses', 'earbuds'])
      .withMessage('Tipo de dispositivo inválido'),
    body('device.brand')
      .isIn(['apple', 'samsung', 'fitbit', 'garmin', 'xiaomi', 'huawei', 'other'])
      .withMessage('Marca de dispositivo inválida'),
    body('device.model')
      .isLength({ min: 1, max: 100 })
      .withMessage('El modelo debe tener entre 1 y 100 caracteres'),
    handleValidationErrors
  ],

  syncData: [
    body('sensorData.heartRate')
      .optional()
      .isInt({ min: 40, max: 200 })
      .withMessage('La frecuencia cardíaca debe estar entre 40 y 200'),
    body('sensorData.steps')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Los pasos deben ser un número positivo'),
    body('sensorData.calories')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Las calorías deben ser un número positivo'),
    body('sensorData.battery')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('La batería debe estar entre 0 y 100'),
    handleValidationErrors
  ]
};

const adminValidators = {
  createMember: [
    body('id')
      .isInt({ min: 1, max: 7 })
      .withMessage('El ID debe estar entre 1 y 7'),
    body('name')
      .isLength({ min: 1, max: 50 })
      .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
    body('real_name')
      .isLength({ min: 1, max: 100 })
      .withMessage('El nombre real debe tener entre 1 y 100 caracteres'),
    body('role')
      .isLength({ min: 1, max: 100 })
      .withMessage('El rol debe tener entre 1 y 100 caracteres'),
    body('biography_es')
      .notEmpty()
      .withMessage('La biografía en español es requerida'),
    body('biography_en')
      .notEmpty()
      .withMessage('La biografía en inglés es requerida'),
    body('birth_date')
      .isISO8601()
      .withMessage('La fecha de nacimiento debe tener un formato válido'),
    body('birth_place')
      .notEmpty()
      .withMessage('El lugar de nacimiento es requerido'),
    handleValidationErrors
  ],

  updateUserRole: [
    body('role')
      .isIn(['user', 'admin', 'moderator'])
      .withMessage('El rol debe ser user, admin o moderator'),
    handleValidationErrors
  ]
};

module.exports = {
  // Esquemas Joi
  authSchemas,
  userSchemas,
  memberSchemas,
  wearableSchemas,
  adminSchemas,

  // Middlewares
  validateWithJoi,
  handleValidationErrors,
  sanitizeInput,

  // Validadores express-validator
  authValidators,
  userValidators,
  memberValidators,
  wearableValidators,
  adminValidators
};