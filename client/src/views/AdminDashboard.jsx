import React, { useState, useEffect } from 'react';
import { Shield, DollarSign, Building2, Users, Zap, CheckCircle2, TrendingUp, RefreshCw, FileText } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const stats = adminData?.stats;
  const transactions = adminData?.recentTransactions || [];
  const stationsList = adminData?.stationsList || [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
      
      {/* Admin Title Banner */}
      <div className="glass-panel p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>National Platform Governance & Settlement</span>
          </div>
          <h1 className="text-2xl font-black text-white">Central Marketplace Admin Hub (Bharat)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monitoring 10% platform commission revenue, UPI settlements, and charging station operator payouts in ₹.</p>
        </div>

        <button
          onClick={loadAdminStats}
          className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Marketplace GMV */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Marketplace Gross Volume</div>
          <div className="text-3xl font-black text-white font-mono">
            ₹{stats?.gmv?.toLocaleString('en-IN') || '2,314.50'}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {stats?.totalTransactions || 3} Confirmed Transactions
          </div>
        </div>

        {/* 10% Platform Commission Revenue */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Platform Commission (10%)</div>
          <div className="text-3xl font-black text-[#00F2FE] font-mono">
            ₹{stats?.platformCommission?.toLocaleString('en-IN') || '231.45'}
          </div>
          <div className="text-[11px] text-[#00E676] mt-2 font-mono font-semibold">
            Owner Payouts (90%): ₹{stats?.ownerPayouts?.toLocaleString('en-IN') || '2,083.05'}
          </div>
        </div>

        {/* Total Stations & Bays */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Network Capacity</div>
          <div className="text-3xl font-black text-[#00E676] font-mono">
            {stats?.totalChargers || 11} <span className="text-sm font-normal text-slate-400">Bays</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            Across {stats?.totalStations || 6} Charging Hubs
          </div>
        </div>

        {/* Network Live Load */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Active Sessions</div>
          <div className="text-3xl font-black text-purple-400 font-mono">
            {stats?.activeSessions || 1} <span className="text-sm font-normal text-slate-400">Live</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 font-mono">
            {stats?.faultedChargers || 0} Hardware Faults Flagged
          </div>
        </div>

      </div>

      {/* Transactions Settlement Ledger */}
      <div className="glass-panel p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#00E676] font-bold text-base">₹</span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">UPI Settlement & 10/90 Commission Ledger</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">Server-Side Verified</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Total Amount</th>
                <th className="py-2.5 px-3 text-[#00F2FE]">10% Commission</th>
                <th className="py-2.5 px-3 text-[#00E676]">90% Host Share</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-300">{tx.transaction_id}</td>
                  <td className="py-3 px-3 text-white font-sans">{tx.user_name}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{tx.station_name}</td>
                  <td className="py-3 px-3 font-bold text-white">₹{tx.total_amount.toFixed(2)}</td>
                  <td className="py-3 px-3 font-bold text-[#00F2FE]">₹{tx.platform_commission.toFixed(2)}</td>
                  <td className="py-3 px-3 font-bold text-[#00E676]">₹{tx.owner_payout.toFixed(2)}</td>
                  <td className="py-3 px-3 text-slate-400 font-sans">{tx.payment_method}</td>
                  <td className="py-3 px-3">
                    <span className="badge badge-available text-[9px]">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
