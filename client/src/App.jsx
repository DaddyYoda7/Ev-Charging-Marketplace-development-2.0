import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import UserExploreView from './views/UserExploreView';
import UserDashboard from './views/UserDashboard';
import HostDashboard from './views/HostDashboard';
import HostAnalytics from './views/HostAnalytics';
import AdminDashboard from './views/AdminDashboard';
import AiAssistantView from './views/AiAssistantView';
import OcppSimulator from './components/OcppSimulator';
import BookingModal from './components/BookingModal';
import PaymentModal from './components/PaymentModal';
import InvoiceModal from './components/InvoiceModal';
import GarageModal from './components/GarageModal';
import AdminLoginModal from './components/AdminLoginModal';
import { api } from './utils/api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('user'); // 'user' | 'owner' | 'admin'
  const [activeView, setActiveView] = useState('explore');
  const [currentUser, setCurrentUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [primaryVehicle, setPrimaryVehicle] = useState(null);
  const [allChargers, setAllChargers] = useState([]);
  const [telemetryConnected, setTelemetryConnected] = useState(false);

  // Admin Security Authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('evconnect_admin_token');
  });
  const [adminUser, setAdminUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('evconnect_admin_user') || 'null');
    } catch (e) {
      return null;
    }
  });
  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  // Modals state
  const [bookingModalStation, setBookingModalStation] = useState(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [isGarageOpen, setIsGarageOpen] = useState(false);

  useEffect(() => {
    initApp();
    setupSseTelemetry();
  }, []);

  async function initApp() {
    try {
      // Login as default driver
      const loginRes = await api.login('alex@evconnect.io', 'pass');
      if (loginRes.success) {
        setCurrentUser(loginRes.user);
        setVehicles(loginRes.user.vehicles || []);
        const primary = loginRes.user.vehicles?.find((v) => v.is_primary === 1) || loginRes.user.vehicles?.[0];
        setPrimaryVehicle(primary);
      }

      // Preload stations & chargers
      const stationsRes = await api.getStations();
      if (stationsRes.success) {
        const chargers = [];
        stationsRes.stations.forEach((s) => {
          if (s.chargers) chargers.push(...s.chargers);
        });
        setAllChargers(chargers);
      }
    } catch (err) {
      console.error('App init error:', err);
    }
  }

  function setupSseTelemetry() {
    try {
      const eventSource = new EventSource('/api/telemetry/stream');
      
      eventSource.onopen = () => {
        setTelemetryConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'METER_TICK' || data.type === 'CHARGER_STATE_CHANGE') {
            // Update live telemetry in state
            setAllChargers((prev) =>
              prev.map((c) => {
                if (c.id === (data.chargerId || data.charger?.id)) {
                  return {
                    ...c,
                    active_power_kw: data.powerKw !== undefined ? data.powerKw : c.active_power_kw,
                    temperature_c: data.temperatureC !== undefined ? data.temperatureC : c.temperature_c,
                    status: data.charger?.status || c.status
                  };
                }
                return c;
              })
            );
          }
        } catch (e) {
          // parse error
        }
      };

      eventSource.onerror = () => {
        setTelemetryConnected(false);
      };

      return () => {
        eventSource.close();
      };
    } catch (e) {
      console.error('SSE initialization error:', e);
    }
  }

  function handleRoleChange(newRole) {
    if (newRole === 'admin' && !isAdminAuthenticated) {
      setIsAdminLoginModalOpen(true);
      return;
    }

    setCurrentRole(newRole);
    if (newRole === 'user') {
      setActiveView('explore');
    } else if (newRole === 'owner') {
      setActiveView('host-stations');
    } else if (newRole === 'admin') {
      setActiveView('admin-dashboard');
    }
  }

  function handleAdminLoginSuccess(token, user) {
    setIsAdminAuthenticated(true);
    setAdminUser(user);
    setIsAdminLoginModalOpen(false);
    setCurrentRole('admin');
    setActiveView('admin-dashboard');
  }

  function handleAdminLogout() {
    sessionStorage.removeItem('evconnect_admin_token');
    sessionStorage.removeItem('evconnect_admin_user');
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    setCurrentRole('user');
    setActiveView('explore');
  }

  function handleVehiclesChange(updatedVehicles) {
    setVehicles(updatedVehicles);
    const primary = updatedVehicles.find((v) => v.is_primary === 1) || updatedVehicles[0];
    setPrimaryVehicle(primary);
  }

  async function handleViewInvoice(bookingIdOrInvoiceId) {
    try {
      const res = await api.getInvoice(bookingIdOrInvoiceId);
      if (res.success) {
        setActiveInvoice(res.invoice);
      }
    } catch (err) {
      console.error('Failed to view invoice:', err);
    }
  }

  return (
    <div className="min-h-screen bg-[#080C15] text-[#F8FAFC] flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        activeView={activeView}
        onViewChange={setActiveView}
        primaryVehicle={primaryVehicle}
        onOpenGarage={() => setIsGarageOpen(true)}
        telemetryConnected={telemetryConnected}
        currentUser={currentUser}
        isAdminAuthenticated={isAdminAuthenticated}
        adminUser={adminUser}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentRole === 'user' && (
          <>
            {activeView === 'explore' && (
              <UserExploreView
                onSelectStation={(station) => {}}
                onBookStation={(station) => setBookingModalStation(station)}
                primaryVehicle={primaryVehicle}
                onOpenGarage={() => setIsGarageOpen(true)}
              />
            )}
            {activeView === 'user-dashboard' && (
              <UserDashboard
                currentUser={currentUser}
                primaryVehicle={primaryVehicle}
                onBookStation={(st) => setBookingModalStation(st)}
                onViewInvoice={handleViewInvoice}
              />
            )}
            {activeView === 'ai-planner' && (
              <AiAssistantView
                primaryVehicle={primaryVehicle}
                onSelectStation={(st) => setBookingModalStation(st)}
              />
            )}
          </>
        )}

        {currentRole === 'owner' && (
          <>
            {activeView === 'host-stations' && (
              <HostDashboard currentUser={currentUser} />
            )}
            {activeView === 'host-analytics' && (
              <HostAnalytics />
            )}
            {activeView === 'ocpp-lab' && (
              <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                <OcppSimulator
                  chargers={allChargers}
                  onChargerUpdated={(updatedCh) => {
                    setAllChargers((prev) => prev.map((c) => c.id === updatedCh.id ? updatedCh : c));
                  }}
                />
              </div>
            )}
          </>
        )}

        {currentRole === 'admin' && (
          <>
            {activeView === 'admin-dashboard' && (
              <AdminDashboard 
                adminUser={adminUser} 
                onLogout={handleAdminLogout} 
              />
            )}
          </>
        )}
      </main>

      {/* Global Interactive Modals */}
      <BookingModal
        isOpen={!!bookingModalStation}
        onClose={() => setBookingModalStation(null)}
        station={bookingModalStation}
        vehicle={primaryVehicle}
        onProceedToPayment={(createdBooking) => {
          setBookingModalStation(null);
          setPaymentModalBooking(createdBooking);
        }}
      />

      <PaymentModal
        isOpen={!!paymentModalBooking}
        onClose={() => setPaymentModalBooking(null)}
        booking={paymentModalBooking}
        onPaymentSuccess={(payment, invoice) => {
          if (invoice) {
            setActiveInvoice(invoice);
          }
        }}
      />

      <InvoiceModal
        isOpen={!!activeInvoice}
        onClose={() => setActiveInvoice(null)}
        invoice={activeInvoice}
      />

      <GarageModal
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        vehicles={vehicles}
        onVehiclesChange={handleVehiclesChange}
      />

      {/* Admin Security Login Gateway Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginModalOpen}
        onClose={() => setIsAdminLoginModalOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-5 px-4 lg:px-8 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div>
            <span className="font-extrabold text-white">EV Connect AI</span> • Pan-India Intelligent EV Charging, Telemetry & Booking Marketplace
          </div>
        </div>
      </footer>

    </div>
  );
}
