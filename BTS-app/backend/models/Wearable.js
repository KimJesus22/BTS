const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wearable = sequelize.define('Wearable', {
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
  device_type: {
    type: DataTypes.ENUM('smartwatch', 'fitness_tracker', 'smart_ring', 'smart_glasses', 'earbuds'),
    allowNull: false
  },
  device_brand: {
    type: DataTypes.ENUM('apple', 'samsung', 'fitbit', 'garmin', 'xiaomi', 'huawei', 'other'),
    allowNull: false
  },
  device_model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  firmwareVersion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  serialNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  connectionType: {
    type: DataTypes.ENUM('bluetooth', 'wifi', 'cellular', 'usb'),
    defaultValue: 'bluetooth'
  },
  signalStrength: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  heartRate_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  heartRate_resting: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  heartRate_max: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  heartRate_lastReading: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  heartRate_readings: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  steps_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  steps_dailyGoal: {
    type: DataTypes.INTEGER,
    defaultValue: 10000
  },
  steps_current: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  steps_lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sleep_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sleep_tracking: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sleep_lastNight: {
    type: DataTypes.JSON,
    allowNull: true
  },
  calories_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  calories_dailyGoal: {
    type: DataTypes.INTEGER,
    defaultValue: 2000
  },
  calories_current: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  stress_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  stress_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  stress_lastReading: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notifications_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_achievements: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_reminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_challenges: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notifications_social: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  quietHours_start: {
    type: DataTypes.STRING,
    allowNull: true
  },
  quietHours_end: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vibration: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sound: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  gamification_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  syncFrequency: {
    type: DataTypes.ENUM('realtime', 'hourly', 'daily', 'manual'),
    defaultValue: 'realtime'
  },
  gamification_achievements: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  experiencePoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  gamification_badges: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  battery_level: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 0,
      max: 100
    }
  },
  battery_isCharging: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  battery_lastUpdate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  units: {
    type: DataTypes.ENUM('metric', 'imperial'),
    defaultValue: 'metric'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'America/Mexico_City'
  },
  wearable_language: {
    type: DataTypes.ENUM('es', 'en'),
    defaultValue: 'es'
  },
  keepDataDays: {
    type: DataTypes.INTEGER,
    defaultValue: 365,
    validate: {
      min: 30,
      max: 3650
    }
  },
  autoDelete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastHealthCheck: {
    type: DataTypes.DATE,
    allowNull: true
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'wearables',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['device_type'] },
    { fields: ['isConnected'] },
    { fields: ['heartRate_lastReading'] }
  ]
});

// Virtual para verificar si el dispositivo está activo
Wearable.prototype.getIsActive = function() {
  return this.isConnected &&
         this.battery_level > 10 &&
         (new Date() - this.lastSync) < (24 * 60 * 60 * 1000); // menos de 24 horas
};

// Virtual para progreso diario de pasos
Wearable.prototype.getStepsProgress = function() {
  return Math.min((this.steps_current / this.steps_dailyGoal) * 100, 100);
};

// Método para sincronizar datos del dispositivo
Wearable.prototype.syncData = function(sensorData) {
  const now = new Date();

  if (sensorData.heartRate) {
    this.heartRate_lastReading = sensorData.heartRate;
    this.heartRate_readings.push({
      value: sensorData.heartRate,
      timestamp: now
    });

    if (this.heartRate_readings.length > 100) {
      this.heartRate_readings = this.heartRate_readings.slice(-100);
    }
  }

  if (sensorData.steps !== undefined) {
    this.steps_current = sensorData.steps;
    this.steps_lastSync = now;
  }

  if (sensorData.calories !== undefined) {
    this.calories_current = sensorData.calories;
  }

  if (sensorData.sleep) {
    this.sleep_lastNight = sensorData.sleep;
  }

  if (sensorData.battery !== undefined) {
    this.battery_level = sensorData.battery;
    this.battery_lastUpdate = now;
  }

  this.lastSync = now;
  this.lastHealthCheck = now;

  return this.save();
};

// Método para verificar objetivos diarios
Wearable.prototype.checkDailyGoals = function() {
  const achievements = [];

  if (this.steps_current >= this.steps_dailyGoal) {
    const existing = this.gamification_achievements.find(a => a.type === 'steps_goal' && !a.completed);
    if (!existing) {
      achievements.push({
        type: 'steps_goal',
        target: this.steps_dailyGoal,
        current: this.steps_current,
        completed: true,
        completedAt: new Date()
      });
    }
  }

  if (this.calories_current >= this.calories_dailyGoal) {
    const existing = this.gamification_achievements.find(a => a.type === 'calories_goal' && !a.completed);
    if (!existing) {
      achievements.push({
        type: 'calories_goal',
        target: this.calories_dailyGoal,
        current: this.calories_current,
        completed: true,
        completedAt: new Date()
      });
    }
  }

  if (achievements.length > 0) {
    this.gamification_achievements.push(...achievements);
    this.experiencePoints += achievements.length * 50;
  }

  return this.save();
};

// Método para resetear contadores diarios
Wearable.prototype.resetDailyCounters = function() {
  this.steps_current = 0;
  this.calories_current = 0;
  this.sleep_lastNight = null;

  this.gamification_achievements = this.gamification_achievements.filter(
    achievement => achievement.type !== 'steps_goal' && achievement.type !== 'calories_goal'
  );

  return this.save();
};

// Método estático para obtener dispositivos conectados
Wearable.getConnectedDevices = function() {
  return this.findAll({
    where: { isConnected: true },
    include: [{
      model: sequelize.models.User,
      as: 'user',
      attributes: ['username']
    }]
  });
};

module.exports = Wearable;