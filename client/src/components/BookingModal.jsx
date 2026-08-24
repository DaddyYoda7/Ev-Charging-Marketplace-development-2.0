import React, { useState, useEffect } from 'react';
import { X, Zap, Calendar, Clock, BatteryCharging, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';

export default function BookingModal({
  isOpen,
  onClose,
  station,
  vehicle,
  onProceedToPayment
}) {
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [targetSoc, setTargetSoc] = useState(85);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (station && station.chargers?.length > 0) {
      const defaultCharger = station.chargers.find((c) => c.status === 'AVAILABLE') || station.chargers[0];
      setSelectedCharger(defaultCharger);
    }
  }, [station]);

  useEffect(() => {
    if (selectedCharger) {
      fetchSlots(selectedCharger.id, selectedDate);
    }
  }, [selectedCharger, selectedDate]);

  async function fetchSlots(chargerId, date) {
    setLoadingSlots(true);
    setBookingError('');
    setSelectedSlot(null);
    try {
      const res = await api.getSlots(chargerId, date);
      if (res.success) {
        setSlots(res.slots || []);
        const firstAvail = res.slots?.find((s) => s.status === 'AVAILABLE');
        if (firstAvail) setSelectedSlot(firstAvail);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoadingSlots(false);
    }
  }

  if (!isOpen || !station) return null;

  // Energy & Rupee Calculation
  const batteryCap = vehicle ? vehicle.battery_capacity : 45.0;
  const currentSoc = vehicle ? vehicle.current_soc : 30.0;
  const neededSocPct = Math.max(10, targetSoc - currentSoc);
  const estimatedKwh = Number(((neededSocPct / 100) * batteryCap).toFixed(1));
  const estimatedPrice = selectedCharger
    ? Number((estimatedKwh * selectedCharger.price_per_kwh).toFixed(2))
    : 450.00;

  async function handleConfirmBooking() {
    if (!selectedSlot) {
      setBookingError('Please select a charging time slot to reserve.');
      return;
    }
    setSubmitting(true);
    setBookingError('');

    try {
      const res = await api.createBooking({
        userId: 'usr-driver-1',
        stationId: station.id,
        chargerId: selectedCharger.id,
        vehicleId: vehicle ? vehicle.id : null,
        date: selectedDate,
        startTime: selectedSlot.time,
        durationMins: 45,
        targetSoc
      });

      if (res.success) {
        onClose();
        if (onProceedToPayment) {
          onProceedToPayment(res.booking);
        }
      } else {
        setBookingError(res.error || 'Booking conflict detected. Please select another slot.');
      }
    } catch (err) {
      setBookingError('Double-booking conflict or network error. Please try another slot.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00F2FE] uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4" />
            <span>Smart Slot Reservation & Conflict Protection</span>
          </div>
          <h2 className="text-2xl font-black text-white">{station.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{station.address}</p>
        </div>

        {/* Conflict / Error Banner */}
        {bookingError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center justify-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <div>{bookingError}</div>
          </div>
        )}

        <div className="space-y-6">

          {/* 1. Charger Bay Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
              1. Select Charging Bay & Connector Standard
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {station.chargers?.map((c) => {
                const isSelected = selectedCharger?.id === c.id;
                const isAvail = c.status === 'AVAILABLE';
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCharger(c)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/15 border-[#00F2FE] shadow-sm shadow-cyan-500/20'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>{c.identifier}</span>
                        <span className="text-[11px] font-mono text-[#00F2FE]">({c.power_kw}kW)</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        {c.connector_type} • ₹{c.price_per_kwh.toFixed(2)}/kWh
                      </div>
                    </div>
                    <span className={`badge text-[10px] ${isAvail ? 'badge-available' : 'badge-occupied'}`}>
                      {c.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Date & Dynamic Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Pick Date & 45-Minute Slot
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white/5 border border-white/15 text-white text-xs px-2.5 py-1 rounded-lg outline-none focus:border-[#00F2FE]"
              />
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
                <span>Checking real-time slot locks in Indian grid...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-44 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.time === slot.time;
                  const isAvailable = slot.status === 'AVAILABLE';
                  return (
                    <button
                      key={slot.time}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-lg text-xs font-semibold font-mono border transition-all text-center ${
                        isSelected
                          ? 'bg-[#00F2FE] text-[#040814] border-[#00F2FE] font-bold shadow-md shadow-cyan-500/30'
                          : isAvailable
                          ? 'bg-white/[0.04] text-slate-200 border-white/10 hover:border-[#00F2FE]/50'
                          : 'bg-red-500/5 text-slate-500 border-red-500/10 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Battery SoC & Energy Estimation */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-[#00E676]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Battery Charge: <span className="text-[#00E676] font-mono">{targetSoc}%</span>
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Current: {currentSoc}% ({vehicle?.model || 'Tata Nexon EV'})
              </span>
            </div>

            <input
              type="range"
              min={Math.max(50, currentSoc + 10)}
              max="100"
              step="5"
              value={targetSoc}
              onChange={(e) => setTargetSoc(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mb-3"
            />

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Estimated Energy</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{estimatedKwh} kWh</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Duration</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">~35 - 45 mins</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Est. Tariff</div>
                <div className="text-sm font-bold text-[#00E676] font-mono mt-0.5">₹{estimatedPrice}</div>
              </div>
            </div>
          </div>

        </div>

        {/* Centered Footer Actions */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00F2FE]" />
            <span>Guaranteed zero double-booking lock</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            <button
              onClick={onClose}
              className="btn-secondary text-xs px-5 py-2.5 w-1/2 sm:w-auto"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={submitting || !selectedSlot}
              className="btn-primary text-xs px-6 py-2.5 w-1/2 sm:w-auto justify-center"
            >
              {submitting ? 'Locking Slot...' : 'Reserve & Pay'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
