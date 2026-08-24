import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lon],
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark theme map tiles
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
      .bindPopup('<b>Your Current EV Location</b><br/>GPS: Bengaluru Tech Corridor');
    markersRef.current.push(userMarker);

    // Station Markers
    stations.forEach((station) => {
      const isAvailable = station.availableBays > 0;
      const isUltraFast = station.maxPower >= 150;
      const markerColor = isAvailable ? (isUltraFast ? '#00F2FE' : '#00E676') : '#F59E0B';

      const stationIcon = L.divIcon({
        className: 'custom-station-marker',
        html: `
          <div style="
            background: #111827;
            border: 2px solid ${markerColor};
            border-radius: 12px;
            padding: 4px 8px;
            color: white;
            font-size: 11px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.6), 0 0 10px ${markerColor}66;
            white-space: nowrap;
          ">
            <span style="color: ${markerColor};">⚡</span>
            <span>${station.maxPower}kW</span>
            <span style="
              background: ${isAvailable ? 'rgba(0,230,118,0.2)' : 'rgba(245,158,11,0.2)'};
              color: ${isAvailable ? '#00E676' : '#F59E0B'};
              padding: 1px 4px;
              border-radius: 4px;
              font-size: 9px;
            ">${station.availableBays}/${station.totalBays}</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15]
      });

      const popupHtml = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; width: 220px;">
          <div style="font-weight: 700; font-size: 13px; color: #F8FAFC; margin-bottom: 2px;">${station.name}</div>
          <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">${station.address}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 11px;">
            <span style="color: #00F2FE; font-weight: 700;">⚡ ${station.maxPower} kW Max</span>
            <span style="color: #00E676; font-weight: 700;">₹${station.minPrice.toFixed(2)}/kWh</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 11px;">
            <span style="color: #FBBF24;">★ ${station.rating} (${station.review_count})</span>
            <span style="color: ${isAvailable ? '#00E676' : '#F59E0B'}; font-weight: 600;">${station.availableBays} bays open</span>
          </div>
          <button id="map-book-${station.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #00F2FE 0%, #00B0FF 100%);
            color: #040814;
            font-weight: 700;
            border: none;
            padding: 7px 10px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
          ">⚡ Reserve Charging Bay</button>
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

  return (
    <div className="relative w-full h-[480px] lg:h-[620px] rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Overlay Legend */}
      <div className="absolute top-4 left-4 z-[1000] bg-[#0B0F19]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-sm shadow-cyan-400"></span>
          <span>Ultra-Fast (120kW+)</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00E676] shadow-sm shadow-emerald-400"></span>
          <span>Fast / AC Level 2</span>
        </div>
        <div className="flex items-center gap-1.5 font-semibold text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
}
