import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Zap, BatteryCharging, Sparkles, Navigation, CheckCircle2, RotateCcw } from 'lucide-react';
import InteractiveMap from '../components/InteractiveMap';
import StationCard from '../components/StationCard';
import StationDetailModal from '../components/StationDetailModal';
import { api } from '../utils/api';

export default function UserExploreView({
  onSelectStation,
  onBookStation,
  primaryVehicle,
  onOpenGarage
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('ALL'); // 'ALL' | 'SCOOTY' | 'CAR'
  const [selectedConnector, setSelectedConnector] = useState('');
  const [minPower, setMinPower] = useState(0);
  const [maxPrice, setMaxPrice] = useState(35.0);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'map' | 'list'
  const [selectedStation, setSelectedStation] = useState(null);
  const [detailModalStation, setDetailModalStation] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 12.9716, lon: 77.5946 });

  useEffect(() => {
    fetchStations();
  }, [searchQuery, selectedConnector, minPower, maxPrice, availableOnly, primaryVehicle, vehicleCategory, userLocation]);

  async function fetchStations() {
    setLoading(true);
    try {
      const res = await api.getStations({
        search: searchQuery,
        connector: selectedConnector,
        minPower,
        maxPrice,
        availableOnly,
        userLat: userLocation.lat,
        userLon: userLocation.lon
      });

      if (res.success) {
        let results = res.stations || [];
        
        // Filter by Vehicle Category
        if (vehicleCategory === 'SCOOTY') {
          results = results.filter(s => s.chargers?.some(c => 
            c.connector_type.includes('2W') || 
            c.connector_type.includes('Ather') || 
            c.connector_type.includes('Ola') || 
            c.connector_type.includes('Swap') ||
            c.connector_type.includes('15A')
          ));
        } else if (vehicleCategory === 'CAR') {
          results = results.filter(s => s.chargers?.some(c => 
            c.connector_type.includes('CCS2') || 
            c.connector_type.includes('Type 2') ||
            c.power_kw >= 50
          ));
        }

        setStations(results);
      }
    } catch (err) {
      console.error('Failed to load stations:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleResetFilters() {
    setSearchQuery('');
    setVehicleCategory('ALL');
    setSelectedConnector('');
    setMinPower(0);
    setMaxPrice(35.0);
    setAvailableOnly(false);
  }

  function handleStationSelect(st) {
    setSelectedStation(st);
    if (onSelectStation) onSelectStation(st);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#00F2FE]/20 to-[#00E676]/20 border border-cyan-400/30 text-xs font-bold text-cyan-300 font-mono">
            <span className="pulse-dot pulse-dot-green"></span>
            <span>Pan-India Live EV Radar & Scooty Battery Swaps Active 🇮🇳</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Find, Reserve & Charge Any EV in India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Live charging bays for <b>Ather, Ola, TVS, Vida, Chetak EV Scooters</b> and <b>Tata, MG, Mahindra, Hyundai 4W Cars</b> across 14+ Indian hubs.
          </p>
        </div>

        {/* Primary Vehicle Garage Badge */}
        <div className="flex items-center gap-3 shrink-0 relative z-10">
          {primaryVehicle ? (
            <div
              onClick={onOpenGarage}
              className="p-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/15 cursor-pointer transition-all flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E676]">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{primaryVehicle.model}</span>
                  <span className="text-[10px] text-[#00E676] font-mono">({primaryVehicle.connector_type})</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Battery: <b className="text-white">{primaryVehicle.current_soc}%</b> • {primaryVehicle.battery_capacity} kWh
                </div>
              </div>
            </div>
          ) : (
            <button onClick={onOpenGarage} className="btn-secondary text-xs">
              Configure EV Garage
            </button>
          )}
        </div>
      </div>

      {/* Vehicle Category & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0E1524] p-3 rounded-2xl border border-white/10 shadow-lg">
        
        {/* Category Filters with Centered Alignment & Hover Effects */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setVehicleCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              vehicleCategory === 'ALL'
                ? 'bg-gradient-to-r from-[#00F2FE] to-[#00B0FF] text-[#040814] shadow-md shadow-cyan-500/30'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>All Stations ({stations.length})</span>
          </button>

          <button
            onClick={() => setVehicleCategory('SCOOTY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              vehicleCategory === 'SCOOTY'
                ? 'bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-[#040814] shadow-md shadow-emerald-500/30'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🛵 EV Scooty (2W)</span>
          </button>

          <button
            onClick={() => setVehicleCategory('CAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              vehicleCategory === 'CAR'
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] text-white shadow-md shadow-purple-500/30'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>🚗 4W Fast DC Cars</span>
          </button>
        </div>

        {/* View Mode Tabs (Split 50/50, Map Only, Grid List) */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              viewMode === 'both' ? 'bg-[#00F2FE] text-[#040814] shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Split 50/50</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              viewMode === 'map' ? 'bg-[#00F2FE] text-[#040814] shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Live Map</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
              viewMode === 'list' ? 'bg-[#00F2FE] text-[#040814] shadow-sm shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Grid List</span>
          </button>
        </div>
      </div>

      {/* Search & Dynamic Filter Controls Bar */}
      <div className="glass-panel p-4 border border-white/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station, city (Bengaluru, Mumbai, Delhi...), highway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass pl-10 text-xs"
            />
          </div>

          {/* Connector Standard Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="input-glass text-xs"
            >
              <option value="">All Connector Standards</option>
              <option value="Ather Grid (2W)">🛵 Ather Grid Fast (2W)</option>
              <option value="Ola Hypercharger (2W)">🛵 Ola Hypercharger (2W)</option>
              <option value="15A EV Socket (2W)">🛵 15A EV Scooty Socket</option>
              <option value="Battery Swap (2W)">🛵 2W Fast Battery Swap</option>
              <option value="CCS2">🚗 CCS2 (Tata / MG / Hyundai / Mahindra)</option>
              <option value="Type 2">🚗 Type 2 AC</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div className="md:col-span-3 bg-black/30 p-2 rounded-xl border border-white/5 text-xs">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Max Tariff:</span>
              <span className="font-mono text-[#00E676] font-bold">₹{maxPrice.toFixed(2)}/kWh</span>
            </div>
            <input
              type="range"
              min="10"
              max="35"
              step="1"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Available Only Toggle & Reset */}
          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                availableOnly
                  ? 'bg-emerald-500/20 text-[#00E676] border-emerald-500/40'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              <span className={`pulse-dot ${availableOnly ? 'pulse-dot-green' : ''}`}></span>
              <span>Open Bays</span>
            </button>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Layout (50/50 Half Screen Split or Full Views) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Live Interactive Map (50% on Desktop in Split View) */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div className={`${viewMode === 'map' ? 'lg:col-span-12' : 'lg:col-span-6'} transition-all duration-300`}>
            <InteractiveMap
              stations={stations}
              selectedStation={selectedStation}
              onSelectStation={handleStationSelect}
              onBookStation={(st) => onBookStation(st)}
              userLocation={userLocation}
              onUserLocationChange={(coords) => setUserLocation(coords)}
              viewMode={viewMode}
            />
          </div>
        )}

        {/* Right Side: Available Charging Stations (50% on Desktop in Split View with Scrollable Column) */}
        {(viewMode === 'both' || viewMode === 'list') && (
          <div className={`${viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-6'} transition-all duration-300`}>
            
            <div className="glass-panel p-4 border border-white/10 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00F2FE]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Available Charging Stations ({stations.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Live Radar Synced</span>
            </div>

            {loading ? (
              <div className="glass-panel p-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning Pan-India EV charging grid...</span>
              </div>
            ) : stations.length === 0 ? (
              <div className="glass-panel p-16 text-center text-slate-400 text-xs">
                No charging stations matched your filter criteria. Try resetting filters.
              </div>
            ) : (
              <div className={`${viewMode === 'list' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-4 max-h-[660px] overflow-y-auto pr-1'}`}>
                {stations.map((st, idx) => (
                  <StationCard
                    key={st.id}
                    station={st}
                    isTopPick={idx === 0}
                    onBook={(station) => onBookStation(station)}
                    onViewDetails={(station) => {
                      handleStationSelect(station);
                      setDetailModalStation(station);
                    }}
                  />
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* Station Detail / Specs Modal */}
      {detailModalStation && (
        <StationDetailModal
          isOpen={!!detailModalStation}
          onClose={() => setDetailModalStation(null)}
          station={detailModalStation}
          onBook={(st) => onBookStation(st)}
        />
      )}

    </div>
  );
}
