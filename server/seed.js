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

  console.log('Seeding EV Scooty & Electric Cars in Garage...');
  const vehicles = [
    {
      id: 'veh-scooty-1',
      user_id: 'usr-driver-1',
      model: 'Ather 450X Gen 3',
      brand: 'Ather Energy',
      vehicle_number: 'KA-01-EV-4500',
      battery_capacity: 3.7,
      current_soc: 35.0,
      connector_type: 'Ather Grid (2W)',
      is_primary: 1
    },
    {
      id: 'veh-scooty-2',
      user_id: 'usr-driver-1',
      model: 'Ola S1 Pro Gen 2',
      brand: 'Ola Electric',
      vehicle_number: 'KA-05-OLA-7722',
      battery_capacity: 4.0,
      current_soc: 45.0,
      connector_type: 'Ola Hypercharger (2W)',
      is_primary: 0
    },
    {
      id: 'veh-scooty-3',
      user_id: 'usr-driver-1',
      model: 'TVS iQube ST',
      brand: 'TVS Motor',
      vehicle_number: 'KA-03-IQ-8811',
      battery_capacity: 5.1,
      current_soc: 60.0,
      connector_type: '15A EV Socket (2W)',
      is_primary: 0
    },
    {
      id: 'veh-car-1',
      user_id: 'usr-driver-1',
      model: 'Nexon EV Empowered+',
      brand: 'Tata Motors',
      vehicle_number: 'KA-01-EV-2026',
      battery_capacity: 45.0,
      current_soc: 28.0,
      connector_type: 'CCS2',
      is_primary: 0
    },
    {
      id: 'veh-car-2',
      user_id: 'usr-driver-1',
      model: 'Ioniq 5 RWD',
      brand: 'Hyundai India',
      vehicle_number: 'KA-05-HY-8899',
      battery_capacity: 72.6,
      current_soc: 50.0,
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

  console.log('Seeding Pan-India EV Stations (Scooty & Car Fast Charging Hubs)...');
  const stations = [
    // 1. Bengaluru - Indiranagar (Central Hub)
    {
      id: 'st-blr-1',
      owner_id: 'usr-owner-1',
      name: 'VoltFlow SuperHub & Ather Grid - Indiranagar',
      address: 'Plot 48, 100 Feet Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      rating: 4.9,
      review_count: 184,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Scooty Fast Bay', 'Ather Grid Point', '60-Sec Battery Swap Dock', 'Solar Powered Canopy', 'Third Wave Coffee', '24/7 Security']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    },
    // 2. Bengaluru - Koramangala
    {
      id: 'st-blr-2',
      owner_id: 'usr-owner-1',
      name: 'Ola Hypercharger & GridPulse Hub - Koramangala',
      address: '7th Block, Sony World Junction, 80 Feet Road, Koramangala',
      city: 'Bengaluru',
      latitude: 12.9352,
      longitude: 77.6245,
      rating: 4.8,
      review_count: 128,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 Ola Hypercharger (15kW 2W)', 'Ather Grid 3.3kW', '180kW CCS2 DC', 'Cafe Coffee Day', 'Free Tire Air Check']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1558441719-20f5c15e8b61?w=600&auto=format&fit=crop&q=80'
    },
    // 3. Bengaluru - Electronic City
    {
      id: 'st-blr-3',
      owner_id: 'usr-owner-2',
      name: 'EcoCharge Express & 2W Swap Station - Electronic City',
      address: 'Hosur Road, Phase 1 Elevated Toll Plaza, Electronic City',
      city: 'Bengaluru',
      latitude: 12.8452,
      longitude: 77.6602,
      rating: 4.7,
      review_count: 95,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Fast Battery Swap', '15A Smart Scooty Sockets', '150kW DC Car Bay', 'Adyar Ananda Bhavan', 'Restrooms']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    },
    // 4. Bengaluru - Whitefield
    {
      id: 'st-blr-4',
      owner_id: 'usr-owner-1',
      name: 'SparkPoint Tech Park Hub - Whitefield ITPL',
      address: 'International Tech Park (ITPB), Whitefield Main Road',
      city: 'Bengaluru',
      latitude: 12.9863,
      longitude: 77.7300,
      rating: 4.8,
      review_count: 140,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Multi-Plug Deck', 'Ather Grid Fast', '240kW DC Ultra-Fast', 'Food Court', 'Co-working Lounge']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80'
    },
    // 5. Mumbai - BKC
    {
      id: 'st-mum-1',
      owner_id: 'usr-owner-2',
      name: 'Zenith 2W & 4W HyperHub - BKC G-Block, Mumbai',
      address: 'Bandra-Kurla Complex, Near Jio World Convention Centre, Mumbai',
      city: 'Mumbai',
      latitude: 19.0657,
      longitude: 72.8687,
      rating: 4.9,
      review_count: 175,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Ola & Ather Fast Hub', '240kW DC Supercharger', '24/7 Security', 'Coffee Lounge', 'Valet EV Parking']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    },
    // 6. Mumbai - Powai
    {
      id: 'st-mum-2',
      owner_id: 'usr-owner-1',
      name: 'Powai Tech Hub & Scooty Dock - Hiranandani',
      address: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai',
      city: 'Mumbai',
      latitude: 19.1197,
      longitude: 72.9051,
      rating: 4.7,
      review_count: 88,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 15A Scooty Charging Pods', 'Ather Grid 3.3kW', '60kW DC Fast', 'Starbucks Cafe', 'EV Air Station']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1558441719-20f5c15e8b61?w=600&auto=format&fit=crop&q=80'
    },
    // 7. Delhi NCR - Connaught Place
    {
      id: 'st-del-1',
      owner_id: 'usr-owner-1',
      name: 'Capital ChargeHub & 2W Fast Station - CP New Delhi',
      address: 'Outer Circle, Connaught Place, New Delhi',
      city: 'Delhi NCR',
      latitude: 28.6315,
      longitude: 77.2167,
      rating: 4.8,
      review_count: 210,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 Ola Hypercharger (15kW)', 'Ather Grid Fast', '150kW DC Fast Car', 'Heritage Market Access', '24/7 CCTV']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
    },
    // 8. Delhi NCR - Gurugram Cyber City
    {
      id: 'st-del-2',
      owner_id: 'usr-owner-2',
      name: 'Cyber City RapidCharge & Swap Pod - Gurugram',
      address: 'DLF Cyber City, Building 10 Plaza, Gurugram, Haryana',
      city: 'Delhi NCR',
      latitude: 28.4950,
      longitude: 77.0895,
      rating: 4.9,
      review_count: 165,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Rapid Battery Swap Pod', 'Ather Grid Point', '240kW DC Ultra-Fast', 'Food Court Access', '24/7 Security']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    },
    // 9. Hyderabad - Hitec City
    {
      id: 'st-hyd-1',
      owner_id: 'usr-owner-1',
      name: 'Hitec City Cyber Towers 2W/4W Hub - Hyderabad',
      address: 'Cyber Towers Junction, Madhapur, Hitec City, Hyderabad',
      city: 'Hyderabad',
      latitude: 17.4504,
      longitude: 78.3808,
      rating: 4.8,
      review_count: 145,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Scooty Multi-Charger', 'Ola Hypercharger', '180kW CCS2 DC', 'Chai Point', 'Free Wi-Fi']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?w=600&auto=format&fit=crop&q=80'
    },
    // 10. Chennai - OMR IT Corridor
    {
      id: 'st-chn-1',
      owner_id: 'usr-owner-2',
      name: 'OMR IT Expressway FastCharge - Chennai',
      address: 'Rajiv Gandhi Salai, Thoraipakkam, OMR Corridor, Chennai',
      city: 'Chennai',
      latitude: 12.9165,
      longitude: 80.2285,
      rating: 4.7,
      review_count: 115,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 Ather Grid Fast Dock', '15A Scooty Socket Bay', '150kW DC Fast', 'Saravana Bhavan Dining', 'Restrooms']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    },
    // 11. Kolkata - Salt Lake Sector V
    {
      id: 'st-kol-1',
      owner_id: 'usr-owner-1',
      name: 'Salt Lake Sector V EcoStation - Kolkata',
      address: 'Block EP & GP, Sector V, Bidhannagar, Kolkata',
      city: 'Kolkata',
      latitude: 22.5804,
      longitude: 88.4378,
      rating: 4.7,
      review_count: 92,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Scooty Fast Bay', 'Ola Hypercharger (15kW)', '120kW CCS2 DC', '24/7 Security Patrol', 'Clean Washrooms']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1558441719-20f5c15e8b61?w=600&auto=format&fit=crop&q=80'
    },
    // 12. Ahmedabad - SG Highway
    {
      id: 'st-ahm-1',
      owner_id: 'usr-owner-2',
      name: 'SG Highway EcoHub & 2W FastPoint - Ahmedabad',
      address: 'Near ISKCON Cross Roads, Sarkhej - Gandhinagar Hwy, Ahmedabad',
      city: 'Ahmedabad',
      latitude: 23.0338,
      longitude: 72.5070,
      rating: 4.8,
      review_count: 104,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Ather & Scooty Pods', '150kW CCS2 DC', 'Honest Restaurant Dining', 'Solar Roof', 'CCTV']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=80'
    },
    // 13. Mumbai-Pune Expressway - Lonavala Oasis
    {
      id: 'st-exp-1',
      owner_id: 'usr-owner-1',
      name: 'Mumbai-Pune Expressway Oasis - Lonavala',
      address: 'KM 52, Yashwantrao Chavan Expressway Food Court, Lonavala',
      city: 'Maharashtra Expressway',
      latitude: 18.7546,
      longitude: 73.4062,
      rating: 4.9,
      review_count: 220,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Highway Fast Socket', '350kW DC Ultra-Fast', 'McDonalds & Food Plaza', 'Free Tire Air', 'Clean Restrooms']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&auto=format&fit=crop&q=80'
    },
    // 14. Bengaluru-Mysuru Expressway - Bidadi Oasis
    {
      id: 'st-exp-2',
      owner_id: 'usr-owner-2',
      name: 'Bengaluru-Mysuru Expressway Oasis - Bidadi',
      address: 'KM 28, Bengaluru-Mysuru Expressway Tollway Oasis, Bidadi',
      city: 'Karnataka Expressway',
      latitude: 12.8010,
      longitude: 77.4020,
      rating: 4.9,
      review_count: 185,
      status: 'ACTIVE',
      amenities: JSON.stringify(['🛵 2W Scooty Rapid Point', '350kW Hyper Charger', 'Highway Food Court', '24/7 Security', 'Solar Canopy']),
      opening_hours: '24/7 Open',
      image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80'
    }
  ];

  for (const s of stations) {
    await db.runAsync(
      `INSERT INTO charging_stations (id, owner_id, name, address, city, latitude, longitude, rating, review_count, status, amenities, opening_hours, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [s.id, s.owner_id, s.name, s.address, s.city, s.latitude, s.longitude, s.rating, s.review_count, s.status, s.amenities, s.opening_hours, s.image_url]
    );
  }

  console.log('Seeding Chargers (EV Scooty Fast Plugs, Battery Swaps & Car Fast DC)...');
  const chargers = [
    // Indiranagar
    { id: 'ch-101', station_id: 'st-blr-1', identifier: 'SCOOTY-01 (Ather Grid Fast)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 100, temperature_c: 26.0, total_sessions: 520 },
    { id: 'ch-102', station_id: 'st-blr-1', identifier: 'SCOOTY-02 (15A Industrial Socket)', connector_type: '15A EV Socket (2W)', current_type: 'AC Level 1 (2W)', power_kw: 3.3, price_per_kwh: 10.00, status: 'AVAILABLE', health_score: 100, temperature_c: 24.5, total_sessions: 410 },
    { id: 'ch-103', station_id: 'st-blr-1', identifier: 'BAY-CAR-01 (240kW Hyper DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 240.0, price_per_kwh: 22.50, status: 'AVAILABLE', health_score: 98, temperature_c: 28.5, total_sessions: 310 },

    // Koramangala
    { id: 'ch-201', station_id: 'st-blr-2', identifier: 'OLA-HYPER-01 (15kW 2W Fast)', connector_type: 'Ola Hypercharger (2W)', current_type: 'DC Fast (2W)', power_kw: 15.0, price_per_kwh: 14.00, status: 'AVAILABLE', health_score: 99, temperature_c: 27.0, total_sessions: 620 },
    { id: 'ch-202', station_id: 'st-blr-2', identifier: 'ATHER-GRID-02 (7.4kW Fast)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 98, temperature_c: 26.5, total_sessions: 380 },
    { id: 'ch-203', station_id: 'st-blr-2', identifier: 'BAY-CAR-02 (180kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 180.0, price_per_kwh: 21.00, status: 'CHARGING', health_score: 96, temperature_c: 36.0, active_power_kw: 135.0, total_sessions: 240 },

    // Electronic City
    { id: 'ch-301', station_id: 'st-blr-3', identifier: 'SWAP-DOCK-01 (2W Battery Swap)', connector_type: 'Battery Swap (2W)', current_type: 'Fast Battery Swap', power_kw: 10.0, price_per_kwh: 45.00, status: 'AVAILABLE', health_score: 100, temperature_c: 25.0, total_sessions: 890 },
    { id: 'ch-302', station_id: 'st-blr-3', identifier: 'SCOOTY-03 (15A EV Socket)', connector_type: '15A EV Socket (2W)', current_type: 'AC Level 1 (2W)', power_kw: 3.3, price_per_kwh: 10.00, status: 'AVAILABLE', health_score: 97, temperature_c: 26.0, total_sessions: 320 },
    { id: 'ch-303', station_id: 'st-blr-3', identifier: 'BAY-CAR-03 (150kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 150.0, price_per_kwh: 20.00, status: 'AVAILABLE', health_score: 95, temperature_c: 29.0, total_sessions: 210 },

    // Whitefield
    { id: 'ch-401', station_id: 'st-blr-4', identifier: 'ATHER-03 (Ather Grid)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 98, temperature_c: 26.0, total_sessions: 440 },
    { id: 'ch-402', station_id: 'st-blr-4', identifier: 'BAY-CAR-04 (240kW DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 240.0, price_per_kwh: 23.00, status: 'AVAILABLE', health_score: 98, temperature_c: 29.0, total_sessions: 195 },

    // Mumbai BKC
    { id: 'ch-501', station_id: 'st-mum-1', identifier: 'OLA-MUM-01 (15kW Hyper)', connector_type: 'Ola Hypercharger (2W)', current_type: 'DC Fast (2W)', power_kw: 15.0, price_per_kwh: 14.50, status: 'AVAILABLE', health_score: 99, temperature_c: 28.0, total_sessions: 510 },
    { id: 'ch-502', station_id: 'st-mum-1', identifier: 'ATHER-MUM-02 (7.4kW Grid)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 13.00, status: 'AVAILABLE', health_score: 98, temperature_c: 27.0, total_sessions: 480 },
    { id: 'ch-503', station_id: 'st-mum-1', identifier: 'BAY-CAR-05 (240kW DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 240.0, price_per_kwh: 23.50, status: 'AVAILABLE', health_score: 97, temperature_c: 30.0, total_sessions: 310 },

    // Powai Mumbai
    { id: 'ch-601', station_id: 'st-mum-2', identifier: 'POWAI-SCOOTY-01 (15A Socket)', connector_type: '15A EV Socket (2W)', current_type: 'AC Level 1 (2W)', power_kw: 3.3, price_per_kwh: 10.50, status: 'AVAILABLE', health_score: 100, temperature_c: 25.5, total_sessions: 330 },
    { id: 'ch-602', station_id: 'st-mum-2', identifier: 'BAY-CAR-06 (60kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 60.0, price_per_kwh: 18.00, status: 'AVAILABLE', health_score: 95, temperature_c: 28.5, total_sessions: 190 },

    // Delhi CP
    { id: 'ch-701', station_id: 'st-del-1', identifier: 'DEL-OLA-01 (15kW Hyper)', connector_type: 'Ola Hypercharger (2W)', current_type: 'DC Fast (2W)', power_kw: 15.0, price_per_kwh: 14.00, status: 'AVAILABLE', health_score: 99, temperature_c: 27.5, total_sessions: 590 },
    { id: 'ch-702', station_id: 'st-del-1', identifier: 'DEL-ATHER-02 (7.4kW)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 98, temperature_c: 26.5, total_sessions: 420 },
    { id: 'ch-703', station_id: 'st-del-1', identifier: 'BAY-CAR-07 (150kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 150.0, price_per_kwh: 21.50, status: 'AVAILABLE', health_score: 96, temperature_c: 31.0, total_sessions: 280 },

    // Gurugram Cyber City
    { id: 'ch-801', station_id: 'st-del-2', identifier: 'GUR-SWAP-01 (Battery Swap 2W)', connector_type: 'Battery Swap (2W)', current_type: 'Fast Battery Swap', power_kw: 10.0, price_per_kwh: 45.00, status: 'AVAILABLE', health_score: 100, temperature_c: 25.0, total_sessions: 760 },
    { id: 'ch-802', station_id: 'st-del-2', identifier: 'BAY-CAR-08 (240kW DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 240.0, price_per_kwh: 23.00, status: 'AVAILABLE', health_score: 98, temperature_c: 29.5, total_sessions: 230 },

    // Hyderabad Hitec City
    { id: 'ch-901', station_id: 'st-hyd-1', identifier: 'HYD-SCOOTY-01 (Ather Grid)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 100, temperature_c: 26.0, total_sessions: 480 },
    { id: 'ch-902', station_id: 'st-hyd-1', identifier: 'BAY-CAR-09 (180kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 180.0, price_per_kwh: 21.00, status: 'AVAILABLE', health_score: 96, temperature_c: 29.0, total_sessions: 240 },

    // Chennai OMR
    { id: 'ch-1001', station_id: 'st-chn-1', identifier: 'CHN-SCOOTY-01 (15A Socket)', connector_type: '15A EV Socket (2W)', current_type: 'AC Level 1 (2W)', power_kw: 3.3, price_per_kwh: 10.00, status: 'AVAILABLE', health_score: 98, temperature_c: 28.0, total_sessions: 310 },
    { id: 'ch-1002', station_id: 'st-chn-1', identifier: 'BAY-CAR-10 (150kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 150.0, price_per_kwh: 20.50, status: 'AVAILABLE', health_score: 95, temperature_c: 30.5, total_sessions: 190 },

    // Kolkata
    { id: 'ch-1101', station_id: 'st-kol-1', identifier: 'KOL-SCOOTY-01 (Ola Hyper)', connector_type: 'Ola Hypercharger (2W)', current_type: 'DC Fast (2W)', power_kw: 15.0, price_per_kwh: 14.00, status: 'AVAILABLE', health_score: 99, temperature_c: 27.0, total_sessions: 260 },
    { id: 'ch-1102', station_id: 'st-kol-1', identifier: 'BAY-CAR-11 (120kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 120.0, price_per_kwh: 19.50, status: 'AVAILABLE', health_score: 96, temperature_c: 29.0, total_sessions: 170 },

    // Ahmedabad
    { id: 'ch-1201', station_id: 'st-ahm-1', identifier: 'AHM-SCOOTY-01 (Ather Grid)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 98, temperature_c: 28.0, total_sessions: 290 },
    { id: 'ch-1202', station_id: 'st-ahm-1', identifier: 'BAY-CAR-12 (150kW DC)', connector_type: 'CCS2', current_type: 'DC Fast', power_kw: 150.0, price_per_kwh: 20.00, status: 'AVAILABLE', health_score: 96, temperature_c: 30.0, total_sessions: 210 },

    // Mumbai-Pune Expressway
    { id: 'ch-1301', station_id: 'st-exp-1', identifier: 'LONAVALA-SCOOTY-01 (15kW Fast)', connector_type: 'Ola Hypercharger (2W)', current_type: 'DC Fast (2W)', power_kw: 15.0, price_per_kwh: 14.50, status: 'AVAILABLE', health_score: 100, temperature_c: 24.0, total_sessions: 390 },
    { id: 'ch-1302', station_id: 'st-exp-1', identifier: 'BAY-CAR-13 (350kW Hyper DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 350.0, price_per_kwh: 24.50, status: 'AVAILABLE', health_score: 100, temperature_c: 28.0, total_sessions: 430 },

    // Bengaluru-Mysuru Expressway
    { id: 'ch-1401', station_id: 'st-exp-2', identifier: 'BIDADI-SCOOTY-01 (Ather Fast)', connector_type: 'Ather Grid (2W)', current_type: 'DC Fast (2W)', power_kw: 7.4, price_per_kwh: 12.50, status: 'AVAILABLE', health_score: 100, temperature_c: 26.0, total_sessions: 340 },
    { id: 'ch-1402', station_id: 'st-exp-2', identifier: 'BAY-CAR-14 (350kW Hyper DC)', connector_type: 'CCS2', current_type: 'DC Ultra-Fast', power_kw: 350.0, price_per_kwh: 24.50, status: 'AVAILABLE', health_score: 100, temperature_c: 28.0, total_sessions: 380 }
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
      station_id: 'st-blr-1',
      charger_id: 'ch-101',
      vehicle_id: 'veh-scooty-1',
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00 AM',
      end_time: '10:35 AM',
      estimated_kwh: 2.8,
      estimated_amount: 35.00,
      status: 'ACTIVE'
    },
    {
      id: 'bk-1002',
      user_id: 'usr-driver-1',
      station_id: 'st-blr-2',
      charger_id: 'ch-201',
      vehicle_id: 'veh-scooty-2',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      start_time: '02:30 PM',
      end_time: '02:50 PM',
      estimated_kwh: 3.2,
      estimated_amount: 44.80,
      status: 'COMPLETED'
    },
    {
      id: 'bk-1003',
      user_id: 'usr-driver-1',
      station_id: 'st-exp-2',
      charger_id: 'ch-1402',
      vehicle_id: 'veh-car-1',
      date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      start_time: '05:30 PM',
      end_time: '06:15 PM',
      estimated_kwh: 32.0,
      estimated_amount: 784.00,
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
    const gstTax = Number((b.estimated_amount * 0.05).toFixed(2));
    const totalWithGst = Number((b.estimated_amount + gstTax).toFixed(2));
    const payId = 'pay-' + b.id;
    const txId = 'UPI-BHARAT-' + Math.floor(1000000000 + Math.random() * 9000000000);

    await db.runAsync(
      `INSERT INTO payments (id, booking_id, user_id, owner_id, total_amount, platform_commission, owner_payout, tax_amount, payment_method, transaction_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [payId, b.id, b.user_id, 'usr-owner-1', totalWithGst, platformComm, ownerPayout, gstTax, 'Instant UPI (GPay / PhonePe / Paytm)', txId, 'SUCCESS']
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
        'VoltFlow SuperHub & Ather Grid - Indiranagar',
        'Plot 48, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
        'SCOOTY-01 (Ather Grid Fast 7.4kW)',
        b.estimated_kwh,
        35,
        12.50,
        b.estimated_amount,
        gstTax,
        totalWithGst,
        'UPI (Google Pay / PhonePe)',
        txId
      ]
    );
  }

  console.log('Seeding Maintenance Alerts...');
  const alerts = [
    {
      id: 'alt-1',
      station_id: 'st-blr-3',
      charger_id: 'ch-301',
      severity: 'INFO',
      issue: 'Battery Swap Dock Lock Mechanism Sensor Calibration Due',
      recommendation: 'Perform routine mechanical alignment check on 2W battery latch bay.',
      failure_risk_pct: 18,
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

  console.log('Pan-India EV Scooty & Car Database Seeded Successfully!');
}

seedDatabase().then(() => {
  db.close();
}).catch((err) => {
  console.error('Seed error:', err);
});
