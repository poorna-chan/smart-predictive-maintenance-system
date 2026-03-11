// Alert controller - manages system alerts and notifications
const { Op } = require('sequelize');
const Alert = require('../models/Alert');
const Pump = require('../models/Pump');

// Get all alerts (admin) or alerts for user's pumps
const getAllAlerts = async (req, res) => {
  try {
    const { severity, startDate, endDate, acknowledged } = req.query;
    const where = {};

    if (severity) where.severity = severity;
    if (acknowledged !== undefined) where.isAcknowledged = acknowledged === 'true';
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const alerts = await Alert.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 200,
      include: [{ model: Pump, as: 'pump', attributes: ['name', 'location'] }]
    });
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get alerts for a specific pump
const getAlertsByPump = async (req, res) => {
  try {
    const { pumpId } = req.params;
    const { severity } = req.query;
    const where = { pumpId };
    if (severity) where.severity = severity;

    const alerts = await Alert.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Acknowledge an alert
const acknowledgeAlert = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ message: 'Alert not found' });

    await alert.update({ isAcknowledged: true });
    res.json({ message: 'Alert acknowledged', alert });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllAlerts, getAlertsByPump, acknowledgeAlert };
