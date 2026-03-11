// Database seeder - creates initial admin user, sample pumps, and sensor data
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('../config/db');
const User = require('../models/User');
const Pump = require('../models/Pump');
const SensorData = require('../models/SensorData');
const Alert = require('../models/Alert');
const Prediction = require('../models/Prediction');

const seedDatabase = async () => {
  await connectDB();
  console.log('Seeding database...');

  // Clear existing data (in correct order for FK constraints)
  await Prediction.destroy({ where: {} });
  await Alert.destroy({ where: {} });
  await SensorData.destroy({ where: {} });
  await Pump.destroy({ where: {} });
  await User.destroy({ where: {} });

  // Create admin user
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@pumpsystem.com',
    password: adminPassword,
    role: 'admin'
  });
  console.log('Admin user created: admin@pumpsystem.com / admin123');

  // Create farmer user
  const farmerPassword = await bcrypt.hash('farmer123', salt);
  const farmer = await User.create({
    name: 'John Farmer',
    email: 'farmer@pumpsystem.com',
    password: farmerPassword,
    role: 'farmer'
  });
  console.log('Farmer user created: farmer@pumpsystem.com / farmer123');

  // Create 3 sample pumps
  const pumpData = [
    { name: 'Main Irrigation Pump', location: 'North Field - Zone A', userId: admin.id },
    { name: 'Secondary Pump Unit', location: 'South Field - Zone B', userId: farmer.id },
    { name: 'Booster Pump Station', location: 'Central Reservoir', userId: admin.id }
  ];
  const pumps = await Pump.bulkCreate(pumpData);
  console.log(`${pumps.length} pumps created.`);

  // Generate 7 days of historical sensor data (hourly readings)
  const now = new Date();
  const sensorReadings = [];

  for (const pump of pumps) {
    for (let day = 6; day >= 0; day--) {
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);

        // Inject an anomaly on day 2 for the first pump
        const isAnomaly = pump.id === pumps[0].id && day === 2 && hour >= 10 && hour <= 14;

        sensorReadings.push({
          pumpId: pump.id,
          temperature: parseFloat((isAnomaly ? 85 + Math.random() * 5 : 40 + Math.random() * 15).toFixed(2)),
          vibration: parseFloat((isAnomaly ? 5 + Math.random() * 1.5 : 1.5 + Math.random() * 1.5).toFixed(2)),
          voltage: parseFloat((215 + Math.random() * 15).toFixed(2)),
          current: parseFloat((7 + Math.random() * 3).toFixed(2)),
          waterFlow: parseFloat((isAnomaly ? 2 + Math.random() * 2 : 20 + Math.random() * 15).toFixed(2)),
          timestamp
        });
      }
    }
  }

  await SensorData.bulkCreate(sensorReadings);
  console.log(`${sensorReadings.length} sensor readings created.`);

  // Create sample alerts
  await Alert.bulkCreate([
    {
      pumpId: pumps[0].id,
      type: 'temperature',
      severity: 'warning',
      message: `Pump "Main Irrigation Pump" temperature reached 82°C — Warning: Check cooling system.`,
      isAcknowledged: true,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      pumpId: pumps[0].id,
      type: 'vibration',
      severity: 'critical',
      message: `Pump "Main Irrigation Pump" vibration is 6.2 mm/s — CRITICAL: Possible bearing failure!`,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      pumpId: pumps[1].id,
      type: 'waterFlow',
      severity: 'warning',
      message: `Pump "Secondary Pump Unit" water flow is 3.5 L/min — Warning: Low water flow detected.`,
      isAcknowledged: false,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000)
    }
  ]);
  console.log('Sample alerts created.');

  // Update pump statuses
  await pumps[0].update({ status: 'warning', isRunning: true });
  await pumps[1].update({ status: 'normal', isRunning: true });
  await pumps[2].update({ status: 'normal', isRunning: false });

  console.log('\nDatabase seeding completed successfully!');
  console.log('Login credentials:');
  console.log('  Admin: admin@pumpsystem.com / admin123');
  console.log('  Farmer: farmer@pumpsystem.com / farmer123');

  await sequelize.close();
  process.exit(0);
};

seedDatabase().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
