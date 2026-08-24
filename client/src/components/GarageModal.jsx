import React, { useState } from 'react';
import { X, BatteryCharging, Plus, CheckCircle2, Car, Zap } from 'lucide-react';
import { api } from '../utils/api';

export default function GarageModal({
  isOpen,
  onClose,
  vehicles = [],
  onVehiclesChange
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newBrand, setNewBrand] = useState('Tata Motors');
  const [newNumber, setNewNumber] = useState('');
  const [newBattery, setNewBattery] = useState(45);
  const [newConnector, setNewConnector] = useState('CCS2');
  const [adding, setAdding] = useState(false);

  if (!isOpen) return null;

  async function handleSetPrimary(id) {
    try {
      const res = await api.setPrimaryVehicle(id, 'usr-driver-1');
      if (res.success && onVehiclesChange) {
        onVehiclesChange(res.vehicles);
      }
    } catch (err) {
      console.error('Failed to set primary vehicle:', err);
    }
  }

  async function handleUpdateSoc(id, newSoc) {
    try {
      await api.updateVehicleSoc(id, newSoc);
      if (onVehiclesChange) {
        const updated = vehicles.map((v) => v.id === id ? { ...v, current_soc: newSoc } : v);
        onVehiclesChange(updated);
      }
    } catch (err) {
      console.error('Failed to update SoC:', err);
    }
  }

  async function handleAddVehicle(e) {
    e.preventDefault();
    if (!newModel) return;
    setAdding(true);
    try {
      const res = await api.addVehicle({
        userId: 'usr-driver-1',
        model: newModel,
        brand: newBrand || 'Tata Motors',
        vehicleNumber: newNumber || 'KA-01-EV-9900',
        batteryCapacity: Number(newBattery) || 45,
        connectorType: newConnector,
        currentSoc: 40
      });
      if (res.success && onVehiclesChange) {
        const refreshed = await api.getVehicles('usr-driver-1');
        onVehiclesChange(refreshed.vehicles);
        setShowAddForm(false);
        setNewModel('');
      }
    } catch (err) {
      console.error('Failed to add vehicle:', err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00E676] uppercase tracking-wider mb-1">
            <Car className="w-4 h-4" />
            <span>Driver Vehicle Garage & Battery Telemetry</span>
          </div>
          <h2 className="text-2xl font-black text-white">Registered Electric Vehicles</h2>
          <p className="text-xs text-slate-400 mt-0.5">Select active vehicle or adjust battery SoC % to recalculate AI matching.</p>
        </div>

        {/* Vehicles List */}
        <div className="space-y-4 mb-6">
          {vehicles.map((v) => {
            const isPrimary = v.is_primary === 1;
            return (
              <div
                key={v.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPrimary
                    ? 'bg-emerald-500/10 border-[#00E676] shadow-sm shadow-emerald-500/10'
                    : 'bg-white/[0.03] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{v.model}</span>
                      {isPrimary && (
                        <span className="badge badge-available text-[9px] py-0.5">
                          Active Primary
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {v.brand} • {v.vehicle_number} • {v.battery_capacity} kWh Pack
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="badge badge-charging font-mono text-[11px]">
                      {v.connector_type}
                    </span>
                    {!isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(v.id)}
                        className="text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Battery Slider for this vehicle */}
                <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-[#00E676]" />
                      Current Battery State of Charge (SoC):
                    </span>
                    <span className="font-mono font-bold text-[#00E676]">{v.current_soc}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={v.current_soc}
                    onChange={(e) => handleUpdateSoc(v.id, Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Vehicle Toggle */}
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full btn-secondary text-xs py-2.5 justify-center border-dashed"
          >
            <Plus className="w-4 h-4 text-[#00F2FE]" />
            <span>Add Another Electric Vehicle (Tata / MG / Mahindra / Hyundai)</span>
          </button>
        ) : (
          /* Add Vehicle Form */
          <form onSubmit={handleAddVehicle} className="p-4 rounded-xl bg-white/[0.04] border border-white/15 space-y-3">
            <div className="text-xs font-bold text-white mb-1">Add New EV to Garage</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Make / Brand</label>
                <select
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="input-glass mt-1 text-xs"
                >
                  <option value="Tata Motors">Tata Motors</option>
                  <option value="MG Motor India">MG Motor India</option>
                  <option value="Mahindra Electric">Mahindra Electric</option>
                  <option value="Hyundai India">Hyundai India</option>
                  <option value="BYD India">BYD India</option>
                  <option value="Tesla">Tesla</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Model</label>
                <input
                  type="text"
                  placeholder="e.g. Nexon EV, Curvv EV, Atto 3"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="input-glass mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Reg Plate #</label>
                <input
                  type="text"
                  placeholder="e.g. KA-01-EV-1122"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  className="input-glass mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Battery (kWh)</label>
                <input
                  type="number"
                  placeholder="45"
                  value={newBattery}
                  onChange={(e) => setNewBattery(e.target.value)}
                  className="input-glass mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase">Connector</label>
                <select
                  value={newConnector}
                  onChange={(e) => setNewConnector(e.target.value)}
                  className="input-glass mt-1 text-xs font-mono"
                >
                  <option value="CCS2">CCS2</option>
                  <option value="Type 2">Type 2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="NACS">NACS</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary text-xs px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="btn-primary text-xs px-4 py-1.5"
              >
                {adding ? 'Saving...' : 'Save Vehicle'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
