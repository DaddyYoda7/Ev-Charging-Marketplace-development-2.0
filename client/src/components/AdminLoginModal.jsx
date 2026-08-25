import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, X, Sparkles } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('admin@evconnect.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(email, password);
      if (res.success) {
        // Store in session storage
        sessionStorage.setItem('evconnect_admin_token', res.adminToken);
        sessionStorage.setItem('evconnect_admin_user', JSON.stringify(res.adminUser));
        onLoginSuccess(res.adminToken, res.adminUser);
      } else {
        setError(res.error || 'Authentication Failed: Invalid admin credentials.');
      }
    } catch (err) {
      setError('Network error connecting to National Security Auth Gateway.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemoCredentials() {
    setEmail('admin@evconnect.in');
    setPassword('Admin@EVConnect2026');
    setError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0B0F19]/95 backdrop-blur-2xl border border-purple-500/40 rounded-3xl shadow-[0_25px_60px_rgba(139,92,246,0.25)] overflow-hidden">
        
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Shield Icon */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-[#C084FC] shadow-lg shadow-purple-500/20">
              <Shield className="w-7 h-7" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-[#C084FC]" />
              <span>National Grid Security Clearance</span>
            </div>

            <h2 className="text-xl font-black text-white tracking-tight">Admin Authentication Gateway</h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Restricted access for platform governance, financial settlements, and grid health moderation.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Admin Email / ID</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@evconnect.in"
                  className="w-full bg-white/5 border border-white/15 focus:border-[#C084FC] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Admin Password</label>
                <span className="text-[10px] text-slate-400 font-mono">Min 8 chars</span>
              </div>
              
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter secure admin password..."
                  className="w-full bg-white/5 border border-white/15 focus:border-[#C084FC] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* 1-Click Demo Helper */}
            <div className="pt-1">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-mono text-purple-300 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>Fill Demo Admin Credentials (<code>Admin@EVConnect2026</code>)</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] hover:from-[#7C3AED] hover:to-[#A855F7] text-white font-bold text-xs shadow-lg shadow-purple-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Open Admin Hub</span>
                </>
              )}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
