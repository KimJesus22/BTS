const mongoose = require('mongoose');

const accessibilityConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  preferences: {
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large', 'extra-large'],
      default: 'medium'
    },
    fontFamily: {
      type: String,
      enum: ['default', 'dyslexic', 'sans-serif', 'serif'],
      default: 'default'
    },
    colorScheme: {
      type: String,
      enum: ['default', 'high-contrast', 'dark', 'light', 'colorblind-friendly'],
      default: 'default'
    },
    motion: {
      type: String,
      enum: ['default', 'reduced', 'none'],
      default: 'default'
    },
    sound: {
      type: String,
      enum: ['default', 'muted', 'screen-reader'],
      default: 'default'
    }
  },
  assistiveTechnologies: {
    screenReader: {
      enabled: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        enum: ['none', 'nvda', 'jaaws', 'voiceover', 'talkback', 'other'],
        default: 'none'
      }
    },
    keyboardNavigation: {
      type: Boolean,
      default: true
    },
    focusManagement: {
      type: Boolean,
      default: true
    },
    skipLinks: {
      type: Boolean,
      default: true
    }
  },
  contentAdaptations: {
    simplifiedLanguage: {
      type: Boolean,
      default: false
    },
    largePrint: {
      type: Boolean,
      default: false
    },
    audioDescriptions: {
      type: Boolean,
      default: false
    },
    signLanguage: {
      type: Boolean,
      default: false
    }
  },
  deviceSettings: {
    touchTargets: {
      type: String,
      enum: ['default', 'large', 'extra-large'],
      default: 'default'
    },
    gestureSupport: {
      type: Boolean,
      default: true
    },
    voiceCommands: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    accessibilityAlerts: {
      type: Boolean,
      default: true
    },
    guidanceMessages: {
      type: Boolean,
      default: true
    },
    errorAnnouncements: {
      type: Boolean,
      default: true
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
accessibilityConfigSchema.index({ userId: 1 });
accessibilityConfigSchema.index({ 'preferences.colorScheme': 1 });
accessibilityConfigSchema.index({ 'assistiveTechnologies.screenReader.enabled': 1 });

// Virtual para verificar si tiene configuraciones avanzadas
accessibilityConfigSchema.virtual('hasAdvancedSettings').get(function() {
  return this.preferences.colorScheme !== 'default' ||
         this.preferences.motion !== 'default' ||
         this.preferences.sound !== 'default' ||
         this.assistiveTechnologies.screenReader.enabled ||
         this.contentAdaptations.simplifiedLanguage;
});

// Método para actualizar configuración
accessibilityConfigSchema.methods.updatePreferences = function(newPreferences) {
  Object.assign(this.preferences, newPreferences);
  this.lastUpdated = new Date();
  this.version += 1;
  return this.save();
};

// Método para resetear a configuración por defecto
accessibilityConfigSchema.methods.resetToDefault = function() {
  this.preferences = {
    fontSize: 'medium',
    fontFamily: 'default',
    colorScheme: 'default',
    motion: 'default',
    sound: 'default'
  };
  this.assistiveTechnologies = {
    screenReader: { enabled: false, type: 'none' },
    keyboardNavigation: true,
    focusManagement: true,
    skipLinks: true
  };
  this.contentAdaptations = {
    simplifiedLanguage: false,
    largePrint: false,
    audioDescriptions: false,
    signLanguage: false
  };
  this.deviceSettings = {
    touchTargets: 'default',
    gestureSupport: true,
    voiceCommands: false
  };
  this.notifications = {
    accessibilityAlerts: true,
    guidanceMessages: true,
    errorAnnouncements: true
  };
  this.lastUpdated = new Date();
  this.version += 1;
  return this.save();
};

// Método estático para obtener configuración por usuario
accessibilityConfigSchema.statics.getByUserId = function(userId) {
  return this.findOne({ userId }).populate('userId', 'username email');
};

// Método estático para estadísticas de accesibilidad
accessibilityConfigSchema.statics.getAccessibilityStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        screenReaderUsers: {
          $sum: { $cond: ['$assistiveTechnologies.screenReader.enabled', 1, 0] }
        },
        highContrastUsers: {
          $sum: { $cond: [{ $eq: ['$preferences.colorScheme', 'high-contrast'] }, 1, 0] }
        },
        reducedMotionUsers: {
          $sum: { $cond: [{ $eq: ['$preferences.motion', 'reduced'] }, 1, 0] }
        },
        largeFontUsers: {
          $sum: { $cond: [{ $in: ['$preferences.fontSize', ['large', 'extra-large']] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('AccessibilityConfig', accessibilityConfigSchema);