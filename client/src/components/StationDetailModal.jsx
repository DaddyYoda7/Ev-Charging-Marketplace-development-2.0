import React from 'react';
import { X, Zap, MapPin, Star, ShieldCheck, Clock, CheckCircle2, ChevronRight, Navigation, Sparkles, AlertTriangle } from 'lucide-react';

export default function StationDetailModal({
  isOpen,
  onClose,
  station,
  onBook
}) {
  if (!isOpen || !station) return null;

  const isAvailable = station.availableBays > 0;
  const matchPct = station.matchPercentage || 88;
  const chargers = station.chargers || [];

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Station Hero Image & Badges */}
        <div className="relative h-52 w-full rounded-2xl overflow-hidden mb-6 border border-white/10">
          <img
            src={station.image_url || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&auto=format&fit=crop&q=80'}
            alt={station.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1524] via-black/40 to-transparent"></div>

          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="badge badge-ai">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              AI Match {matchPct}%
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className={`badge ${isAvailable ? 'badge-available' : 'badge-occupied'} mb-1.5`}>
                <span className={`pulse-dot ${isAvailable ? 'pulse-dot-green' : ''}`}></span>
                {isAvailable ? `${station.availableBays} of ${station.totalBays} Bays Available` : 'Full Occupancy'}
              </span>
              <h2 className="text-2xl font-black text-white">{station.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>{station.address}, {station.city}</span>
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Tariff from</div>
              <div className="text-2xl font-black text-[#00E676] font-mono">
                ₹{station.minPrice ? station.minPrice.toFixed(2) : '12.50'}<span className="text-xs text-slate-400 font-normal">/kWh</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Verdict Banner */}
        {station.aiVerdict && (
          <div className="bg-[#131E33] border border-cyan-500/30 rounded-2xl p-4 mb-6 text-xs text-cyan-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white uppercase tracking-wider block mb-0.5">Explainable AI Analysis:</span>
              <p className="leading-relaxed">{station.aiVerdict}</p>
            </div>
          </div>
        )}

        {/* Bays & Chargers Hardware Specification Grid */}
        <div className="space-y-3 mb-6">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Installed Charging Bays & Telemetry Status ({chargers.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chargers.map((c) => {
              const isAvail = c.status === 'AVAILABLE';
              const isCharging = c.status === 'CHARGING';
              const isFaulted = c.status === 'FAULTED';
              const is2W = c.connector_type.includes('2W') || c.connector_type.includes('Ather') || c.connector_type.includes('Ola') || c.connector_type.includes('Swap');

              return (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{is2W ? '🛵' : '🚗'}</span>
                        <span>{c.identifier}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {c.connector_type} • {c.current_type}
                      </div>
                    </div>
                    <span className={`badge text-[9px] ${
                      isAvail ? 'badge-available' : isCharging ? 'badge-charging' : 'badge-faulted'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-[#00F2FE] font-bold">⚡ {c.power_kw} kW Peak</span>
                    <span className="text-[#00E676] font-bold">₹{c.price_per_kwh?.toFixed(2)}/kWh</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Amenities & Operating Details */}
        <div className="p-4 rounded-xl bg-black/30 border border-white/10 mb-6 space-y-3">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Station Amenities & Facilities
          </div>
          <div className="flex flex-wrap gap-2">
            {station.amenities?.map((amenity, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-5 py-2.5"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              if (onBook) onBook(station);
            }}
            className="btn-primary text-xs px-6 py-2.5 justify-center font-bold"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Book & Reserve Slot</span>
          </button>
        </div>

      </div>
    </div>
  );
}
