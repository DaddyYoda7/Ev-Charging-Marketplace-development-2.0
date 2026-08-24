const { db, initSchema } = require('./db');

async function seedDatabase() {
  await initSchema();

  console.log('Clearing existing records...');
  await db.runAsync('DELETE FROM maintenance_alerts');
  await db.runAsync('DELETE FROM telemetry_logs');
  await db.runAsync('DELETE FROM invoices');
  await db.runAsync('DELETE FROM payments');
  await db.runAsync('DELETE FROM bookings');
  await db.runAsync('DELETE FROM chargers');
  await db.runAsync('DELETE FROM charging_stations');
  await db.runAsync('DELETE FROM vehicles');
  await db.runAsync('DELETE FROM users');

  console.log('Seeding Indian Users...');
  const users = [
    {
      id: 'usr-driver-1',
      name: 'Aarav Sharma',
      email: 'aarav@evconnect.in',
      phone: '+91 98765 43210',
      password_hash: 'hashed_pw_123',
      role: 'user',
      wallet_balance: 3450.00,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-owner-1',
      name: 'Pooja Iyer (VoltFlow Bharat Infra)',
      email: 'pooja@voltflow.in',
      phone: '+91 98111 22334',
      password_hash: 'hashed_pw_owner',
      role: 'owner',
      wallet_balance: 48500.00,
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-owner-2',
      name: 'Rohan Deshmukh (EcoCharge India)',
      email: 'rohan@ecocharge.in',
      phone: '+91 98222 33445',
      password_hash: 'hashed_pw_rohan',
      role: 'owner',
      wallet_balance: 32400.00,
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr-admin-1',
      name: 'Vikram Malhotra (National Admin)',
      email: 'admin@evconnect.in',
      phone: '+91 99000 11223',
      password_hash: 'hashed_admin_pass',
      role: 'admin',
      wallet_balance: 500000.00,
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const u of users) {
    await db.runAsync(
      `INSERT INTO users (id, name, email, phone, password_hash, role, wallet_balance, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.phone, u.password_hash, u.role, u.wallet_balance, u.avatar_url]
    );
  }

  console.log('Seeding Indian EV Models in Garage...');
  const vehicles = [
    {
      id: 'veh-1',
      user_id: 'usr-driver-1',
      model: 'Nexon EV Empowered+',
      brand: 'Tata Motors',
      vehicle_number: 'KA-01-EV-2026',
      battery_capacity: 45.0,
      current_soc: 28.0,
      connector_type: 'CCS2',
      is_primary: 1
    },
    {
      id: 'veh-2',
      user_id: 'usr-driver-1',
      model: 'Ioniq 5 RWD',
      brand: 'Hyundai India',
      vehicle_number: 'KA-05-HY-8899',
      battery_capacity: 72.6,
      current_soc: 45.0,
      connector_type: 'CCS2',
      is_primary: 0
    },
    {
      id: 'veh-3',
      user_id: 'usr-driver-1',
      model: 'ZS EV Exclusive',
      brand: 'MG Motor India',
      vehicle_number: 'KA-03-MG-4422',
      battery_capacity: 50.3,
      current_soc: 60.0,
      connector_type: 'CCS2',
      is_primary: 0
    },
    {
      id: 'veh-4',
      user_id: 'usr-driver-1',
      model: 'XUV400 EL Pro',
      brand: 'Mahindra Electric',
      vehicle_number: 'KA-04-MH-7711',
      battery_capacity: 39.4,
      current_soc: 35.0,
      connector_type: 'CCS2',
      is_primary: 0
    }
  ];

  for (const v of vehicles) {
    await db.runAsync(
      `INSERT INTO vehicles (id, user_id, model, brand, vehicle_number, battery_capacity, current_soc, connector_type, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [v.id, v.user_id, v.model, v.brand, v.vehicle_number, v.battery_capacity, v.current_soc, v.connector_type, v.is_primary]
    );
  }

  console.log('Seeding Indian EV Charging Stations across Bengaluru & Tech Corridors...');
  const stations = [
    {
      id: 'st-1',
      owner_id: 'usr-owner-1',
      name: 'VoltFlow SuperHub - Indiranagar 100ft Road',
      address: 'Plot 48, 100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      rating: 4.9,
      review_count: 142,
      status: 'ACTIVE',
      amenities: JSON.stringify(['Solar Powered Canopy', 'Fast Wi-Fi', 'Third Wave Coffee', '24/7 Security Guards', 'EV Air Check', 'Clean Restrooms']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'st-2',
      owner_id: 'usr-owner-1',
      name: 'GridPulse HyperCharge - Koramangala 80ft Hub',
      address: '7th Block, Sony World Junction, Koramangala',
      city: 'Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      rating: 4.8,
      review_count: 98,
      status: 'ACTIVE',
      amenities: JSON.stringify(['180kW DC Hyper Fast', 'Cafe Coffee Day', 'Free Nitrogen Tire Air', 'EV Priority Bays', 'CCTV 24/7']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1558441719-20f5c15e8b61?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'st-3',
      owner_id: 'usr-owner-2',
      name: 'EcoCharge Express - Electronic City Toll Plaza',
      address: 'Hosur Road, Phase 1 Elevated Toll Oasis, Electronic City',
      city: 'Bengaluru',
      latitude: 12.8452,
      longitude: 77.6602,
      rating: 4.7,
      review_count: 76,
      status: 'ACTIVE',
      amenities: JSON.stringify(['Highway Express Bay', 'Adyar Ananda Bhavan Dining', '24/7 Security', 'Restrooms', 'Battery Health Diagnostics']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'st-4',
      owner_id: 'usr-owner-2',
      name: 'GreenWatts Plaza - Outer Ring Road Bellandur',
      address: 'Ecospace Business Park, Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      latitude: 12.9260,
      longitude: 77.6762,
      rating: 4.6,
      review_count: 65,
      status: 'ACTIVE',
      amenities: JSON.stringify(['Tech Park Access', 'Starbucks Cafe', 'Wind & Solar Hybrid Power', 'Valet EV Parking', 'Restrooms']),
      opening_hours: '06:00 AM - 11:30 PM',
      image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'st-5',
      owner_id: 'usr-owner-1',
      name: 'SparkPoint Destination - Whitefield ITPL Hub',
      address: 'International Tech Park (ITPB), Whitefield Main Road',
      city: 'Bengaluru',
      latitude: 12.9863,
      longitude: 77.7300,
      rating: 4.8,
      review_count: 110,
      status: 'ACTIVE',
      amenities: JSON.stringify(['Ultra Fast 240kW DC', 'Food Court', 'Co-working Pods', 'EV Maintenance & Detailing', 'Wheelchair Accessible']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'st-6',
      owner_id: 'usr-owner-2',
      name: 'Zenith FastHub - Bengaluru-Mysuru Expressway Oasis',
      address: 'KM 28, Bengaluru-Mysuru Expressway Tollway Oasis, Bidadi',
      city: 'Bengaluru Region',
      latitude: 12.8010,
      longitude: 77.4020,
      rating: 4.9,
      review_count: 135,
      status: 'ACTIVE',
      amenities: JSON.stringify(['350kW Hyper Charger', 'Highway Diner & Food Plaza', 'Clean Washrooms', '24/7 Security Patrol', 'Solar Canopy']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    }
  ];

  for (const s of stations) {
    await db.runAsync(
      `INSERT INTO charging_stations (id, owner_id, name, address, city, latitude, longitude, rating, review_count, status, amenities, opening_hours, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.owner_id, s.name, s.address, s.city, s.latitude, s.longitude, s.rating, s.review_count, s.status, s.amenities, s.opening_hours, s.image_url]
    );
  }

  console.log('Seeding Indian Chargers with Rupee (₹) Tariffs...');
  const chargers = [
    // Station 1: Indiranagar
    {
      id: 'ch-101',
      station_id: 'st-1',
      identifier: 'BAY-01 (Hyper 240kW DC)',
      connector_type: 'CCS2',
      current_type: 'DC Ultra-Fast',
      power_kw: 240.0,
      price_per_kwh: 22.50,
      status: 'AVAILABLE',
      health_score: 99,
      temperature_c: 28.5,
      total_sessions: 310
    },
    {
      id: 'ch-102',
      station_id: 'st-1',
      identifier: 'BAY-02 (Supercharger 120kW)',
      connector_type: 'CCS2',
      current_type: 'DC Fast',
      power_kw: 120.0,
      price_per_kwh: 19.50,
      status: 'CHARGING',
      health_score: 96,
      temperature_c: 37.8,
      active_power_kw: 95.0,
      voltage: 415.0,
      current_amp: 230.0,
      total_sessions: 240
    },
    {
      id: 'ch-103',
      station_id: 'st-1',
      identifier: 'BAY-03 (AC Fast 22kW)',
      connector_type: 'Type 2',
      current_type: 'AC Level 2',
      power_kw: 22.0,
      price_per_kwh: 14.00,
      status: 'AVAILABLE',
      health_score: 100,
      temperature_c: 26.0,
      total_sessions: 420
    },

    // Station 2: Koramangala
    {
      id: 'ch-201',
      station_id: 'st-2',
      identifier: 'KORA-01 (180kW DC)',
      connector_type: 'CCS2',
      current_type: 'DC Fast',
      power_kw: 180.0,
      price_per_kwh: 21.00,
      status: 'AVAILABLE',
      health_score: 95,
      temperature_c: 32.0,
      total_sessions: 190
    },
    {
      id: 'ch-202',
      station_id: 'st-2',
      identifier: 'KORA-02 (60kW DC Rapid)',
      connector_type: 'CHAdeMO',
      current_type: 'DC Fast',
      power_kw: 60.0,
      price_per_kwh: 17.50,
      status: 'AVAILABLE',
      health_score: 93,
      temperature_c: 30.5,
      total_sessions: 120
    },

    // Station 3: Electronic City
    {
      id: 'ch-301',
      station_id: 'st-3',
      identifier: 'ECITY-01 (150kW DC)',
      connector_type: 'CCS2',
      current_type: 'DC Fast',
      power_kw: 150.0,
      price_per_kwh: 20.00,
      status: 'OCCUPIED',
      health_score: 89,
      temperature_c: 43.0,
      active_power_kw: 110.0,
      total_sessions: 260
    },
    {
      id: 'ch-302',
      station_id: 'st-3',
      identifier: 'ECITY-02 (22kW AC)',
      connector_type: 'Type 2',
      current_type: 'AC Level 2',
      power_kw: 22.0,
      price_per_kwh: 13.50,
      status: 'AVAILABLE',
      health_score: 98,
      temperature_c: 27.0,
      total_sessions: 180
    },

    // Station 4: Bellandur ORR
    {
      id: 'ch-401',
      station_id: 'st-4',
      identifier: 'ORR-01 (120kW DC)',
      connector_type: 'CCS2',
      current_type: 'DC Fast',
      power_kw: 120.0,
      price_per_kwh: 19.00,
      status: 'AVAILABLE',
      health_score: 96,
      temperature_c: 31.5,
      total_sessions: 290
    },
    {
      id: 'ch-402',
      station_id: 'st-4',
      identifier: 'ORR-02 (60kW DC)',
      connector_type: 'CHAdeMO',
      current_type: 'DC Fast',
      power_kw: 60.0,
      price_per_kwh: 16.50,
      status: 'AVAILABLE',
      health_score: 82,
      temperature_c: 48.5, // High thermal condition
      total_sessions: 310
    },

    // Station 5: Whitefield
    {
      id: 'ch-501',
      station_id: 'st-5',
      identifier: 'ITPL-01 (240kW DC)',
      connector_type: 'CCS2',
      current_type: 'DC Ultra-Fast',
      power_kw: 240.0,
      price_per_kwh: 23.00,
      status: 'AVAILABLE',
      health_score: 98,
      temperature_c: 29.0,
      total_sessions: 165
    },

    // Station 6: Mysuru Expressway
    {
      id: 'ch-601',
      station_id: 'st-6',
      identifier: 'EXP-01 (Hyper 350kW)',
      connector_type: 'CCS2',
      current_type: 'DC Ultra-Fast',
      power_kw: 350.0,
      price_per_kwh: 24.50,
      status: 'AVAILABLE',
      health_score: 100,
      temperature_c: 28.0,
      total_sessions: 210
    }
  ];

  for (const c of chargers) {
    await db.runAsync(
      `INSERT INTO chargers (id, station_id, identifier, connector_type, current_type, power_kw, price_per_kwh, status, health_score, temperature_c, active_power_kw, total_sessions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.station_id, c.identifier, c.connector_type, c.current_type, c.power_kw, c.price_per_kwh, c.status, c.health_score, c.temperature_c, c.active_power_kw || 0, c.total_sessions]
    );
  }

  console.log('Seeding Sample Indian Bookings & UPI Invoices in ₹...');
  const sampleBookings = [
    {
      id: 'bk-1001',
      user_id: 'usr-driver-1',
      station_id: 'st-1',
      charger_id: 'ch-102',
      vehicle_id: 'veh-1',
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '10:45 AM',
      estimated_kwh: 32.0,
      estimated_amount: 624.00,
      status: 'ACTIVE'
    },
    {
      id: 'bk-1002',
      user_id: 'usr-driver-1',
      station_id: 'st-2',
      charger_id: 'ch-201',
      vehicle_id: 'veh-1',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      start_time: '02:30 PM',
      end_time: '03:15 PM',
      estimated_kwh: 28.0,
      estimated_amount: 588.00,
      status: 'COMPLETED'
    },
    {
      id: 'bk-1003',
      user_id: 'usr-driver-1',
      station_id: 'st-6',
      charger_id: 'ch-601',
      vehicle_id: 'veh-2',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      start_time: '05:30 PM',
      end_time: '06:15 PM',
      estimated_kwh: 45.0,
      estimated_amount: 1102.50,
      status: 'COMPLETED'
    }
  ];

  for (const b of sampleBookings) {
    await db.runAsync(
      `INSERT INTO bookings (id, user_id, station_id, charger_id, vehicle_id, date, start_time, end_time, estimated_kwh, estimated_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.user_id, b.station_id, b.charger_id, b.vehicle_id, b.date, b.start_time, b.end_time, b.estimated_kwh, b.estimated_amount, b.status]
    );

    const platformComm = Number((b.estimated_amount * 0.10).toFixed(2));
    const ownerPayout = Number((b.estimated_amount * 0.90).toFixed(2));
    const gstTax = Number((b.estimated_amount * 0.05).toFixed(2)); // 5% GST on EV Charging in India
    const totalWithGst = Number((b.estimated_amount + gstTax).toFixed(2));
    const payId = 'pay-' + b.id;
    const txId = 'UPI-IND-' + Math.floor(1000000000 + Math.random() * 9000000000);

    await db.runAsync(
      `INSERT INTO payments (id, booking_id, user_id, owner_id, total_amount, platform_commission, owner_payout, tax_amount, payment_method, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payId, b.id, b.user_id, 'usr-owner-1', totalWithGst, platformComm, ownerPayout, gstTax, 'Instant UPI (Google Pay / PhonePe)', txId, 'SUCCESS']
    );

    const invNum = 'EVC-GST-2026-' + b.id.replace('bk-', '');
    await db.runAsync(
      `INSERT INTO invoices (id, invoice_number, payment_id, booking_id, user_id, user_name, station_name, station_address, charger_info, energy_delivered_kwh, duration_mins, tariff_per_kwh, subtotal, tax, total, payment_method, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'inv-' + b.id,
        invNum,
        payId,
        b.id,
        b.user_id,
        'Aarav Sharma',
        'VoltFlow SuperHub - Indiranagar 100ft Road',
        'Plot 48, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
        'BAY-02 (Supercharger 120kW CCS2)',
        b.estimated_kwh,
        45,
        19.50,
        b.estimated_amount,
        gstTax,
        totalWithGst,
        'UPI (Google Pay / PhonePe)',
        txId
      ]
    );
  }

  console.log('Seeding Predictive Maintenance Alerts...');
  const alerts = [
    {
      id: 'alt-1',
      station_id: 'st-4',
      charger_id: 'ch-402',
      severity: 'WARNING',
      issue: 'Cooling Radiator Thermal Anomaly (48.5°C in tropical ambient load)',
      recommendation: 'Clean radiator air filters and check liquid coolant pressure before peak noon hours.',
      failure_risk_pct: 65,
      status: 'OPEN'
    }
  ];

  for (const a of alerts) {
    await db.runAsync(
      `INSERT INTO maintenance_alerts (id, station_id, charger_id, severity, issue, recommendation, failure_risk_pct, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.id, a.station_id, a.charger_id, a.severity, a.issue, a.recommendation, a.failure_risk_pct, a.status]
    );
  }

  console.log('Indian EV Database Seeded Successfully with Rupee (₹) Pricing & Coordinates!');
}

seedDatabase().then(() => {
  db.close();
}).catch((err) => {
  console.error('Seed error:', err);
});
