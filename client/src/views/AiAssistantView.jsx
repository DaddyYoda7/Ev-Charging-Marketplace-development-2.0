import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Navigation, BatteryCharging, Zap, ArrowRight, ShieldCheck, Sliders, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

export default function AiAssistantView({
  primaryVehicle,
  onBookStation
}) {
  const [origin, setOrigin] = useState('MG Road / Indiranagar, Bengaluru');
  const [destination, setDestination] = useState('Electronic City Tollway, Bengaluru');
  const [currentSoc, setCurrentSoc] = useState(primaryVehicle?.current_soc || 28);
  const [tripPlan, setTripPlan] = useState(null);
  const [planning, setPlanning] = useState(false);

  // Custom AI Weighting Model (Roadmap Phase 5.3)
  const [weights, setWeights] = useState({
    availability: 0.30,
    distance: 0.25,
    price: 0.20,
    speed: 0.15,
    rating: 0.10
  });
  const [customRankedStations, setCustomRankedStations] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    handleRunTripPlanner();
    fetchCustomRankings();
  }, [primaryVehicle]);

  async function handleRunTripPlanner(e) {
    if (e) e.preventDefault();
    setPlanning(true);
    try {
      const res = await api.planTrip({
        origin,
        destination,
        vehicleBatteryKwh: primaryVehicle?.battery_capacity || 45.0,
        currentSoc,
        preferredConnector: primaryVehicle?.connector_type || 'CCS2'
      });
      if (res.success) {
        setTripPlan(res.trip);
      }
    } catch (err) {
      console.error('Failed to plan trip:', err);
    } finally {
      setPlanning(false);
    }
  }

  async function fetchCustomRankings() {
    setLoadingCustom(true);
    try {
      const res = await api.getAiRecommendations({
        latitude: 12.9716,
        longitude: 77.5946,
        battery: currentSoc,
        connector: primaryVehicle?.connector_type || 'CCS2',
        customWeights: weights
      });
      if (res.success) {
        setCustomRankedStations(res.recommendations || []);
      }
    } catch (err) {
      console.error('Failed custom rankings:', err);
    } finally {
      setLoadingCustom(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top AI Header */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4 text-[#A78BFA]" />
            <span>Phase 5 • Explainable AI Recommendation & Trip Optimizer</span>
          </div>
          <h1 className="text-2xl font-black text-white">AI EV Charging & Route Intelligence (India)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Weighted multi-factor scoring: Availability (30%), Distance (25%), Price in ₹ (20%), Speed (15%), Rating (10%).</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#00F2FE] bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-500/30">
          <Sparkles className="w-4 h-4" />
          <span>Vehicle Profile: {primaryVehicle?.model || 'Tata Nexon EV Max'}</span>
        </div>
      </div>

      {/* Main Grid: Trip Planner (Left) & Weighting Tuner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Smart Trip Planner (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-panel p-6 border border-white/10 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <Navigation className="w-4 h-4 text-[#00F2FE]" />
              <span>Smart Indian Route & Battery Top-Up Assistant</span>
            </div>

            <form onSubmit={handleRunTripPlanner} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Trip Departure Origin</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Trip Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>

              <div className="sm:col-span-2 bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Current Battery Departure SoC:</span>
                  <span className="font-mono font-bold text-[#00E676]">{currentSoc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={currentSoc}
                  onChange={(e) => setCurrentSoc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={planning}
                className="sm:col-span-2 btn-primary text-xs py-2.5 justify-center mt-1"
              >
                <Sparkles className="w-4 h-4" />
                <span>{planning ? 'Analyzing Indian EV Grid & Traffic Routes...' : 'Calculate Optimal Top-Up Stop'}</span>
              </button>
            </form>
          </div>

          {/* Trip Recommendation Output Card */}
          {tripPlan && tripPlan.recommendedStop && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121E36] via-[#0E1729] to-[#15132B] border border-cyan-500/40 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="badge badge-ai text-[10px]">Recommended Charging Stop</span>
                <span className="text-xs font-mono text-cyan-300 font-bold">{tripPlan.distanceKm} km Corridor</span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">{tripPlan.recommendedStop.station.name}</h2>
                <p className="text-xs text-slate-300 mt-0.5">{tripPlan.recommendedStop.station.address}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">AI Strategy: </span>
                  {tripPlan.recommendedStop.aiTip}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Top-Up Needed</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {tripPlan.recommendedStop.topUpKwh} kWh
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Charging Time</div>
                  <div className="text-sm font-bold text-[#00F2FE] font-mono mt-0.5">
                    ~{tripPlan.recommendedStop.chargingTimeMins} mins
                  </div>
                </div>

                <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                  <div className="text-[10px] text-slate-400 uppercase">Est. Tariff</div>
                  <div className="text-sm font-bold text-[#00E676] font-mono mt-0.5">
                    ₹{tripPlan.recommendedStop.estimatedCost}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onBookStation(tripPlan.recommendedStop.station)}
                className="w-full btn-emerald text-xs py-2.5 justify-center mt-2"
              >
                <Zap className="w-4 h-4" />
                <span>Reserve Bay at this Recommended Stop</span>
              </button>
            </div>
          )}

        </div>

        {/* Right Column: AI Scoring Weight Tuner & Dynamic Ranks (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="glass-panel p-5 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-[#8B5CF6]" />
                <span>Custom AI Scoring Weights</span>
              </div>
              <button
                onClick={fetchCustomRankings}
                className="text-[10px] text-[#00F2FE] hover:underline font-mono"
              >
                Recalculate
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Availability Weight:</span>
                  <span className="font-mono text-[#00E676]">{(weights.availability * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.availability}
                  onChange={(e) => setWeights({ ...weights, availability: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Distance Weight:</span>
                  <span className="font-mono text-[#00F2FE]">{(weights.distance * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.distance}
                  onChange={(e) => setWeights({ ...weights, distance: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Price Tariff Weight:</span>
                  <span className="font-mono text-emerald-400">{(weights.price * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.price}
                  onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Speed / Power (kW) Weight:</span>
                  <span className="font-mono text-cyan-300">{(weights.speed * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.60"
                  step="0.05"
                  value={weights.speed}
                  onChange={(e) => setWeights({ ...weights, speed: Number(e.target.value) })}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Scored Stations List */}
          <div className="glass-panel p-4 border border-white/10 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Real-Time AI Ranked Stations ({customRankedStations.length})
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {customRankedStations.map((st, idx) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-slate-300 text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-white leading-tight">{st.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {st.distanceKm} km • {st.maxPower}kW • ₹{st.lowestPrice.toFixed(2)}/kWh
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="badge badge-ai text-[10px] font-mono">
                      {st.matchPercentage}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
