require('dotenv').config();
const { Sequelize } = require('sequelize');

// Conexão com o banco de dados
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
