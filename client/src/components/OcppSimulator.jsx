import React, { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, AlertOctagon, Play, Square, RefreshCw, Thermometer, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';

export default function OcppSimulator({
  chargers = [],
  onChargerUpdated
}) {
  const [selectedChargerId, setSelectedChargerId] = useState('');
  const [chargerData, setChargerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (chargers.length > 0 && !selectedChargerId) {
      setSelectedChargerId(chargers[0].id);
    }
  }, [chargers, selectedChargerId]);

  useEffect(() => {
    if (selectedChargerId) {
      loadChargerInfo(selectedChargerId);
    }
  }, [selectedChargerId]);

  async function loadChargerInfo(id) {
    setLoading(true);
    try {
      const res = await api.getChargerTelemetry(id);
      if (res.success) {
        setChargerData(res);
      }
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleOcppAction(eventType, status = null, faultCode = null) {
    if (!selectedChargerId) return;
    setActionMsg(`Dispatching OCPP 2.0.1 ${eventType}...`);
    try {
      const res = await api.triggerOcppEvent({
        chargerId: selectedChargerId,
        eventType,
        status,
        faultCode
      });
      if (res.success) {
        setChargerData((prev) => ({
          ...prev,
          charger: res.charger,
          healthReport: res.healthReport
        }));
        setActionMsg(`✓ OCPP Message Acknowledged: ${eventType}`);
        if (onChargerUpdated) onChargerUpdated(res.charger);
      }
    } catch (err) {
      setActionMsg(`Failed to send OCPP event: ${err.message}`);
    }
  }

  const ch = chargerData?.charger;
  const health = chargerData?.healthReport;
  const isCharging = ch?.status === 'CHARGING';
  const isFaulted = ch?.status === 'FAULTED';
  const isAvailable = ch?.status === 'AVAILABLE';

  return (
    <div className="glass-panel p-6 border border-white/20 bg-[#0E1524] shadow-2xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00F2FE] uppercase tracking-wider mb-1">
            <Cpu className="w-4 h-4" />
            <span>Phase 6 • OCPP 1.6 / 2.0.1 Hardware & Telemetry Simulator</span>
          </div>
          <h2 className="text-2xl font-black text-white">Live Charge Point Simulator</h2>
          <p className="text-xs text-slate-400 mt-0.5">Inject real hardware events, trigger live charging cycles, or simulate thermal/ground faults.</p>
        </div>

        {/* Charger Bay Switcher */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">Target Bay:</label>
          <select
            value={selectedChargerId}
            onChange={(e) => setSelectedChargerId(e.target.value)}
            className="input-glass text-xs font-mono py-1.5 w-auto"
          >
            {chargers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.identifier} ({c.power_kw}kW {c.connector_type}) - [{c.status}]
              </option>
            ))}
          </select>
        </div>
      </div>

      {actionMsg && (
        <div className="mb-4 p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00F2FE] animate-spin shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {ch && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Live Telemetry Gauges */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Live Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Status */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</div>
                <div className="mt-1 flex justify-center">
                  <span className={`badge text-[11px] ${
                    isAvailable ? 'badge-available' : isCharging ? 'badge-charging' : isFaulted ? 'badge-faulted' : 'badge-occupied'
                  }`}>
                    {ch.status}
                  </span>
                </div>
              </div>

              {/* Active Power Draw */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Power</div>
                <div className="text-xl font-extrabold text-[#00F2FE] font-mono mt-0.5">
                  {ch.active_power_kw?.toFixed(1) || '0.0'} <span className="text-xs font-normal text-slate-400">kW</span>
                </div>
              </div>

              {/* Internal Temperature */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temperature</div>
                <div className={`text-xl font-extrabold font-mono mt-0.5 ${
                  ch.temperature_c > 45 ? 'text-red-400' : ch.temperature_c > 38 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {ch.temperature_c?.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
                </div>
              </div>

              {/* Health Score */}
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Health Index</div>
                <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                  {ch.health_score}%
                </div>
              </div>

            </div>

            {/* Simulated Live Signal Oscilloscope / Event Log */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 font-mono flex items-center gap-2">
                  <span className="pulse-dot pulse-dot-cyan"></span>
                  OCPP 1.6-J Raw Telemetry Frame
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Voltage: 415.0V • 3-Phase Indian Grid</span>
              </div>

              <div className="bg-[#070B12] p-3 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300 space-y-1 max-h-36 overflow-y-auto">
                <div className="text-cyan-400">[OCPP 2.0] &lt;StatusNotification&gt; connectorId: 1, status: "{ch.status}"</div>
                <div className="text-emerald-400">[OCPP 2.0] &lt;MeterValues&gt; Active.Import: {ch.active_power_kw || 0} kW, Temp: {ch.temperature_c}°C</div>
                {chargerData?.recentLogs?.slice(0, 4).map((log, idx) => (
                  <div key={idx} className="text-slate-400">
                    [{new Date(log.timestamp).toLocaleTimeString('en-IN')}] {log.event_type} - {log.power_kw}kW, {log.temperature_c}°C {log.fault_code ? `[FAULT: ${log.fault_code}]` : ''}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Hardware Trigger Controls */}
          <div className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider text-center">
              Simulation Hardware Actions
            </div>

            {/* Standard Operations */}
            <div className="space-y-2.5">
              <button
                onClick={() => handleOcppAction('StartTransaction', 'CHARGING')}
                disabled={isCharging}
                className="w-full btn-emerald text-xs py-2.5 justify-center disabled:opacity-40"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Charging Cycle (Draw Power)</span>
              </button>

              <button
                onClick={() => handleOcppAction('StopTransaction', 'AVAILABLE')}
                disabled={!isCharging && isAvailable}
                className="w-full btn-secondary text-xs py-2.5 justify-center text-slate-200"
              >
                <Square className="w-4 h-4" />
                <span>Stop Session / Reset to Available</span>
              </button>
            </div>

            {/* Fault Injections (Phase 6.5) */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Fault Injection & Anomaly Testing</span>
              </div>

              <button
                onClick={() => handleOcppAction('FaultAlert', 'FAULTED', 'Thermal Overheat Protection Alert')}
                className="w-full btn-danger text-xs py-2 justify-center"
              >
                Inject Thermal Fault (49°C Spike)
              </button>

              <button
                onClick={() => handleOcppAction('FaultAlert', 'FAULTED', 'Ground Relay Insulation Breakdown')}
                className="w-full btn-danger text-xs py-2 justify-center"
              >
                Inject Ground Relay Failure
              </button>
            </div>

            {/* Predictive Maintenance Warning pill */}
            {health && health.severity !== 'NORMAL' && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Predictive Alert: {health.failureRiskPct}% Risk</span>
                </div>
                <p className="text-[11px] text-red-200/90 leading-tight">{health.recommendation}</p>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
