const express = require('express');
const router = express.Router();
const { db } = require('../db');

// List available demo users / switch account
router.get('/users', async (req, res) => {
  try {
    const users = await db.allAsync('SELECT id, name, email, phone, role, wallet_balance, avatar_url FROM users');
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Security Login
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email belongs to admin
    const normalizedEmail = (email || '').trim().toLowerCase();
    const adminUser = await db.getAsync('SELECT * FROM users WHERE (email = ? OR role = "admin") AND role = "admin"', [normalizedEmail]);

    if (!adminUser) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Admin record not found.' });
    }

    // Accepted secure passwords for national admin
    const validPasswords = ['Admin@EVConnect2026', 'admin123', 'admin@2026', 'admin', 'hashed_admin_pass'];
    if (!password || !validPasswords.includes(password.trim())) {
      return res.status(401).json({ success: false, error: 'Invalid security password. Access Denied.' });
    }

    const adminToken = `evconnect-admin-sec-${adminUser.id}-${Date.now()}`;

    res.json({
      success: true,
      adminToken,
      adminUser: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        phone: adminUser.phone,
        role: 'admin',
        clearanceLevel: 'Level 4 National Grid Admin',
        wallet_balance: adminUser.wallet_balance,
        avatar_url: adminUser.avatar_url,
        authenticatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Token Verification
router.get('/admin-verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token && token.startsWith('evconnect-admin-sec-')) {
      const adminUser = await db.getAsync('SELECT * FROM users WHERE role = "admin" LIMIT 1');
      return res.json({
        success: true,
        valid: true,
        adminUser: {
          id: adminUser?.id || 'usr-admin-1',
          name: adminUser?.name || 'Vikram Malhotra',
          email: adminUser?.email || 'admin@evconnect.in',
          role: 'admin',
          clearanceLevel: 'Level 4 National Grid Admin'
        }
      });
    }
    res.status(401).json({ success: false, valid: false, error: 'Invalid or expired admin session token.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      // Fallback: search by role or default to driver
      user = await db.getAsync('SELECT * FROM users WHERE role = "user" LIMIT 1');
    }
    const vehicles = await db.allAsync('SELECT * FROM vehicles WHERE user_id = ?', [user.id]);
    res.json({
      success: true,
      token: `jwt-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet_balance: user.wallet_balance,
        avatar_url: user.avatar_url,
        vehicles
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role = 'user' } = req.body;
    const id = `usr-${Date.now()}`;
    await db.runAsync(
      `INSERT INTO users (id, name, email, phone, password_hash, role, wallet_balance, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, phone, 'hashed_' + (password || 'pass'), role, 100.0, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80']
    );

    // Create a default vehicle for driver
    if (role === 'user') {
      await db.runAsync(
        `INSERT INTO vehicles (id, user_id, model, brand, vehicle_number, battery_capacity, current_soc, connector_type, is_primary)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`veh-${Date.now()}`, id, 'Model 3', 'Tesla', 'EV-DEMO-01', 75.0, 50.0, 'CCS2', 1]
      );
    }

    const newUser = await db.getAsync('SELECT id, name, email, phone, role, wallet_balance, avatar_url FROM users WHERE id = ?', [id]);
    const vehicles = await db.allAsync('SELECT * FROM vehicles WHERE user_id = ?', [id]);

    res.json({
      success: true,
      token: `jwt-token-${id}-${Date.now()}`,
      user: { ...newUser, vehicles }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Vehicles CRUD
router.get('/vehicles', async (req, res) => {
  try {
    const userId = req.query.userId || 'usr-driver-1';
    const vehicles = await db.allAsync('SELECT * FROM vehicles WHERE user_id = ? ORDER BY is_primary DESC', [userId]);
    res.json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/vehicles', async (req, res) => {
  try {
    const { userId = 'usr-driver-1', model, brand, vehicleNumber, batteryCapacity, currentSoc = 50, connectorType = 'CCS2' } = req.body;
    const id = `veh-${Date.now()}`;
    await db.runAsync(
      `INSERT INTO vehicles (id, user_id, model, brand, vehicle_number, battery_capacity, current_soc, connector_type, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [id, userId, model, brand || 'EV', vehicleNumber || 'EV-NEW', Number(batteryCapacity) || 60, Number(currentSoc), connectorType]
    );
    const vehicle = await db.getAsync('SELECT * FROM vehicles WHERE id = ?', [id]);
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/vehicles/:id/primary', async (req, res) => {
  try {
    const { userId = 'usr-driver-1' } = req.body;
    await db.runAsync('UPDATE vehicles SET is_primary = 0 WHERE user_id = ?', [userId]);
    await db.runAsync('UPDATE vehicles SET is_primary = 1 WHERE id = ?', [req.params.id]);
    const vehicles = await db.allAsync('SELECT * FROM vehicles WHERE user_id = ? ORDER BY is_primary DESC', [userId]);
    res.json({ success: true, vehicles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/vehicles/:id/soc', async (req, res) => {
  try {
    const { currentSoc } = req.body;
    await db.runAsync('UPDATE vehicles SET current_soc = ? WHERE id = ?', [Number(currentSoc), req.params.id]);
    res.json({ success: true, currentSoc: Number(currentSoc) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
