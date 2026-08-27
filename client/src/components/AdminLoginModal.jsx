import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, X, LogIn } from 'lucide-react';
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
      
      {/* Modal Container: Matching Landing Page Background (#0B0F19) with Round Bezels */}
      <div className="relative w-full max-w-lg bg-[#0B0F19] border border-white/15 rounded-[32px] sm:rounded-[36px] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC]"></div>

        {/* Close Button with Hover Animation */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-white hover:bg-white/10 hover:rotate-90 rounded-full transition-all duration-200 cursor-pointer z-10"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Clean Header: No Shield Icon or Bubble */}
          <div className="text-center space-y-1.5 pt-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {authMode === 'login' ? 'Admin Portal Authentication' : 'Activate License & Create Admin'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {authMode === 'login'
                ? 'Sign in to access platform governance, financial settlement ledgers, and station moderation.'
                : 'Enter your Enterprise Product License Key provided when purchasing the application to provision a new Administrator.'}
            </p>
          </div>

          {/* Mode Switcher Tabs with Hover Effects */}
          <div className="flex items-center p-1.5 rounded-2xl bg-[#111827] border border-white/10 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                authMode === 'login'
                  ? 'bg-purple-500/25 text-[#C084FC] border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
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
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                authMode === 'register'
                  ? 'bg-purple-500/25 text-[#C084FC] border border-purple-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Register with License Key</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/35 text-red-300 text-xs flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
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
                  className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
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
                    className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-4 py-3 pr-11 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer p-1"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button with Gradient Glow Hover */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] hover:from-[#7C3AED] hover:to-[#A855F7] text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
                  className="text-xs text-slate-400 hover:text-[#C084FC] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#111827] border border-purple-500/30">
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
                  className="w-full bg-[#080C15] border border-purple-400/40 focus:border-[#00F2FE] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono tracking-wider"
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
                    className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 99000 11223"
                    className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
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
                  className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
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
                      className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-3.5 py-2.5 pr-9 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer p-1"
                      title={showRegPassword ? "Hide password" : "Show password"}
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
                    className="w-full bg-[#111827]/90 hover:bg-[#182338] focus:bg-[#182338] border border-white/15 focus:border-[#C084FC] rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all duration-200 font-mono"
                  />
                </div>
              </div>

              {/* Submit Registration Button with Hover Effects */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC] hover:opacity-95 text-black font-black text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Verify License & Create Admin Account</span>
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
                  className="text-xs text-slate-400 hover:text-[#C084FC] hover:scale-[1.02] transition-all duration-200 cursor-pointer"
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
