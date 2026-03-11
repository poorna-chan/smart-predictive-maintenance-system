const express = require('express');
const router = express.Router();
const { getAllAlerts, getAlertsByPump, acknowledgeAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllAlerts);
router.get('/:pumpId', protect, getAlertsByPump);
router.put('/:id/acknowledge', protect, acknowledgeAlert);

module.exports = router;
