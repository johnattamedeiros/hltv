const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Message = sequelize.define('message', {
  code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
});

module.exports = Message;
