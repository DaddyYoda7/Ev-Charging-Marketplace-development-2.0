import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress page number on cover page
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header
        self.drawString(45, A4[1] - 30, "EV Connect AI • Full Technical Documentation & Architecture")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(45, A4[1] - 35, A4[0] - 45, A4[1] - 35)

        # Footer
        self.line(45, 45, A4[0] - 45, 45)
        self.drawString(45, 32, "Confidential • EV Connect AI Platform • Bharat 2.0 Edition")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(A4[0] - 45, 32, page_text)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=45,
        bottomMargin=45
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#0284C7")
    c_dark = colors.HexColor("#0F172A")
    c_slate = colors.HexColor("#334155")
    c_light_bg = colors.HexColor("#F8FAFC")
    c_border = colors.HexColor("#CBD5E1")

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=30,
        leading=34,
        textColor=colors.HexColor("#FFFFFF"),
        alignment=0,
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=17,
        textColor=colors.HexColor("#94A3B8"),
        spaceAfter=25
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_slate,
        spaceAfter=6
    )

    body_bold = ParagraphStyle(
        'Body_Bold',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=c_dark
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # ==========================================
    # 1. COVER PAGE
    # ==========================================
    cover_data = [
        [Paragraph("<b>⚡ BHARAT 2.0 EDITION • PRODUCTION ARCHITECTURE</b>", ParagraphStyle('Badge', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#00F2FE"), fontSize=9))],
        [Paragraph("EV Connect <font color='#00F2FE'>AI</font>", title_style)],
        [Paragraph("Pan-India Intelligent EV Charging Marketplace, Real-Time OCPP Telemetry, Atomic Slot Engine & AI Route Optimization Architecture", subtitle_style)],
        [Spacer(1, 40)],
        [Paragraph("<b>PLATFORM METADATA & REPOSITORY SPECIFICATION</b>", ParagraphStyle('Sub', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor("#38BDF8"), fontSize=9))],
        [Table([
            [Paragraph("<b>Author & Engineering Lead:</b>", body_style), Paragraph("EV Connect Core Team", body_style)],
            [Paragraph("<b>Software Release:</b>", body_style), Paragraph("v2.0.0 (Fullstack Production)", body_style)],
            [Paragraph("<b>Target Network:</b>", body_style), Paragraph("14 Indian Metropolitan Hubs & Expressways", body_style)],
            [Paragraph("<b>GitHub Repository:</b>", body_style), Paragraph("DaddyYoda7/Ev-Charging-Marketplace-development-2.0", body_style)],
            [Paragraph("<b>Date of Publication:</b>", body_style), Paragraph("August 2026", body_style)],
        ], colWidths=[150, 310], style=[
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#1E293B")),
            ('TEXTCOLOR', (0,0), (-1,-1), colors.white),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#334155")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#475569")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ])],
        [Spacer(1, 80)],
        [Paragraph("CONFIDENTIAL & PROPRIETARY — ALL RIGHTS RESERVED", ParagraphStyle('Conf', parent=body_style, textColor=colors.HexColor("#64748B"), fontSize=8))]
    ]

    cover_table = Table(cover_data, colWidths=[505])
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0B0F19")),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (-1,-1), 18),
        ('RIGHTPADDING', (0,0), (-1,-1), 18),
    ]))

    story.append(cover_table)
    story.append(PageBreak())

    # ==========================================
    # 2. EXECUTIVE SUMMARY
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Core Mission", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=8))
    
    story.append(Paragraph(
        "<b>EV Connect AI</b> is an enterprise-grade, two-sided electric mobility platform engineered specifically for the Indian charging grid. "
        "It bridges the infrastructure gap between EV Drivers, Station Hosts / Charge Point Operators (CPOs), and Grid Administrators by delivering "
        "unified search across 14 cities, atomic double-booking prevention, dynamic time-of-day tariffs, simulated UPI/Card payments with GST tax invoices, "
        "and real-time OCPP 1.6-J / 2.0.1 telemetry.",
        body_style
    ))

    persona_table_data = [
        [Paragraph("<b>Stakeholder Persona</b>", body_bold), Paragraph("<b>Core Platform Capabilities</b>", body_bold), Paragraph("<b>Value Proposition & Impact</b>", body_bold)],
        [
            Paragraph("<b>EV Drivers<br/>(2W & 4W)</b>", body_style),
            Paragraph("Pan-India discovery, 45-min slot reservation, garage manager with SoC sliders, simulated payments, AI highway trip planner.", body_style),
            Paragraph("Eliminates range anxiety, guarantees slot availability, and supports both 2W battery swaps & 4W Ultra-Fast DC charging.", body_style)
        ],
        [
            Paragraph("<b>Station Hosts<br/>(CPOs & Owners)</b>", body_style),
            Paragraph("Station builder, bay hardware management (3.3kW to 350kW), dynamic kWh tariff editor, and 90% payout settlement.", body_style),
            Paragraph("Maximizes bay utilization, monetizes peak traffic hours, and automates financial reconciliations.", body_style)
        ],
        [
            Paragraph("<b>Platform Admins<br/>(Treasury & Grid)</b>", body_style),
            Paragraph("National grid telemetry hub, 10% platform commission ledger, station verification audit, and predictive failure diagnostics.", body_style),
            Paragraph("Full visibility over national EV infrastructure health, Gross Merchandise Value (GMV), and dispute management.", body_style)
        ]
    ]
    p_tab = Table(persona_table_data, colWidths=[110, 200, 195])
    p_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(p_tab)
    story.append(Spacer(1, 10))

    # ==========================================
    # 3. TECHNOLOGY STACK
    # ==========================================
    story.append(Paragraph("2. Technology Stack & Architectural Tooling", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=8))

    tech_data = [
        [Paragraph("<b>Layer</b>", body_bold), Paragraph("<b>Technology / Tool</b>", body_bold), Paragraph("<b>Version</b>", body_bold), Paragraph("<b>Architectural Role & Functionality</b>", body_bold)],
        [Paragraph("Frontend", body_style), Paragraph("React", body_bold), Paragraph("^19.2.8", code_style), Paragraph("Component-based UI framework managing modals, state, and telemetry animations.", body_style)],
        [Paragraph("Frontend", body_style), Paragraph("Vite", body_bold), Paragraph("^8.2.0", code_style), Paragraph("Next-gen build tool & dev server with instant Hot Module Replacement (HMR).", body_style)],
        [Paragraph("Frontend", body_style), Paragraph("Tailwind CSS", body_bold), Paragraph("^4.0", code_style), Paragraph("Utility CSS engine customized with glassmorphism and backdrop blurs.", body_style)],
        [Paragraph("Frontend", body_style), Paragraph("Leaflet Maps", body_bold), Paragraph("^1.9.4", code_style), Paragraph("Interactive map engine with CartoDB dark tiles, 2W/4W pins, and polyline routes.", body_style)],
        [Paragraph("Frontend", body_style), Paragraph("Lucide React", body_bold), Paragraph("^1.33.0", code_style), Paragraph("Modern SVG icon system for UI controls, navigation, and badges.", body_style)],
        [Paragraph("Backend", body_style), Paragraph("Node.js", body_bold), Paragraph(">=18.0.0", code_style), Paragraph("Asynchronous non-blocking runtime powering server APIs and event streams.", body_style)],
        [Paragraph("Backend", body_style), Paragraph("Express.js", body_bold), Paragraph("^4.21.2", code_style), Paragraph("RESTful routing framework, error middleware, and production static server.", body_style)],
        [Paragraph("Database", body_style), Paragraph("SQLite3", body_bold), Paragraph("^5.1.7", code_style), Paragraph("ACID-compliant transactional relational database engine.", body_style)],
        [Paragraph("Real-Time", body_style), Paragraph("Server-Sent Events", body_bold), Paragraph("Native HTTP", code_style), Paragraph("Unidirectional real-time stream pushing live power, voltage, current, and SoC %.", body_style)]
    ]
    t_tab = Table(tech_data, colWidths=[65, 95, 65, 280])
    t_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_tab)

    story.append(PageBreak())

    # ==========================================
    # 4. PHASED ROADMAP (PHASE 1 - 6)
    # ==========================================
    story.append(Paragraph("3. Detailed Phased Roadmap Implementation (Phases 1 – 6)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=8))

    phases = [
        ("Phase 1: User & EV Driver Ecosystem", [
            "Multi-Role Switcher: Instant switching between Driver (Cyan), Host (Emerald), and Admin (Purple).",
            "EV Garage Manager: Vehicle selector with real-time battery SoC sliders supporting Ather, Ola, Tata, MG, and Hyundai.",
            "Pan-India Interactive Map: Leaflet engine plotting 15 charging hubs across 14 Tier-1/2 Indian cities with city quick-jumps.",
            "Dynamic Filter Grid: Search bar, category filters (All, 2W Scooty, 4W Fast DC), transparent frosted connector dropdown with full background blur, max tariff slider, and Open Bays toggle."
        ]),
        ("Phase 2: Station Owner / Host Marketplace", [
            "Station Builder: Registration form wizard for physical hubs with GPS coordinates, address, and amenities (WiFi, Café, CCTV).",
            "Bay Hardware Configurator: Manage individual chargers from 3.3kW AC (15A socket) up to 350kW DC Ultra-Fast.",
            "Dynamic Tariff Engine: Configure base rates (₹/kWh), peak-hour surcharges (1.25x), and idle parking penalties (₹/min)."
        ]),
        ("Phase 3: Slot Reservation & Conflict Prevention", [
            "45-Minute Slot Matrix: Dynamic time slot generation for today and tomorrow based on station operational hours.",
            "Atomic Concurrency Protection: Database-level overlap validation ensuring no bay can be double-booked simultaneously.",
            "Lifecycle State Machine: CONFIRMED -> ACTIVE (charging in progress) -> COMPLETED or CANCELLED."
        ]),
        ("Phase 4: Financial Transactions, Revenue Splits & Invoicing", [
            "Multi-Method Checkout: Simulated payment gateway supporting UPI QR (GPay, PhonePe), Cards, and EV Connect Digital Wallet.",
            "Automated 10/90 Revenue Split: 10% platform commission retained in treasury, 90% payout settled to station host.",
            "Cryptographic GST Tax Invoices: Downloadable/printable tax invoices signed with unique HMAC-SHA256 verification hashes."
        ]),
        ("Phase 5: Multi-Factor AI Recommendation Engine", [
            "Mathematical Scoring Model: Score = (0.30 * Availability) + (0.25 * Proximity) + (0.20 * Price) + (0.15 * Speed) + (0.10 * Rating).",
            "Explainable AI (XAI) Badges: Natural language decision reasoning tags (e.g. 'Top Pick: 60kW Fast DC + 100% Green Solar').",
            "AI Highway Route & Battery Planner: Computes trip distance, estimated kWh consumption, remaining SoC %, and recommends optimal charging stops."
        ]),
        ("Phase 6: Real-Time OCPP 2.0.1 & Predictive Maintenance", [
            "OCPP Protocol Simulation: Implements BootNotification, StatusNotification, Heartbeat, MeterValues, StartTransaction, and StopTransaction.",
            "Fault Injection Sandbox: Live simulation of Overheating, Ground Fault, and Connector Lock Failure conditions.",
            "Predictive Maintenance (MTBF): Evaluates voltage variance, connector cycles, and temperature to calculate Mean Time Between Failures."
        ])
    ]

    for p_title, p_items in phases:
        story.append(Paragraph(p_title, h2_style))
        for item in p_items:
            story.append(Paragraph(f"• {item}", body_style))
        story.append(Spacer(1, 4))

    story.append(PageBreak())

    # ==========================================
    # 5. DATABASE SCHEMA & REST APIS
    # ==========================================
    story.append(Paragraph("4. Backend Database Schema & REST API Specifications", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=8))

    story.append(Paragraph("<b>Primary Database Tables (SQLite3):</b>", body_bold))
    schema_code = (
        "CREATE TABLE users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, role TEXT, wallet_balance REAL);\n"
        "CREATE TABLE vehicles (id TEXT PRIMARY KEY, user_id TEXT, model TEXT, battery_capacity REAL, current_soc REAL, connector_type TEXT);\n"
        "CREATE TABLE stations (id TEXT PRIMARY KEY, name TEXT, address TEXT, city TEXT, latitude REAL, longitude REAL, base_tariff REAL, host_id TEXT);\n"
        "CREATE TABLE chargers (id TEXT PRIMARY KEY, station_id TEXT, identifier TEXT, connector_type TEXT, power_kw REAL, status TEXT);\n"
        "CREATE TABLE bookings (id TEXT PRIMARY KEY, user_id TEXT, station_id TEXT, charger_id TEXT, slot_time TEXT, total_amount REAL, status TEXT);\n"
        "CREATE TABLE payments (id TEXT PRIMARY KEY, booking_id TEXT, amount REAL, platform_fee REAL, host_payout REAL, transaction_ref TEXT);"
    )
    s_box = Table([[Paragraph(schema_code.replace("\n", "<br/>"), code_style)]], colWidths=[505])
    s_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(s_box)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Key REST API Endpoints:</b>", body_bold))
    api_data = [
        [Paragraph("<b>Endpoint</b>", body_bold), Paragraph("<b>Method</b>", body_bold), Paragraph("<b>Description & Payload Details</b>", body_bold)],
        [Paragraph("/api/auth/users", code_style), Paragraph("GET", body_style), Paragraph("Fetch registered stakeholder profiles and wallet balance.", body_style)],
        [Paragraph("/api/auth/vehicles/:id/soc", code_style), Paragraph("PUT", body_style), Paragraph("Update live EV battery state of charge (SoC %).", body_style)],
        [Paragraph("/api/stations", code_style), Paragraph("GET", body_style), Paragraph("Filter stations by keyword, connector, power, price, and geo-radius.", body_style)],
        [Paragraph("/api/stations/:id/tariff", code_style), Paragraph("PUT", body_style), Paragraph("Update base tariffs, peak multipliers, and idle parking fees.", body_style)],
        [Paragraph("/api/bookings/slots", code_style), Paragraph("GET", body_style), Paragraph("Generate 45-minute available slot matrix for today and tomorrow.", body_style)],
        [Paragraph("/api/bookings", code_style), Paragraph("POST", body_style), Paragraph("Reserve a charging bay with atomic concurrency conflict check.", body_style)],
        [Paragraph("/api/payments/process", code_style), Paragraph("POST", body_style), Paragraph("Execute payment with 10% platform / 90% host revenue split.", body_style)],
        [Paragraph("/api/payments/invoice/:id", code_style), Paragraph("GET", body_style), Paragraph("Generate cryptographic GST tax invoice with HMAC signature.", body_style)],
        [Paragraph("/api/ai/recommend", code_style), Paragraph("POST", body_style), Paragraph("Compute multi-factor recommendation score for vehicle & location.", body_style)],
        [Paragraph("/api/ai/trip-planner", code_style), Paragraph("POST", body_style), Paragraph("Plan long-distance EV route with battery discharge curves.", body_style)],
        [Paragraph("/api/telemetry/stream", code_style), Paragraph("GET", body_style), Paragraph("Persistent Server-Sent Events (SSE) live telemetry stream.", body_style)],
        [Paragraph("/api/telemetry/ocpp/event", code_style), Paragraph("POST", body_style), Paragraph("Dispatch simulated OCPP hardware events (Start/Stop/Fault).", body_style)]
    ]
    a_tab = Table(api_data, colWidths=[150, 55, 300])
    a_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(a_tab)

    story.append(PageBreak())

    # ==========================================
    # 6. LOCAL EXECUTION & CLOUD DEPLOYMENT
    # ==========================================
    story.append(Paragraph("5. Local Execution & Cloud Deployment Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=c_primary, spaceAfter=8))

    story.append(Paragraph("<b>Local Development (1-Click Launch):</b>", body_bold))
    story.append(Paragraph("Double-click <code>start.bat</code> in the project root folder. It starts both the Express server on port 5000 and the Vite frontend dev server on port 5173.", body_style))

    run_code = (
        "# Manual Execution in Two Terminals:\n\n"
        "# Terminal 1: Backend Express Server (Port 5000)\n"
        "cd server && npm install && npm start\n\n"
        "# Terminal 2: Frontend Vite Client (Port 5173)\n"
        "cd client && npm install && npm run dev\n\n"
        "# Live App URLs:\n"
        "# Frontend: http://localhost:5173\n"
        "# Backend API: http://localhost:5000/api/health"
    )
    r_box = Table([[Paragraph(run_code.replace("\n", "<br/>"), code_style)]], colWidths=[505])
    r_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(r_box)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Production Cloud Deployment Options:</b>", body_bold))
    deploy_data = [
        [Paragraph("<b>Provider</b>", body_bold), Paragraph("<b>Type</b>", body_bold), Paragraph("<b>Deployment Steps</b>", body_bold)],
        [
            Paragraph("<b>Render.com</b>", body_style),
            Paragraph("Fullstack (Node + SQLite)", body_style),
            Paragraph("Connect repository <code>DaddyYoda7/Ev-Charging-Marketplace-development-2.0</code>.<br/>Build Command: <code>cd client && npm install && npm run build</code><br/>Start Command: <code>cd server && npm install && node index.js</code>", body_style)
        ],
        [
            Paragraph("<b>Railway.app</b>", body_style),
            Paragraph("Fullstack Container", body_style),
            Paragraph("Deploy directly from GitHub repository and generate a public domain under service settings.", body_style)
        ],
        [
            Paragraph("<b>Vercel</b>", body_style),
            Paragraph("Frontend Client (SPA)", body_style),
            Paragraph("Import repository &rarr; Framework: <code>Vite</code> &rarr; Root Directory: <code>client</code>.", body_style)
        ]
    ]
    d_tab = Table(deploy_data, colWidths=[90, 115, 300])
    d_tab.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, c_border),
        ('BOX', (0,0), (-1,-1), 1, c_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(d_tab)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"[SUCCESS] PDF generated successfully: {filename}")

if __name__ == '__main__':
    target = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'EVConnect_AI_Documentation.pdf')
    build_pdf(target)
