import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, Zap, MapPin, Sparkles, LayoutGrid, Map as MapIcon, Star, CheckCircle, RefreshCw } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import StationCard from '../components/StationCard';
import { api } from '../utils/api';

export default function UserExploreView({
  onBookStation,
  onOpenGarage,
  primaryVehicle
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'grid' | 'map'
  const [selectedStation, setSelectedStation] = useState(null);
  const [detailModalStation, setDetailModalStation] = useState(null);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConnector, setSelectedConnector] = useState(primaryVehicle?.connector_type || '');
  const [minPower, setMinPower] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0.50);
  const [minRating, setMinRating] = useState(0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStations();
  }, [selectedConnector, minPower, maxPrice, minRating, availableOnly, primaryVehicle]);

  async function fetchStations() {
    setLoading(true);
    try {
      const res = await api.getStations({
        search: searchTerm,
        connector: selectedConnector,
        minPower,
        maxPrice,
        minRating,
        availableOnly: availableOnly ? 'true' : 'false',
        userLat: 37.7749,
        userLon: -122.4194
      });
      if (res.success) {
        setStations(res.stations || []);
        if (res.stations?.length > 0 && !selectedStation) {
          setSelectedStation(res.stations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchStations();
  }

  const topPick = stations.length > 0 ? stations[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Search & Filter Header Bar */}
      <div className="glass-panel p-4 md:p-6 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search station, city, or corridor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-10 text-xs md:text-sm"
            />
          </form>

          {/* Quick Connectors Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 justify-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 shrink-0">Connector:</span>
            {['', 'CCS2', 'Type 2', 'CHAdeMO', 'NACS'].map((conn) => (
              <button
                key={conn}
                onClick={() => setSelectedConnector(conn)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all shrink-0 ${
                  selectedConnector === conn
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                }`}
              >
                {conn || 'All Plugs'}
              </button>
            ))}
          </div>

          {/* Controls: Filter Toggle & View Switcher */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-xs py-2 px-3 ${showFilters ? 'bg-cyan-500/20 text-[#00F2FE] border-cyan-500/40' : ''}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'split' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Split Map & Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Full Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Min Power Rating */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Minimum Power: <span className="text-[#00F2FE] font-mono">{minPower > 0 ? `${minPower} kW+` : 'Any Speed'}</span>
              </label>
              <input
                type="range"
                min="0"
                max="350"
                step="25"
                value={minPower}
                onChange={(e) => setMinPower(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Max Tariff */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Max Price: <span className="text-[#00E676] font-mono">${maxPrice.toFixed(2)}/kWh</span>
              </label>
              <input
                type="range"
                min="0.15"
                max="0.60"
                step="0.05"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Rating: <span className="text-amber-400 font-mono">{minRating > 0 ? `${minRating}★ & above` : 'All Ratings'}</span>
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="input-glass py-1.5 text-xs font-medium"
              >
                <option value="0">All Ratings</option>
                <option value="4.5">4.5★ and above</option>
                <option value="4.7">4.7★ Top Rated</option>
              </select>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center gap-2 pt-4">
              <input
                type="checkbox"
                id="availOnly"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 accent-[#00E676] rounded cursor-pointer"
              />
              <label htmlFor="availOnly" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Show Only Available Plugs
              </label>
            </div>
          </div>
        )}

      </div>

      {/* AI Recommendation Spotlight Banner (Roadmap Phase 5) */}
      {topPick && (
        <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#111C33] via-[#0E1628] to-[#15132C] border border-cyan-500/35 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00F2FE] via-[#00E676] to-[#8B5CF6] p-[2px] shrink-0">
                <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#00F2FE]" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-ai text-[10px]">AI Top Recommendation</span>
                  <span className="text-xs font-mono text-[#00F2FE] font-bold">{topPick.matchPercentage}% Match</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white mt-1">{topPick.name}</h2>
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                  <span>{topPick.aiVerdict}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end md:self-center shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Tariff Rate</div>
                <div className="text-lg font-black text-[#00E676] font-mono">${topPick.minPrice.toFixed(2)} <span className="text-xs font-normal text-slate-400">/ kWh</span></div>
              </div>
              <button
                onClick={() => onBookStation(topPick)}
                className="btn-primary text-xs px-5 py-2.5"
              >
                <Zap className="w-4 h-4" />
                <span>Instant Reserve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout (Split / Grid / Map) */}
      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Station Cards List (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 max-h-[620px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
              <span>{stations.length} Stations Available</span>
              <span className="text-cyan-400 font-mono">Ranked by AI Score</span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
                <span>Calculating live geo-distance & AI scores...</span>
              </div>
            ) : stations.length === 0 ? (
              <div className="p-8 text-center glass-panel text-slate-400 text-xs">
                No charging stations match your active filters. Try adjusting power or radius.
              </div>
            ) : (
              stations.map((st, idx) => (
                <StationCard
                  key={st.id}
                  station={st}
                  isTopPick={idx === 0}
                  onBook={(s) => onBookStation(s)}
                  onViewDetails={(s) => {
                    setSelectedStation(s);
                    setDetailModalStation(s);
                  }}
                />
              ))
            )}
          </div>

          {/* Right: Leaflet Map (7 Cols) */}
          <div className="lg:col-span-7">
            <InteractiveMap
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={(s) => setSelectedStation(s)}
              onBookStation={(s) => onBookStation(s)}
            />
          </div>
        </div>
      )}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((st, idx) => (
            <StationCard
              key={st.id}
              station={st}
              isTopPick={idx === 0}
              onBook={(s) => onBookStation(s)}
              onViewDetails={(s) => setDetailModalStation(s)}
            />
          ))}
        </div>
      )}

      {viewMode === 'map' && (
        <div>
          <InteractiveMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={(s) => setSelectedStation(s)}
            onBookStation={(s) => onBookStation(s)}
          />
        </div>
      )}

      {/* Station Detail Modal */}
      {detailModalStation && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
            <button
              onClick={() => setDetailModalStation(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors"
            >
              ✕
            </button>

            <div className="relative h-48 w-full rounded-xl overflow-hidden mb-6">
              <img
                src={detailModalStation.image_url}
                alt={detailModalStation.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E1524] via-transparent to-transparent"></div>
              <div className="absolute bottom-3 left-3">
                <span className="badge badge-ai text-xs">
                  ★ {detailModalStation.rating} ({detailModalStation.review_count} verified EV drivers)
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white">{detailModalStation.name}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{detailModalStation.address}, {detailModalStation.city}</span>
            </p>

            {/* AI Multi-Score Breakdown */}
            {detailModalStation.subScores && (
              <div className="mt-4 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/25 text-xs space-y-2">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>AI Multi-Factor Score Model (Roadmap Phase 5.3)</span>
                  <span className="text-[#00F2FE] font-mono font-bold">{detailModalStation.matchPercentage}% Total</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
                  <div className="bg-black/30 p-2 rounded text-center border border-white/5">
                    <div className="text-slate-400 text-[9px]">AVAILABILITY</div>
                    <div className="font-bold text-[#00E676]">{detailModalStation.subScores.availability * 100}%</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center border border-white/5">
                    <div className="text-slate-400 text-[9px]">DISTANCE</div>
                    <div className="font-bold text-[#00F2FE]">{detailModalStation.subScores.distance * 100}%</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center border border-white/5">
                    <div className="text-slate-400 text-[9px]">PRICE TARIFF</div>
                    <div className="font-bold text-emerald-400">{detailModalStation.subScores.price * 100}%</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center border border-white/5">
                    <div className="text-slate-400 text-[9px]">POWER SPEED</div>
                    <div className="font-bold text-cyan-300">{detailModalStation.subScores.speed * 100}%</div>
                  </div>
                  <div className="bg-black/30 p-2 rounded text-center border border-white/5">
                    <div className="text-slate-400 text-[9px]">RATING</div>
                    <div className="font-bold text-amber-400">{detailModalStation.subScores.rating * 100}%</div>
                  </div>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div className="mt-5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Available Amenities</div>
              <div className="flex flex-wrap gap-2">
                {detailModalStation.amenities?.map((am, i) => (
                  <span key={i} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-300">
                    ✓ {am}
                  </span>
                ))}
              </div>
            </div>

            {/* Chargers Hardware Inventory */}
            <div className="mt-5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Hardware Chargers & Bays</div>
              <div className="space-y-2">
                {detailModalStation.chargers?.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{c.identifier}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        {c.power_kw}kW {c.current_type} • {c.connector_type} • Tariff: ${c.price_per_kwh.toFixed(2)}/kWh
                      </div>
                    </div>
                    <span className={`badge ${c.status === 'AVAILABLE' ? 'badge-available' : 'badge-occupied'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-end gap-3">
              <button onClick={() => setDetailModalStation(null)} className="btn-secondary text-xs px-4 py-2">
                Close
              </button>
              <button
                onClick={() => {
                  const st = detailModalStation;
                  setDetailModalStation(null);
                  onBookStation(st);
                }}
                className="btn-primary text-xs px-6 py-2"
              >
                <Zap className="w-4 h-4" />
                <span>Reserve Slot Now</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
