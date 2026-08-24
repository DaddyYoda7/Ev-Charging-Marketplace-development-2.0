const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { calculateAIScore, calculateDistance } = require('../services/aiEngine');

// Smart AI Recommendation Endpoint (Roadmap Phase 5.5)
router.post('/recommend', async (req, res) => {
  try {
    const {
      latitude = 12.9716,
      longitude = 77.5946,
      battery = 35,
      connector = 'CCS2',
      budget = 30.0,
      requiredSpeed = 100,
      customWeights = null
    } = req.body;

    const stations = await db.allAsync('SELECT * FROM charging_stations WHERE status = "ACTIVE"');
    const allChargers = await db.allAsync('SELECT * FROM chargers');

    const defaultWeights = customWeights || {
      availability: 0.30,
      distance: 0.25,
      price: 0.20,
      speed: 0.15,
      rating: 0.10
    };

    const scoredStations = stations.map((station) => {
      const stationChargers = allChargers.filter((c) => c.station_id === station.id);
      let amenitiesList = [];
      try {
        amenitiesList = JSON.parse(station.amenities || '[]');
      } catch (e) {
        amenitiesList = [];
      }

      const evaluation = calculateAIScore(
        { ...station, chargers: stationChargers },
        {
          userLat: Number(latitude),
          userLon: Number(longitude),
          connectorType: connector,
          batterySoc: Number(battery),
          budgetMax: Number(budget),
          weights: defaultWeights
        }
      );

      return {
        id: station.id,
        name: station.name,
        address: station.address,
        city: station.city,
        latitude: station.latitude,
        longitude: station.longitude,
        rating: station.rating,
        image_url: station.image_url,
        amenities: amenitiesList,
        chargers: stationChargers,
        aiScore: evaluation.score,
        matchPercentage: evaluation.matchPercentage,
        distanceKm: evaluation.distanceKm,
        lowestPrice: evaluation.lowestPrice,
        maxPower: evaluation.maxPower,
        availablePlugs: evaluation.availablePlugs,
        totalPlugs: evaluation.totalPlugs,
        aiVerdict: evaluation.aiVerdict,
        reasons: evaluation.reasons,
        subScores: evaluation.subScores
      };
    });

    // Sort by AI score descending
    scoredStations.sort((a, b) => b.aiScore - a.aiScore);

    const topPick = scoredStations.length > 0 ? scoredStations[0] : null;

    res.json({
      success: true,
      query: { latitude, longitude, battery, connector, budget, requiredSpeed },
      weightsUsed: defaultWeights,
      topPick,
      recommendations: scoredStations
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Trip & Route Charging Planner (Indian Route Topography)
router.post('/trip-planner', async (req, res) => {
  try {
    const {
      origin = 'MG Road / Indiranagar, Bengaluru',
      destination = 'Electronic City Elevated Tollway, Bengaluru',
      vehicleBatteryKwh = 45.0,
      currentSoc = 25,
      targetArrivalSoc = 30,
      preferredConnector = 'CCS2'
    } = req.body;

    const stations = await db.allAsync('SELECT * FROM charging_stations WHERE status = "ACTIVE"');
    const allChargers = await db.allAsync('SELECT * FROM chargers WHERE status = "AVAILABLE"');

    const tripDistanceKm = 48.0;
    const avgConsumptionKwhPerKm = 0.16;
    const energyRequiredKwh = Number((tripDistanceKm * avgConsumptionKwhPerKm).toFixed(1));

    // Recommend the best midway charging stop
    const candidateStations = stations.map((s) => {
      const sChargers = allChargers.filter((c) => c.station_id === s.id && (!preferredConnector || c.connector_type.toLowerCase() === preferredConnector.toLowerCase()));
      const fastCharger = sChargers.sort((a, b) => b.power_kw - a.power_kw)[0];
      return {
        station: s,
        fastCharger,
        score: s.rating * (fastCharger ? fastCharger.power_kw : 20)
      };
    }).filter((c) => c.fastCharger);

    candidateStations.sort((a, b) => b.score - a.score);
    const recommendedStop = candidateStations[0];

    const topUpNeededKwh = Math.max(12, Number((((80 - currentSoc) / 100) * vehicleBatteryKwh).toFixed(1)));
    const chargingTimeMins = recommendedStop && recommendedStop.fastCharger
      ? Math.round((topUpNeededKwh / recommendedStop.fastCharger.power_kw) * 60) + 5
      : 25;
    const estimatedCost = recommendedStop && recommendedStop.fastCharger
      ? Number((topUpNeededKwh * recommendedStop.fastCharger.price_per_kwh).toFixed(2))
      : 480.00;

    res.json({
      success: true,
      trip: {
        origin,
        destination,
        distanceKm: tripDistanceKm,
        currentSoc,
        energyRequiredKwh,
        recommendedStop: recommendedStop ? {
          station: recommendedStop.station,
          charger: recommendedStop.fastCharger,
          topUpKwh: topUpNeededKwh,
          chargingTimeMins,
          estimatedCost,
          departureSoc: 80,
          aiTip: `Take a ~${chargingTimeMins} min top-up at ${recommendedStop.station.name} (${recommendedStop.fastCharger.power_kw}kW DC) to arrive comfortably with 80% reserve.`
        } : null
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
