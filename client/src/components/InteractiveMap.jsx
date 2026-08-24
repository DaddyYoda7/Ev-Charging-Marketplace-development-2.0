import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Zap, Compass, Layers, Crosshair, Sparkles } from 'lucide-react';

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
  userLocation = { lat: 12.9716, lon: 77.5946 },
  onUserLocationChange
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const [activeCity, setActiveCity] = useState('All India 🇮🇳');
  const [mapTheme, setMapTheme] = useState('dark'); // 'dark' | 'voyager' | 'satellite'
  const [liveLocationTracking, setLiveLocationTracking] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default Dark Theme TileLayer
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; OpenStreetMap',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      mapInstanceRef.current._tileLayer = tileLayer;

      // Click on Map to relocate user GPS pin
      map.on('click', (e) => {
        if (onUserLocationChange) {
          onUserLocationChange({ lat: e.latlng.lat, lon: e.latlng.lng });
        }
      });
    }
  }, []);

  // Update Tile Theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map._tileLayer) return;

    map.removeLayer(map._tileLayer);
    let newUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapTheme === 'dark') {
      newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (mapTheme === 'satellite') {
      newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const newLayer = L.tileLayer(newUrl, { maxZoom: 19 }).addTo(map);
    map._tileLayer = newLayer;
  }, [mapTheme]);

  // Update Markers & Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersMapRef.current.forEach((marker) => marker.remove());
    markersMapRef.current.clear();

    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (accuracyCircleRef.current) accuracyCircleRef.current.remove();

    // User Location Pulsing Ring Pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 28px; height: 28px;">
          <div style="width: 16px; height: 16px; background: #00F2FE; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 14px #00F2FE; margin: 6px auto;"></div>
          <div style="position: absolute; top: 0; left: 0; width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 242, 254, 0.4); animation: pulse-ring 1.8s infinite;"></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lon], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 2px;">
          <div style="font-weight: 800; font-size: 12px; color: #00F2FE;">📍 Your GPS Position</div>
          <div style="font-size: 10px; color: #94A3B8; margin-top: 2px;">Lat: ${userLocation.lat.toFixed(4)}, Lon: ${userLocation.lon.toFixed(4)}</div>
          <div style="font-size: 10px; color: #00E676; margin-top: 2px;">⚡ Live EV Radar Active</div>
        </div>
      `);

    accuracyCircleRef.current = L.circle([userLocation.lat, userLocation.lon], {
      radius: 3500,
      color: '#00F2FE',
      fillColor: '#00F2FE',
      fillOpacity: 0.05,
      weight: 1,
      dashArray: '4, 4'
    }).addTo(map);

    // Station Markers across India
    stations.forEach((station) => {
      const isAvailable = station.availableBays > 0;
      const isChargingNow = station.chargers?.some(c => c.status === 'CHARGING');
      const hasScooty = station.chargers?.some(c => 
        c.connector_type.includes('2W') || 
        c.connector_type.includes('Ather') || 
        c.connector_type.includes('Ola') || 
        c.connector_type.includes('Swap')
      );
      const isSelected = selectedStation?.id === station.id;

      const markerBorder = isSelected ? '#00F2FE' : isAvailable ? (hasScooty ? '#00E676' : '#00F2FE') : '#F59E0B';
      const glowEffect = isSelected ? '0 0 20px #00F2FE' : isChargingNow ? '0 0 15px #00F2FE66' : '0 4px 12px rgba(0,0,0,0.8)';
      const iconSymbol = hasScooty ? '🛵' : '⚡';

      const stationIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background: ${isSelected ? '#0E2A3B' : '#0B1220'};
            border: 2px solid ${markerBorder};
            border-radius: 14px;
            padding: 5px 9px;
            color: white;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: ${glowEffect};
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.12)' : 'scale(1.0)'};
            transition: all 0.2s ease;
          ">
            <span style="font-size: 14px;">${iconSymbol}</span>
            <span style="letter-spacing: -0.01em;">${station.city || 'Hub'}</span>
            <span style="
              background: ${isAvailable ? 'rgba(0,230,118,0.25)' : 'rgba(245,158,11,0.25)'};
              color: ${isAvailable ? '#00E676' : '#F59E0B'};
              padding: 1px 5px;
              border-radius: 6px;
              font-size: 9px;
              font-weight: 800;
            ">${station.availableBays}/${station.totalBays}</span>
          </div>
        `,
        iconSize: [115, 34],
        iconAnchor: [57, 17]
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${hasScooty ? '#00E676' : '#00F2FE'};">
              ${hasScooty ? '🛵 EV Scooty & Car Hub' : '⚡ Fast DC Car Hub'}
            </span>
            <span style="font-size: 11px; color: #FBBF24; font-weight: 700;">★ ${station.rating}</span>
          </div>
          
          <div style="font-weight: 800; font-size: 13px; color: #F8FAFC; margin-bottom: 2px; line-height: 1.3;">${station.name}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">${station.address}</div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px; background: rgba(255,255,255,0.06); padding: 5px 8px; border-radius: 8px;">
            <span style="color: #00F2FE; font-weight: 700;">⚡ ${station.maxPower} kW Peak</span>
            <span style="color: #00E676; font-weight: 800; font-family: 'JetBrains Mono', monospace;">₹${station.minPrice.toFixed(2)}/kWh</span>
          </div>

          <div style="font-size: 10px; color: #94A3B8; margin-bottom: 10px;">
            <div style="font-weight: 700; margin-bottom: 3px; color: #CBD5E1;">Installed Plugs:</div>
            ${station.chargers?.map(c => `<span style="display: inline-block; background: rgba(0,242,254,0.12); color: #00F2FE; padding: 2px 5px; border-radius: 5px; margin: 1.5px; font-size: 9px; font-family: 'JetBrains Mono', monospace;">${c.connector_type} • ${c.power_kw}kW</span>`).join(' ') || 'CCS2'}
          </div>

          <button id="map-book-${station.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #00F2FE 0%, #00B0FF 100%);
            color: #040814;
            font-weight: 800;
            border: none;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            box-shadow: 0 4px 14px rgba(0,242,254,0.4);
          ">⚡ Reserve Charging Slot</button>
        </div>
      `;

      const marker = L.marker([station.latitude, station.longitude], { icon: stationIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectStation) onSelectStation(station);
      });

      marker.on('popupopen', () => {
        const bookBtn = document.getElementById(`map-book-${station.id}`);
        if (bookBtn) {
          bookBtn.onclick = () => {
            if (onBookStation) onBookStation(station);
          };
        }
        if (onSelectStation) onSelectStation(station);
      });

      markersMapRef.current.set(station.id, marker);
    });

    // Fly to selected station
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 13.5, { duration: 1.2 });
      const targetMarker = markersMapRef.current.get(selectedStation.id);
      if (targetMarker && !targetMarker.isPopupOpen()) {
        setTimeout(() => targetMarker.openPopup(), 400);
      }
    }
  }, [stations, selectedStation, userLocation]);

  function handleCityJump(city) {
    setActiveCity(city.name);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([city.lat, city.lon], city.zoom, { duration: 1.4 });
    }
  }

  function handleLocateMe() {
    if (navigator.geolocation) {
      setLiveLocationTracking(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          if (onUserLocationChange) {
            onUserLocationChange({ lat, lon });
          }
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lon], 13, { duration: 1.2 });
          }
          setLiveLocationTracking(false);
        },
        () => {
          // Fallback to Bengaluru Tech Corridor
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lon], 13, { duration: 1.2 });
          }
          setLiveLocationTracking(false);
        }
      );
    }
  }

  return (
    <div className="relative w-full h-[520px] lg:h-[660px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl flex flex-col">
      
      {/* Top Pan-India City Quick Selector Toolbar */}
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

        {/* Map Layer Switcher & Locate Me */}
        <div className="flex items-center gap-1.5 shrink-0 bg-[#0B0F19]/95 backdrop-blur-md p-1.5 rounded-xl border border-white/15 shadow-xl">
          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'voyager' : mapTheme === 'voyager' ? 'satellite' : 'dark')}
            title="Switch Map Theme (Dark / Street / Satellite)"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 font-semibold"
          >
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="capitalize">{mapTheme}</span>
          </button>

          <button
            onClick={handleLocateMe}
            title="Recenter to GPS Location"
            className="p-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00F2FE] border border-cyan-500/40 text-xs flex items-center gap-1 font-bold"
          >
            <Crosshair className={`w-3.5 h-3.5 ${liveLocationTracking ? 'animate-spin' : ''}`} />
            <span>GPS</span>
          </button>
        </div>
      </div>

      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Bottom Map Legend & Interactive Hint */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-[#0B0F19]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs flex flex-wrap items-center gap-4">
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
        <div className="text-[11px] text-slate-400 hidden sm:inline">
          💡 Click any station pin or map area to update live radar
        </div>
      </div>

    </div>
  );
}
