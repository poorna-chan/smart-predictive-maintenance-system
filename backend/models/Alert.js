// Alert model - stores system alerts generated from sensor anomalies
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pumpId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'pumps', key: 'id' }
  },
  type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Alert type: temperature, vibration, voltage, current, waterFlow'
  },
  severity: {
    type: DataTypes.ENUM('warning', 'critical'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isAcknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  updatedAt: false
});

module.exports = Alert;
