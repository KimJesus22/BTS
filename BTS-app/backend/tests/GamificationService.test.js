const GamificationService = require('../services/GamificationService');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('GamificationService', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bts-test');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('addExperience', () => {
    it('debería agregar experiencia y subir de nivel', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          level: 1,
          experience: 0
        }
      });

      const result = await GamificationService.addExperience(user._id, 1500);

      expect(result.newLevel).toBe(2);
      expect(result.leveledUp).toBe(true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.level).toBe(2);
      expect(updatedUser.gamification.experience).toBe(1500);
    });

    it('debería agregar experiencia sin subir de nivel', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          level: 1,
          experience: 500
        }
      });

      const result = await GamificationService.addExperience(user._id, 200);

      expect(result.newLevel).toBe(1);
      expect(result.leveledUp).toBe(false);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.experience).toBe(700);
    });
  });

  describe('grantAchievement', () => {
    it('debería otorgar logro por primera vez', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });

      const result = await GamificationService.grantAchievement(user._id, 'first_login');

      expect(result.achievement.title).toBe('Primeros Pasos');
      expect(result.completed).toBe(true);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.achievements).toHaveLength(1);
      expect(updatedUser.gamification.achievements[0].badgeId).toBe('first_login');
    });

    it('debería rechazar logro ya completado', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          achievements: [{
            badgeId: 'first_login',
            earnedAt: new Date(),
            progress: 100
          }]
        }
      });

      const result = await GamificationService.grantAchievement(user._id, 'first_login');

      expect(result.alreadyGranted).toBe(true);
    });
  });

  describe('updateStreak', () => {
    it('debería iniciar racha para nuevo usuario', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password'
      });

      await GamificationService.updateStreak(user);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.streak.current).toBe(1);
      expect(updatedUser.gamification.streak.longest).toBe(1);
    });

    it('debería continuar racha en día consecutivo', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          streak: {
            current: 5,
            longest: 5,
            lastActivity: yesterday
          }
        }
      });

      await GamificationService.updateStreak(user);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.streak.current).toBe(6);
      expect(updatedUser.gamification.streak.longest).toBe(6);
    });

    it('debería resetear racha después de día perdido', async () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          streak: {
            current: 5,
            longest: 7,
            lastActivity: twoDaysAgo
          }
        }
      });

      await GamificationService.updateStreak(user);

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.streak.current).toBe(1);
      expect(updatedUser.gamification.streak.longest).toBe(7); // No cambia
    });
  });

  describe('checkStreakAchievements', () => {
    it('debería otorgar logro de racha de 7 días', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          streak: {
            current: 7
          }
        }
      });

      await GamificationService.checkStreakAchievements(user);

      const updatedUser = await User.findById(user._id);
      const streakAchievement = updatedUser.gamification.achievements.find(
        a => a.badgeId === 'streak_7'
      );
      expect(streakAchievement).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    beforeEach(async () => {
      await User.insertMany([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password',
          gamification: { level: 5, experience: 5000 }
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password',
          gamification: { level: 3, experience: 3000 }
        },
        {
          username: 'user3',
          email: 'user3@example.com',
          password: 'password',
          gamification: { level: 7, experience: 7000 }
        }
      ]);
    });

    it('debería retornar leaderboard por experiencia', async () => {
      const leaderboard = await GamificationService.getLeaderboard('experience', 2);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].username).toBe('user3');
      expect(leaderboard[1].username).toBe('user1');
    });

    it('debería retornar leaderboard por nivel', async () => {
      const leaderboard = await GamificationService.getLeaderboard('level', 2);

      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0].username).toBe('user3');
      expect(leaderboard[1].username).toBe('user1');
    });
  });

  describe('getGamificationStats', () => {
    beforeEach(async () => {
      await User.insertMany([
        {
          username: 'user1',
          email: 'user1@example.com',
          password: 'password',
          gamification: { level: 5, experience: 5000, achievements: [{ badgeId: 'test' }] }
        },
        {
          username: 'user2',
          email: 'user2@example.com',
          password: 'password',
          gamification: { level: 3, experience: 3000, achievements: [{ badgeId: 'test' }] }
        }
      ]);
    });

    it('debería calcular estadísticas generales', async () => {
      const stats = await GamificationService.getGamificationStats();

      expect(stats.totalUsers).toBe(2);
      expect(stats.avgLevel).toBe(4);
      expect(stats.avgExperience).toBe(4000);
      expect(stats.totalAchievements).toBe(2);
    });
  });

  describe('getAvailableAchievements', () => {
    it('debería retornar lista de logros disponibles', () => {
      const achievements = GamificationService.getAvailableAchievements();

      expect(Array.isArray(achievements)).toBe(true);
      expect(achievements.length).toBeGreaterThan(0);

      const firstLogin = achievements.find(a => a.id === 'first_login');
      expect(firstLogin).toBeDefined();
      expect(firstLogin.title).toBe('Primeros Pasos');
    });
  });

  describe('resetUserProgress', () => {
    it('debería resetear progreso de gamificación', async () => {
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        gamification: {
          level: 5,
          experience: 5000,
          achievements: [{ badgeId: 'first_login', earnedAt: new Date() }]
        }
      });

      const result = await GamificationService.resetUserProgress(user._id);

      expect(result.message).toBe('Progreso reseteado exitosamente');

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.gamification.level).toBe(1);
      expect(updatedUser.gamification.experience).toBe(0);
      expect(updatedUser.gamification.achievements).toHaveLength(0);
    });
  });
});