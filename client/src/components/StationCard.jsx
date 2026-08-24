import React from 'react';
import { Zap, MapPin, Star, ShieldCheck, Sparkles, Navigation, Clock } from 'lucide-react';

export default function StationCard({
  station,
  onBook,
  onViewDetails,
  isTopPick = false
}) {
  const isAvailable = station.availableBays > 0;
  const matchPct = station.matchPercentage || 85;

  return (
    <div className={`glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between relative transition-all duration-300 ${
      isTopPick ? 'ring-2 ring-[#00F2FE] shadow-xl shadow-cyan-500/10' : ''
    }`}>
      {/* Top Pick / AI Badge Ribbon */}
      {isTopPick && (
        <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-[#00F2FE] to-[#8B5CF6] text-[#040814] text-[11px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-cyan-500/30">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>AI Top Match ({matchPct}%)</span>
        </div>
      )}

      {/* Card Header & Media */}
      <div>
        <div className="relative h-44 w-full overflow-hidden">
          <img
            src={station.image_url || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'}
            alt={station.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-black/30 to-transparent"></div>
          
          {/* Status pill on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className={`badge ${isAvailable ? 'badge-available' : 'badge-occupied'}`}>
              <span className={`pulse-dot ${isAvailable ? 'pulse-dot-green' : ''}`}></span>
              {isAvailable ? `${station.availableBays} Plugs Ready` : 'Full Occupancy'}
            </span>
            <span className="badge badge-charging">
              <Zap className="w-3 h-3 text-[#00F2FE]" />
              {station.maxPower} kW Max
            </span>
          </div>

          <div className="absolute bottom-3 right-3 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono">
            {station.distanceKm} km away
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-lg font-bold text-white leading-snug hover:text-[#00F2FE] cursor-pointer transition-colors" onClick={() => onViewDetails(station)}>
              {station.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{station.address}</span>
          </div>

          {/* AI Explainability Badge */}
          {station.aiVerdict && (
            <div className="bg-[#131B2E] border border-cyan-500/20 rounded-xl p-2.5 mb-4 text-xs text-cyan-200/90 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-semibold text-white">AI Verdict: </span>
                {station.aiVerdict}
              </div>
            </div>
          )}

          {/* Plugs & Connector Types */}
          <div className="mb-4">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Compatible Connectors</div>
            <div className="flex flex-wrap gap-1.5">
              {station.chargers?.map((c, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${
                    c.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-white/5'
                  }`}
                >
                  {c.connector_type} • {c.power_kw}kW
                </span>
              ))}
            </div>
          </div>

          {/* Pricing & Rating row */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">Tariff from</span>
              <div className="text-base font-extrabold text-[#00E676] font-mono">
                ₹{station.minPrice ? station.minPrice.toFixed(2) : '19.50'} <span className="text-[11px] text-slate-400 font-normal">/ kWh</span>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400 font-bold justify-end">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{station.rating}</span>
                <span className="text-slate-500 text-[11px] font-normal">({station.review_count || 45})</span>
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" /> {station.opening_hours || '24/7 Open'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Action Footer with Centrally Aligned Buttons */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2">
        <button
          onClick={() => onViewDetails(station)}
          className="btn-secondary text-xs py-2 justify-center"
        >
          View Specs
        </button>
        <button
          onClick={() => onBook(station)}
          className="btn-primary text-xs py-2 justify-center"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Book Bay</span>
        </button>
      </div>
    </div>
  );
}
