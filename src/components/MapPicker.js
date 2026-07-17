import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issue with Webpack/Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Handles clicking on the map to set a pin and reverse geocode
function LocationMarker({ position, setPosition, setVenue }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      // Reverse geocode to get human-readable address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setVenue(data.display_name);
          }
        })
        .catch(err => console.error('Geocoding error:', err));
    },
  });

  return position === null ? null : <Marker position={position} />;
}

// Automatically pans the map when the position changes (e.g. from typing)
function MapCenterer({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom() < 13 ? 15 : map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ venue, setVenue }) {
  const [position, setPosition] = useState(null); // [lat, lng]
  const [debouncedVenue, setDebouncedVenue] = useState(venue);

  // Debounce typed venue to avoid spamming Nominatim API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedVenue(venue);
    }, 1500);
    return () => clearTimeout(handler);
  }, [venue]);

  // Forward geocode when user types an address
  useEffect(() => {
    if (debouncedVenue && debouncedVenue.length > 5) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedVenue)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            // Only update if it significantly changed to avoid feedback loop
            if (!position || Math.abs(position[0] - lat) > 0.001 || Math.abs(position[1] - lon) > 0.001) {
              setPosition([lat, lon]);
            }
          }
        })
        .catch(err => console.error('Forward geocoding error:', err));
    }
  }, [debouncedVenue]);

  // Default fallback center (Mumbai)
  const center = position || [19.0760, 72.8777];

  return (
    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker position={position} setPosition={setPosition} setVenue={setVenue} />
      <MapCenterer position={position} />
    </MapContainer>
  );
}
