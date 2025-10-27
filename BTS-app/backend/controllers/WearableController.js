const Joi = require('joi');
const Wearable = require('../models/Wearable');
const GamificationService = require('../services/GamificationService');
const OptimizationService = require('../services/OptimizationService');
const { validateWithJoi, wearableSchemas } = require('../middlewares/validation');

class WearableController {
  // Conectar dispositivo wearable
  async connectDevice(req, res) {
    try {
      // La validación ya se realizó en el middleware
      // Verificar si ya tiene un dispositivo conectado
      let wearable = await Wearable.findOne({ userId: req.userId });

      if (wearable) {
        return res.status(400).json({
          error: 'Ya tienes un dispositivo conectado. Desconecta el actual primero.'
        });
      }

      // Crear nueva conexión
      wearable = new Wearable({
        userId: req.userId,
        device: req.body.device,
        connection: {
          isConnected: true,
          lastSync: new Date()
        },
        settings: req.body.settings
      });

      await wearable.save();

      // Otorgar logro de dispositivo conectado
      await GamificationService.grantAchievement(req.userId, 'wearable_connected');

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.status(201).json({
        message: 'Dispositivo conectado exitosamente',
        wearable: {
          id: wearable._id,
          device: wearable.device,
          connection: wearable.connection,
          settings: wearable.settings
        }
      });
    } catch (error) {
      console.error('Error conectando dispositivo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Desconectar dispositivo
  async disconnectDevice(req, res) {
    try {
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      wearable.connection.isConnected = false;
      wearable.connection.signalStrength = 0;
      await wearable.save();

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.json({ message: 'Dispositivo desconectado exitosamente' });
    } catch (error) {
      console.error('Error desconectando dispositivo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estado del dispositivo
  async getDeviceStatus(req, res) {
    try {
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      res.json({
        wearable: {
          id: wearable._id,
          device: wearable.device,
          connection: wearable.connection,
          battery: wearable.battery,
          isActive: wearable.isActive,
          stepsProgress: wearable.stepsProgress,
          lastHealthCheck: wearable.lastHealthCheck
        }
      });
    } catch (error) {
      console.error('Error obteniendo estado del dispositivo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Sincronizar datos del dispositivo
  async syncDeviceData(req, res) {
    try {
      // La validación ya se realizó en el middleware
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      if (!wearable.connection.isConnected) {
        return res.status(400).json({ error: 'Dispositivo no conectado' });
      }

      // Sincronizar datos
      await wearable.syncData(req.body.sensorData);

      // Verificar metas diarias y logros
      await wearable.checkDailyGoals();
      await GamificationService.checkWearableAchievements(req.userId);

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.json({
        message: 'Datos sincronizados exitosamente',
        wearable: {
          id: wearable._id,
          sensors: wearable.sensors,
          battery: wearable.battery,
          gamification: wearable.gamification,
          lastSync: wearable.connection.lastSync
        }
      });
    } catch (error) {
      console.error('Error sincronizando datos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Actualizar configuración del dispositivo
  async updateDeviceSettings(req, res) {
    try {
      // La validación ya se realizó en el middleware
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      // Actualizar configuración
      if (req.body.notifications) {
        Object.assign(wearable.notifications, req.body.notifications);
      }

      if (req.body.gamification) {
        Object.assign(wearable.gamification, req.body.gamification);
      }

      if (req.body.dataRetention) {
        Object.assign(wearable.dataRetention, req.body.dataRetention);
      }

      await wearable.save();

      // Limpiar caché de optimizaciones
      OptimizationService.clearCache(req.userId);

      res.json({
        message: 'Configuración actualizada exitosamente',
        settings: {
          notifications: wearable.notifications,
          gamification: wearable.gamification,
          dataRetention: wearable.dataRetention
        }
      });
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Resetear contadores diarios
  async resetDailyCounters(req, res) {
    try {
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      await wearable.resetDailyCounters();

      res.json({
        message: 'Contadores diarios reseteados',
        wearable: {
          id: wearable._id,
          sensors: {
            steps: wearable.sensors.steps,
            calories: wearable.sensors.calories,
            sleep: wearable.sensors.sleep
          },
          gamification: wearable.gamification
        }
      });
    } catch (error) {
      console.error('Error reseteando contadores:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener historial de datos
  async getDataHistory(req, res) {
    try {
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      const days = parseInt(req.query.days) || 7;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      // En un caso real, tendríamos una colección separada para historial
      // Por ahora, retornamos datos básicos
      const history = {
        period: {
          start: startDate,
          end: endDate,
          days: days
        },
        summary: {
          avgHeartRate: wearable.sensors.heartRate.readings.length > 0
            ? wearable.sensors.heartRate.readings.reduce((sum, reading) => sum + reading.value, 0) / wearable.sensors.heartRate.readings.length
            : 0,
          totalSteps: wearable.sensors.steps.current,
          totalCalories: wearable.sensors.calories.current,
          sleepQuality: wearable.sensors.sleep.lastNight?.quality || 0
        },
        recentReadings: wearable.sensors.heartRate.readings.slice(-10) // Últimas 10 lecturas
      };

      res.json({ history });
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener logros relacionados con wearable
  async getWearableAchievements(req, res) {
    try {
      const wearable = await Wearable.findOne({ userId: req.userId });

      if (!wearable) {
        return res.status(404).json({ error: 'No se encontró dispositivo conectado' });
      }

      res.json({
        wearableAchievements: wearable.gamification.achievements,
        rewards: wearable.gamification.rewards
      });
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener estadísticas de dispositivos (solo administradores)
  async getWearableStats(req, res) {
    try {
      const stats = await Wearable.getWearableStats();

      res.json({ wearableStats: stats });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // Obtener dispositivos conectados (solo administradores)
  async getConnectedDevices(req, res) {
    try {
      const devices = await Wearable.getConnectedDevices();

      res.json({ connectedDevices: devices });
    } catch (error) {
      console.error('Error obteniendo dispositivos conectados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new WearableController();