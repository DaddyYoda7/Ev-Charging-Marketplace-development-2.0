/**
 * Predictive Maintenance & Hardware Diagnostic Engine (Roadmap Phase 6.5 & 7.5)
 * Calculates Failure Risk %, Health Score %, and Actionable Recommendations
 */
function evaluateChargerHealth(charger, telemetryHistory = []) {
  let healthScore = charger.health_score || 95;
  let failureRisk = 5;
  const issues = [];
  const recommendations = [];

  // 1. Temperature Check (Normal < 40°C, Warning 40-48°C, Critical > 48°C)
  const temp = charger.temperature_c || 30.0;
  if (temp > 48.0) {
    healthScore -= 25;
    failureRisk += 40;
    issues.push(`Over-temperature condition (${temp.toFixed(1)}°C)`);
    recommendations.push('Inspect cooling fan RPM, liquid coolant pressure, and heat-sink airflow.');
  } else if (temp > 40.0) {
    healthScore -= 10;
    failureRisk += 15;
    issues.push(`Elevated operating temperature (${temp.toFixed(1)}°C)`);
    recommendations.push('Schedule preventive dust filter cleaning and radiator inspection.');
  }

  // 2. High Session Count Wear & Tear
  const sessions = charger.total_sessions || 50;
  if (sessions > 250) {
    healthScore -= 8;
    failureRisk += 10;
    issues.push(`High session load (${sessions} completed cycles)`);
    recommendations.push('Check contact pin contact resistance and cable strain relief jacket.');
  }

  // 3. Status condition
  if (charger.status === 'FAULTED') {
    healthScore = Math.min(healthScore, 40);
    failureRisk = Math.max(failureRisk, 85);
    issues.push('Active hardware fault triggered via OCPP status');
    recommendations.push('Dispatch field technician for safety relay reset and isolation test.');
  }

  healthScore = Math.max(10, Math.min(100, healthScore));
  failureRisk = Math.max(2, Math.min(98, failureRisk));

  // Determine Severity
  let severity = 'NORMAL';
  if (failureRisk >= 60 || healthScore < 70) {
    severity = 'CRITICAL';
  } else if (failureRisk >= 25 || healthScore < 88) {
    severity = 'WARNING';
  }

  return {
    chargerId: charger.id,
    identifier: charger.identifier,
    healthScore,
    failureRiskPct: failureRisk,
    severity,
    temperature: temp,
    issues: issues.length > 0 ? issues : ['Operating within optimal voltage/thermal boundaries'],
    recommendation: recommendations.length > 0 ? recommendations.join(' ') : 'Routine scheduled check in 90 days.',
    mtbfHours: Math.round(8500 * (healthScore / 100))
  };
}

module.exports = {
  evaluateChargerHealth
};
