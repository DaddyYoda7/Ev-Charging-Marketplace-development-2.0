import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Zap, BatteryCharging, Sparkles, Navigation, CheckCircle2, RotateCcw, Compass } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Left Side: Headline & Subtitle */}
        <div className="space-y-3 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#00F2FE]/20 to-[#00E676]/20 border border-cyan-400/30 text-xs font-bold text-cyan-300 font-mono shadow-sm">
            <span className="pulse-dot pulse-dot-green"></span>
            <span>Live Pan-India EV Infrastructure Active 🇮🇳</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Find, Reserve & Charge Any EV in India
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Real-time charging bays & battery swap hubs for <span className="text-emerald-400 font-semibold">Ather, Ola, TVS, Vida, Chetak EV Scooters</span> and <span className="text-cyan-300 font-semibold">Tata, MG, Mahindra, Hyundai 4W Cars</span> across India.
          </p>
        </div>

        {/* Right Side: Active Primary Vehicle Card */}
        <div className="shrink-0 flex items-center justify-start lg:justify-end">
          {primaryVehicle ? (
            <div
              onClick={onOpenGarage}
              title="Click to switch vehicle or adjust battery SoC"
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all duration-300 flex items-center gap-4 shadow-xl shadow-cyan-500/5 group w-full sm:w-auto hover:scale-105"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-[#00E676] group-hover:scale-110 transition-transform shrink-0">
                <BatteryCharging className="w-6 h-6" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white tracking-tight">{primaryVehicle.model}</span>
                  <span className="badge badge-charging text-[10px] font-mono py-0.5 px-2">
                    {primaryVehicle.connector_type}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-2">
                  <span>Battery SoC: <b className="text-[#00E676] font-bold">{primaryVehicle.current_soc}%</b></span>
                  <span className="text-slate-500">•</span>
                  <span>{primaryVehicle.battery_capacity} kWh</span>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={onOpenGarage} className="btn-secondary text-xs px-5 py-3">
              Configure EV Garage
            </button>
          )}
        </div>

      </div>

      {/* Vehicle Category Selector Bar with Transparent Background & Small "14 Cities Connected" Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
        
        {/* Category Filters with Transparent Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setVehicleCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              vehicleCategory === 'ALL'
                ? 'bg-gradient-to-r from-[#00F2FE] to-[#00B0FF] text-[#040814] shadow-md shadow-cyan-500/30 scale-105 font-black'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>All Charging Hubs ({stations.length})</span>
          </button>

          <button
            onClick={() => setVehicleCategory('SCOOTY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              vehicleCategory === 'SCOOTY'
                ? 'bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-[#040814] shadow-md shadow-emerald-500/30 scale-105 font-black'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105'
            }`}
          >
            <span>🛵 EV Scooty (2W Fast & Swaps)</span>
          </button>

          <button
            onClick={() => setVehicleCategory('CAR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              vehicleCategory === 'CAR'
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] text-white shadow-md shadow-purple-500/30 scale-105 font-black'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/15 hover:scale-105'
            }`}
          >
            <span>🚗 4W Fast DC Cars</span>
          </button>

          {/* 14 Cities Connected Badge (Noticeably Smaller & Delicate) */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono tracking-tight self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] shadow-sm shadow-emerald-400"></span>
            <span>14 Cities Connected</span>
          </div>
        </div>

      </div>

      {/* Search & Dynamic Filter Controls Bar (Transparent Backgrounds) */}
      <div className="glass-panel p-4 md:p-5 border border-white/10 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          
          {/* Transparent Search Input */}
          <div className="md:col-span-4 relative flex items-center">
            <Search className="w-4 h-4 text-[#00F2FE] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search station, city, expressway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/15 hover:border-white/30 focus:border-[#00F2FE] text-white placeholder-slate-400 pl-10 pr-3 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-[#00F2FE] transition-all font-body"
            />
          </div>

          {/* Transparent Connector Standard Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedConnector}
              onChange={(e) => setSelectedConnector(e.target.value)}
              className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/10 border border-white/15 hover:border-white/30 focus:border-[#00F2FE] text-white pl-3 pr-8 py-2.5 rounded-xl text-xs outline-none transition-all font-body cursor-pointer"
            >
              <option value="" className="bg-[#0B0F19] text-white">All Connector Standards</option>
              <option value="Ather Grid (2W)" className="bg-[#0B0F19] text-white">🛵 Ather Grid Fast (2W)</option>
              <option value="Ola Hypercharger (2W)" className="bg-[#0B0F19] text-white">🛵 Ola Hypercharger (2W)</option>
              <option value="15A EV Socket (2W)" className="bg-[#0B0F19] text-white">🛵 15A EV Scooty Socket</option>
              <option value="Battery Swap (2W)" className="bg-[#0B0F19] text-white">🛵 2W Fast Battery Swap</option>
              <option value="CCS2" className="bg-[#0B0F19] text-white">🚗 CCS2 (Tata / MG / Hyundai / Mahindra)</option>
              <option value="Type 2" className="bg-[#0B0F19] text-white">🚗 Type 2 AC</option>
            </select>
          </div>

          {/* Transparent Max Price Range Slider */}
          <div className="md:col-span-3 bg-white/5 p-2.5 rounded-xl border border-white/15 text-xs">
            <div className="flex justify-between text-[11px] text-slate-300 mb-1">
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
              className="w-full h-1.5 bg-white/10 rounded appearance-none cursor-pointer"
            />
          </div>

          {/* Transparent Available Only Toggle & Reset */}
          <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2">
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                availableOnly
                  ? 'bg-emerald-500/25 text-[#00E676] border-emerald-500/50 shadow-sm'
                  : 'bg-white/5 text-slate-300 border-white/15 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={`pulse-dot ${availableOnly ? 'pulse-dot-green' : ''}`}></span>
              <span>Open Bays</span>
            </button>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2.5 text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/15 transition-all cursor-pointer hover:scale-105"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* 1. Default Pan-India EV Charging Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#00F2FE]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pan-India EV Charging Map
            </h2>
          </div>
          <span className="text-xs text-slate-300 font-mono">Interactive GPS & Topography</span>
        </div>

        <InteractiveMap
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={handleStationSelect}
          onBookStation={(st) => onBookStation(st)}
          userLocation={userLocation}
          onUserLocationChange={(coords) => setUserLocation(coords)}
        />
      </div>

      {/* 2. Available Charging Stations Section */}
      <div className="space-y-5 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00F2FE]" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Available Charging Stations
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Verified charging bays & battery swap hubs sorted by AI matching score and proximity.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="badge badge-available text-xs px-3 py-1 font-mono">
              {stations.length} Hubs Ready
            </span>
          </div>
        </div>

        {loading ? (
          <div className="glass-panel p-16 text-center text-slate-300 text-xs flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
            <span>Scanning Pan-India EV charging grid...</span>
          </div>
        ) : stations.length === 0 ? (
          <div className="glass-panel p-16 text-center text-slate-300 text-xs">
            No charging stations matched your filter criteria. Try resetting filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
