const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  favoriteMembers: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  language: {
    type: DataTypes.ENUM('es', 'en'),
    defaultValue: 'es'
  },
  fontSize: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    defaultValue: 'medium'
  },
  highContrast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reducedMotion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  screenReader: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gamification_level: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  gamification_experience: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamification_achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  gamification_streak_current: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamification_streak_longest: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamification_streak_lastActivity: {
    type: DataTypes.DATE,
    allowNull: true
  },
  wearable_deviceType: {
    type: DataTypes.ENUM('smartwatch', 'fitness_tracker', 'smart_ring', 'none'),
    defaultValue: 'none'
  },
  wearable_connected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wearable_lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  wearable_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  wearable_hapticFeedback: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  wearable_autoSync: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['username'] },
    { fields: ['gamification_level'] },
    { fields: ['gamification_experience'] }
  ]
});

// Virtual para nombre completo
User.prototype.getFullName = function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
};

// Virtual para verificar si la cuenta está bloqueada
User.prototype.getIsLocked = function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Hook para hashear contraseña antes de guardar
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed('password')) {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Método para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para incrementar intentos de login
User.prototype.incLoginAttempts = function() {
  if (this.loginAttempts >= 5) {
    this.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
  } else {
    this.loginAttempts += 1;
  }
  return this.save();
};

// Método para resetear intentos de login
User.prototype.resetLoginAttempts = function() {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

// Método para actualizar experiencia y nivel
User.prototype.addExperience = function(points) {
  this.gamification_experience += points;

  // Calcular nuevo nivel (cada 1000 puntos = 1 nivel)
  const newLevel = Math.floor(this.gamification_experience / 1000) + 1;

  if (newLevel > this.gamification_level) {
    this.gamification_level = newLevel;
    // Aquí se podría emitir un evento para notificaciones
  }

  return this.save();
};

// Método estático para encontrar usuario por email o username
User.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    where: {
      [Op.or]: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    }
  });
};

module.exports = User;