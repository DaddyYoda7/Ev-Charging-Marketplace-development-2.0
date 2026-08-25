const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { calculateDistance, calculateAIScore } = require('../services/aiEngine');

// Get all stations with multi-criteria filters and AI scoring
router.get('/', async (req, res) => {
  try {
    const {
      userLat = 12.9716,
      userLon = 77.5946,
      search = '',
      connector = '',
      minPower = 0,
      maxPrice = 35.0,
      minRating = 0,
      availableOnly = 'false',
      ownerId = ''
    } = req.query;

    let sql = 'SELECT * FROM charging_stations WHERE 1=1';
    const params = [];

    if (ownerId) {
      sql += ' AND owner_id = ?';
      params.push(ownerId);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR address LIKE ? OR city LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (minRating > 0) {
      sql += ' AND rating >= ?';
      params.push(Number(minRating));
    }

    const stations = await db.allAsync(sql, params);

    // Fetch all chargers
    const allChargers = await db.allAsync('SELECT * FROM chargers');

    const enrichedStations = stations.map((station) => {
      let amenitiesList = [];
      try {
        amenitiesList = JSON.parse(station.amenities || '[]');
      } catch (e) {
        amenitiesList = ['Fast Charging', '24/7 Access'];
      }

      const stationChargers = allChargers.filter((c) => c.station_id === station.id);
      
      const totalBays = stationChargers.length;
      const availableBays = stationChargers.filter((c) => c.status === 'AVAILABLE').length;
      const minPrice = stationChargers.length > 0
        ? Math.min(...stationChargers.map((c) => c.price_per_kwh))
        : 0.30;
      const maxPower = stationChargers.length > 0
        ? Math.max(...stationChargers.map((c) => c.power_kw))
        : 50.0;
      const connectors = [...new Set(stationChargers.map((c) => c.connector_type))];

      const aiEvaluation = calculateAIScore(
        { ...station, chargers: stationChargers },
        {
          userLat: Number(userLat),
          userLon: Number(userLon),
          connectorType: connector || null,
          budgetMax: Number(maxPrice)
        }
      );

      return {
        ...station,
        amenities: amenitiesList,
        chargers: stationChargers,
        totalBays,
        availableBays,
        minPrice,
        maxPower,
        connectors,
        distanceKm: aiEvaluation.distanceKm,
        aiScore: aiEvaluation.score,
        matchPercentage: aiEvaluation.matchPercentage,
        aiVerdict: aiEvaluation.aiVerdict,
        reasons: aiEvaluation.reasons,
        subScores: aiEvaluation.subScores
      };
    });

    // Apply post-enrichment filters
    let results = enrichedStations;

    if (availableOnly === 'true') {
      results = results.filter((s) => s.availableBays > 0);
    }

    if (connector) {
      results = results.filter((s) =>
        s.chargers.some((c) => c.connector_type.toLowerCase() === connector.toLowerCase())
      );
    }

    if (Number(minPower) > 0) {
      results = results.filter((s) => s.maxPower >= Number(minPower));
    }

    if (Number(maxPrice) < 35.0) {
      results = results.filter((s) => s.minPrice <= Number(maxPrice));
    }

    // Default sort by AI recommendation score descending
    results.sort((a, b) => b.aiScore - a.aiScore);

    res.json({
      success: true,
      count: results.length,
      stations: results
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single station details
router.get('/:id', async (req, res) => {
  try {
    const station = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [req.params.id]);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const chargers = await db.allAsync('SELECT * FROM chargers WHERE station_id = ?', [station.id]);
    const owner = await db.getAsync('SELECT id, name, email, phone FROM users WHERE id = ?', [station.owner_id]);

    let amenitiesList = [];
    try {
      amenitiesList = JSON.parse(station.amenities || '[]');
    } catch (e) {
      amenitiesList = ['Fast Charging'];
    }

    res.json({
      success: true,
      station: {
        ...station,
        amenities: amenitiesList,
        chargers,
        owner
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new station (Host)
router.post('/', async (req, res) => {
  try {
    const {
      owner_id = 'usr-owner-1',
      name,
      address,
      city = 'Metro City',
      latitude = 37.7749,
      longitude = -122.4194,
      amenities = ['High-Speed Wi-Fi', '24/7 Access'],
      opening_hours = '24/7 Open',
      image_url,
      chargers = []
    } = req.body;

    const stationId = `st-${Date.now()}`;
    const amenitiesJson = JSON.stringify(amenities);
    const defaultImg = image_url || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80';

    await db.runAsync(
      `INSERT INTO charging_stations (id, owner_id, name, address, city, latitude, longitude, rating, review_count, status, amenities, opening_hours, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, 'ACTIVE', ?, ?, ?)`,
      [stationId, owner_id, name, address, city, Number(latitude), Number(longitude), amenitiesJson, opening_hours, defaultImg]
    );

    // If initial chargers were provided
    if (Array.isArray(chargers) && chargers.length > 0) {
      for (let i = 0; i < chargers.length; i++) {
        const c = chargers[i];
        const chargerId = `ch-${Date.now()}-${i + 1}`;
        await db.runAsync(
          `INSERT INTO chargers (id, station_id, identifier, connector_type, current_type, power_kw, price_per_kwh, status, health_score, temperature_c)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', 100, 26.0)`,
          [chargerId, stationId, c.identifier || `BAY-${i + 1}`, c.connector_type || 'CCS2', c.current_type || 'DC Fast', Number(c.power_kw) || 150, Number(c.price_per_kwh) || 0.35]
        );
      }
    } else {
      // Default 2 chargers
      await db.runAsync(
        `INSERT INTO chargers (id, station_id, identifier, connector_type, current_type, power_kw, price_per_kwh, status, health_score, temperature_c)
         VALUES (?, ?, 'BAY-01 (DC Fast)', 'CCS2', 'DC Fast', 150.0, 0.35, 'AVAILABLE', 100, 26.0)`,
        [`ch-${Date.now()}-1`, stationId]
      );
      await db.runAsync(
        `INSERT INTO chargers (id, station_id, identifier, connector_type, current_type, power_kw, price_per_kwh, status, health_score, temperature_c)
         VALUES (?, ?, 'BAY-02 (AC Level 2)', 'Type 2', 'AC Level 2', 22.0, 0.20, 'AVAILABLE', 100, 24.0)`,
        [`ch-${Date.now()}-2`, stationId]
      );
    }

    const createdStation = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [stationId]);
    const createdChargers = await db.allAsync('SELECT * FROM chargers WHERE station_id = ?', [stationId]);

    res.json({
      success: true,
      station: {
        ...createdStation,
        amenities,
        chargers: createdChargers
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update station
router.put('/:id', async (req, res) => {
  try {
    const { name, address, city, amenities, opening_hours, status } = req.body;
    const existing = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Station not found' });

    const updatedAmenities = amenities ? JSON.stringify(amenities) : existing.amenities;

    await db.runAsync(
      `UPDATE charging_stations 
       SET name = COALESCE(?, name),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           amenities = ?,
           opening_hours = COALESCE(?, opening_hours),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [name, address, city, updatedAmenities, opening_hours, status, req.params.id]
    );

    const updated = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [req.params.id]);
    res.json({ success: true, station: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add charger to station (Host)
router.post('/:id/chargers', async (req, res) => {
  try {
    const { identifier, connector_type, current_type, power_kw, price_per_kwh, idle_fee_per_min = 0.50 } = req.body;
    const chargerId = `ch-${Date.now()}`;

    await db.runAsync(
      `INSERT INTO chargers (id, station_id, identifier, connector_type, current_type, power_kw, price_per_kwh, idle_fee_per_min, status, health_score, temperature_c)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', 100, 25.0)`,
      [chargerId, req.params.id, identifier, connector_type, current_type, Number(power_kw), Number(price_per_kwh), Number(idle_fee_per_min)]
    );

    const charger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [chargerId]);
    res.json({ success: true, charger });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update charger / tariff
router.put('/chargers/:chargerId', async (req, res) => {
  try {
    const { identifier, connector_type, current_type, power_kw, price_per_kwh, idle_fee_per_min, status } = req.body;
    await db.runAsync(
      `UPDATE chargers
       SET identifier = COALESCE(?, identifier),
           connector_type = COALESCE(?, connector_type),
           current_type = COALESCE(?, current_type),
           power_kw = COALESCE(?, power_kw),
           price_per_kwh = COALESCE(?, price_per_kwh),
           idle_fee_per_min = COALESCE(?, idle_fee_per_min),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [identifier, connector_type, current_type, power_kw, price_per_kwh, idle_fee_per_min, status, req.params.chargerId]
    );

    const charger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [req.params.chargerId]);
    res.json({ success: true, charger });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete charger
router.delete('/chargers/:chargerId', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM chargers WHERE id = ?', [req.params.chargerId]);
    res.json({ success: true, message: 'Charger removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Override station status (ONLINE, MAINTENANCE, SUSPENDED)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status' });

    await db.runAsync(
      `UPDATE charging_stations SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );

    const station = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [req.params.id]);
    res.json({ success: true, station, message: `Station status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Toggle station verified badge
router.patch('/:id/verify', async (req, res) => {
  try {
    const { isVerified } = req.body;
    await db.runAsync(
      `UPDATE charging_stations SET is_verified = ? WHERE id = ?`,
      [isVerified ? 1 : 0, req.params.id]
    );

    const station = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [req.params.id]);
    res.json({ success: true, station, message: `Station verification set to ${isVerified ? 'VERIFIED' : 'UNVERIFIED'}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

