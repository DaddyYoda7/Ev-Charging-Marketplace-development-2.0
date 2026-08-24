const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { evaluateChargerHealth } = require('../services/predictiveEngine');

// Station Owner / Host Analytics (Roadmap Phase 3.5 & 7.6)
router.get('/host', async (req, res) => {
  try {
    const ownerId = req.query.ownerId || 'usr-owner-1';

    const stations = await db.allAsync('SELECT * FROM charging_stations WHERE owner_id = ?', [ownerId]);
    const stationIds = stations.map((s) => s.id);

    if (stationIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalRevenue: 0,
          ownerPayout: 0,
          energyDeliveredKwh: 0,
          totalSessions: 0,
          utilizationRate: 0,
          activeChargersCount: 0,
          totalChargersCount: 0
        },
        chargers: [],
        alerts: [],
        peakHours: []
      });
    }

    const placeholders = stationIds.map(() => '?').join(',');
    const chargers = await db.allAsync(
      `SELECT c.*, s.name as station_name 
       FROM chargers c 
       JOIN charging_stations s ON c.station_id = s.id 
       WHERE c.station_id IN (${placeholders})`,
      stationIds
    );

    const payments = await db.allAsync(
      `SELECT p.* FROM payments p 
       JOIN bookings b ON p.booking_id = b.id 
       WHERE b.station_id IN (${placeholders}) AND p.status = "SUCCESS"`,
      stationIds
    );

    const totalRevenue = payments.reduce((acc, p) => acc + p.total_amount, 0);
    const ownerPayout = payments.reduce((acc, p) => acc + p.owner_payout, 0);
    const platformCommission = payments.reduce((acc, p) => acc + p.platform_commission, 0);

    const invoices = await db.allAsync(
      `SELECT i.* FROM invoices i 
       JOIN bookings b ON i.booking_id = b.id 
       WHERE b.station_id IN (${placeholders})`,
      stationIds
    );
    const energyDeliveredKwh = invoices.reduce((acc, i) => acc + i.energy_delivered_kwh, 0);

    const totalChargersCount = chargers.length;
    const activeChargersCount = chargers.filter((c) => c.status === 'CHARGING' || c.status === 'OCCUPIED').length;
    const utilizationRate = totalChargersCount > 0
      ? Math.round((activeChargersCount / totalChargersCount) * 100)
      : 0;

    // Charger Health & Predictive Diagnostics
    const evaluatedChargers = chargers.map((c) => {
      const health = evaluateChargerHealth(c);
      return {
        ...c,
        health
      };
    });

    const alerts = await db.allAsync(
      `SELECT a.*, s.name as station_name, c.identifier as charger_identifier 
       FROM maintenance_alerts a 
       JOIN charging_stations s ON a.station_id = s.id 
       JOIN chargers c ON a.charger_id = c.id 
       WHERE a.station_id IN (${placeholders}) 
       ORDER BY a.detected_at DESC`,
      stationIds
    );

    // Peak hours simulated telemetry distribution (Indian Metro EV Peak Loads)
    const peakHours = [
      { hour: '07:00 AM', loadPct: 30, kwDraw: 75 },
      { hour: '09:30 AM', loadPct: 80, kwDraw: 290 },
      { hour: '12:00 PM', loadPct: 65, kwDraw: 210 },
      { hour: '02:30 PM', loadPct: 75, kwDraw: 280 },
      { hour: '05:00 PM', loadPct: 70, kwDraw: 240 },
      { hour: '07:30 PM', loadPct: 95, kwDraw: 420 },
      { hour: '09:30 PM', loadPct: 85, kwDraw: 350 },
      { hour: '11:30 PM', loadPct: 45, kwDraw: 130 }
    ];

    // Weekly revenue breakdown in ₹
    const revenueByDay = [
      { day: 'Mon', revenue: 14200, kwh: 710 },
      { day: 'Tue', revenue: 16800, kwh: 840 },
      { day: 'Wed', revenue: 19500, kwh: 975 },
      { day: 'Thu', revenue: 21200, kwh: 1060 },
      { day: 'Fri', revenue: 27800, kwh: 1390 },
      { day: 'Sat', revenue: 34500, kwh: 1725 },
      { day: 'Sun', revenue: 31200, kwh: 1560 }
    ];

    res.json({
      success: true,
      stats: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        ownerPayout: Number(ownerPayout.toFixed(2)),
        platformCommission: Number(platformCommission.toFixed(2)),
        energyDeliveredKwh: Number(energyDeliveredKwh.toFixed(1)),
        totalSessions: chargers.reduce((sum, c) => sum + (c.total_sessions || 0), 0) + invoices.length,
        utilizationRate,
        activeChargersCount,
        totalChargersCount
      },
      chargers: evaluatedChargers,
      alerts,
      peakHours,
      revenueByDay
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Marketplace Analytics (Roadmap Phase 7.6 & 11)
router.get('/admin', async (req, res) => {
  try {
    const totalUsers = await db.getAsync('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const totalOwners = await db.getAsync('SELECT COUNT(*) as count FROM users WHERE role = "owner"');
    const totalStations = await db.getAsync('SELECT COUNT(*) as count FROM charging_stations');
    const totalChargers = await db.getAsync('SELECT COUNT(*) as count FROM chargers');
    
    const paymentSums = await db.getAsync(
      `SELECT SUM(total_amount) as gmv, SUM(platform_commission) as commission, SUM(owner_payout) as payouts, COUNT(*) as count 
       FROM payments WHERE status = "SUCCESS"`
    );

    const activeSessions = await db.getAsync('SELECT COUNT(*) as count FROM chargers WHERE status = "CHARGING"');
    const faultedChargers = await db.getAsync('SELECT COUNT(*) as count FROM chargers WHERE status = "FAULTED"');

    const recentTransactions = await db.allAsync(
      `SELECT p.*, u.name as user_name, b.start_time, s.name as station_name 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       JOIN bookings b ON p.booking_id = b.id 
       JOIN charging_stations s ON b.station_id = s.id 
       ORDER BY p.created_at DESC LIMIT 10`
    );

    const stationsList = await db.allAsync(
      `SELECT s.*, u.name as owner_name, COUNT(c.id) as charger_count 
       FROM charging_stations s 
       JOIN users u ON s.owner_id = u.id 
       LEFT JOIN chargers c ON s.id = c.station_id 
       GROUP BY s.id`
    );

    res.json({
      success: true,
      stats: {
        gmv: Number((paymentSums.gmv || 0).toFixed(2)),
        platformCommission: Number((paymentSums.commission || 0).toFixed(2)),
        ownerPayouts: Number((paymentSums.payouts || 0).toFixed(2)),
        totalTransactions: paymentSums.count || 0,
        totalUsers: totalUsers.count,
        totalOwners: totalOwners.count,
        totalStations: totalStations.count,
        totalChargers: totalChargers.count,
        activeSessions: activeSessions.count,
        faultedChargers: faultedChargers.count
      },
      recentTransactions,
      stationsList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
