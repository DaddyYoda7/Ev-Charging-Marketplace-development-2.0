import React from 'react';
import { Zap, Shield, Building2, BatteryCharging, Compass, LayoutDashboard, Brain, Cpu, Wallet, Layers } from 'lucide-react';

export default function Navbar({
  currentRole,
  onRoleChange,
  activeView,
  onViewChange,
  primaryVehicle,
  onOpenGarage,
  telemetryConnected,
  currentUser
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0F19]/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title: EV Connect AI */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0" 
          onClick={() => onViewChange(currentRole === 'user' ? 'explore' : currentRole === 'owner' ? 'host-stations' : 'admin-dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F2FE] via-[#00E676] to-[#8B5CF6] p-[2px] shadow-lg shadow-cyan-500/25 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00F2FE]" />
            </div>
          </div>
          <div className="flex flex-col justify-center text-left">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl tracking-tight text-white leading-none">
                EV Connect <span className="text-[#00F2FE]">AI</span>
              </span>
              <span className="badge badge-ai text-[10px] px-2 py-0.5 font-bold">Bharat 2.0</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Intelligent EV Charging & Telemetry Hub</p>
          </div>
        </div>

        {/* Center View Navigation Links: Unified Cyan Palette for Driver Views */}
        <nav className="flex items-center gap-1.5 bg-transparent p-1 rounded-xl border border-white/10">
          {currentRole === 'user' && (
            <>
              <button
                onClick={() => onViewChange('explore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'explore'
                    ? 'bg-cyan-500/15 text-[#00F2FE] border border-cyan-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00F2FE] hover:bg-cyan-500/10'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Find Stations</span>
              </button>

              <button
                onClick={() => onViewChange('user-dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'user-dashboard'
                    ? 'bg-cyan-500/15 text-[#00F2FE] border border-cyan-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00F2FE] hover:bg-cyan-500/10'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>My Dashboard</span>
              </button>

              <button
                onClick={() => onViewChange('ai-planner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'ai-planner'
                    ? 'bg-cyan-500/15 text-[#00F2FE] border border-cyan-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00F2FE] hover:bg-cyan-500/10'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>AI Trip Planner</span>
              </button>
            </>
          )}

          {currentRole === 'owner' && (
            <>
              <button
                onClick={() => onViewChange('host-stations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'host-stations'
                    ? 'bg-emerald-500/15 text-[#00E676] border border-emerald-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00E676] hover:bg-emerald-500/10'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Stations & Tariffs</span>
              </button>

              <button
                onClick={() => onViewChange('host-analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'host-analytics'
                    ? 'bg-emerald-500/15 text-[#00E676] border border-emerald-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00E676] hover:bg-emerald-500/10'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>BI & Health Matrix</span>
              </button>

              <button
                onClick={() => onViewChange('ocpp-lab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'ocpp-lab'
                    ? 'bg-cyan-500/15 text-[#00F2FE] border border-cyan-400/40 shadow-sm font-bold'
                    : 'bg-transparent text-slate-400 hover:text-[#00F2FE] hover:bg-cyan-500/10'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>OCPP 2.0 Lab</span>
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => onViewChange('admin-dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                activeView === 'admin-dashboard'
                  ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/50 shadow-sm font-bold'
                  : 'bg-transparent text-slate-400 hover:text-[#C084FC] hover:bg-purple-500/10'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>National Platform Hub</span>
            </button>
          )}
        </nav>

        {/* Right Section: Primary Vehicle, Live Signal & Role Switcher */}
        <div className="flex items-center gap-2.5">
          
          {/* Primary Vehicle Garage Pill */}
          {currentRole === 'user' && primaryVehicle && (
            <button
              onClick={onOpenGarage}
              className="hidden lg:flex items-center gap-2 bg-transparent hover:bg-cyan-500/10 border border-white/10 hover:border-[#00F2FE] px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200 hover:scale-105 cursor-pointer"
              title="Click to switch EV or adjust battery SoC"
            >
              <BatteryCharging className="w-4 h-4 text-[#00E676]" />
              <div className="text-left">
                <div className="text-slate-200 font-bold leading-tight">{primaryVehicle.model}</div>
                <div className="text-[10px] text-[#00E676] font-mono font-bold">
                  {primaryVehicle.current_soc}% SoC • {primaryVehicle.connector_type}
                </div>
              </div>
            </button>
          )}

          {/* Telemetry Live Indicator (Matching Capsule Pill Style) */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-bold text-cyan-300 font-mono shadow-sm self-center">
            <span className={`pulse-dot shrink-0 ${telemetryConnected ? 'pulse-dot-green' : 'pulse-dot-cyan'}`}></span>
            <span>Live Telemetry</span>
          </div>

          {/* Transparent Role Switcher Pill Bar (Distinct Colors for Roles) */}
          <div className="flex items-center bg-transparent p-1 rounded-xl border border-white/10 gap-1">
            <button
              onClick={() => onRoleChange('user')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'user'
                  ? 'bg-cyan-500/15 text-[#00F2FE] border border-cyan-400/40 shadow-sm font-bold'
                  : 'bg-transparent text-slate-400 hover:text-[#00F2FE] hover:bg-cyan-500/10'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Driver</span>
            </button>

            <button
              onClick={() => onRoleChange('owner')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'owner'
                  ? 'bg-emerald-500/15 text-[#00E676] border border-emerald-400/40 shadow-sm font-bold'
                  : 'bg-transparent text-slate-400 hover:text-[#00E676] hover:bg-emerald-500/10'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>Host</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/50 shadow-sm font-bold'
                  : 'bg-transparent text-slate-400 hover:text-[#C084FC] hover:bg-purple-500/10'
              }`}
            >
              <Shield className="w-3 h-3 text-[#C084FC]" />
              <span>Admin</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
