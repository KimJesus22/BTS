const { sequelize } = require('../config/database');
const Member = require('../models/Member');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Leer datos de db.json
    const dbPath = path.join(__dirname, '..', 'db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Insertar miembros
    for (const memberData of dbData.members) {
      const member = {
        id: memberData.id,
        name: memberData.name,
        real_name: memberData.real_name,
        role: memberData.role,
        biography_es: memberData.biography.es,
        biography_en: memberData.biography.en,
        birth_date: new Date('1994-09-12'), // Fecha de nacimiento de RM como ejemplo
        birth_place: 'Seoul, South Korea', // Lugar de nacimiento como ejemplo
        followers: Math.floor(Math.random() * 50000000) + 10000000,
        likes: Math.floor(Math.random() * 100000000) + 50000000,
        views: Math.floor(Math.random() * 200000000) + 100000000,
        achievements: [
          {
            title: 'Debut',
            year: 2013,
            description: 'Debut oficial con BTS'
          }
        ]
      };

      await Member.upsert(member);
      console.log(`✅ Miembro ${member.name} insertado/actualizado`);
    }

    console.log('🎉 Seeding completado exitosamente!');
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar seeding si se llama directamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;