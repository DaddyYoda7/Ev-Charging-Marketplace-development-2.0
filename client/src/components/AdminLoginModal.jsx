import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, KeyRound, AlertTriangle, CheckCircle2, X, LogIn } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-3xl animate-fadeIn">
      
      {/* Translucent Frosted Glass Modal Container */}
      <div className="relative w-full max-w-lg bg-white/20 backdrop-blur-3xl border border-white/40 shadow-[0_30px_70px_rgba(0,0,0,0.35)] rounded-3xl overflow-hidden text-black">
        
        {/* Top Gradient Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00F2FE] via-[#8B5CF6] to-[#C084FC]"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-black/70 hover:text-black hover:bg-black/10 rounded-full transition-all cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header & Shield Icon */}
          <div className="text-center space-y-2">
            <div className="w-13 h-13 mx-auto rounded-2xl bg-black/10 border border-black/20 flex items-center justify-center text-black shadow-md shadow-black/10">
              <Shield className="w-6 h-6" />
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/10 border border-black/20 text-[10px] font-mono text-black font-extrabold uppercase tracking-wider">
              <Lock className="w-3 h-3 text-black" />
              <span>National Security Gateway</span>
            </div>

            <h2 className="text-2xl font-black text-black tracking-tight">
              {authMode === 'login' ? 'Admin Portal Authentication' : 'Activate License & Create Admin'}
            </h2>
            <p className="text-xs text-slate-900 font-medium max-w-sm mx-auto leading-relaxed">
              {authMode === 'login'
                ? 'Sign in to access platform governance, financial settlement ledgers, and station moderation.'
                : 'Enter your Enterprise Product License Key provided when purchasing the application to provision a new Administrator.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-black/10 border border-black/15 gap-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                authMode === 'login'
                  ? 'bg-black text-white shadow-md font-extrabold'
                  : 'text-slate-900 hover:text-black hover:bg-black/5 font-bold'
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
                  ? 'bg-black text-white shadow-md font-extrabold'
                  : 'text-slate-900 hover:text-black hover:bg-black/5 font-bold'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Register with License Key</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-600/15 border border-red-600/40 text-red-950 font-bold text-xs flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message Alert */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-600/20 border border-emerald-600/40 text-emerald-950 font-bold text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-800 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black">Admin Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@evconnect.in"
                  className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3.5 py-2.5 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black">Admin Password</label>
                </div>
                
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="Enter your admin security password..."
                    className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3.5 py-2.5 pr-10 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 text-black/70 hover:text-black transition-colors cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-900 text-white font-black text-xs shadow-lg shadow-black/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
              <div className="text-center pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError(null);
                  }}
                  className="text-xs text-slate-900 hover:text-black transition-colors cursor-pointer font-medium"
                >
                  Purchased the app? <span className="text-black font-extrabold underline underline-offset-2">Create Admin Account with License Key</span>
                </button>
              </div>

            </form>
          )}

          {/* MODE 2: REGISTER FORM WITH LICENSE KEY */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              
              {/* Product License Key (Guarded Field) */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/30 border border-black/20">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-black flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-black" />
                    <span>Master Product License Key</span>
                  </label>
                  <span className="text-[10px] text-slate-900 font-mono font-bold">Issued at purchase</span>
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  required
                  placeholder="e.g. EVCONNECT-PRO-ADMIN-2026-KEY"
                  className="w-full bg-white/40 border border-black/25 focus:border-black rounded-xl px-3 py-2 text-xs text-black font-bold placeholder-slate-700 outline-none transition-all font-mono tracking-wider"
                />
                <p className="text-[10px] text-slate-800 font-medium">
                  This commercial key was provided when you bought the application.
                </p>
              </div>

              {/* Full Name & Phone in 2 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">Admin Full Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3 py-2 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-body"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+91 99000 11223"
                    className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3 py-2 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-black">Admin Work Email</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  placeholder="e.g. admin@yourdomain.com"
                  className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3 py-2 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">New Password</label>
                  <div className="relative flex items-center">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Min 6 characters..."
                      className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3 py-2 pr-8 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 text-black/70 hover:text-black transition-colors cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-black">Confirm Password</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat password..."
                    className="w-full bg-white/30 hover:bg-white/40 focus:bg-white/50 border border-black/20 focus:border-black rounded-xl px-3 py-2 text-xs text-black font-semibold placeholder-slate-700 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-black hover:bg-slate-900 text-white font-black text-xs shadow-lg shadow-black/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Verify License & Create Admin Account</span>
                  </>
                )}
              </button>

              {/* Switch to Login footer */}
              <div className="text-center pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className="text-xs text-slate-900 hover:text-black transition-colors cursor-pointer font-medium"
                >
                  Already have an authorized admin account? <span className="text-black font-extrabold underline underline-offset-2">Sign In</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>

    </div>
  );
}
