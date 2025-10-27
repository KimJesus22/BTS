const mongoose = require('mongoose');

const wearableSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  device: {
    type: {
      type: String,
      enum: ['smartwatch', 'fitness_tracker', 'smart_ring', 'smart_glasses', 'earbuds'],
      required: true
    },
    brand: {
      type: String,
      enum: ['apple', 'samsung', 'fitbit', 'garmin', 'xiaomi', 'huawei', 'other'],
      required: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    firmwareVersion: String,
    serialNumber: String
  },
  connection: {
    isConnected: {
      type: Boolean,
      default: false
    },
    lastSync: Date,
    connectionType: {
      type: String,
      enum: ['bluetooth', 'wifi', 'cellular', 'usb'],
      default: 'bluetooth'
    },
    signalStrength: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  sensors: {
    heartRate: {
      enabled: {
        type: Boolean,
        default: true
      },
      resting: Number,
      max: Number,
      lastReading: Number,
      readings: [{
        value: Number,
        timestamp: {
          type: Date,
          default: Date.now
        }
      }]
    },
    steps: {
      enabled: {
        type: Boolean,
        default: true
      },
      dailyGoal: {
        type: Number,
        default: 10000
      },
      current: {
        type: Number,
        default: 0
      },
      lastSync: Date
    },
    sleep: {
      enabled: {
        type: Boolean,
        default: true
      },
      tracking: {
        type: Boolean,
        default: true
      },
      lastNight: {
        duration: Number, // en minutos
        quality: {
          type: Number,
          min: 0,
          max: 100
        },
        stages: {
          deep: Number,
          light: Number,
          rem: Number,
          awake: Number
        }
      }
    },
    calories: {
      enabled: {
        type: Boolean,
        default: true
      },
      dailyGoal: {
        type: Number,
        default: 2000
      },
      current: {
        type: Number,
        default: 0
      }
    },
    stress: {
      enabled: {
        type: Boolean,
        default: false
      },
      level: {
        type: Number,
        min: 0,
        max: 100
      },
      lastReading: Date
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    types: {
      achievements: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      },
      challenges: {
        type: Boolean,
        default: true
      },
      social: {
        type: Boolean,
        default: false
      }
    },
    schedule: {
      quietHours: {
        start: String, // formato HH:MM
        end: String
      },
      vibration: {
        type: Boolean,
        default: true
      },
      sound: {
        type: Boolean,
        default: true
      }
    }
  },
  gamification: {
    enabled: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily', 'manual'],
      default: 'realtime'
    },
    achievements: [{
      type: {
        type: String,
        enum: ['steps_goal', 'sleep_goal', 'heart_rate_zone', 'calories_goal', 'streak']
      },
      target: Number,
      current: Number,
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: Date
    }],
    rewards: {
      experiencePoints: {
        type: Number,
        default: 0
      },
      badges: [{
        id: String,
        earnedAt: Date
      }]
    }
  },
  battery: {
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    isCharging: {
      type: Boolean,
      default: false
    },
    lastUpdate: Date
  },
  settings: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    timezone: {
      type: String,
      default: 'America/Mexico_City'
    },
    language: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
  },
  dataRetention: {
    keepDataDays: {
      type: Number,
      default: 365,
      min: 30,
      max: 3650
    },
    autoDelete: {
      type: Boolean,
      default: false
    }
  },
  lastHealthCheck: Date,
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
wearableSchema.index({ userId: 1 });
wearableSchema.index({ 'device.type': 1 });
wearableSchema.index({ 'connection.isConnected': 1 });
wearableSchema.index({ 'sensors.heartRate.lastReading': -1 });

// Virtual para verificar si el dispositivo está activo
wearableSchema.virtual('isActive').get(function() {
  return this.connection.isConnected &&
         this.battery.level > 10 &&
         (new Date() - this.connection.lastSync) < (24 * 60 * 60 * 1000); // menos de 24 horas
});

