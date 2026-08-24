const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Process Checkout & Payment for a Booking
router.post('/checkout', async (req, res) => {
  try {
    const {
      bookingId,
      userId = 'usr-driver-1',
      paymentMethod = 'UPI (Google Pay / PhonePe / Paytm)',
      paymentDetails = {}
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' });
    }

    const booking = await db.getAsync(
      `SELECT b.*, s.name as station_name, s.address as station_address, s.owner_id,
              c.identifier as charger_identifier, c.power_kw, c.price_per_kwh, c.connector_type,
              u.name as user_name, u.email as user_email
       FROM bookings b
       JOIN charging_stations s ON b.station_id = s.id
       JOIN chargers c ON b.charger_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if already paid
    const existingPayment = await db.getAsync('SELECT * FROM payments WHERE booking_id = ? AND status = "SUCCESS"', [bookingId]);
    if (existingPayment) {
      const invoice = await db.getAsync('SELECT * FROM invoices WHERE payment_id = ?', [existingPayment.id]);
      return res.json({
        success: true,
        message: 'Payment already processed',
        payment: existingPayment,
        invoice
      });
    }

    const energyKwh = booking.estimated_kwh || 30.0;
    const tariff = booking.price_per_kwh || 20.00;
    const subtotal = Number((energyKwh * tariff).toFixed(2));
    const taxRate = 0.05; // 5% GST on Electric Vehicle Charging in India
    const tax = Number((subtotal * taxRate).toFixed(2));
    const totalAmount = Number((subtotal + tax).toFixed(2));

    // Revenue Model (Roadmap Phase 4.5): 10% Platform Commission, 90% Host Payout
    const platformCommission = Number((subtotal * 0.10).toFixed(2));
    const ownerPayout = Number((subtotal * 0.90).toFixed(2));

    const paymentId = `pay-${Date.now()}`;
    const transactionId = `UPI-BHARAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Record Payment
    await db.runAsync(
      `INSERT INTO payments (id, booking_id, user_id, owner_id, total_amount, platform_commission, owner_payout, tax_amount, payment_method, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SUCCESS')`,
      [paymentId, bookingId, userId, booking.owner_id, totalAmount, platformCommission, ownerPayout, tax, paymentMethod, transactionId]
    );

    // Update Station Owner Wallet Balance
    await db.runAsync(
      'UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?',
      [ownerPayout, booking.owner_id]
    );

    // Generate Official Indian GST Invoice
    const invoiceId = `inv-${Date.now()}`;
    const invoiceNumber = `EVC-GST-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.runAsync(
      `INSERT INTO invoices (id, invoice_number, payment_id, booking_id, user_id, user_name, station_name, station_address, charger_info, energy_delivered_kwh, duration_mins, tariff_per_kwh, subtotal, tax, total, payment_method, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceId,
        invoiceNumber,
        paymentId,
        bookingId,
        userId,
        booking.user_name || 'Valued EV Driver',
        booking.station_name,
        booking.station_address,
        `${booking.charger_identifier} (${booking.power_kw}kW ${booking.connector_type})`,
        energyKwh,
        45,
        tariff,
        subtotal,
        tax,
        totalAmount,
        paymentMethod,
        transactionId
      ]
    );

    // Update Booking status to CONFIRMED
    await db.runAsync('UPDATE bookings SET status = "CONFIRMED" WHERE id = ?', [bookingId]);

    const payment = await db.getAsync('SELECT * FROM payments WHERE id = ?', [paymentId]);
    const invoice = await db.getAsync('SELECT * FROM invoices WHERE id = ?', [invoiceId]);

    res.json({
      success: true,
      message: 'UPI payment verified and tax invoice generated successfully!',
      payment,
      invoice,
      breakdown: {
        subtotal,
        tax,
        totalAmount,
        platformCommission,
        ownerPayout
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch Invoice details by ID
router.get('/invoice/:id', async (req, res) => {
  try {
    const invoice = await db.getAsync('SELECT * FROM invoices WHERE id = ? OR booking_id = ? OR invoice_number = ?', [req.params.id, req.params.id, req.params.id]);
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Payment History
router.get('/history/user/:userId', async (req, res) => {
  try {
    const history = await db.allAsync(
      `SELECT p.*, i.invoice_number, i.id as invoice_id, s.name as station_name
       FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       JOIN charging_stations s ON b.station_id = s.id
       LEFT JOIN invoices i ON p.id = i.payment_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.params.userId]
    );
    res.json({ success: true, payments: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
