const express = require('express');
const router = express.Router();
const { getPredictions, triggerAnalysis } = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:pumpId', protect, getPredictions);
router.post('/:pumpId/analyze', protect, triggerAnalysis);

module.exports = router;
