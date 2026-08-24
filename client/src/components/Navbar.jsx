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
    <header className="sticky top-0 z-50 bg-[#0B0F19] border-b border-white/20 px-4 lg:px-8 py-3.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Title with Perfect Vertical Alignment */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer select-none group shrink-0" 
          onClick={() => onViewChange(currentRole === 'user' ? 'explore' : currentRole === 'owner' ? 'host-stations' : 'admin-dashboard')}
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00F2FE] via-[#00E676] to-[#8B5CF6] p-[2px] shadow-lg shadow-cyan-500/30 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:shadow-cyan-500/50 transition-all duration-200">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#00F2FE]" />
            </div>
          </div>
          <div className="flex flex-col justify-center text-left">
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl tracking-tight text-white leading-none">
                EVConnect <span className="text-[#00F2FE]">AI</span>
              </span>
              <span className="badge badge-ai text-[10px] px-2 py-0.5 font-extrabold tracking-wide">Bharat 2.0</span>
            </div>
            <p className="text-[12px] text-slate-300 font-medium mt-1">Intelligent EV Charging & Telemetry Hub</p>
          </div>
        </div>

        {/* Center View Navigation Links (High Contrast, Bold & Vivid Hover Effects) */}
        <nav className="flex items-center gap-2 bg-[#111827] p-1.5 rounded-xl border border-white/20 shadow-lg">
          {currentRole === 'user' && (
            <>
              <button
                onClick={() => onViewChange('explore')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'explore'
                    ? 'bg-[#00F2FE] text-[#040814] shadow-lg shadow-cyan-500/40 font-black scale-105'
                    : 'text-white hover:text-[#00F2FE] hover:bg-white/15 hover:scale-105 hover:border-cyan-400/50'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Find Stations</span>
              </button>

              <button
                onClick={() => onViewChange('user-dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'user-dashboard'
                    ? 'bg-[#00F2FE] text-[#040814] shadow-lg shadow-cyan-500/40 font-black scale-105'
                    : 'text-white hover:text-[#00F2FE] hover:bg-white/15 hover:scale-105 hover:border-cyan-400/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>

              <button
                onClick={() => onViewChange('ai-planner')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'ai-planner'
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#00F2FE] text-white shadow-lg shadow-purple-500/40 font-black scale-105'
                    : 'text-white hover:text-[#D8B4FE] hover:bg-white/15 hover:scale-105'
                }`}
              >
                <Brain className="w-4 h-4 text-[#C084FC]" />
                <span>AI Trip Planner</span>
              </button>
            </>
          )}

          {currentRole === 'owner' && (
            <>
              <button
                onClick={() => onViewChange('host-stations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'host-stations'
                    ? 'bg-[#00E676] text-[#040814] shadow-lg shadow-emerald-500/40 font-black scale-105'
                    : 'text-white hover:text-[#00E676] hover:bg-white/15 hover:scale-105'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Stations & Tariffs</span>
              </button>

              <button
                onClick={() => onViewChange('host-analytics')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'host-analytics'
                    ? 'bg-[#00E676] text-[#040814] shadow-lg shadow-emerald-500/40 font-black scale-105'
                    : 'text-white hover:text-[#00E676] hover:bg-white/15 hover:scale-105'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>BI & Health Matrix</span>
              </button>

              <button
                onClick={() => onViewChange('ocpp-lab')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                  activeView === 'ocpp-lab'
                    ? 'bg-[#00F2FE] text-[#040814] shadow-lg shadow-cyan-500/40 font-black scale-105'
                    : 'text-white hover:text-[#00F2FE] hover:bg-white/15 hover:scale-105'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>OCPP 2.0 Lab</span>
              </button>
            </>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => onViewChange('admin-dashboard')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                activeView === 'admin-dashboard'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-purple-500/40 font-black scale-105'
                  : 'text-white hover:text-[#D8B4FE] hover:bg-white/15 hover:scale-105'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>National Platform Hub & Settlements</span>
            </button>
          )}
        </nav>

        {/* Right Section: Primary Vehicle, Live Signal & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Primary Vehicle Garage Pill */}
          {currentRole === 'user' && primaryVehicle && (
            <button
              onClick={onOpenGarage}
              className="hidden lg:flex items-center gap-2.5 bg-[#111827] hover:bg-[#1E293B] border border-white/20 hover:border-[#00F2FE] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
              title="Click to switch EV or adjust battery SoC"
            >
              <BatteryCharging className="w-4 h-4 text-[#00E676]" />
              <div className="text-left">
                <div className="text-white font-bold leading-tight">{primaryVehicle.model}</div>
                <div className="text-[11px] text-[#00E676] font-mono font-bold">{primaryVehicle.current_soc}% SoC • {primaryVehicle.connector_type}</div>
              </div>
            </button>
          )}

          {/* Telemetry Live Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111827] border border-white/20 text-xs shadow-md">
            <span className={`pulse-dot ${telemetryConnected ? 'pulse-dot-green' : 'pulse-dot-cyan'}`}></span>
            <span className="text-[12px] text-white font-mono font-bold">Live Telemetry</span>
          </div>

          {/* Role Switcher Pill Bar (High Contrast & Tactile Hover States) */}
          <div className="flex items-center bg-[#111827] p-1.5 rounded-xl border border-white/20 shadow-lg gap-1.5">
            <button
              onClick={() => onRoleChange('user')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'user'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00B0FF] text-[#040814] shadow-lg shadow-cyan-500/40 scale-105 font-black'
                  : 'text-white hover:text-[#00F2FE] hover:bg-white/15 hover:scale-105'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>

            <button
              onClick={() => onRoleChange('owner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'owner'
                  ? 'bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-[#040814] shadow-lg shadow-emerald-500/40 scale-105 font-black'
                  : 'text-white hover:text-[#00E676] hover:bg-white/15 hover:scale-105'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Host</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-heading transition-all duration-200 cursor-pointer ${
                currentRole === 'admin'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-purple-500/40 scale-105 font-black'
                  : 'text-white hover:text-[#D8B4FE] hover:bg-white/15 hover:scale-105'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
