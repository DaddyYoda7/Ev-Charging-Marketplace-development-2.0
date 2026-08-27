const API_BASE = '/api';

export const api = {
  // Auth & Vehicles
  async getUsers() {
    const res = await fetch(`${API_BASE}/auth/users`);
    return res.json();
  },
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async getVehicles(userId) {
    const res = await fetch(`${API_BASE}/auth/vehicles?userId=${userId || ''}`);
    return res.json();
  },
  async addVehicle(data) {
    const res = await fetch(`${API_BASE}/auth/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async setPrimaryVehicle(id, userId) {
    const res = await fetch(`${API_BASE}/auth/vehicles/${id}/primary`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },
  async updateVehicleSoc(id, currentSoc) {
    const res = await fetch(`${API_BASE}/auth/vehicles/${id}/soc`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSoc })
    });
    return res.json();
  },

  // Stations
  async getStations(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stations?${query}`);
    return res.json();
  },
  async getStation(id) {
    const res = await fetch(`${API_BASE}/stations/${id}`);
    return res.json();
  },
  async createStation(data) {
    const res = await fetch(`${API_BASE}/stations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateStation(id, data) {
    const res = await fetch(`${API_BASE}/stations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async addCharger(stationId, data) {
    const res = await fetch(`${API_BASE}/stations/${stationId}/chargers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateCharger(chargerId, data) {
    const res = await fetch(`${API_BASE}/stations/chargers/${chargerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async deleteCharger(chargerId) {
    const res = await fetch(`${API_BASE}/stations/chargers/${chargerId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Bookings
  async getSlots(chargerId, date) {
    const res = await fetch(`${API_BASE}/bookings/slots?chargerId=${chargerId}&date=${date || ''}`);
    return res.json();
  },
  async createBooking(data) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getUserBookings(userId) {
    const res = await fetch(`${API_BASE}/bookings/user/${userId}`);
    return res.json();
  },
  async getStationBookings(stationId) {
    const res = await fetch(`${API_BASE}/bookings/station/${stationId}`);
    return res.json();
  },
  async cancelBooking(id) {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST'
    });
    return res.json();
  },
  async updateBookingStatus(id, status) {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Payments & Invoices
  async processPayment(data) {
    const res = await fetch(`${API_BASE}/payments/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getInvoice(id) {
    const res = await fetch(`${API_BASE}/payments/invoice/${id}`);
    return res.json();
  },
  async getUserPayments(userId) {
    const res = await fetch(`${API_BASE}/payments/history/user/${userId}`);
    return res.json();
  },

  // AI Recommendation Engine
  async getAiRecommendations(data) {
    const res = await fetch(`${API_BASE}/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async planTrip(data) {
    const res = await fetch(`${API_BASE}/ai/trip-planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // OCPP Telemetry & Hardware Simulation
  async getChargerTelemetry(chargerId) {
    const res = await fetch(`${API_BASE}/telemetry/charger/${chargerId}`);
    return res.json();
  },
  async triggerOcppEvent(data) {
    const res = await fetch(`${API_BASE}/telemetry/ocpp/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Analytics & Admin Operations
  async getHostAnalytics(ownerId) {
    const res = await fetch(`${API_BASE}/analytics/host?ownerId=${ownerId || ''}`);
    return res.json();
  },
  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/admin`);
    return res.json();
  },
  async adminLogin(email, password) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async adminRegister(data) {
    const res = await fetch(`${API_BASE}/auth/admin-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async adminVerify(token) {
    const res = await fetch(`${API_BASE}/auth/admin-verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  },
  async settlePayout(paymentId) {
    const res = await fetch(`${API_BASE}/analytics/admin/settle-payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId })
    });
    return res.json();
  },
  async settleAllPayouts() {
    const res = await fetch(`${API_BASE}/analytics/admin/settle-all-payouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  async resetGridFaults() {
    const res = await fetch(`${API_BASE}/analytics/admin/reset-grid-faults`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },
  async updateStationStatus(stationId, status) {
    const res = await fetch(`${API_BASE}/stations/${stationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return res.json();
  },
  async verifyStation(stationId, isVerified) {
    const res = await fetch(`${API_BASE}/stations/${stationId}/verify`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVerified })
    });
    return res.json();
  }
};
