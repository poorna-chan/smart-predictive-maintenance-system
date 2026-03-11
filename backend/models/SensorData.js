// SensorData model - stores IoT sensor readings from pumps
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SensorData = sequelize.define('SensorData', {
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
  temperature: {
    type: DataTypes.FLOAT,
    comment: 'Temperature in Celsius'
  },
  vibration: {
    type: DataTypes.FLOAT,
    comment: 'Vibration in mm/s'
  },
  voltage: {
    type: DataTypes.FLOAT,
    comment: 'Voltage in Volts'
  },
  current: {
    type: DataTypes.FLOAT,
    comment: 'Current in Amperes'
  },
  waterFlow: {
    type: DataTypes.FLOAT,
    comment: 'Water flow in L/min'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'sensor_data',
  timestamps: true,
  updatedAt: false
});

module.exports = SensorData;
