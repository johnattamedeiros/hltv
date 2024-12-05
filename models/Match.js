const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Match = sequelize.define('Match', {
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

module.exports = Match;
