const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    favoriteMembers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    }],
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
  },
  accessibility: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    highContrast: {
      type: Boolean,
      default: false
    },
    reducedMotion: {
      type: Boolean,
      default: false
    },
    screenReader: {
      type: Boolean,
      default: false
    }
  },
  gamification: {
    level: {
      type: Number,
      default: 1
    },
    experience: {
      type: Number,
      default: 0
    },
    achievements: [{
      badgeId: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      progress: {
        type: Number,
        default: 100
      }
    }],
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: Date
    }
  },
  wearable: {
    deviceType: {
      type: String,
      enum: ['smartwatch', 'fitness_tracker', 'smart_ring', 'none'],
      default: 'none'
    },
    connected: {
      type: Boolean,
      default: false
    },
    lastSync: Date,
    preferences: {
      notifications: {
        type: Boolean,
        default: true
      },
      hapticFeedback: {
        type: Boolean,
        default: true
      },
      autoSync: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'gamification.level': -1 });
userSchema.index({ 'gamification.experience': -1 });

// Virtual para nombre completo
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar intentos de login
userSchema.methods.incLoginAttempts = function() {
  if (this.loginAttempts >= 5) {
    this.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 horas
  } else {
    this.loginAttempts += 1;
  }
  return this.save();
};

// Método para resetear intentos de login
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// Método para actualizar experiencia y nivel
userSchema.methods.addExperience = function(points) {
  this.gamification.experience += points;

  // Calcular nuevo nivel (cada 1000 puntos = 1 nivel)
  const newLevel = Math.floor(this.gamification.experience / 1000) + 1;

  if (newLevel > this.gamification.level) {
    this.gamification.level = newLevel;
    // Aquí se podría emitir un evento para notificaciones
  }

  return this.save();
};

// Método estático para encontrar usuario por email o username
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier }
    ]
  });
};

module.exports = mongoose.model('User', userSchema);