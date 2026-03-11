// Pump controller - handles CRUD operations and remote control for pumps
const Pump = require('../models/Pump');
const SensorData = require('../models/SensorData');

// Get all pumps (admin sees all, farmer sees their pumps)
const getAllPumps = async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const pumps = await Pump.findAll({ where });
    res.json(pumps);
  } catch (error) {
    console.error('Get pumps error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new pump
const createPump = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: 'Name and location are required' });
    }
    const pump = await Pump.create({
      name,
      location,
      userId: req.user.id,
      status: 'normal',
      isRunning: false
    });
    res.status(201).json(pump);
  } catch (error) {
    console.error('Create pump error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single pump by ID
const getPumpById = async (req, res) => {
  try {
    const pump = await Pump.findByPk(req.params.id);
    if (!pump) return res.status(404).json({ message: 'Pump not found' });
    res.json(pump);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update pump info
const updatePump = async (req, res) => {
  try {
    const pump = await Pump.findByPk(req.params.id);
    if (!pump) return res.status(404).json({ message: 'Pump not found' });

    const { name, location } = req.body;
    await pump.update({ name: name || pump.name, location: location || pump.location });
    res.json(pump);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a pump
const deletePump = async (req, res) => {
  try {
    const pump = await Pump.findByPk(req.params.id);
    if (!pump) return res.status(404).json({ message: 'Pump not found' });
    await pump.destroy();
    res.json({ message: 'Pump deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Control pump ON/OFF (simulated relay command)
const controlPump = async (req, res) => {
  try {
    const pump = await Pump.findByPk(req.params.id);
    if (!pump) return res.status(404).json({ message: 'Pump not found' });

    const { command } = req.body; // 'on' or 'off'
    if (!['on', 'off'].includes(command)) {
      return res.status(400).json({ message: 'Command must be "on" or "off"' });
    }

    const isRunning = command === 'on';
    await pump.update({ isRunning });

    // Emit real-time update via Socket.IO (attached to req.app)
    const io = req.app.get('io');
    if (io) {
      io.emit('pump_control', { pumpId: pump.id, isRunning, timestamp: new Date() });
    }

    res.json({ message: `Pump ${command.toUpperCase()} command sent`, pump });
  } catch (error) {
    console.error('Control pump error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllPumps, createPump, getPumpById, updatePump, deletePump, controlPump };
