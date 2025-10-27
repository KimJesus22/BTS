const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bts_app',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'admin123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'postgres',
    storage: process.env.DB_STORAGE, // Para SQLite en tests
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: process.env.DB_DIALECT === 'sqlite' ? undefined : {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Connected successfully');

    // Sincronizar modelos con la base de datos
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized');
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, sequelize };