import React, { useState, useEffect } from 'react';
import { Building2, Plus, Zap, Settings, DollarSign, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Trash2, Edit3 } from 'lucide-react';
import { api } from '../utils/api';

export default function HostDashboard({
  currentUser
}) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showAddStation, setShowAddStation] = useState(false);
  const [showAddCharger, setShowAddCharger] = useState(false);

  // New Station Form State
  const [newStationName, setNewStationName] = useState('');
  const [newStationAddress, setNewStationAddress] = useState('');
  const [newStationHours, setNewStationHours] = useState('24/7 Open');
  const [submittingStation, setSubmittingStation] = useState(false);

  // New Charger Form State
  const [chargerIdentifier, setChargerIdentifier] = useState('');
  const [chargerPower, setChargerPower] = useState(150);
  const [chargerConnector, setChargerConnector] = useState('CCS2');
  const [chargerCurrentType, setChargerCurrentType] = useState('DC Fast');
  const [chargerPrice, setChargerPrice] = useState(21.00);
  const [submittingCharger, setSubmittingCharger] = useState(false);

  useEffect(() => {
    loadHostStations();
  }, []);

  async function loadHostStations() {
    setLoading(true);
    try {
      const res = await api.getStations({ ownerId: 'usr-owner-1' });
      if (res.success) {
        setStations(res.stations || []);
        if (res.stations?.length > 0 && !selectedStation) {
          setSelectedStation(res.stations[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load host stations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStation(e) {
    e.preventDefault();
    if (!newStationName || !newStationAddress) return;
    setSubmittingStation(true);
    try {
      const res = await api.createStation({
        owner_id: 'usr-owner-1',
        name: newStationName,
        address: newStationAddress,
        city: 'Bengaluru',
        latitude: 12.9716 + (Math.random() * 0.04 - 0.02),
        longitude: 77.5946 + (Math.random() * 0.04 - 0.02),
        opening_hours: newStationHours,
        amenities: ['24/7 Access', 'CCTV Security', 'Fast DC Hub', 'High-Speed Wi-Fi']
      });

      if (res.success) {
        setShowAddStation(false);
        setNewStationName('');
        setNewStationAddress('');
        await loadHostStations();
      }
    } catch (err) {
      console.error('Failed to create station:', err);
    } finally {
      setSubmittingStation(false);
    }
  }

  async function handleAddCharger(e) {
    e.preventDefault();
    if (!selectedStation || !chargerIdentifier) return;
    setSubmittingCharger(true);
    try {
      const res = await api.addCharger(selectedStation.id, {
        identifier: chargerIdentifier,
        connector_type: chargerConnector,
        current_type: chargerCurrentType,
        power_kw: Number(chargerPower),
        price_per_kwh: Number(chargerPrice)
      });
      if (res.success) {
        setShowAddCharger(false);
        setChargerIdentifier('');
        await loadHostStations();
        const updated = await api.getStation(selectedStation.id);
        if (updated.success) setSelectedStation(updated.station);
      }
    } catch (err) {
      console.error('Failed to add charger:', err);
    } finally {
      setSubmittingCharger(false);
    }
  }

  async function handleUpdateTariff(chargerId, newPrice) {
    try {
      await api.updateCharger(chargerId, { price_per_kwh: Number(newPrice) });
      const updated = await api.getStation(selectedStation.id);
      if (updated.success) setSelectedStation(updated.station);
    } catch (err) {
      console.error('Failed to update tariff:', err);
    }
  }

  async function handleDeleteCharger(chargerId) {
    if (!window.confirm('Delete this charger bay from your station?')) return;
    try {
      await api.deleteCharger(chargerId);
      const updated = await api.getStation(selectedStation.id);
      if (updated.success) setSelectedStation(updated.station);
      loadHostStations();
    } catch (err) {
      console.error('Failed to delete charger:', err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00E676] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Station Host Marketplace & Infrastructure</span>
          </div>
          <h1 className="text-2xl font-black text-white">Hubs & Dynamic Tariff Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage charging bays, configure ₹/kWh dynamic tariffs, and monitor station health.</p>
        </div>

        <button
          onClick={() => setShowAddStation(true)}
          className="btn-emerald text-xs px-4 py-2.5"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy New Station</span>
        </button>
      </div>

      {/* Main Grid: Station Selector (Left) & Station Detail/Charger CRUD (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Host Stations List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Your Managed Stations ({stations.length})
          </div>

          {loading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading station assets...</div>
          ) : (
            stations.map((st) => {
              const isSelected = selectedStation?.id === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-[#00E676] shadow-sm shadow-emerald-500/10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-white">{st.name}</h3>
                    <span className="badge badge-available text-[9px]">
                      {st.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 truncate">{st.address}</p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10 text-xs font-mono">
                    <span className="text-[#00F2FE]">{st.totalBays || st.chargers?.length || 0} Charging Bays</span>
                    <span className="text-[#00E676]">₹{st.minPrice?.toFixed(2) || '19.50'}/kWh</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Station Details & Chargers (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStation ? (
            <div className="glass-panel p-6 border border-white/10 space-y-6">
              
              {/* Station Info Top */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedStation.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedStation.address}, {selectedStation.city}</p>
                </div>

                <button
                  onClick={() => setShowAddCharger(true)}
                  className="btn-primary text-xs px-3.5 py-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Charger Bay</span>
                </button>
              </div>

              {/* Chargers List & Dynamic Tariffs */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Installed Charger Bays & Dynamic Pricing (₹)
                </div>

                <div className="space-y-3">
                  {selectedStation.chargers?.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{c.identifier}</span>
                          <span className={`badge text-[9px] ${
                            c.status === 'AVAILABLE' ? 'badge-available' : c.status === 'CHARGING' ? 'badge-charging' : 'badge-faulted'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-mono">
                          {c.power_kw} kW {c.current_type} • {c.connector_type} • Temp: {c.temperature_c}°C
                        </div>
                      </div>

                      {/* Tariff input & Action */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                          <span className="text-xs font-bold text-[#00E676]">₹</span>
                          <input
                            type="number"
                            step="0.50"
                            defaultValue={c.price_per_kwh}
                            onBlur={(e) => handleUpdateTariff(c.id, e.target.value)}
                            className="bg-transparent text-xs font-bold font-mono text-white w-14 outline-none"
                            title="Edit tariff (₹/kWh)"
                          />
                          <span className="text-[10px] text-slate-400 font-mono">/ kWh</span>
                        </div>

                        <button
                          onClick={() => handleDeleteCharger(c.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Remove charger"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 text-xs">
              Select a station to manage chargers and tariffs.
            </div>
          )}
        </div>

      </div>

      {/* Add Station Modal */}
      {showAddStation && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-lg p-6 relative border border-white/20 bg-[#0E1524]">
            <button onClick={() => setShowAddStation(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Deploy New Charging Hub</h2>
            <form onSubmit={handleCreateStation} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Station Hub Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VoltFlow HyperHub - HSR Layout"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 27th Main Road, Sector 1, HSR Layout, Bengaluru"
                  value={newStationAddress}
                  onChange={(e) => setNewStationAddress(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={newStationHours}
                  onChange={(e) => setNewStationHours(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStation(false)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                <button type="submit" disabled={submittingStation} className="btn-emerald text-xs px-5 py-1.5">
                  {submittingStation ? 'Deploying...' : 'Deploy Station'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Charger Modal */}
      {showAddCharger && (
        <div className="modal-overlay">
          <div className="glass-panel w-full max-w-md p-6 relative border border-white/20 bg-[#0E1524]">
            <button onClick={() => setShowAddCharger(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-white mb-4">Add Charger Bay</h2>
            <form onSubmit={handleAddCharger} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Identifier</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BAY-04 (Ultra-Fast DC)"
                  value={chargerIdentifier}
                  onChange={(e) => setChargerIdentifier(e.target.value)}
                  className="input-glass text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Connector</label>
                  <select
                    value={chargerConnector}
                    onChange={(e) => setChargerConnector(e.target.value)}
                    className="input-glass text-xs"
                  >
                    <option value="CCS2">CCS2</option>
                    <option value="Type 2">Type 2</option>
                    <option value="CHAdeMO">CHAdeMO</option>
                    <option value="NACS">NACS</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Power (kW)</label>
                  <input
                    type="number"
                    value={chargerPower}
                    onChange={(e) => setChargerPower(e.target.value)}
                    className="input-glass text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tariff Rate (₹ / kWh)</label>
                <input
                  type="number"
                  step="0.50"
                  value={chargerPrice}
                  onChange={(e) => setChargerPrice(e.target.value)}
                  className="input-glass text-xs font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddCharger(false)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
                <button type="submit" disabled={submittingCharger} className="btn-primary text-xs px-5 py-1.5">
                  {submittingCharger ? 'Adding...' : 'Add Charger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
