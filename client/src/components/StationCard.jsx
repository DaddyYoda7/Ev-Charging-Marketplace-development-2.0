import React from 'react';
import { Zap, MapPin, Star, ShieldCheck, Sparkles, Navigation, Clock } from 'lucide-react';

export default function StationCard({
  station,
  onBook,
  onViewDetails,
  isTopPick = false
}) {
  const isAvailable = station.availableBays > 0;
  const matchPct = station.matchPercentage || 88;
  const hasScooty = station.chargers?.some(c => 
    c.connector_type.includes('2W') || 
    c.connector_type.includes('Ather') || 
    c.connector_type.includes('Ola') || 
    c.connector_type.includes('Swap')
  );

  return (
    <div className={`glass-panel glass-panel-hover overflow-hidden flex flex-col justify-between relative transition-all duration-300 rounded-2xl border ${
      isTopPick ? 'ring-2 ring-[#00F2FE] border-[#00F2FE]/50 shadow-xl shadow-cyan-500/10' : 'border-white/10 hover:border-cyan-400/40'
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
          
          {/* Status pill & vehicle compatibility on image */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className={`badge ${isAvailable ? 'badge-available' : 'badge-occupied'} shadow-lg`}>
              <span className={`pulse-dot ${isAvailable ? 'pulse-dot-green' : ''}`}></span>
              {isAvailable ? `${station.availableBays} Bays Open` : 'Full Occupancy'}
            </span>
            <span className="badge badge-charging shadow-lg">
              {hasScooty ? '🛵 2W/4W' : '⚡ 4W Only'}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 text-xs font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 font-mono">
            {station.distanceKm} km
          </div>
        </div>

        {/* Card Body with Centered & Balanced Alignment */}
        <div className="p-5 text-center">
          <h3
            onClick={() => onViewDetails(station)}
            className="text-base sm:text-lg font-bold text-white leading-snug hover:text-[#00F2FE] cursor-pointer transition-colors line-clamp-1"
          >
            {station.name}
          </h3>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-1 mb-3">
            <MapPin className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="truncate">{station.address}, {station.city}</span>
          </div>

          {/* AI Explainability Badge */}
          {station.aiVerdict && (
            <div className="bg-[#131B2E] border border-cyan-500/20 rounded-xl p-2.5 mb-3 text-xs text-cyan-200/90 flex items-center justify-center gap-2 text-center">
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
              <span className="truncate">{station.aiVerdict}</span>
            </div>
          )}

          {/* Plugs & Connector Types (Centered Badges with Hover Effect) */}
          <div className="mb-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 text-center">
              Available Charging Ports
            </div>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {station.chargers?.map((c, idx) => (
                <span
                  key={idx}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default ${
                    c.status === 'AVAILABLE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400'
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
            <div className="text-left">
              <span className="text-slate-400 text-[11px] block">Tariff from</span>
              <div className="text-base font-extrabold text-[#00E676] font-mono">
                ₹{station.minPrice ? station.minPrice.toFixed(2) : '12.50'} <span className="text-[10px] text-slate-400 font-normal">/ kWh</span>
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
      <div className="p-5 pt-0 grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onViewDetails(station)}
          className="btn-secondary text-xs py-2.5 justify-center font-bold"
        >
          View Specs
        </button>
        <button
          onClick={() => onBook(station)}
          className="btn-primary text-xs py-2.5 justify-center font-bold"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Book Bay</span>
        </button>
      </div>
    </div>
  );
}
