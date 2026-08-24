const express = require('express');
const cors = require('cors');
const path = require('path');
const { initSchema } = require('./db');

const authRoutes = require('./routes/auth');
const stationsRoutes = require('./routes/stations');
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');
const telemetryRoutes = require('./routes/telemetry');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'EVConnect AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  await initSchema();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`⚡ EVConnect AI API Server running on port ${PORT}`);
    console.log(`⚡ REST API: http://localhost:${PORT}/api/health`);
    console.log(`⚡ Telemetry SSE: http://localhost:${PORT}/api/telemetry/stream`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
