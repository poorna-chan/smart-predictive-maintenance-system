// Sensor simulator - generates realistic IoT sensor data for demo/testing
// Simulates multiple pumps with random variations and occasional fault conditions
const SensorData = require('../models/SensorData');
const Pump = require('../models/Pump');
const { generateAlerts } = require('../services/alertService');
const { analyzePump } = require('../services/predictionService');

// Simulation configuration
const SIMULATION_INTERVAL_MS = 5000; // Send data every 5 seconds
let simulatorInterval = null;

// Base values for each pump (realistic agricultural pump parameters)
const BASE_VALUES = {
  temperature: 45,   // °C
  vibration: 2.0,    // mm/s
  voltage: 220,      // V
  current: 8,        // A
  waterFlow: 25      // L/min
};

// Add random variation within given range
const randomVariation = (base, range) => {
  return base + (Math.random() * 2 - 1) * range;
};

// Simulate an occasional anomaly (10% chance per reading)
const simulateAnomaly = (values, pumpIndex) => {
  const anomalyChance = Math.random();

  if (anomalyChance < 0.05) {
    // Temperature spike (motor overheating)
    values.temperature = randomVariation(88, 5);
  } else if (anomalyChance < 0.08) {
    // Vibration spike (bearing issue)
    values.vibration = randomVariation(5.5, 1.5);
  } else if (anomalyChance < 0.10) {
    // Low water flow (dry run risk)
    values.waterFlow = randomVariation(3, 1);
  } else if (anomalyChance < 0.12) {
    // Voltage fluctuation
    values.voltage = randomVariation(175, 10);
  }

  return values;
};

// Generate a single sensor reading for a pump
const generateSensorReading = (pumpId, pumpIndex = 0) => {
  // Slight base offset per pump for variety
  const offset = pumpIndex * 3;

  let values = {
    pumpId,
    temperature: randomVariation(BASE_VALUES.temperature + offset, 8),
    vibration: randomVariation(BASE_VALUES.vibration, 0.5),
    voltage: randomVariation(BASE_VALUES.voltage, 5),
    current: randomVariation(BASE_VALUES.current + offset * 0.5, 1.5),
    waterFlow: randomVariation(BASE_VALUES.waterFlow - offset, 5)
  };

  // Round values to 2 decimal places
  Object.keys(values).forEach(key => {
    if (typeof values[key] === 'number') {
      values[key] = parseFloat(values[key].toFixed(2));
    }
  });

  // Occasionally inject anomalies for realistic simulation
  values = simulateAnomaly(values, pumpIndex);

  return values;
};

// Start the sensor simulator
const startSimulator = (io) => {
  if (simulatorInterval) {
    console.log('Simulator already running.');
    return;
  }

  console.log(`Starting sensor simulator (interval: ${SIMULATION_INTERVAL_MS}ms)`);

  simulatorInterval = setInterval(async () => {
    try {
      // Get all pumps from database
      const pumps = await Pump.findAll();

      if (pumps.length === 0) {
        console.log('No pumps found. Waiting for pumps to be created...');
        return;
      }

      for (let i = 0; i < pumps.length; i++) {
        const pump = pumps[i];
        const reading = generateSensorReading(pump.id, i);

        // Store in database
        const sensorData = await SensorData.create({
          ...reading,
          timestamp: new Date()
        });

        // Generate alerts based on thresholds
        await generateAlerts(pump.id, reading, pump, io);

        // Determine pump status
        let status = 'normal';
        if (reading.temperature > 95 || reading.vibration > 7.0 || reading.voltage < 180 || reading.waterFlow < 1) {
          status = 'critical';
        } else if (reading.temperature > 80 || reading.vibration > 4.5 || reading.voltage < 200 || reading.waterFlow < 5) {
          status = 'warning';
        }
        await pump.update({ status });

        // Emit real-time sensor data via Socket.IO
        if (io) {
          io.emit('sensor_data', { ...sensorData.toJSON(), pumpStatus: status });
        }
      }

      // Run prediction analysis every 30 readings (~2.5 minutes)
      const count = await SensorData.count();
      if (count % 30 === 0) {
        for (const pump of pumps) {
          const recentData = await SensorData.findAll({
            where: { pumpId: pump.id },
            order: [['timestamp', 'DESC']],
            limit: 50
          });
          if (recentData.length >= 5) {
            const prediction = await analyzePump(pump.id, recentData);
            if (io) {
              io.emit('prediction_update', { pumpId: pump.id, prediction });
            }
          }
        }
      }
    } catch (error) {
      console.error('Simulator error:', error.message);
    }
  }, SIMULATION_INTERVAL_MS);

  console.log('Sensor simulator started successfully.');
};

// Stop the simulator
const stopSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log('Sensor simulator stopped.');
  }
};

module.exports = { startSimulator, stopSimulator, generateSensorReading };
