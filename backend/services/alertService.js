// Alert generation service - creates alerts when sensor thresholds are exceeded
const Alert = require('../models/Alert');

// Threshold definitions for each sensor parameter
const THRESHOLDS = {
  temperature: {
    warning: { min: null, max: 80 },
    critical: { min: null, max: 95 }
  },
  vibration: {
    warning: { min: null, max: 4.5 },
    critical: { min: null, max: 7.0 }
  },
  voltage: {
    warning: { min: 200, max: 250 },
    critical: { min: 180, max: 260 }
  },
  current: {
    warning: { min: null, max: 15 },
    critical: { min: null, max: 20 }
  },
  waterFlow: {
    warning: { min: 5, max: null },
    critical: { min: 1, max: null }
  }
};

// Descriptive messages for each alert type and severity
const getAlertMessage = (type, value, severity, pump) => {
  const messages = {
    temperature: `Pump "${pump.name}" temperature is ${value}°C — ${severity === 'critical' ? 'CRITICAL: Immediate shutdown recommended!' : 'Warning: Check cooling system.'}`,
    vibration: `Pump "${pump.name}" vibration is ${value} mm/s — ${severity === 'critical' ? 'CRITICAL: Possible bearing failure!' : 'Warning: Inspect bearings.'}`,
    voltage: `Pump "${pump.name}" voltage is ${value}V — ${severity === 'critical' ? 'CRITICAL: Severe voltage anomaly!' : 'Warning: Check electrical supply.'}`,
    current: `Pump "${pump.name}" current is ${value}A — ${severity === 'critical' ? 'CRITICAL: Motor overload!' : 'Warning: Check motor load.'}`,
    waterFlow: `Pump "${pump.name}" water flow is ${value} L/min — ${severity === 'critical' ? 'CRITICAL: Dry run detected!' : 'Warning: Low water flow detected.'}`
  };
  return messages[type] || `Pump "${pump.name}" ${type} anomaly detected.`;
};

// Check sensor values and generate alerts if thresholds are exceeded
const generateAlerts = async (pumpId, sensorValues, pump, io) => {
  const newAlerts = [];

  for (const [type, value] of Object.entries(sensorValues)) {
    if (value === undefined || value === null) continue;
    const thresholds = THRESHOLDS[type];
    if (!thresholds) continue;

    let severity = null;

    // Check critical first, then warning
    const crit = thresholds.critical;
    const warn = thresholds.warning;

    if (
      (crit.max !== null && value > crit.max) ||
      (crit.min !== null && value < crit.min)
    ) {
      severity = 'critical';
    } else if (
      (warn.max !== null && value > warn.max) ||
      (warn.min !== null && value < warn.min)
    ) {
      severity = 'warning';
    }

    if (severity) {
      const message = getAlertMessage(type, value, severity, pump);

      // Avoid duplicate alerts within the last 5 minutes
      const { Op } = require('sequelize');
      const recentAlert = await Alert.findOne({
        where: {
          pumpId,
          type,
          severity,
          createdAt: { [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) }
        }
      });

      if (!recentAlert) {
        const alert = await Alert.create({ pumpId, type, severity, message });
        newAlerts.push(alert);

        // Emit alert via Socket.IO for real-time notifications
        if (io) {
          io.emit('new_alert', { ...alert.toJSON(), pumpName: pump.name });
        }
      }
    }
  }

  return newAlerts;
};

module.exports = { generateAlerts, THRESHOLDS };
