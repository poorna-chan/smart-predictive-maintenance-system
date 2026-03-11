// Main server entry point - Express + Socket.IO for Smart Predictive Maintenance System
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const pumpRoutes = require('./routes/pumpRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

// Import Sequelize models to register associations
const User = require('./models/User');
const Pump = require('./models/Pump');
const SensorData = require('./models/SensorData');
const Alert = require('./models/Alert');
const Prediction = require('./models/Prediction');

// Set up model associations
User.hasMany(Pump, { foreignKey: 'userId', as: 'pumps' });
Pump.belongsTo(User, { foreignKey: 'userId', as: 'owner' });
Pump.hasMany(SensorData, { foreignKey: 'pumpId', as: 'sensorData' });
SensorData.belongsTo(Pump, { foreignKey: 'pumpId', as: 'pump' });
Pump.hasMany(Alert, { foreignKey: 'pumpId', as: 'alerts' });
Alert.belongsTo(Pump, { foreignKey: 'pumpId', as: 'pump' });
Pump.hasMany(Prediction, { foreignKey: 'pumpId', as: 'predictions' });
Prediction.belongsTo(Pump, { foreignKey: 'pumpId', as: 'pump' });

const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/pumps', pumpRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/predictions', predictionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), message: 'Smart Pump Maintenance API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Client can request to join a specific pump room
  socket.on('join_pump', (pumpId) => {
    socket.join(`pump_${pumpId}`);
    console.log(`Socket ${socket.id} joined pump_${pumpId}`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Start sensor simulator after DB is ready
  const { startSimulator } = require('./utils/sensorSimulator');
  startSimulator(io);

  server.listen(PORT, () => {
    console.log(`\n🚀 Smart Pump Maintenance Server running on port ${PORT}`);
    console.log(`📊 API: http://localhost:${PORT}/api/health`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
  });
};

startServer();
