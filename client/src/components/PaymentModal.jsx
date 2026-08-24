import React, { useState } from 'react';
import { X, CreditCard, QrCode, Wallet, CheckCircle2, Shield, ArrowRight, FileText, Zap, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../utils/api';

export default function PaymentModal({
  isOpen,
  onClose,
  booking,
  onPaymentSuccess
}) {
  const [method, setMethod] = useState('UPI'); // 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'
  const [upiApp, setUpiApp] = useState('GPay');
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !booking) return null;

  const energyKwh = booking.estimated_kwh || 30.0;
  const tariff = booking.charger?.price_per_kwh || booking.price_per_kwh || 20.00;
  const subtotal = Number((energyKwh * tariff).toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% GST on EV Charging in India
  const totalAmount = Number((subtotal + tax).toFixed(2));

  // Split Commission (Roadmap Phase 4.5): 10% Marketplace Commission & 90% Host Revenue
  const platformFee = Number((subtotal * 0.10).toFixed(2));
  const hostPayout = Number((subtotal * 0.90).toFixed(2));

  async function handlePayNow() {
    setProcessing(true);
    setErrorMsg('');

    try {
      const res = await api.processPayment({
        bookingId: booking.id,
        userId: 'usr-driver-1',
        paymentMethod: method === 'UPI' ? `Instant UPI (${upiApp} / BHIM QR)` : method === 'CARD' ? 'RuPay / Visa / Mastercard Secure' : 'EVConnect Clean Wallet (₹)',
        paymentDetails: { totalAmount, subtotal, tax }
      });

      if (res.success) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 }
        });

        setSuccessResult(res);
        if (onPaymentSuccess) {
          onPaymentSuccess(res.payment, res.invoice);
        }
      } else {
        setErrorMsg(res.error || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Payment gateway error. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-xl p-6 md:p-8 relative border border-white/20 bg-[#0E1524] shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl border border-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successResult ? (
          <div>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00F2FE] uppercase tracking-wider mb-1">
                <CreditCard className="w-4 h-4" />
                <span>Phase 4 • Instant UPI & Card Gateway</span>
              </div>
              <h2 className="text-2xl font-black text-white">Authorize Charging Session</h2>
              <p className="text-xs text-slate-400 mt-0.5">Booking ID: {booking.id} • {booking.station?.name || 'EV Station'}</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Indian Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  method === 'UPI'
                    ? 'bg-cyan-500/15 border-[#00F2FE] text-[#00F2FE] shadow-sm shadow-cyan-500/20'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="text-xs font-bold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  method === 'CARD'
                    ? 'bg-cyan-500/15 border-[#00F2FE] text-[#00F2FE] shadow-sm shadow-cyan-500/20'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs font-bold">RuPay / Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('WALLET')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  method === 'WALLET'
                    ? 'bg-cyan-500/15 border-[#00F2FE] text-[#00F2FE] shadow-sm shadow-cyan-500/20'
                    : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-bold">Wallet (₹3,450)</span>
              </button>
            </div>

            {/* Method Details Box */}
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
              {method === 'UPI' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 pb-2 border-b border-white/10">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiApp(app)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold font-mono border transition-all ${
                          upiApp === app
                            ? 'bg-[#00E676]/20 text-[#00E676] border-[#00E676]'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-white text-[9px] font-mono font-bold text-center leading-tight">
                        <QrCode className="w-6 h-6 text-cyan-400 mb-0.5" />
                        <span>UPI SCAN</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Scan with {upiApp} or any UPI App</div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">UPI ID: evconnect.india@icici</div>
                      <div className="text-[10px] text-[#00E676] mt-1 font-semibold">⚡ Instant Zero-Fee Bank Settlement</div>
                    </div>
                  </div>
                </div>
              )}

              {method === 'CARD' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Card Number</label>
                    <input
                      type="text"
                      readOnly
                      value="•••• •••• •••• 8820 (RuPay Platinum EV Card)"
                      className="input-glass mt-1 text-xs font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">Valid Thru</label>
                      <input type="text" readOnly value="09/29" className="input-glass mt-1 text-xs font-mono" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase font-semibold">CVV</label>
                      <input type="text" readOnly value="•••" className="input-glass mt-1 text-xs font-mono" />
                    </div>
                  </div>
                </div>
              )}

              {method === 'WALLET' && (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">EVConnect AutoPay Wallet</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Available Balance: ₹3,450.00</div>
                  </div>
                  <span className="badge badge-available">Auto-Deduct Ready</span>
                </div>
              )}
            </div>

            {/* Split Commission & Transparent Breakdown (Roadmap 5.5 in Rupees) */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 mb-6 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Estimated Energy ({energyKwh} kWh @ ₹{tariff.toFixed(2)})</span>
                <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>GST on EV Charging (5%)</span>
                <span className="font-mono text-slate-300">₹{tax.toFixed(2)}</span>
              </div>

              {/* Transparent Split Ledger */}
              <div className="pt-2 border-t border-cyan-500/20 text-[11px] flex items-center justify-between text-slate-400">
                <span>↳ Station Owner Share (90%): <b className="text-[#00E676] font-mono">₹{hostPayout.toFixed(2)}</b></span>
                <span>Platform Fee (10%): <b className="text-[#00F2FE] font-mono">₹{platformFee.toFixed(2)}</b></span>
              </div>

              <div className="pt-2 border-t border-cyan-500/30 flex items-center justify-between text-sm font-bold text-white">
                <span>Total Amount Authorized</span>
                <span className="text-lg font-black text-[#00F2FE] font-mono">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full btn-emerald text-sm py-3 justify-center text-[#040814] font-black tracking-wide"
            >
              {processing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying UPI Gateway Settlement...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Confirm & Pay ₹{totalAmount.toFixed(2)}</span>
                </div>
              )}
            </button>
          </div>
        ) : (
          /* Payment Success & Invoice Confirmation */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-[#00E676] border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-extrabold text-white">Payment Confirmed!</h3>
            <p className="text-xs text-slate-400 mt-1 mb-6">
              UPI Ref ID: <span className="font-mono text-cyan-300">{successResult.payment?.transaction_id}</span>
            </p>

            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">GST Invoice #:</span>
                <span className="font-mono text-white font-bold">{successResult.invoice?.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Charging Bay:</span>
                <span className="text-slate-200 font-semibold">{successResult.invoice?.charger_info}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Settled:</span>
                <span className="font-mono text-[#00E676] font-bold">₹{successResult.payment?.total_amount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="btn-secondary text-xs py-2.5 justify-center"
              >
                Done
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onPaymentSuccess) onPaymentSuccess(successResult.payment, successResult.invoice);
                }}
                className="btn-primary text-xs py-2.5 justify-center"
              >
                <FileText className="w-4 h-4" />
                <span>View GST Invoice</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
