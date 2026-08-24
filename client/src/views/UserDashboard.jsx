import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BatteryCharging, Zap, Clock, Calendar, FileText, CheckCircle2, AlertCircle, XCircle, ArrowUpRight, Play, Square } from 'lucide-react';
import { api } from '../utils/api';

export default function UserDashboard({
  currentUser,
  primaryVehicle,
  onOpenGarage,
  onViewInvoice,
  onPayBooking
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    loadUserBookings();
  }, []);

  async function loadUserBookings() {
    setLoading(true);
    try {
      const res = await api.getUserBookings('usr-driver-1');
      if (res.success) {
        setBookings(res.bookings || []);
        const active = res.bookings?.find((b) => b.status === 'ACTIVE');
        if (active) setActiveSession(active);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(id) {
    if (!window.confirm('Are you sure you want to cancel this reservation and release the charging slot?')) return;
    try {
      const res = await api.cancelBooking(id);
      if (res.success) {
        loadUserBookings();
      }
    } catch (err) {
      console.error('Failed to cancel:', err);
    }
  }

  async function handleStartSession(bookingId) {
    try {
      await api.updateBookingStatus(bookingId, 'ACTIVE');
      loadUserBookings();
    } catch (err) {
      console.error('Failed to start session:', err);
    }
  }

  async function handleStopSession(bookingId) {
    try {
      await api.updateBookingStatus(bookingId, 'COMPLETED');
      loadUserBookings();
      setActiveSession(null);
    } catch (err) {
      console.error('Failed to stop session:', err);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Header Profile & Vehicle Banner */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="User"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00F2FE]/50 shadow-lg shadow-cyan-500/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{currentUser?.name || 'Aarav Sharma'}</h1>
              <span className="badge badge-ai text-[10px]">Verified EV Driver</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{currentUser?.email || 'aarav@evconnect.in'} • Member since Jan 2026</p>
          </div>
        </div>

        {/* Primary Vehicle Quick Card */}
        {primaryVehicle && (
          <div
            onClick={onOpenGarage}
            className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 cursor-pointer transition-all flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00E676]">
              <BatteryCharging className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{primaryVehicle.model}</span>
                <span className="text-[10px] text-[#00E676] font-mono">({primaryVehicle.connector_type})</span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                Battery SoC: <b className="text-white">{primaryVehicle.current_soc}%</b> • {primaryVehicle.battery_capacity} kWh
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Active Charging Session Box (Roadmap Phase 6.4 & 7.4) */}
      {activeSession && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#07242B] via-[#0D1B2A] to-[#141226] border border-cyan-400/40 shadow-2xl relative overflow-hidden animate-fadeIn">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="pulse-dot pulse-dot-cyan"></span>
                <span className="badge badge-charging text-[10px] font-mono">
                  LIVE CHARGING SESSION IN PROGRESS
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{activeSession.station_name}</h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Bay: {activeSession.charger_identifier} • Assigned Connector: {activeSession.connector_type}
              </p>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Power Draw</div>
                <div className="text-xl font-black text-[#00F2FE] font-mono mt-0.5">
                  {(activeSession.power_kw * 0.85).toFixed(1)} kW
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Energy Delivered</div>
                <div className="text-xl font-black text-[#00E676] font-mono mt-0.5">
                  {activeSession.estimated_kwh} kWh
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Target SoC</div>
                <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                  85%
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-white/10 text-center">
                <div className="text-[10px] text-slate-400 uppercase">Current Tariff</div>
                <div className="text-xl font-black text-white font-mono mt-0.5">
                  ₹{activeSession.estimated_amount}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStopSession(activeSession.id)}
              className="btn-danger text-xs py-3 px-6 justify-center shrink-0 font-bold"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Complete & Release Bay</span>
            </button>
          </div>
        </div>
      )}

      {/* Bookings & Reservations Section */}
      <div className="glass-panel p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#00F2FE]" />
            <h2 className="text-lg font-bold text-white">Your Reserved Slots & Charging History</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">{bookings.length} Total Bookings</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading charging history...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No charging bookings yet. Explore stations to reserve your first slot!
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isActive = b.status === 'ACTIVE';
              const isCompleted = b.status === 'COMPLETED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <Zap className="w-5 h-5 text-[#00F2FE]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{b.station_name}</span>
                        <span className={`badge text-[9px] ${
                          isActive ? 'badge-charging' : isConfirmed ? 'badge-available' : isCompleted ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'badge-faulted'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {b.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" /> {b.start_time}
                        </span>
                        <span>Bay: {b.charger_identifier}</span>
                        <span className="text-[#00E676] font-bold">₹{b.estimated_amount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {isConfirmed && !b.payment_status && (
                      <button
                        onClick={() => onPayBooking(b)}
                        className="btn-emerald text-xs py-1.5 px-3"
                      >
                        Authorize & Pay (₹)
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleStartSession(b.id)}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Plug In / Start</span>
                      </button>
                    )}

                    {(isConfirmed || isActive || isCompleted) && (
                      <button
                        onClick={() => onViewInvoice(b.id)}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>GST Invoice</span>
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Cancel reservation"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
