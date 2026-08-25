const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'evconnect.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to EVConnect SQLite database.');
  }
});

// Helper for promise-based queries
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

async function initSchema() {
  await db.runAsync('PRAGMA foreign_keys = ON;');

  // Users Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT,
      role TEXT CHECK(role IN ('user', 'owner', 'admin')) DEFAULT 'user',
      wallet_balance REAL DEFAULT 250.00,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Vehicles Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      model TEXT NOT NULL,
      brand TEXT,
      vehicle_number TEXT NOT NULL,
      battery_capacity REAL NOT NULL,
      current_soc REAL DEFAULT 35.0,
      connector_type TEXT NOT NULL,
      is_primary INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Charging Stations Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS charging_stations (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 12,
      status TEXT CHECK(status IN ('ACTIVE', 'MAINTENANCE', 'OFFLINE', 'PENDING_APPROVAL')) DEFAULT 'ACTIVE',
      amenities TEXT,
      opening_hours TEXT DEFAULT '24/7 Open',
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Chargers Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS chargers (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      identifier TEXT NOT NULL,
      connector_type TEXT NOT NULL,
      current_type TEXT NOT NULL,
      power_kw REAL NOT NULL,
      price_per_kwh REAL NOT NULL,
      idle_fee_per_min REAL DEFAULT 0.50,
      status TEXT CHECK(status IN ('AVAILABLE', 'CHARGING', 'OCCUPIED', 'RESERVED', 'FAULTED', 'OFFLINE')) DEFAULT 'AVAILABLE',
      health_score INTEGER DEFAULT 95,
      temperature_c REAL DEFAULT 34.0,
      voltage REAL DEFAULT 400.0,
      current_amp REAL DEFAULT 0.0,
      active_power_kw REAL DEFAULT 0.0,
      total_sessions INTEGER DEFAULT 45,
      last_maintenance DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
    )
  `);

  // Bookings Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      station_id TEXT NOT NULL,
      charger_id TEXT NOT NULL,
      vehicle_id TEXT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      estimated_kwh REAL DEFAULT 25.0,
      estimated_amount REAL NOT NULL,
      status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')) DEFAULT 'CONFIRMED',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (station_id) REFERENCES charging_stations(id),
      FOREIGN KEY (charger_id) REFERENCES chargers(id)
    )
  `);

  // Payments Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      total_amount REAL NOT NULL,
      platform_commission REAL NOT NULL,
      owner_payout REAL NOT NULL,
      tax_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'UPI',
      transaction_id TEXT UNIQUE NOT NULL,
      status TEXT CHECK(status IN ('SUCCESS', 'SETTLED', 'PENDING', 'REFUNDED')) DEFAULT 'SUCCESS',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (booking_id) REFERENCES bookings(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Invoices Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      payment_id TEXT NOT NULL,
      booking_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT,
      station_name TEXT NOT NULL,
      station_address TEXT,
      charger_info TEXT NOT NULL,
      energy_delivered_kwh REAL NOT NULL,
      duration_mins INTEGER NOT NULL,
      tariff_per_kwh REAL NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT NOT NULL,
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    )
  `);

  // Telemetry Logs Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS telemetry_logs (
      id TEXT PRIMARY KEY,
      charger_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      power_kw REAL DEFAULT 0.0,
      energy_kwh REAL DEFAULT 0.0,
      soc_percentage REAL DEFAULT 0.0,
      temperature_c REAL DEFAULT 30.0,
      voltage REAL DEFAULT 400.0,
      current_amp REAL DEFAULT 0.0,
      fault_code TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (charger_id) REFERENCES chargers(id)
    )
  `);

  // Predictive Maintenance Alerts
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS maintenance_alerts (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL,
      charger_id TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('CRITICAL', 'WARNING', 'INFO')) DEFAULT 'WARNING',
      issue TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      failure_risk_pct INTEGER NOT NULL,
      status TEXT CHECK(status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'OPEN',
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (station_id) REFERENCES charging_stations(id),
      FOREIGN KEY (charger_id) REFERENCES chargers(id)
    )
  `);

  console.log('Database schema initialized successfully.');
}

module.exports = {
  db,
  initSchema
};
