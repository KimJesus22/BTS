const request = require('supertest');
const { sequelize } = require('../config/database');
const app = require('../server');
const Member = require('../models/Member');

describe('MembersController', () => {
  beforeAll(async () => {
    // Conectar a base de datos de test
    await sequelize.authenticate();
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await sequelize.drop();
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar tabla antes de cada test
    await Member.destroy({ where: {}, truncate: true });
  });

  describe('GET /api/members', () => {
    it('debería retornar lista de miembros con paginación', async () => {
      // Crear miembros de prueba
      const membersData = [
        { id: 1, name: 'RM', real_name: 'Kim Nam-joon', role: 'Leader, Rapper', biography_es: 'Bio RM', biography_en: 'RM Bio' },
        { id: 2, name: 'Jin', real_name: 'Kim Seok-jin', role: 'Vocalist, Visual', biography_es: 'Bio Jin', biography_en: 'Jin Bio' }
      ];

      await Member.bulkCreate(membersData);

      const response = await request(app)
        .get('/api/members')
        .expect(200);

      expect(response.body.members).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalMembers).toBe(2);
    });

    it('debería filtrar miembros por rol', async () => {
      await Member.bulkCreate([
        { id: 1, name: 'RM', real_name: 'Kim Nam-joon', role: 'Leader, Rapper', biography_es: 'Bio RM', biography_en: 'RM Bio' },
        { id: 2, name: 'Jin', real_name: 'Kim Seok-jin', role: 'Vocalist, Visual', biography_es: 'Bio Jin', biography_en: 'Jin Bio' }
      ]);

      const response = await request(app)
        .get('/api/members?role=Rapper')
        .expect(200);

      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].name).toBe('RM');
    });

    it('debería buscar miembros por nombre', async () => {
      await Member.bulkCreate([
        { id: 1, name: 'RM', real_name: 'Kim Nam-joon', role: 'Leader, Rapper', biography_es: 'Bio RM', biography_en: 'RM Bio' },
        { id: 2, name: 'Jin', real_name: 'Kim Seok-jin', role: 'Vocalist, Visual', biography_es: 'Bio Jin', biography_en: 'Jin Bio' }
      ]);

      const response = await request(app)
        .get('/api/members?search=jin')
        .expect(200);

      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].name).toBe('Jin');
    });
  });

  describe('GET /api/members/:id', () => {
    it('debería retornar un miembro específico', async () => {
      const memberData = {
        id: 1,
        name: 'RM',
        real_name: 'Kim Nam-joon',
        role: 'Leader, Rapper',
        biography_es: 'Biografía de RM',
        biography_en: 'RM biography'
      };

      await Member.create(memberData);

      const response = await request(app)
        .get('/api/members/1')
        .expect(200);

      expect(response.body.name).toBe('RM');
      expect(response.body.real_name).toBe('Kim Nam-joon');
    });

    it('debería retornar 404 para miembro no encontrado', async () => {
      const response = await request(app)
        .get('/api/members/999')
        .expect(404);

      expect(response.body.error).toBe('Miembro no encontrado');
    });

    it('debería validar ID inválido', async () => {
      const response = await request(app)
        .get('/api/members/invalid')
        .expect(400);

      expect(response.body.error).toContain('ID de miembro inválido');
    });
  });

  describe('GET /api/members/popular', () => {
    it('debería retornar miembros populares', async () => {
      await Member.bulkCreate([
        { id: 1, name: 'RM', real_name: 'Kim Nam-joon', role: 'Leader, Rapper', biography_es: 'Bio RM', biography_en: 'RM Bio', followers: 100, likes: 50, views: 200 },
        { id: 2, name: 'Jin', real_name: 'Kim Seok-jin', role: 'Vocalist, Visual', biography_es: 'Bio Jin', biography_en: 'Jin Bio', followers: 80, likes: 60, views: 150 }
      ]);

      const response = await request(app)
        .get('/api/members/popular')
        .expect(200);

      expect(response.body.popularMembers).toHaveLength(2);
      expect(response.body.popularMembers[0].name).toBe('RM'); // Mayor cantidad de followers
    });
  });

  describe('GET /api/members/stats', () => {
    it('debería retornar estadísticas generales', async () => {
      await Member.bulkCreate([
        { id: 1, name: 'RM', real_name: 'Kim Nam-joon', role: 'Leader, Rapper', biography_es: 'Bio RM', biography_en: 'RM Bio', followers: 100, likes: 50, views: 200 },
        { id: 2, name: 'Jin', real_name: 'Kim Seok-jin', role: 'Vocalist, Visual', biography_es: 'Bio Jin', biography_en: 'Jin Bio', followers: 80, likes: 60, views: 150 }
      ]);

      const response = await request(app)
        .get('/api/members/stats')
        .expect(200);

      expect(response.body.totalMembers).toBe(2);
      expect(response.body.totalFollowers).toBe(180);
      expect(response.body.totalLikes).toBe(110);
    });
  });
});