const express = require('express');
const router = express.Router();
const { db } = require('../db');

// Helper to generate time slots (06:00 AM to 11:00 PM in 45-minute increments)
function generateDaySlots() {
  const slots = [];
  const times = [
    '07:00 AM', '07:45 AM', '08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM',
    '11:30 AM', '12:15 PM', '01:00 PM', '01:45 PM', '02:30 PM', '03:15 PM',
    '04:00 PM', '04:45 PM', '05:30 PM', '06:15 PM', '07:00 PM', '07:45 PM',
    '08:30 PM', '09:15 PM', '10:00 PM'
  ];
  return times;
}

// Generate dynamic slot availability for a charger on a date
router.get('/slots', async (req, res) => {
  try {
    const { chargerId, date } = req.query;
    if (!chargerId) {
      return res.status(400).json({ error: 'chargerId is required' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    const charger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [chargerId]);
    if (!charger) {
      return res.status(404).json({ error: 'Charger not found' });
    }

    // Existing active bookings for this charger on this date
    const existingBookings = await db.allAsync(
      `SELECT * FROM bookings 
       WHERE charger_id = ? AND date = ? AND status IN ('CONFIRMED', 'ACTIVE', 'PENDING')`,
      [chargerId, targetDate]
    );

    const bookedStartTimes = new Set(existingBookings.map((b) => b.start_time));
    const allSlotTimes = generateDaySlots();

    const slotMatrix = allSlotTimes.map((time, idx) => {
      const isBooked = bookedStartTimes.has(time);
      const isChargerFaulted = charger.status === 'FAULTED' || charger.status === 'OFFLINE';
      const available = !isBooked && !isChargerFaulted;

      return {
        id: `slot-${idx}`,
        time,
        date: targetDate,
        durationMins: 45,
        status: available ? 'AVAILABLE' : (isChargerFaulted ? 'MAINTENANCE' : 'RESERVED'),
        priceEstimate: Number((charger.power_kw * (45 / 60) * 0.7 * charger.price_per_kwh).toFixed(2))
      };
    });

    res.json({
      success: true,
      chargerId,
      date: targetDate,
      chargerStatus: charger.status,
      slots: slotMatrix
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a booking with atomic conflict prevention
router.post('/', async (req, res) => {
  try {
    const {
      userId = 'usr-driver-1',
      stationId,
      chargerId,
      vehicleId,
      date,
      startTime,
      durationMins = 45,
      targetSoc = 85
    } = req.body;

    if (!stationId || !chargerId || !startTime) {
      return res.status(400).json({ error: 'Missing required booking parameters' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    // CONFLICT PREVENTION CHECK:
    const conflict = await db.getAsync(
      `SELECT * FROM bookings 
       WHERE charger_id = ? AND date = ? AND start_time = ? AND status IN ('CONFIRMED', 'ACTIVE')`,
      [chargerId, targetDate, startTime]
    );

    if (conflict) {
      return res.status(409).json({
        error: 'Double-booking conflict detected! This time slot was just reserved by another EV driver. Please select another slot.',
        conflictId: conflict.id
      });
    }

    const charger = await db.getAsync('SELECT * FROM chargers WHERE id = ?', [chargerId]);
    if (!charger) return res.status(404).json({ error: 'Charger not found' });

    const vehicle = vehicleId
      ? await db.getAsync('SELECT * FROM vehicles WHERE id = ?', [vehicleId])
      : await db.getAsync('SELECT * FROM vehicles WHERE user_id = ? AND is_primary = 1', [userId]);

    // Calculate estimated energy (kWh)
    let estimatedKwh = 35.0;
    if (vehicle) {
      const neededSoc = Math.max(10, targetSoc - (vehicle.current_soc || 30));
      estimatedKwh = Number(((neededSoc / 100) * vehicle.battery_capacity).toFixed(1));
    }
    // Cap energy by charger max output during duration
    const maxPossibleKwh = charger.power_kw * (durationMins / 60);
    estimatedKwh = Math.min(estimatedKwh, maxPossibleKwh);

    const estimatedAmount = Number((estimatedKwh * charger.price_per_kwh).toFixed(2));

    const bookingId = `bk-${Date.now()}`;
    const endTime = `Slot (+${durationMins}m)`;

    await db.runAsync(
      `INSERT INTO bookings (id, user_id, station_id, charger_id, vehicle_id, date, start_time, end_time, estimated_kwh, estimated_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [bookingId, userId, stationId, chargerId, vehicle ? vehicle.id : null, targetDate, startTime, endTime, estimatedKwh, estimatedAmount]
    );

    const createdBooking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    const station = await db.getAsync('SELECT * FROM charging_stations WHERE id = ?', [stationId]);

    res.json({
      success: true,
      message: 'Charging slot reserved successfully!',
      booking: {
        ...createdBooking,
        station,
        charger,
        vehicle
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await db.allAsync(
      `SELECT b.*, s.name as station_name, s.address as station_address, s.image_url as station_image,
              c.identifier as charger_identifier, c.power_kw, c.connector_type, c.price_per_kwh,
              p.transaction_id, p.status as payment_status, p.payment_method
       FROM bookings b
       JOIN charging_stations s ON b.station_id = s.id
       JOIN chargers c ON b.charger_id = c.id
       LEFT JOIN payments p ON b.id = p.booking_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.userId]
    );

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get station bookings (Host view)
router.get('/station/:stationId', async (req, res) => {
  try {
    const bookings = await db.allAsync(
      `SELECT b.*, u.name as user_name, u.phone as user_phone, c.identifier as charger_identifier, c.power_kw
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN chargers c ON b.charger_id = c.id
       WHERE b.station_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.stationId]
    );
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a booking
router.post('/:id/cancel', async (req, res) => {
  try {
    const booking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    await db.runAsync('UPDATE bookings SET status = "CANCELLED" WHERE id = ?', [req.params.id]);
    
    // If there was a payment, mark refunded
    await db.runAsync('UPDATE payments SET status = "REFUNDED" WHERE booking_id = ?', [req.params.id]);

    res.json({ success: true, message: 'Reservation cancelled and slot released.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status lifecycle (CONFIRMED -> ACTIVE -> COMPLETED)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.runAsync('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    
    // If starting charging, set charger to CHARGING
    const booking = await db.getAsync('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    if (booking) {
      if (status === 'ACTIVE') {
        await db.runAsync('UPDATE chargers SET status = "CHARGING", active_power_kw = power_kw * 0.85 WHERE id = ?', [booking.charger_id]);
      } else if (status === 'COMPLETED') {
        await db.runAsync('UPDATE chargers SET status = "AVAILABLE", active_power_kw = 0 WHERE id = ?', [booking.charger_id]);
      }
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
