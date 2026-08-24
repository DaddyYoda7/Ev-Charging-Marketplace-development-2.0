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
    <header className="sticky top-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => onViewChange(currentRole === 'user' ? 'explore' : currentRole === 'owner' ? 'host-stations' : 'admin-dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F2FE] via-[#00E676] to-[#8B5CF6] p-[2px] shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00F2FE]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                EVConnect <span className="text-[#00F2FE]">AI</span>
              </span>
              <span className="badge badge-ai text-[10px] px-2 py-0.5">v2.4 Live</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Smart EV Charging Marketplace & Telemetry</p>
          </div>
        </div>

        {/* View Navigation Links (Role Specific - Centered Navigation) */}
        <nav className="flex items-center gap-1 bg-white/[0.04] p-1.5 rounded-xl border border-white/10 text-xs sm:text-sm">
          {currentRole === 'user' && (
            <>
              <button
                onClick={() => onViewChange('explore')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'explore'
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Find Stations</span>
              </button>
              <button
                onClick={() => onViewChange('user-dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'user-dashboard'
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>
              <button
                onClick={() => onViewChange('ai-planner')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'ai-planner'
                    ? 'bg-[#8B5CF6]/25 text-[#D8B4FE] border border-[#8B5CF6]/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'host-stations'
                    ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Stations & Tariffs</span>
              </button>
              <button
                onClick={() => onViewChange('host-analytics')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'host-analytics'
                    ? 'bg-[#00E676]/20 text-[#00E676] border border-[#00E676]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>BI & Health Matrix</span>
              </button>
              <button
                onClick={() => onViewChange('ocpp-lab')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'ocpp-lab'
                    ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeView === 'admin-dashboard'
                  ? 'bg-[#8B5CF6]/20 text-[#D8B4FE] border border-[#8B5CF6]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Platform Hub & Settlement</span>
            </button>
          )}
        </nav>

        {/* Right Section: Active Vehicle, Live Telemetry & Role Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Primary Vehicle Garage Pill */}
          {currentRole === 'user' && primaryVehicle && (
            <button
              onClick={onOpenGarage}
              className="hidden lg:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-all hover:border-[#00F2FE]/50 cursor-pointer"
              title="Click to switch vehicle or adjust battery"
            >
              <BatteryCharging className="w-4 h-4 text-[#00E676]" />
              <div className="text-left">
                <div className="text-white font-bold leading-tight">{primaryVehicle.model}</div>
                <div className="text-[10px] text-[#00E676] font-mono">{primaryVehicle.current_soc}% SoC • {primaryVehicle.connector_type}</div>
              </div>
            </button>
          )}

          {/* Telemetry Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
            <span className={`pulse-dot ${telemetryConnected ? 'pulse-dot-green' : 'pulse-dot-cyan'}`}></span>
            <span className="text-[11px] text-slate-300 font-mono">Live Telemetry</span>
          </div>

          {/* Role Switcher Pill Bar */}
          <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onRoleChange('user')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'user'
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00B0FF] text-[#040814] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>

            <button
              onClick={() => onRoleChange('owner')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'owner'
                  ? 'bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-[#040814] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Host</span>
            </button>

            <button
              onClick={() => onRoleChange('admin')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentRole === 'admin'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
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
