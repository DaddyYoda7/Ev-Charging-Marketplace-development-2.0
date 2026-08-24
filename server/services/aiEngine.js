// Haversine formula to compute great-circle distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * AI Scoring Model (Roadmap Phase 5.3):
 * Score = 0.30 × Availability + 0.25 × Distance Score + 0.20 × Price Score + 0.15 × Charging Speed + 0.10 × Rating
 */
function calculateAIScore(station, options = {}) {
  const {
    userLat = 12.9716,
    userLon = 77.5946,
    connectorType = null,
    batterySoc = 30,
    budgetMax = 30.0,
    weights = {
      availability: 0.30,
      distance: 0.25,
      price: 0.20,
      speed: 0.15,
      rating: 0.10
    }
  } = options;

  const distanceKm = calculateDistance(userLat, userLon, station.latitude, station.longitude);

  // Filter or match chargers
  const chargers = station.chargers || [];
  const compatibleChargers = connectorType
    ? chargers.filter((c) => c.connector_type.toLowerCase() === connectorType.toLowerCase())
    : chargers;

  const targetChargers = compatibleChargers.length > 0 ? compatibleChargers : chargers;

  // 1. Availability Score (0.0 to 1.0)
  const totalPlugs = targetChargers.length || 1;
  const availablePlugs = targetChargers.filter((c) => c.status === 'AVAILABLE').length;
  const availabilityScore = availablePlugs > 0 ? (availablePlugs / totalPlugs) * 0.7 + 0.3 : 0.1;

  // 2. Distance Score (0.0 to 1.0) - decay as distance exceeds 25km
  const distanceScore = Math.max(0.05, 1 - Math.min(distanceKm / 30, 0.95));

  // 3. Price Score (0.0 to 1.0) - cheaper is higher
  const lowestPrice = targetChargers.length > 0
    ? Math.min(...targetChargers.map((c) => c.price_per_kwh))
    : 20.0;
  const priceScore = Math.max(0.1, 1 - (lowestPrice / Math.max(budgetMax, 35.0)));

  // 4. Charging Speed / Power Score (0.0 to 1.0) - higher kW is better
  const maxPower = targetChargers.length > 0
    ? Math.max(...targetChargers.map((c) => c.power_kw))
    : 50;
  const speedScore = Math.min(1.0, maxPower / 350);

  // 5. Rating Score (0.0 to 1.0)
  const ratingScore = (station.rating || 4.0) / 5.0;

  // Weighted Sum
  const totalScore = (
    (weights.availability * availabilityScore) +
    (weights.distance * distanceScore) +
    (weights.price * priceScore) +
    (weights.speed * speedScore) +
    (weights.rating * ratingScore)
  );

  const matchPercentage = Math.round(totalScore * 100);

  // Generate Explainable AI Tag & Bullet Points
  const reasons = [];
  if (availablePlugs > 0) {
    reasons.push(`${availablePlugs}/${totalPlugs} bays open`);
  }
  if (distanceKm <= 3.0) {
    reasons.push(`Nearby (${distanceKm} km)`);
  } else {
    reasons.push(`${distanceKm} km`);
  }
  if (maxPower >= 150) {
    reasons.push(`Ultra-fast ${maxPower}kW power`);
  } else if (maxPower >= 50) {
    reasons.push(`Fast ${maxPower}kW DC`);
  }
  if (lowestPrice <= 20.0) {
    reasons.push(`Economical tariff (₹${lowestPrice.toFixed(2)}/kWh)`);
  }
  if (station.rating >= 4.8) {
    reasons.push(`Top-rated (${station.rating}★)`);
  }

  let aiVerdict = `Recommended: ${reasons.slice(0, 3).join(' • ')}`;
  if (availablePlugs === 0) {
    aiVerdict = `High-power hub (${maxPower}kW), but currently high occupancy.`;
  }

  return {
    score: Number(totalScore.toFixed(3)),
    matchPercentage,
    distanceKm,
    lowestPrice,
    maxPower,
    availablePlugs,
    totalPlugs,
    reasons,
    aiVerdict,
    subScores: {
      availability: Number(availabilityScore.toFixed(2)),
      distance: Number(distanceScore.toFixed(2)),
      price: Number(priceScore.toFixed(2)),
      speed: Number(speedScore.toFixed(2)),
      rating: Number(ratingScore.toFixed(2))
    }
  };
}

module.exports = {
  calculateDistance,
  calculateAIScore
};
