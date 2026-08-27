import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, X, Sparkles, UserPlus, LogIn, HelpCircle, Check } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register fields
  const [licenseKey, setLicenseKey] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await api.adminLogin(loginEmail, loginPassword);
      if (res.success) {
        sessionStorage.setItem('evconnect_admin_token', res.adminToken);
        sessionStorage.setItem('evconnect_admin_user', JSON.stringify(res.adminUser));
        onLoginSuccess(res.adminToken, res.adminUser);
      } else {
        setError(res.error || 'Invalid credentials. Please verify your admin email and password.');
      }
    } catch (err) {
      setError('Network connection error with security authentication server.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminRegister({
        licenseKey,
        name: regName,
        email: regEmail,
        phone: regPhone,
        password: regPassword
      });

      if (res.success) {
        sessionStorage.setItem('evconnect_admin_token', res.adminToken);
        sessionStorage.setItem('evconnect_admin_user', JSON.stringify(res.adminUser));
        setSuccessMsg('Enterprise License Verified! Admin account successfully provisioned.');
        setTimeout(() => {
          onLoginSuccess(res.adminToken, res.adminUser);
        }, 1200);
      } else {
        setError(res.error || 'Failed to verify license key or create admin account.');
      }
    } catch (err) {
      setError('Error communicating with Enterprise License Authority.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0B0F19]/90 backdrop-blur-3xl border border-purple-500/35 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Shield Icon */}
          <div className="text-center space-y-2">
            <div className="w-13 h-13 mx-auto rounded-2xl bg-purple-500/15 border border-purple-400/30 flex items-center justify-center text-[#C084FC] shadow-lg shadow-purple-500/20">
              <Shield className="w-6 h-6" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-[#C084FC]" />
              <span>National Security Gateway</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Admin Portal Authentication' : 'Activate License & Create Admin'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {authMode === 'login'
                ? 'Sign in to access platform governance, financial settlement ledgers, and station moderation.'
                : 'Enter your Enterprise Product License Key provided when purchasing the application to provision a new Administrator.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Existing Admin Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'register'
                  ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Register with License Key</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@evconnect.in"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">Admin Password</label>
                </div>
                
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your admin security password..."
                    className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] hover:from-[#7C3AED] hover:to-[#A855F7] text-white font-bold text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize & Enter Admin Hub</span>
                  </>
                )}
              </button>

              {/* Switch to Register footer */}
              <div className="text-center pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Purchased the app? <span className="text-[#C084FC] font-semibold underline underline-offset-2">Create Admin Account with License Key</span>
                </button>
              </div>

            </form>
          )}

          {/* MODE 2: REGISTER FORM WITH LICENSE KEY */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Product License Key (Guarded Field) */}
              <div className="space-y-1.5 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#C084FC]" />
                    <span>Master Product License Key</span>
                  </label>
                  <span className="text-[10px] text-purple-300/80 font-mono">Issued at purchase</span>
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. EVCONNECT-PRO-ADMIN-2026-KEY"
                  className="w-full bg-[#0B0F19] border border-purple-400/40 focus:border-[#00F2FE] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono tracking-wider"
                />
                <p className="text-[10px] text-slate-400">
                  This key was provided with your commercial software deployment.
                </p>
              </div>

              {/* Full Name & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Admin Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-body"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 99000 11223"
                    className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Admin Work Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@yourdomain.com"
                  className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 6 characters..."
                      className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3 py-2 pr-8 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password..."
                    className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/10 border border-white/15 focus:border-[#C084FC] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC] hover:opacity-95 text-black font-black text-xs shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify License & Create Admin Account</span>
                  </>
                )}
              </button>

              {/* Switch to Login footer */}
              <div className="text-center pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-[#C084FC] transition-colors cursor-pointer"
                >
                  Already have an authorized admin account? <span className="text-[#C084FC] font-semibold underline underline-offset-2">Sign In</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
