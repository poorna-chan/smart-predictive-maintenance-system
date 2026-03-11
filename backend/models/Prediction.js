// Prediction model - stores ML-based pump health predictions
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Prediction = sequelize.define('Prediction', {
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
  healthScore: {
    type: DataTypes.FLOAT,
    comment: 'Health score 0-100 (100 = perfect health)'
  },
  predictedFault: {
    type: DataTypes.STRING(100),
    comment: 'Predicted fault type'
  },
  severity: {
    type: DataTypes.ENUM('none', 'low', 'medium', 'high', 'critical'),
    defaultValue: 'none'
  },
  recommendedAction: {
    type: DataTypes.TEXT,
    comment: 'Recommended maintenance action'
  },
  estimatedTimeToFailure: {
    type: DataTypes.STRING(100),
    comment: 'Estimated time before failure occurs'
  }
}, {
  tableName: 'predictions',
  timestamps: true,
  updatedAt: false
});

module.exports = Prediction;
