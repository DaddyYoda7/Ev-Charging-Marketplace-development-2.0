import React, { useState, useEffect } from 'react';
import { 
  Shield, DollarSign, Building2, Users, Zap, CheckCircle2, TrendingUp, 
  RefreshCw, FileText, Download, Check, AlertTriangle, Power, Lock, 
  LogOut, Filter, BadgeCheck, Sliders, ChevronRight, Activity, Cpu
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard({ adminUser, onLogout }) {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'stations' | 'grid'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'SUCCESS' | 'SETTLED'
  const [actionMessage, setActionMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadAdminStats();
  }, []);

  async function loadAdminStats() {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res.success) {
        setAdminData(res);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  function showNotification(msg) {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4500);
  }

  // Settle individual host payout
  async function handleSettlePayout(paymentId) {
    setProcessingId(paymentId);
    try {
      const res = await api.settlePayout(paymentId);
      if (res.success) {
        showNotification(res.message || 'Host payout settled successfully!');
        await loadAdminStats();
      }
    } catch (err) {
      showNotification('Error settling payout.');
    } finally {
      setProcessingId(null);
    }
  }

  // Settle all pending host payouts
  async function handleSettleAllPayouts() {
    setProcessingId('all');
    try {
      const res = await api.settleAllPayouts();
      if (res.success) {
        showNotification(res.message || 'All host payouts settled successfully!');
        await loadAdminStats();
      }
    } catch (err) {
      showNotification('Error processing batch payout.');
    } finally {
      setProcessingId(null);
    }
  }

  // Emergency Grid Fault Reset
  async function handleResetGridFaults() {
    setProcessingId('reset-faults');
    try {
      const res = await api.resetGridFaults();
      if (res.success) {
        showNotification(res.message || 'National Grid hardware faults cleared and restored!');
        await loadAdminStats();
      }
    } catch (err) {
      showNotification('Error resetting grid faults.');
    } finally {
      setProcessingId(null);
    }
  }

  // Toggle Station Status (ONLINE / MAINTENANCE / SUSPENDED)
  async function handleStationStatusToggle(stationId, currentStatus) {
    const nextStatus = currentStatus === 'ONLINE' ? 'MAINTENANCE' : 'ONLINE';
    try {
      const res = await api.updateStationStatus(stationId, nextStatus);
      if (res.success) {
        showNotification(`Station ${res.station?.name || ''} marked as ${nextStatus}`);
        await loadAdminStats();
      }
    } catch (err) {
      showNotification('Error updating station status.');
    }
  }

  // Toggle Station Verification
  async function handleStationVerifyToggle(stationId, currentVerified) {
    try {
      const res = await api.verifyStation(stationId, !currentVerified);
      if (res.success) {
        showNotification(`Station verification updated.`);
        await loadAdminStats();
      }
    } catch (err) {
      showNotification('Error updating verification.');
    }
  }

  // Export Financial Ledger as CSV
  function exportLedgerCSV() {
    const rows = adminData?.recentTransactions || [];
    if (rows.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Driver,Station,Total Amount (INR),Platform Commission (10%),Host Share (90%),Payment Method,Status,Timestamp\n";

    rows.forEach((tx) => {
      csvContent += `"${tx.transaction_id}","${tx.user_name}","${tx.station_name}",${tx.total_amount},${tx.platform_commission},${tx.owner_payout},"${tx.payment_method}","${tx.status}","${tx.created_at || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EVConnect_Financial_Ledger_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Financial Ledger exported to CSV successfully.");
  }

  const stats = adminData?.stats;
  const transactions = adminData?.recentTransactions || [];
  const stationsList = adminData?.stationsList || [];

  const filteredTransactions = transactions.filter((tx) => {
    if (statusFilter === 'ALL') return true;
    return tx.status === statusFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Top Banner with Admin Security Clearance & Controls */}
      <div className="p-6 md:p-8 rounded-3xl bg-[#0B0F19]/85 backdrop-blur-2xl border border-purple-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        
        {/* Subtle Glowing Background Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Left: Title & Clearance */}
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/35 text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#C084FC]" />
            <span>National Security Clearance • Level 4 Admin</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Central Marketplace Governance & Financial Hub 🇮🇳
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Logged in as <span className="text-purple-300 font-bold">{adminUser?.name || 'National Admin'}</span> ({adminUser?.email || 'admin@evconnect.in'}). Authorized for UPI financial reconciliations, 10/90 settlement ledgers, and Pan-India station grid moderation.
          </p>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={loadAdminStats}
            title="Refresh statistics"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleResetGridFaults}
            disabled={processingId === 'reset-faults'}
            className="py-2.5 px-3.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 hover:text-red-200 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Power className="w-3.5 h-3.5" />
            <span>Emergency Grid Reset</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/15 hover:border-red-500/40 text-slate-300 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Secure Logout</span>
            </button>
          )}
        </div>

      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Marketplace GMV */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Marketplace Gross Volume</div>
          <div className="text-3xl font-black text-white font-mono">
            ₹{stats?.gmv?.toLocaleString('en-IN') || '2,314.50'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]"></span>
            <span>{stats?.totalTransactions || 3} Confirmed Transactions</span>
          </div>
        </div>

        {/* 10% Platform Commission Revenue */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/30 transition-all shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Commission (10%)</div>
          <div className="text-3xl font-black text-[#00F2FE] font-mono">
            ₹{stats?.platformCommission?.toLocaleString('en-IN') || '231.45'}
          </div>
          <div className="text-[11px] text-[#00E676] mt-2 font-mono font-semibold">
            Host Payouts (90%): ₹{stats?.ownerPayouts?.toLocaleString('en-IN') || '2,083.05'}
          </div>
        </div>

        {/* Total Stations & Bays */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pan-India Capacity</div>
          <div className="text-3xl font-black text-[#00E676] font-mono">
            {stats?.totalChargers || 14} <span className="text-sm font-normal text-slate-400">Bays</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Across {stats?.totalStations || 14} Charging Hubs
          </div>
        </div>

        {/* Network Live Load */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grid Health & Load</div>
          <div className="text-3xl font-black text-[#C084FC] font-mono">
            {stats?.activeSessions || 1} <span className="text-sm font-normal text-slate-400">Live</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${stats?.faultedChargers > 0 ? 'bg-red-400' : 'bg-[#00E676]'}`}></span>
            <span>{stats?.faultedChargers || 0} Hardware Faults</span>
          </div>
        </div>

      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Financial Settlements & 10/90 Ledger</span>
        </button>

        <button
          onClick={() => setActiveTab('stations')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'stations'
              ? 'bg-purple-500/20 text-[#C084FC] border border-purple-400/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Station Grid Moderation ({stationsList.length})</span>
        </button>
      </div>

      {/* TAB 1: Financial Settlements & Ledger */}
      {activeTab === 'ledger' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/10 space-y-5 shadow-2xl">
          
          {/* Table Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[#00E676] font-bold text-base">₹</span>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  UPI Settlement & 10/90 Commission Ledger
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit transactions, execute automated host bank payouts, and export financial records.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                {['ALL', 'SUCCESS', 'SETTLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-purple-500/25 text-[#C084FC] shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Settle All Button */}
              <button
                onClick={handleSettleAllPayouts}
                disabled={processingId === 'all'}
                className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-[#00E676] text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settle All Payouts</span>
              </button>

              {/* Export CSV Button */}
              <button
                onClick={exportLedgerCSV}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-xs text-left">
              <thead className="bg-white/[0.02]">
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Transaction Ref</th>
                  <th className="py-3.5 px-4">Driver</th>
                  <th className="py-3.5 px-4">Station</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4 text-[#00F2FE]">Platform (10%)</th>
                  <th className="py-3.5 px-4 text-[#00E676]">Host Share (90%)</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-10 text-slate-400 text-xs font-sans">
                      No transactions match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-300">{tx.transaction_id}</td>
                      <td className="py-3 px-4 text-white font-sans font-medium">{tx.user_name}</td>
                      <td className="py-3 px-4 text-slate-300 font-sans">{tx.station_name}</td>
                      <td className="py-3 px-4 font-bold text-white">₹{tx.total_amount?.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-[#00F2FE]">₹{tx.platform_commission?.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-[#00E676]">₹{tx.owner_payout?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans">{tx.payment_method}</td>
                      <td className="py-3 px-4">
                        <span className={`badge text-[9px] ${
                          tx.status === 'SETTLED' ? 'badge-available' : 'badge-charging'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {tx.status !== 'SETTLED' ? (
                          <button
                            onClick={() => handleSettlePayout(tx.id)}
                            disabled={processingId === tx.id}
                            className="py-1 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[#00E676] text-[11px] font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                          >
                            {processingId === tx.id ? 'Settling...' : 'Settle Payout (90%)'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5 text-[#00E676]" />
                            <span>Paid to Host</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: Station Grid Moderation */}
      {activeTab === 'stations' && (
        <div className="p-6 md:p-8 rounded-3xl bg-[#0B0F19]/80 backdrop-blur-2xl border border-white/10 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Pan-India Station Moderation & Operational Grid
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authorize new charging station operators, toggle maintenance states, and verify physical hardware.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">{stationsList.length} Hubs Listed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {stationsList.map((st) => (
              <div key={st.id} className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 space-y-3.5 hover:border-white/20 transition-all shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{st.name}</span>
                      {st.is_verified === 1 && (
                        <BadgeCheck className="w-4 h-4 text-[#00F2FE]" title="Verified CPO" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{st.city} • Owner: <span className="text-slate-300 font-medium">{st.owner_name}</span></p>
                  </div>

                  <span className={`badge text-[9px] ${
                    st.status === 'ONLINE' || !st.status ? 'badge-available' : 'badge-faulted'
                  }`}>
                    {st.status || 'ONLINE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300 font-mono border-t border-white/5 pt-2.5">
                  <span>Capacity: <b className="text-white">{st.charger_count || 2} Bays</b></span>
                  <span>Base Tariff: <b className="text-[#00E676]">₹{st.base_tariff?.toFixed(2)}/kWh</b></span>
                </div>

                {/* Moderation Controls */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => handleStationVerifyToggle(st.id, st.is_verified === 1)}
                    className={`text-[11px] font-bold py-1.5 px-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                      st.is_verified === 1
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-400/30 hover:bg-cyan-500/20'
                        : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {st.is_verified === 1 ? '✔ Verified CPO' : 'Mark Verified'}
                  </button>

                  <button
                    onClick={() => handleStationStatusToggle(st.id, st.status || 'ONLINE')}
                    className={`text-[11px] font-bold py-1.5 px-3 rounded-xl border transition-all cursor-pointer shadow-sm ${
                      st.status === 'MAINTENANCE'
                        ? 'bg-emerald-500/20 text-[#00E676] border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                    }`}
                  >
                    {st.status === 'MAINTENANCE' ? 'Restore Online' : 'Set Maintenance'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
