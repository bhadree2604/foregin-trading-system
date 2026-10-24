import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon missing in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom colored markers
const createCustomIcon = (color = '#2563eb') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

const defaultOriginIcon = createCustomIcon('#64748b'); // Slate
const defaultDestIcon = createCustomIcon('#10b981'); // Emerald
const defaultCurrentIcon = createCustomIcon('#2563eb'); // Blue

// Helper to fit bounds automatically
function SetBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      const validPoints = positions.filter((p) => p && typeof p[0] === 'number' && typeof p[1] === 'number');
      if (validPoints.length > 1) {
        map.fitBounds(validPoints, { padding: [40, 40] });
      } else if (validPoints.length === 1) {
        map.setView(validPoints[0], 6);
      }
    }
  }, [positions, map]);
  return null;
}

export default function TrackingMap({
  originCoords,
  destCoords,
  currentCoords,
  events = [],
  originName = 'Origin',
  destName = 'Destination',
  currentLocationName = 'In Transit',
}) {
  // Default coordinates if none provided: center of global trade route
  const defaultCenter = [20.0, 50.0];

  // Build array of coordinates for polyline
  const polylineCoords = [];
  if (originCoords && originCoords[0] && originCoords[1]) polylineCoords.push(originCoords);

  // Add intermediate coordinates from tracking events with lat/lng
  events.forEach((ev) => {
    if (ev.latitude && ev.longitude) {
      polylineCoords.push([Number(ev.latitude), Number(ev.longitude)]);
    }
  });

  if (currentCoords && currentCoords[0] && currentCoords[1]) {
    // only push if not already in list
    polylineCoords.push(currentCoords);
  }

  if (destCoords && destCoords[0] && destCoords[1]) {
    polylineCoords.push(destCoords);
  }

  const hasPoints = polylineCoords.length > 0;
  const mapCenter = currentCoords || (originCoords || defaultCenter);

  return (
    <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900">Live Vessel / Cargo Route Map</h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-gray-600">Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-gray-600">Current</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-600">Destination</span>
          </div>
        </div>
      </div>

      <div className="h-[380px] w-full relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={hasPoints ? 4 : 2}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {originCoords && (
            <Marker position={originCoords} icon={defaultOriginIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-slate-700">Origin:</strong>
                  <p>{originName}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {destCoords && (
            <Marker position={destCoords} icon={defaultDestIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-emerald-700">Destination:</strong>
                  <p>{destName}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {currentCoords && (
            <Marker position={currentCoords} icon={defaultCurrentIcon}>
              <Popup>
                <div className="text-xs">
                  <strong className="text-blue-700">Current Location:</strong>
                  <p>{currentLocationName}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Polyline Route */}
          {polylineCoords.length > 1 && (
            <Polyline
              positions={polylineCoords}
              color="#2563eb"
              dashArray="6, 8"
              weight={3}
              opacity={0.8}
            />
          )}

          <SetBounds positions={polylineCoords} />
        </MapContainer>
      </div>
    </div>
  );
}
