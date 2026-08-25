# ⚡ EV Connect AI — Full Technical & Architectural Documentation

> **Platform**: Pan-India Intelligent EV Charging Marketplace, Real-Time OCPP Telemetry & AI Route Optimization  
> **Version**: `2.0.0 (Bharat Edition)`  
> **Repository**: [https://github.com/DaddyYoda7/Ev-Charging-Marketplace-development-2.0](https://github.com/DaddyYoda7/Ev-Charging-Marketplace-development-2.0)  

---

## 📑 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Technology Stack, Libraries & Tools](#3-technology-stack-libraries--tools)
4. [Phased Development Roadmap (Phases 1 to 6)](#4-phased-development-roadmap-phases-1-to-6)
5. [Frontend Component Breakdown](#5-frontend-component-breakdown)
6. [Backend Services & REST API Specifications](#6-backend-services--rest-api-specifications)
7. [Database Schema & Entity Relationships](#7-database-schema--entity-relationships)
8. [Real-Time OCPP 2.0.1 & Telemetry Engine](#8-real-time-ocpp-201--telemetry-engine)
9. [Multi-Factor AI Recommendation & Routing Algorithm](#9-multi-factor-ai-recommendation--routing-algorithm)
10. [Design System & UI/UX Aesthetic Tokens](#10-design-system--uiux-aesthetic-tokens)
11. [Installation, Local Execution & Cloud Deployment Guide](#11-installation-local-execution--cloud-deployment-guide)

---

## 1. Executive Summary

**EV Connect AI** is a production-grade, two-sided electric vehicle charging marketplace and real-time telemetry management platform tailored to India's dynamic EV ecosystem.

The system connects three key stakeholder personas:
1. **EV Drivers (2W Scooters & 4W Cars)**: Enables seamless discovery across 14 Indian cities, slot booking with atomic double-booking prevention, range anxiety elimination via AI route planning, and simulated digital payments with instant GST-compliant tax invoices.
2. **Station Hosts / Charge Point Operators (CPOs)**: Provides full hardware lifecycle control, dynamic time-of-day tariff configuration (₹/kWh), idle parking penalty enforcement, and automated 90% payout reconciliation.
3. **Platform Administrators**: Delivers national grid analytics, platform Gross Merchandise Value (GMV) auditing, 10% platform commission accounting, and hardware predictive maintenance monitoring.

---

## 2. High-Level Architecture

The platform is architected as a decoupled full-stack application communicating via **RESTful JSON APIs** and persistent **Server-Sent Events (SSE)** for telemetry:

```
+-------------------------------------------------------------------------------+
|                             CLIENT LAYER (React 19)                           |
|  +-----------------------+  +----------------------+  +--------------------+  |
|  | Driver Explore & Maps |  | Host & CPO Dashboard |  | Admin Platform Hub |  |
|  +-----------------------+  +----------------------+  +--------------------+  |
|  +-------------------------------------------------------------------------+  |
|  |         Leaflet Maps • Tailwind Glassmorphism • Lucide Icons            |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------^---------------------------------------+
                                        | (HTTP / REST & SSE Stream)
+---------------------------------------v---------------------------------------+
|                            BACKEND LAYER (Express.js)                         |
|  +-------------------+  +-------------------+  +----------------------------+ |
|  | Stations & Search |  | Bookings & Slots  |  | Split Payments & Invoicing | |
|  +-------------------+  +-------------------+  +----------------------------+ |
|  +-------------------+  +-------------------+  +----------------------------+ |
|  | AI Recommendation |  | OCPP 2.0.1 Engine |  | Predictive Maintenance     | |
|  +-------------------+  +-------------------+  +----------------------------+ |
+---------------------------------------^---------------------------------------+
                                        | (SQL Queries & Transactions)
+---------------------------------------v---------------------------------------+
|                              DATA LAYER (SQLite3)                             |
|  [Users] • [Vehicles] • [Stations] • [Chargers] • [Bookings] • [Payments]    |
+-------------------------------------------------------------------------------+
```

---

## 3. Technology Stack, Libraries & Tools

### 🌐 Frontend (Client-Side)
| Library / Tool | Version | Purpose & Functionality |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative UI framework managing view states, responsive modals, dynamic filters, and real-time charging animations. |
| **Vite** | `^8.2.0` | Next-generation frontend build tooling and local development server featuring instant Hot Module Replacement (HMR). |
| **Tailwind CSS** | `^4.0` | Utility-first CSS engine customized with glassmorphic tokens, deep frosted backdrop blurs (`backdrop-blur-2xl`), and dark mode themes. |
| **Leaflet** | `^1.9.4` | High-performance interactive map engine rendering CartoDB Voyager dark tiles, custom 2W/4W vehicle pins, and highway routes. |
| **Lucide React** | `^1.33.0` | High-clarity SVG icon library utilized across navigation bars, telemetry cards, and hardware controls. |
| **Canvas Confetti** | `^1.9.4` | Interactive micro-animation triggered upon successful booking confirmations and payment completion. |

### 🖥️ Backend (Server-Side)
| Library / Tool | Version | Purpose & Functionality |
| :--- | :--- | :--- |
| **Node.js** | `>=18.0.0` | Asynchronous event-driven JavaScript runtime engine. |
| **Express.js** | `^4.21.2` | Fast, minimalist web framework providing RESTful API routing, error middleware, and production static asset serving. |
| **SQLite3** | `^5.1.7` | Zero-configuration, serverless, transactional relational database engine storing stations, bookings, and telemetry history. |
| **CORS** | `^2.8.5` | Cross-Origin Resource Sharing middleware enabling secure client-server communication. |
| **Server-Sent Events (SSE)**| Native HTTP | Persistent unidirectional stream pushing live charging telemetry (voltage, power kW, SoC %) to connected browsers. |

---

## 4. Phased Development Roadmap (Phases 1 to 6)

### 📍 Phase 1: User & EV Driver Platform
- **Role Switcher**: Real-time persona toggle between **Driver** (Cyan `#00F2FE`), **Host** (Emerald `#00E676`), and **Admin** (Purple `#C084FC`).
- **Interactive EV Garage**: Vehicle switcher supporting Ather 450X, Ola S1 Pro, TVS iQube, Tata Nexon EV, MG ZS EV, and Hyundai Ioniq 5 with adjustable SoC sliders.
- **Pan-India Map Discovery**: 15 stations across 14 Tier-1 and Tier-2 Indian cities with quick-jump city pins.
- **Dynamic Filter Controls**: Keyword search, vehicle category filters (**All**, **🛵 EV Scooty**, **🚗 4W Fast DC**), custom transparent frosted connector dropdown with full background blur, max tariff slider, and **Open Bays** toggle.

### 📍 Phase 2: Station Owner / Host Marketplace
- **Station Builder**: Form wizard to register physical charging hubs, GPS coordinates, operating hours, and amenities.
- **Hardware Configurator**: Manage individual bays from 3.3kW AC (15A socket) up to 350kW DC Ultra-Fast chargers.
- **Dynamic Tariff & Penalty Engine**: Configure base kWh tariffs (₹/kWh), peak-hour multipliers, and idle parking fees (₹/min).

### 📍 Phase 3: Slot Reservation & Conflict Prevention Engine
- **45-Minute Time Slot Matrix**: Generates available slots for today and tomorrow based on station operational hours.
- **Atomic Concurrency Control**: Prevents double-booking collisions by verifying slot overlaps before confirming reservations.
- **Lifecycle Transitions**: `CONFIRMED` $\rightarrow$ `ACTIVE` $\rightarrow$ `COMPLETED` / `CANCELLED`.

### 📍 Phase 4: Financial Transactions, Revenue Splits & Invoicing
- **Multi-Method Checkout**: Simulated payment gateway supporting UPI QR codes (GPay, PhonePe, Paytm), Credit/Debit Cards, and EV Connect Digital Wallet.
- **10/90 Revenue Split Engine**:
  - **10% Platform Commission**: Automatically routed to the marketplace platform treasury.
  - **90% Host Settlement**: Credited directly to the station owner's account.
- **Cryptographic GST Tax Invoices**: Generates printable and downloadable tax invoices with HMAC-SHA256 verification hashes.

### 📍 Phase 5: Multi-Factor AI Recommendation Engine
- **Mathematical Weighted Scoring Model**:
  $$\text{Score} = (0.30 \times \text{Availability}) + (0.25 \times \text{Proximity}) + (0.20 \times \text{Price}) + (0.15 \times \text{Speed}) + (0.10 \times \text{Rating})$$
- **Explainable AI (XAI) Badges**: Displays natural language decision tags (e.g. *"Top Pick: 60kW Fast DC + 100% Green Solar"*).
- **AI Route & Battery Planner**: Simulates highway journeys, predicts battery discharge curves, and schedules optimal charging stops.

### 📍 Phase 6: OCPP 2.0.1 Hardware Simulator & Predictive Maintenance
- **OCPP Message Protocol**: Implements `BootNotification`, `StatusNotification`, `Heartbeat`, `MeterValues`, `StartTransaction`, and `StopTransaction`.
- **Fault Injection Sandbox**: Live testing for *Overheating*, *Ground Fault*, and *Connector Lock Failure*.
- **Predictive Maintenance (MTBF)**: Evaluates voltage variance, connector wear cycles, and hardware temperature to calculate Mean Time Between Failures.

---

## 5. Frontend Component Breakdown

```
client/src/
├── App.jsx                     # Global State, Real-Time SSE listener & View Switcher
├── components/
│   ├── Navbar.jsx              # Brand header, transparent navigation tabs & role switcher
│   ├── InteractiveMap.jsx      # Leaflet dark map with 2W/4W pins & city quick-jumps
│   ├── StationCard.jsx         # Station cards with live occupancy, ratings & pricing
│   ├── StationDetailModal.jsx  # Technical hardware specs, bay status & directions
│   ├── BookingModal.jsx        # 45-minute slot selector & kWh energy calculator
│   ├── PaymentModal.jsx        # Checkout modal with 10/90 split & tax invoice trigger
│   ├── GarageModal.jsx         # EV garage manager with battery SoC adjustment
│   └── OcppSimulator.jsx       # Floating OCPP 1.6/2.0.1 hardware diagnostic dock
└── views/
    ├── UserExploreView.jsx     # Station discovery dashboard with frosted glass dropdown
    ├── UserDashboard.jsx       # Driver live charging sessions & invoice history
    ├── HostDashboard.jsx       # Host stations, bay manager & dynamic tariff editor
    ├── HostAnalyticsView.jsx   # Business intelligence, revenue charts & hardware uptime
    ├── AdminDashboard.jsx      # National GMV platform ledger & grid audit
    └── AiAssistantView.jsx     # AI trip planner & weight model tuner
```

---

## 6. Backend Services & REST API Specifications

### 🔑 Authentication & Garage Endpoints (`/api/auth`)
- `GET /api/auth/users` — Returns registered users and profiles.
- `GET /api/auth/vehicles?userId=:id` — Lists vehicles in user garage.
- `POST /api/auth/vehicles` — Adds a new EV profile.
- `PUT /api/auth/vehicles/:id/soc` — Updates live battery state of charge (SoC %).

### ⚡ Station & Charging Grid Endpoints (`/api/stations`)
- `GET /api/stations` — Query stations with filters (`search`, `connector`, `minPower`, `maxPrice`, `availableOnly`, `userLat`, `userLon`).
- `GET /api/stations/:id` — Fetches complete station specs, amenities, and charger bays.
- `POST /api/stations` — Creates a new charging station.
- `PUT /api/stations/:id/tariff` — Updates base tariffs, peak-hour rules, and idle fees.

### 📅 Booking & Slot Endpoints (`/api/bookings`)
- `GET /api/bookings/slots?stationId=:id&date=:date` — Returns 45-minute available slot matrix.
- `POST /api/bookings` — Confirms bay reservation with atomic double-booking prevention.
- `GET /api/bookings/active?userId=:id` — Retrieves active charging sessions.
- `POST /api/bookings/:id/complete` — Ends charging session and finalizes kWh metrics.

### 💳 Payment & Invoicing Endpoints (`/api/payments`)
- `POST /api/payments/process` — Executes payment with 10/90 platform-host split.
- `GET /api/payments/invoice/:bookingId` — Generates cryptographic GST tax invoice.

### 🧠 AI Intelligence & Trip Planner (`/api/ai`)
- `POST /api/ai/recommend` — Computes weighted multi-factor recommendation scores.
- `POST /api/ai/trip-planner` — Computes route distance, battery consumption, and highway charging stops.

### 📡 Real-Time Telemetry & OCPP (`/api/telemetry`)
- `GET /api/telemetry/stream` — Persistent **Server-Sent Events (SSE)** telemetry stream.
- `POST /api/telemetry/ocpp/event` — Dispatches simulated OCPP hardware events.
- `GET /api/telemetry/charger/:id` — Fetches real-time diagnostics and MTBF health scores.

---

## 7. Database Schema & Entity Relationships

The platform uses SQLite with foreign key constraints:

```sql
-- Users & Stakeholders
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('DRIVER', 'HOST', 'ADMIN')),
    wallet_balance REAL DEFAULT 1500.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles (Garage)
CREATE TABLE vehicles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    model TEXT NOT NULL,
    vehicle_type TEXT CHECK(vehicle_type IN ('SCOOTY', 'CAR')),
    battery_capacity REAL NOT NULL,
    current_soc REAL DEFAULT 50.0,
    connector_type TEXT NOT NULL,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Stations
CREATE TABLE stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    base_tariff REAL NOT NULL,
    idle_fee REAL DEFAULT 2.0,
    peak_multiplier REAL DEFAULT 1.25,
    rating REAL DEFAULT 4.8,
    host_id TEXT NOT NULL,
    FOREIGN KEY(host_id) REFERENCES users(id)
);

-- Chargers (Bays)
CREATE TABLE chargers (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    identifier TEXT NOT NULL,
    connector_type TEXT NOT NULL,
    power_kw REAL NOT NULL,
    status TEXT CHECK(status IN ('AVAILABLE', 'CHARGING', 'MAINTENANCE', 'FAULTED')),
    current_power REAL DEFAULT 0.0,
    FOREIGN KEY(station_id) REFERENCES stations(id)
);

-- Bookings
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    station_id TEXT NOT NULL,
    charger_id TEXT NOT NULL,
    vehicle_id TEXT,
    slot_time TEXT NOT NULL,
    duration_min INTEGER DEFAULT 45,
    estimated_kwh REAL NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(station_id) REFERENCES stations(id),
    FOREIGN KEY(charger_id) REFERENCES chargers(id)
);

-- Payments & Settlements
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount REAL NOT NULL,
    platform_fee REAL NOT NULL,
    host_payout REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_ref TEXT UNIQUE NOT NULL,
    status TEXT CHECK(status IN ('SUCCESS', 'PENDING', 'FAILED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(booking_id) REFERENCES bookings(id)
);
```

---

## 8. Real-Time OCPP 2.0.1 & Telemetry Engine

```
[Charger Hardware Simulator]
           │
           │  1. Dispatches OCPP Message (StartTransaction / MeterValues)
           ▼
[Express Server (/api/telemetry/ocpp/event)]
           │
           │  2. Updates Charger State in SQLite
           ▼
[SSE Stream Broadcaster (/api/telemetry/stream)]
           │
           │  3. Pushes JSON Telemetry Packet via HTTP Stream
           ▼
[React 19 Client (Driver UI)]
   • Live Active Power (kW) Gauge
   • Battery SoC % Wave Meter
   • Voltage (V) & Current (A) Diagnostics
   • Predictive Maintenance Health %
```

---

## 9. Multi-Factor AI Recommendation & Routing Algorithm

### Algorithmic Scoring Breakdown
1. **Bay Availability ($S_{\text{avail}}$)**: Ratio of open charging bays to total capacity.
2. **Proximity Decay ($S_{\text{dist}}$)**: Inverse linear decay over a 50 km search radius.
3. **Tariff Affordability ($S_{\text{price}}$)**: Normalized against minimum and maximum market tariffs.
4. **Charger Speed ($S_{\text{speed}}$)**: Capability index up to 150 kW DC Fast Charging.
5. **Customer Satisfaction ($S_{\text{rating}}$)**: Historical 5-star driver review average.

$$\text{Final Recommendation Score} = 0.30 \cdot S_{\text{avail}} + 0.25 \cdot S_{\text{dist}} + 0.20 \cdot S_{\text{price}} + 0.15 \cdot S_{\text{speed}} + 0.10 \cdot S_{\text{rating}}$$

---

## 10. Design System & UI/UX Aesthetic Tokens

- **Color Scheme**:
  - **Background**: `#0B0F19` (Cosmic Dark Navy)
  - **Glass Surface**: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(16px)`
  - **Electric Cyan (`#00F2FE`)**: Driver Navigation, Fast DC badges, and active glowing borders.
  - **Energetic Emerald (`#00E676`)**: Host Actions, 2W Battery Swaps, and live radar indicators.
  - **Royal Purple (`#C084FC`)**: Admin Platform Hub and revenue analytics.
  - **Subdued Slate Grey (`#94A3B8`)**: Inactive navigation buttons and secondary metadata.
  - **Selected High-Contrast Black (`#040814`)**: Active role and category text.

---

## 11. Installation, Local Execution & Cloud Deployment Guide

### 💻 Localhost Execution

#### 🟢 Method 1: Using `start.bat` (Windows)
Double-click `start.bat` in the root folder. It will launch both the backend server and frontend client automatically.

#### 🟢 Method 2: Manual Terminal Execution
```bash
# 1. Start Backend API Server
cd server
npm install
npm start

# 2. Start Frontend Dev Client
cd client
npm install
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### ☁️ Free Cloud Deployment

| Service | Hosting Type | Instructions |
| :--- | :--- | :--- |
| **Render.com** | Fullstack (Recommended) | Connect GitHub repo `DaddyYoda7/Ev-Charging-Marketplace-development-2.0` $\rightarrow$ Build Command: `cd client && npm install && npm run build` $\rightarrow$ Start Command: `cd server && npm install && node index.js` |
| **Railway.app** | Fullstack | Deploy repository directly $\rightarrow$ Generate public domain in Settings |
| **Vercel** | Frontend Only | Import repository $\rightarrow$ Framework: `Vite` $\rightarrow$ Root Directory: `client` |

---

*EV Connect AI — Engineered for Pan-India Sustainable E-Mobility.*
