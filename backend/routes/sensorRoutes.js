const express = require('express');
const router = express.Router();
const { ingestSensorData, getSensorData, getLatestSensorData, getSensorHistory } = require('../controllers/sensorController');
const { protect } = require('../middleware/authMiddleware');

// Data ingestion (from ESP32 or simulator - no auth required for IoT devices)
router.post('/data', ingestSensorData);

// Data retrieval (requires authentication)
router.get('/data/:pumpId', protect, getSensorData);
router.get('/data/:pumpId/latest', protect, getLatestSensorData);
router.get('/data/:pumpId/history', protect, getSensorHistory);

module.exports = router;
