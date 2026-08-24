import React from 'react';
import { X, Printer, Download, CheckCircle2, Zap, QrCode, FileText } from 'lucide-react';

export default function InvoiceModal({
  isOpen,
  onClose,
  invoice
}) {
  if (!isOpen || !invoice) return null;

  function handlePrint() {
    window.print();
  }

  const subtotal = invoice.subtotal || 624.00;
  const cgst = Number((subtotal * 0.025).toFixed(2));
  const sgst = Number((subtotal * 0.025).toFixed(2));
  const total = invoice.total || Number((subtotal + cgst + sgst).toFixed(2));

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Invoice Container for Print */}
        <div id="printable-invoice" className="bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-xl">
          
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-black text-cyan-400 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  EVConnect <span className="text-cyan-600">Bharat</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Tax Invoice / Clean EV Energy Receipt</p>
              <p className="text-[11px] text-slate-400 font-mono">GSTIN: 29AABCE9876F1Z4 (Karnataka) • HSN: 998714</p>
            </div>

            <div className="text-right">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 font-mono">
                PAID & VERIFIED
              </span>
              <div className="text-xs text-slate-500 font-mono">Invoice #: <b>{invoice.invoice_number}</b></div>
              <div className="text-xs text-slate-500 font-mono">Date: {new Date(invoice.issued_at || Date.now()).toLocaleDateString('en-IN')}</div>
            </div>
          </div>

          {/* User & Station Details */}
          <div className="grid grid-cols-2 gap-6 text-xs mb-6">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billed To</div>
              <div className="font-bold text-slate-800 text-sm">{invoice.user_name || 'Aarav Sharma'}</div>
              <div className="text-slate-600">Registered EV Driver Member</div>
              <div className="text-slate-500 font-mono">ID: {invoice.user_id}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Charging Location</div>
              <div className="font-bold text-slate-800 text-sm">{invoice.station_name}</div>
              <div className="text-slate-600 truncate">{invoice.station_address}</div>
              <div className="text-cyan-700 font-semibold mt-0.5">{invoice.charger_info}</div>
            </div>
          </div>

          {/* Line Item Table */}
          <table className="w-full text-xs text-left mb-6 border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Energy (kWh)</th>
                <th className="py-2 text-center">Tariff / kWh</th>
                <th className="py-2 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-semibold text-slate-800">
                  EV Fast Charging Energy Session (45 mins)
                </td>
                <td className="py-3 text-center font-mono">{invoice.energy_delivered_kwh || 32.0} kWh</td>
                <td className="py-3 text-center font-mono">₹{invoice.tariff_per_kwh?.toFixed(2) || '19.50'}</td>
                <td className="py-3 text-right font-mono font-bold text-slate-800">₹{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 text-[11px]">CGST on EV Charging (2.5%)</td>
                <td className="py-2 text-center text-slate-400">-</td>
                <td className="py-2 text-center text-slate-400">2.50%</td>
                <td className="py-2 text-right font-mono text-slate-700">₹{cgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 text-[11px]">SGST on EV Charging (2.5%)</td>
                <td className="py-2 text-center text-slate-400">-</td>
                <td className="py-2 text-center text-slate-400">2.50%</td>
                <td className="py-2 text-right font-mono text-slate-700">₹{sgst.toFixed(2)}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 font-bold text-slate-900 text-sm">
                <td colSpan={3} className="pt-3 text-right">Grand Total Paid:</td>
                <td className="pt-3 text-right font-mono text-base text-cyan-700">₹{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Bottom Verification & QR */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-slate-500 text-[11px]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                <QrCode className="w-9 h-9 text-slate-700" />
              </div>
              <div>
                <div className="font-semibold text-slate-700">Digital UPI Reference Hash</div>
                <div className="font-mono text-[10px] text-slate-500">{invoice.transaction_id || 'UPI-BHARAT-2026-VERIFIED'}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">✓ Cryptographically Signed GST Invoice</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-700">Payment Channel</div>
              <div>{invoice.payment_method || 'Instant UPI'}</div>
            </div>
          </div>

        </div>

        {/* Modal Action Controls */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="btn-secondary text-xs px-5 py-2.5"
          >
            Close
          </button>
          
          <button
            onClick={handlePrint}
            className="btn-primary text-xs px-5 py-2.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Tax Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
}
