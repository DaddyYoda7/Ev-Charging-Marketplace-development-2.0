# EVConnect AI — Full-Stack AI EV Charging Marketplace & Telemetry Platform

> **Project Reference**: Implementation of the *AI EV Charging Marketplace (Detailed Development Roadmap — Phase 1 to Phase 6)*

---

## ⚡ Overview & Distilled Architecture

EVConnect AI is an end-to-end full-stack intelligent EV charging platform connecting **EV Drivers (Users)**, **Station Hosts / Owners (Clients)**, and **Platform Administrators**.

### 🚀 Roadmap Phases Implemented

| Phase | Functional Capabilities |
| :--- | :--- |
| **Phase 1: User Platform** | Role switcher, vehicle garage manager (Tesla Model 3, Hyundai Ioniq 5, Tata Nexon EV), battery SoC sliders, station directory with live availability badges. |
| **Phase 2: Station Owner Marketplace** | Station builder, charger bay management (7kW AC to 350kW DC Ultra-Fast), dynamic kWh tariffs & idle fee editor. |
| **Phase 3: Booking & Slot Management** | Dynamic 45-minute slot grid generator, atomic concurrency double-booking prevention, cancellation, and session lifecycle (`CONFIRMED` $\to$ `ACTIVE` $\to$ `COMPLETED`). |
| **Phase 4: Payments & Split Invoicing** | Multi-method checkout (Simulated UPI QR / Card / EVConnect Wallet), 10% platform commission vs 90% host revenue split engine, downloadable/printable tax invoices with cryptographic verification hashes. |
| **Phase 5: AI Recommendation Engine** | Weighted scoring formula: $\text{Score} = 0.30 \times \text{Availability} + 0.25 \times \text{Distance} + 0.20 \times \text{Price} + 0.15 \times \text{Speed} + 0.10 \times \text{Rating}$, natural language explainability badges, and AI Route & Battery Planner. |
| **Phase 6: Real-Time OCPP & Analytics** | Interactive OCPP 1.6/2.0.1 charge point simulator (Start/Stop transactions, inject Overheating/Ground faults), live Server-Sent Events (SSE) telemetry stream, predictive maintenance MTBF risk engine, and BI utilization heatmaps. |

---

## 📁 Project Structure

```
evconnect-ai/
├── start.bat                   # 1-Click launcher for Server & Client
├── server/
│   ├── index.js                # Express Server + SSE Telemetry Engine (Port 5000)
│   ├── db.js                   # SQLite Database schema initialization
│   ├── seed.js                 # Realistic seed data (Stations, Chargers, Vehicles, History)
│   ├── services/
│   │   ├── aiEngine.js         # Phase 5 Weighted AI scoring & explainability model
│   │   └── predictiveEngine.js # Phase 6 Anomaly detection & MTBF failure risk scoring
│   └── routes/
│       ├── auth.js             # Auth & Vehicle Garage CRUD
│       ├── stations.js         # Stations & Charger management + Geo-search
│       ├── bookings.js         # Dynamic slots & conflict prevention
│       ├── payments.js         # Split payments & digital tax invoices
│       ├── ai.js               # AI recommendation & Trip planner endpoints
│       ├── telemetry.js        # OCPP simulator & live SSE stream
│       └── analytics.js        # Host & Admin BI insights
└── client/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx             # Global State & Real-time Telemetry manager
    │   ├── index.css           # Modern dark-mode electric design system
    │   ├── components/
    │   │   ├── Navbar.jsx          # Role switcher & vehicle status pill
    │   │   ├── InteractiveMap.jsx  # Leaflet dark map with custom EV pins
    │   │   ├── StationCard.jsx     # Station cards with AI score & live connectors
    │   │   ├── BookingModal.jsx    # 4-step reservation wizard
    │   │   ├── PaymentModal.jsx    # Checkout with 10/90 split & confetti
    │   │   ├── InvoiceModal.jsx    # Printable tax invoice modal
    │   │   ├── GarageModal.jsx     # Vehicle battery SoC slider & garage
    │   │   └── OcppSimulator.jsx   # OCPP charge point hardware dock
    │   ├── views/
    │   │   ├── UserExploreView.jsx # Station finder with filters & split map
    │   │   ├── UserDashboard.jsx   # Driver active charging telemetry & history
    │   │   ├── HostDashboard.jsx   # Owner stations & dynamic tariff editor
    │   │   ├── HostAnalytics.jsx   # BI revenue charts & predictive health matrix
    │   │   ├── AdminDashboard.jsx  # Platform GMV & commission ledger
    │   │   └── AiAssistantView.jsx # AI trip optimizer & weights tuner
    │   └── utils/
    │       └── api.js              # Centralized API client
```

---

## 🛠️ Quick Start

### 1. Launch with `start.bat`
Double-click `start.bat` in the root folder, or run:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api/health`
