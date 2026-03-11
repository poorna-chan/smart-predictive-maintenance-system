const express = require('express');
const router = express.Router();
const { getAllPumps, createPump, getPumpById, updatePump, deletePump, controlPump } = require('../controllers/pumpController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getAllPumps);
router.post('/', protect, createPump);
router.get('/:id', protect, getPumpById);
router.put('/:id', protect, updatePump);
router.delete('/:id', protect, adminOnly, deletePump);
router.post('/:id/control', protect, controlPump);

module.exports = router;