// Virtual para progreso diario de pasos
wearableSchema.virtual('stepsProgress').get(function() {
  return Math.min((this.sensors.steps.current / this.sensors.steps.dailyGoal) * 100, 100);
});

// Método para sincronizar datos del dispositivo
wearableSchema.methods.syncData = function(sensorData) {
  const now = new Date();

  // Actualizar sensores
  if (sensorData.heartRate) {
    this.sensors.heartRate.lastReading = sensorData.heartRate;
    this.sensors.heartRate.readings.push({
      value: sensorData.heartRate,
      timestamp: now
    });

    // Mantener solo las últimas 100 lecturas
    if (this.sensors.heartRate.readings.length > 100) {
      this.sensors.heartRate.readings = this.sensors.heartRate.readings.slice(-100);
    }
  }

  if (sensorData.steps !== undefined) {
    this.sensors.steps.current = sensorData.steps;
    this.sensors.steps.lastSync = now;
  }

  if (sensorData.calories !== undefined) {
    this.sensors.calories.current = sensorData.calories;
  }

  if (sensorData.sleep) {
    this.sensors.sleep.lastNight = sensorData.sleep;
  }

  if (sensorData.battery !== undefined) {
    this.battery.level = sensorData.battery;
    this.battery.lastUpdate = now;
  }

  this.connection.lastSync = now;
  this.lastHealthCheck = now;

  return this.save();
};

// Método para verificar objetivos diarios
wearableSchema.methods.checkDailyGoals = function() {
  const achievements = [];

  // Verificar objetivo de pasos
  if (this.sensors.steps.current >= this.sensors.steps.dailyGoal) {
    const existing = this.gamification.achievements.find(a => a.type === 'steps_goal' && !a.completed);
    if (!existing) {
      achievements.push({
        type: 'steps_goal',
        target: this.sensors.steps.dailyGoal,
        current: this.sensors.steps.current,
        completed: true,
        completedAt: new Date()
      });
    }
  }

  // Verificar objetivo de calorías
  if (this.sensors.calories.current >= this.sensors.calories.dailyGoal) {
    const existing = this.gamification.achievements.find(a => a.type === 'calories_goal' && !a.completed);
    if (!existing) {
      achievements.push({
        type: 'calories_goal',
        target: this.sensors.calories.dailyGoal,
        current: this.sensors.calories.current,
        completed: true,
        completedAt: new Date()
      });
    }
  }

  if (achievements.length > 0) {
    this.gamification.achievements.push(...achievements);
    this.gamification.rewards.experiencePoints += achievements.length * 50; // 50 XP por logro
  }

  return this.save();
};

// Método para resetear contadores diarios
wearableSchema.methods.resetDailyCounters = function() {
  this.sensors.steps.current = 0;
  this.sensors.calories.current = 0;
  this.sensors.sleep.lastNight = null;

  // Resetear logros diarios
  this.gamification.achievements = this.gamification.achievements.filter(
    achievement => achievement.type !== 'steps_goal' && achievement.type !== 'calories_goal'
  );

  return this.save();
};

// Método estático para obtener dispositivos conectados
wearableSchema.statics.getConnectedDevices = function() {
  return this.find({ 'connection.isConnected': true }).populate('userId', 'username');
};

// Método estático para estadísticas de dispositivos
wearableSchema.statics.getWearableStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalDevices: { $sum: 1 },
        connectedDevices: {
          $sum: { $cond: ['$connection.isConnected', 1, 0] }
        },
        avgBatteryLevel: { $avg: '$battery.level' },
        devicesByType: {
          $push: '$device.type'
        }
      }
    },
    {
      $project: {
        totalDevices: 1,
        connectedDevices: 1,
        avgBatteryLevel: { $round: ['$avgBatteryLevel', 1] },
        deviceTypeDistribution: {
          $reduce: {
            input: '$devicesByType',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                { ['$$this']: { $add: [{ $getField: { field: '$$this', input: '$$value' } }, 1] } }
              ]
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Wearable', wearableSchema);