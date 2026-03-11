// Prediction service - rule-based + statistical ML engine for pump health analysis
const Prediction = require('../models/Prediction');

// Normal operating ranges for each parameter
const NORMAL_RANGES = {
  temperature: { min: 20, max: 75 },
  vibration: { min: 0, max: 4.0 },
  voltage: { min: 210, max: 240 },
  current: { min: 0, max: 12 },
  waterFlow: { min: 10, max: 100 }
};

// Calculate z-score to detect anomalies statistically
const calculateZScore = (values) => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return stdDev === 0 ? 0 : (values[values.length - 1] - mean) / stdDev;
};

// Calculate rolling average from recent readings
const rollingAverage = (values, window = 10) => {
  const recent = values.slice(-window);
  return recent.reduce((a, b) => a + b, 0) / recent.length;
};

// Analyze pump sensor history and return a health prediction
const analyzePump = async (pumpId, sensorReadings) => {
  // Extract arrays for each parameter
  const temps = sensorReadings.map(r => r.temperature).filter(v => v != null);
  const vibs = sensorReadings.map(r => r.vibration).filter(v => v != null);
  const volts = sensorReadings.map(r => r.voltage).filter(v => v != null);
  const currents = sensorReadings.map(r => r.current).filter(v => v != null);
  const flows = sensorReadings.map(r => r.waterFlow).filter(v => v != null);

  let healthScore = 100;
  const faults = [];

  // --- Temperature analysis: detect motor overheating ---
  if (temps.length > 0) {
    const avgTemp = rollingAverage(temps);
    const tempZScore = Math.abs(calculateZScore(temps));
    if (avgTemp > 90) {
      faults.push({ type: 'Motor Overheating', severity: 'critical', deduction: 35 });
    } else if (avgTemp > 80 || tempZScore > 2.5) {
      faults.push({ type: 'Motor Overheating', severity: 'high', deduction: 20 });
    } else if (avgTemp > 70 || tempZScore > 2.0) {
      faults.push({ type: 'High Temperature', severity: 'medium', deduction: 10 });
    }
  }

  // --- Vibration analysis: detect bearing failure ---
  if (vibs.length > 0) {
    const avgVib = rollingAverage(vibs);
    const vibZScore = Math.abs(calculateZScore(vibs));
    if (avgVib > 7.0) {
      faults.push({ type: 'Bearing Failure', severity: 'critical', deduction: 40 });
    } else if (avgVib > 4.5 || vibZScore > 2.5) {
      faults.push({ type: 'Bearing Wear', severity: 'high', deduction: 25 });
    } else if (avgVib > 3.5 || vibZScore > 2.0) {
      faults.push({ type: 'Vibration Anomaly', severity: 'medium', deduction: 12 });
    }
  }

  // --- Water flow analysis: detect dry run ---
  if (flows.length > 0) {
    const avgFlow = rollingAverage(flows);
    if (avgFlow < 1) {
      faults.push({ type: 'Dry Run', severity: 'critical', deduction: 45 });
    } else if (avgFlow < 5) {
      faults.push({ type: 'Low Flow / Dry Run Risk', severity: 'high', deduction: 25 });
    }
  }

  // --- Voltage analysis: detect voltage fluctuation ---
  if (volts.length > 0) {
    const avgVolt = rollingAverage(volts);
    const voltZScore = Math.abs(calculateZScore(volts));
    if (avgVolt < 180 || avgVolt > 260 || voltZScore > 3.0) {
      faults.push({ type: 'Voltage Fluctuation', severity: 'critical', deduction: 30 });
    } else if (avgVolt < 200 || avgVolt > 250 || voltZScore > 2.0) {
      faults.push({ type: 'Voltage Instability', severity: 'medium', deduction: 15 });
    }
  }

  // --- Current analysis: detect overload ---
  if (currents.length > 0) {
    const avgCurrent = rollingAverage(currents);
    if (avgCurrent > 20) {
      faults.push({ type: 'Current Overload', severity: 'critical', deduction: 35 });
    } else if (avgCurrent > 15) {
      faults.push({ type: 'High Current Draw', severity: 'high', deduction: 20 });
    }
  }

  // Apply deductions to health score
  for (const fault of faults) {
    healthScore -= fault.deduction;
  }
  healthScore = Math.max(0, Math.min(100, healthScore));

  // Determine primary fault (highest severity)
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
  faults.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
  const primaryFault = faults[0];

  // Estimate time to failure based on health score
  let estimatedTimeToFailure = 'No failure predicted';
  let overallSeverity = 'none';
  let recommendedAction = 'Continue regular monitoring. Schedule routine maintenance.';

  if (healthScore < 20) {
    estimatedTimeToFailure = 'Imminent (< 24 hours)';
    overallSeverity = 'critical';
    recommendedAction = 'IMMEDIATE ACTION REQUIRED: Shut down pump and schedule emergency maintenance.';
  } else if (healthScore < 40) {
    estimatedTimeToFailure = '1–3 days';
    overallSeverity = 'high';
    recommendedAction = 'Urgent maintenance needed. Inspect and service within 24 hours.';
  } else if (healthScore < 60) {
    estimatedTimeToFailure = '1–2 weeks';
    overallSeverity = 'medium';
    recommendedAction = 'Schedule maintenance within the week. Monitor closely.';
  } else if (healthScore < 80) {
    estimatedTimeToFailure = '2–4 weeks';
    overallSeverity = 'low';
    recommendedAction = 'Plan routine maintenance. Check specific fault indicators.';
  }

  // Save prediction to database
  const prediction = await Prediction.create({
    pumpId,
    healthScore: parseFloat(healthScore.toFixed(1)),
    predictedFault: primaryFault ? primaryFault.type : 'None',
    severity: overallSeverity,
    recommendedAction,
    estimatedTimeToFailure
  });

  return { ...prediction.toJSON(), faults };
};

module.exports = { analyzePump };
