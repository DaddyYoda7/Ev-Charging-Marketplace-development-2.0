const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { evaluateChargerHealth } = require('../services/predictiveEngine');

// Connected SSE clients list
let sseClients = [];

// SSE Telemetry Stream Endpoint
router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'OCPP Telemetry Live Stream Connected' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// Broadcast telemetry event to all connected web clients
function broadcastTelemetry(event) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.res.write(data);
    } catch (e) {
      // client disconnected
    }
  });
}

// Background simulation ticker: updates active charging sessions every 3 seconds
setInterval(async () => {
  try {
    const activeChargers = await db.allAsync('SELECT * FROM chargers WHERE status = "CHARGING"');
    for (const charger of activeChargers) {
      const powerKw = charger.active_power_kw || (charger.power_kw * 0.85);
      const energyIncrement = (powerKw * (3 / 3600)); // 3 seconds of power in kWh
      const tempFluctuation = Number((charger.temperature_c + (Math.random() * 0.4 - 0.15)).toFixed(1));

      await db.runAsync(
        `UPDATE chargers 
         SET temperature_c = ?, active_power_kw = ?
         WHERE id = ?`,
        [Math.min(55, Math.max(25, tempFluctuation)), powerKw, charger.id]
      );

      // Log meter value
      const logId = `tel-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await db.runAsync(
        `INSERT INTO telemetry_logs (id, charger_id, event_type, power_kw, energy_kwh, temperature_c, voltage, current_amp)
         VALUES (?, ?, 'MeterValues', ?, ?, ?, 400.0, ?)`,
        [logId, charger.id, powerKw, Number(energyIncrement.toFixed(3)), tempFluctuation, Number((powerKw * 2.5).toFixed(1))]
      );

      // Broadcast live tick
      broadcastTelemetry({
        type: 'METER_TICK',
        chargerId: charger.id,
        powerKw: Number(powerKw.toFixed(1)),
        temperatureC: tempFluctuation,
        voltage: 400.0,
        currentAmp: Number((powerKw * 2.5).toFixed(1)),
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    // quiet tick catch
  }
}, 3000);

// Get live telemetry & health for a charger
router.get('/charger/:id', async (req, res) => {
  try {
    const charger = await db.getAsync(
      `SELECT c.*, s.name as station_name, s.address as station_address 
       FROM chargers c 
       JOIN charging_stations s ON c.station_id = s.id 
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    const recentLogs = await db.allAsync(
      'SELECT * FROM telemetry_logs WHERE charger_id = ? ORDER BY timestamp DESC LIMIT 20',
      [charger.id]
    );

    const healthReport = evaluateChargerHealth(charger, recentLogs);

    res.json({
      success: true,
      charger,
      healthReport,
      recentLogs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// OCPP Simulator Action Endpoint (Roadmap Phase 6.2 & 7.2)
router.post('/ocpp/event', async (req, res) => {
  try {
    const {
      chargerId,
      eventType, // 'StatusNotification' | 'Authorize' | 'StartTransaction' | 'StopTransaction' | 'FaultAlert' | 'SetTemperature'
      status, // 'AVAILABLE' | 'OCCUPIED' | 'CHARGING' | 'FAULTED' | 'OFFLINE'
      powerKw,
      temperatureC,
      faultCode
    } = req.body;

    const charger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [chargerId]);
    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    let updatedStatus = charger.status;
    let updatedPower = charger.active_power_kw;
    let updatedTemp = charger.temperature_c;
    let updatedHealth = charger.health_score;

    if (eventType === 'StatusNotification' && status) {
      updatedStatus = status;
      if (status === 'AVAILABLE') updatedPower = 0;
    } else if (eventType === 'StartTransaction') {
      updatedStatus = 'CHARGING';
      updatedPower = powerKw || (charger.power_kw * 0.9);
      updatedTemp = Math.min(52, charger.temperature_c + 4.5);
      await db.runAsync('UPDATE chargers SET total_sessions = total_sessions + 1 WHERE id = ?', [chargerId]);
    } else if (eventType === 'StopTransaction') {
      updatedStatus = 'AVAILABLE';
      updatedPower = 0;
      updatedTemp = Math.max(26, charger.temperature_c - 5.0);
    } else if (eventType === 'FaultAlert') {
      updatedStatus = 'FAULTED';
      updatedPower = 0;
      updatedHealth = Math.max(20, charger.health_score - 30);

      // Create an open maintenance alert
      const alertId = `alt-${Date.now()}`;
      await db.runAsync(
        `INSERT INTO maintenance_alerts (id, station_id, charger_id, severity, issue, recommendation, failure_risk_pct, status)
         VALUES (?, ?, ?, 'CRITICAL', ?, 'Field technician dispatch advised. Reset circuit breaker after continuity check.', 88, 'OPEN')`,
        [alertId, charger.station_id, chargerId, faultCode || 'Ground Fault / Insulation Breakdown Detected']
      );
    } else if (eventType === 'SetTemperature' && temperatureC !== undefined) {
      updatedTemp = Number(temperatureC);
    }

    await db.runAsync(
      `UPDATE chargers 
       SET status = ?, active_power_kw = ?, temperature_c = ?, health_score = ?
       WHERE id = ?`,
      [updatedStatus, updatedPower, updatedTemp, updatedHealth, chargerId]
    );

    // Telemetry log
    const logId = `tel-${Date.now()}`;
    await db.runAsync(
      `INSERT INTO telemetry_logs (id, charger_id, event_type, power_kw, energy_kwh, temperature_c, fault_code)
       VALUES (?, ?, ?, ?, 0.0, ?, ?)`,
      [logId, chargerId, eventType, updatedPower, updatedTemp, faultCode || null]
    );

    const updatedCharger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [chargerId]);
    const healthReport = evaluateChargerHealth(updatedCharger);

    // Broadcast live update over SSE
    broadcastTelemetry({
      type: 'CHARGER_STATE_CHANGE',
      charger: updatedCharger,
      eventType,
      healthReport
    });

    res.json({
      success: true,
      message: `OCPP event ${eventType} executed successfully`,
      charger: updatedCharger,
      healthReport
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
