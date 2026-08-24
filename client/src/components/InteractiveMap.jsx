import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Zap, Compass } from 'lucide-react';

const INDIAN_CITIES = [
  { name: 'All India 🇮🇳', lat: 20.5937, lon: 78.9629, zoom: 5 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, zoom: 12 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, zoom: 12 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, zoom: 11 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, zoom: 12 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, zoom: 12 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, zoom: 12 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, zoom: 12 }
];

export default function InteractiveMap({
  stations = [],
  selectedStation = null,
  onSelectStation,
  onBookStation,
  userLocation = { lat: 12.9716, lon: 77.5946 }
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [activeCity, setActiveCity] = useState('All India 🇮🇳');

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on India with pan-India view
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Clean Voyager map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User Location Marker with pulsing ring (India GPS Reference)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="width: 14px; height: 14px; background: #00F2FE; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 12px #00F2FE; margin: 5px auto;"></div>
          <div style="position: absolute; top: 0; left: 0; width: 24px; height: 24px; border-radius: 50%; background: rgba(0, 242, 254, 0.35); animation: pulse-ring 2s infinite;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Current EV Location</b><br/>GPS: India EV Grid');
    markersRef.current.push(userMarker);

    // Station Markers across India
    stations.forEach((station) => {
      const isAvailable = station.availableBays > 0;
      const hasScooty = station.chargers?.some(c => 
        c.connector_type.includes('2W') || 
        c.connector_type.includes('Ather') || 
        c.connector_type.includes('Ola') || 
        c.connector_type.includes('Swap')
      );
      const isUltraFast = station.maxPower >= 150;
      
      const pinBg = hasScooty ? '#041B15' : '#0B132B';
      const markerColor = isAvailable ? (hasScooty ? '#00E676' : '#00F2FE') : '#F59E0B';
      const iconSymbol = hasScooty ? '🛵' : '⚡';

      const stationIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background: ${pinBg};
            border: 2px solid ${markerColor};
            border-radius: 14px;
            padding: 4px 8px;
            color: white;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.7), 0 0 12px ${markerColor}55;
            white-space: nowrap;
          ">
            <span style="font-size: 13px;">${iconSymbol}</span>
            <span>${station.city}</span>
            <span style="
              background: ${isAvailable ? 'rgba(0,230,118,0.25)' : 'rgba(245,158,11,0.25)'};
              color: ${isAvailable ? '#00E676' : '#F59E0B'};
              padding: 1px 5px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 700;
            ">${station.availableBays}/${station.totalBays}</span>
          </div>
        `,
        iconSize: [110, 32],
        iconAnchor: [55, 16]
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 240px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${hasScooty ? '#00E676' : '#00F2FE'};">
              ${hasScooty ? '🛵 EV Scooty & Car Hub' : '⚡ EV Car Fast Hub'}
            </span>
            <span style="font-size: 11px; color: #FBBF24; font-weight: 700;">★ ${station.rating}</span>
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #F8FAFC; margin-bottom: 2px; line-height: 1.3;">${station.name}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">${station.address}, ${station.city}</div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; font-size: 11px; background: rgba(255,255,255,0.05); padding: 4px 6px; border-radius: 6px;">
            <span style="color: #00F2FE; font-weight: 700;">⚡ ${station.maxPower} kW Max</span>
            <span style="color: #00E676; font-weight: 700;">From ₹${station.minPrice.toFixed(2)}/kWh</span>
          </div>

          <div style="font-size: 10px; color: #94A3B8; margin-bottom: 8px;">
            <b>Available Connectors:</b><br/>
            ${station.chargers?.map(c => `<span style="display: inline-block; background: rgba(0,242,254,0.1); color: #00F2FE; padding: 1px 4px; border-radius: 4px; margin: 1px; font-size: 9px;">${c.connector_type}</span>`).join(' ') || 'CCS2'}
          </div>

          <button id="map-book-${station.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #00F2FE 0%, #00B0FF 100%);
            color: #040814;
            font-weight: 700;
            border: none;
            padding: 8px 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
          ">⚡ Reserve Charging Slot</button>
        </div>
      `;

      const marker = L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('popupopen', () => {
        const bookBtn = document.getElementById(`map-book-${station.id}`);
        if (bookBtn) {
          bookBtn.onclick = () => {
            if (onBookStation) onBookStation(station);
          };
        }
        if (onSelectStation) onSelectStation(station);
      });

      markersRef.current.push(marker);
    });

    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 13.5, { duration: 1.2 });
    }
  }, [stations, selectedStation, userLocation]);

  function handleCityJump(city) {
    setActiveCity(city.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lon], city.zoom, { duration: 1.5 });
    }
  }

  return (
    <div className="relative w-full h-[520px] lg:h-[660px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col">
      
      {/* Pan-India City Quick Selector Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between gap-2 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 bg-[#0B0F19]/95 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl shrink-0">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Topography:</span>
          </div>
          {INDIAN_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => handleCityJump(c)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeCity === c.name
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#00B0FF] text-[#040814] shadow-md shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map DOM */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#0B0F19]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="text-sm">🛵</span>
          <span>EV Scooty (Ather/Ola/Swap)</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <span className="text-sm">⚡</span>
          <span>4W Car Ultra-Fast DC</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] shadow-sm shadow-emerald-400"></span>
          <span>Ready & Open</span>
        </div>
      </div>

    </div>
  );
}
