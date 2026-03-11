// Prediction controller - triggers and retrieves ML-based health predictions
const Prediction = require('../models/Prediction');
const SensorData = require('../models/SensorData');
const { analyzePump } = require('../services/predictionService');

// Get predictions for a pump
const getPredictions = async (req, res) => {
  try {
    const { pumpId } = req.params;
    const predictions = await Prediction.findAll({
      where: { pumpId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Trigger a new prediction analysis for a pump
const triggerAnalysis = async (req, res) => {
  try {
    const { pumpId } = req.params;

    // Fetch recent sensor data for analysis
    const recentData = await SensorData.findAll({
      where: { pumpId },
      order: [['timestamp', 'DESC']],
      limit: 50
    });

    if (recentData.length === 0) {
      return res.status(404).json({ message: 'No sensor data available for analysis' });
    }

    // Run prediction analysis
    const prediction = await analyzePump(pumpId, recentData);

    // Emit prediction via Socket.IO if available
    const io = req.app.get('io');
    if (io) {
      io.emit('prediction_update', { pumpId: parseInt(pumpId), prediction });
    }

    res.json(prediction);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPredictions, triggerAnalysis };
