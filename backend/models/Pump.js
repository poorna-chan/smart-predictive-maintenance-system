// Pump model - stores agricultural water pump information
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Pump = sequelize.define('Pump', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('normal', 'warning', 'critical'),
    defaultValue: 'normal'
  },
  isRunning: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'pumps',
  timestamps: true
});

module.exports = Pump;
