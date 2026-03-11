// Sensor controller - handles sensor data ingestion and retrieval
const { Op } = require('sequelize');
const SensorData = require('../models/SensorData');
const Pump = require('../models/Pump');
const { generateAlerts } = require('../services/alertService');
const { analyzePump } = require('../services/predictionService');

// Ingest new sensor data (from ESP32 or simulator)
const ingestSensorData = async (req, res) => {
  try {
    const { pumpId, temperature, vibration, voltage, current, waterFlow } = req.body;

    if (!pumpId) {
      return res.status(400).json({ message: 'pumpId is required' });
    }

    // Verify pump exists
    const pump = await Pump.findByPk(pumpId);
    if (!pump) return res.status(404).json({ message: 'Pump not found' });

    // Store sensor reading
    const sensorData = await SensorData.create({
      pumpId,
      temperature,
      vibration,
      voltage,
      current,
      waterFlow,
      timestamp: new Date()
    });

    // Generate alerts based on thresholds
    await generateAlerts(pumpId, { temperature, vibration, voltage, current, waterFlow }, pump, req.app.get('io'));

    // Update pump status based on sensor data
    const status = determinePumpStatus({ temperature, vibration, voltage, current, waterFlow });
    await pump.update({ status });

    // Emit real-time sensor data via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('sensor_data', { ...sensorData.toJSON(), pumpStatus: status });
    }

    res.status(201).json(sensorData);
  } catch (error) {
    console.error('Ingest sensor data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Determine pump status based on thresholds
const determinePumpStatus = ({ temperature, vibration, voltage, current, waterFlow }) => {
  // Critical conditions
  if (
    temperature > 95 ||
    vibration > 7.0 ||
    voltage < 180 || voltage > 260 ||
    current > 20 ||
    waterFlow < 1
  ) return 'critical';

  // Warning conditions
  if (
    temperature > 80 ||
    vibration > 4.5 ||
    voltage < 200 || voltage > 250 ||
    current > 15 ||
    waterFlow < 5
  ) return 'warning';

  return 'normal';
};

// Get sensor data for a specific pump (with pagination)
const getSensorData = async (req, res) => {
  try {
    const { pumpId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const data = await SensorData.findAll({
      where: { pumpId },
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get the latest sensor reading for a pump
const getLatestSensorData = async (req, res) => {
  try {
    const { pumpId } = req.params;
    const data = await SensorData.findOne({
      where: { pumpId },
      order: [['timestamp', 'DESC']]
    });
    if (!data) return res.status(404).json({ message: 'No sensor data found for this pump' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get historical sensor data with optional date filtering
const getSensorHistory = async (req, res) => {
  try {
    const { pumpId } = req.params;
    const { startDate, endDate, view = 'daily' } = req.query;

    // Build date filter
    const where = { pumpId };
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    } else {
      // Default: last 7 days
      where.timestamp = { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }

    const data = await SensorData.findAll({
      where,
      order: [['timestamp', 'ASC']],
      limit: 1000
    });

    res.json(data);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { ingestSensorData, getSensorData, getLatestSensorData, getSensorHistory };
