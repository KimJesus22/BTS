const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AccessibilityConfig = sequelize.define('AccessibilityConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fontSize: {
    type: DataTypes.ENUM('small', 'medium', 'large', 'extra-large'),
    defaultValue: 'medium'
  },
  fontFamily: {
    type: DataTypes.ENUM('default', 'dyslexic', 'sans-serif', 'serif'),
    defaultValue: 'default'
  },
  colorScheme: {
    type: DataTypes.ENUM('default', 'high-contrast', 'dark', 'light', 'colorblind-friendly'),
    defaultValue: 'default'
  },
  motion: {
    type: DataTypes.ENUM('default', 'reduced', 'none'),
    defaultValue: 'default'
  },
  sound: {
    type: DataTypes.ENUM('default', 'muted', 'screen-reader'),
    defaultValue: 'default'
  },
  screenReader_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  screenReader_type: {
    type: DataTypes.ENUM('none', 'nvda', 'jaaws', 'voiceover', 'talkback', 'other'),
    defaultValue: 'none'
  },
  keyboardNavigation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  focusManagement: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  skipLinks: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  simplifiedLanguage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  largePrint: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  audioDescriptions: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  signLanguage: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  touchTargets: {
    type: DataTypes.ENUM('default', 'large', 'extra-large'),
    defaultValue: 'default'
  },
  gestureSupport: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  voiceCommands: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  accessibilityAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  guidanceMessages: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  errorAnnouncements: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'accessibility_configs',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['colorScheme'] },
    { fields: ['screenReader_enabled'] }
  ]
});

// Virtual para verificar si tiene configuraciones avanzadas
AccessibilityConfig.prototype.getHasAdvancedSettings = function() {
  return this.colorScheme !== 'default' ||
         this.motion !== 'default' ||
         this.sound !== 'default' ||
         this.screenReader_enabled ||
         this.simplifiedLanguage;
};

// Método para actualizar configuración
AccessibilityConfig.prototype.updatePreferences = function(newPreferences) {
  if (newPreferences.fontSize) this.fontSize = newPreferences.fontSize;
  if (newPreferences.fontFamily) this.fontFamily = newPreferences.fontFamily;
  if (newPreferences.colorScheme) this.colorScheme = newPreferences.colorScheme;
  if (newPreferences.motion) this.motion = newPreferences.motion;
  if (newPreferences.sound) this.sound = newPreferences.sound;
  this.lastUpdated = new Date();
  this.version += 1;
  return this.save();
};

// Método para resetear a configuración por defecto
AccessibilityConfig.prototype.resetToDefault = function() {
  this.fontSize = 'medium';
  this.fontFamily = 'default';
  this.colorScheme = 'default';
  this.motion = 'default';
  this.sound = 'default';
  this.screenReader_enabled = false;
  this.screenReader_type = 'none';
  this.keyboardNavigation = true;
  this.focusManagement = true;
  this.skipLinks = true;
  this.simplifiedLanguage = false;
  this.largePrint = false;
  this.audioDescriptions = false;
  this.signLanguage = false;
  this.touchTargets = 'default';
  this.gestureSupport = true;
  this.voiceCommands = false;
  this.accessibilityAlerts = true;
  this.guidanceMessages = true;
  this.errorAnnouncements = true;
  this.lastUpdated = new Date();
  this.version += 1;
  return this.save();
};

// Método estático para obtener configuración por usuario
AccessibilityConfig.getByUserId = function(userId) {
  return this.findOne({
    where: { userId },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['username', 'email']
    }]
  });
};

module.exports = AccessibilityConfig;