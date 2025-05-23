import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, useMap, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map center updates
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function LeafletMap({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setAccuracy(position.coords.accuracy);
          setMapKey(prev => prev + 1);
        },
        (error) => {
          setError("Unable to retrieve your location");
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleMapClick = (e) => {
    console.log('Map clicked:', e.latlng); // Debug log
    const { lat, lng } = e.latlng;
    const newLocation = { lat, lng };
    setSelectedLocation(newLocation);
    if (onLocationSelect) {
      onLocationSelect(newLocation);
    }
  };

  const handleMarkerClick = () => {
    console.log('Marker clicked'); // Debug log
    setSelectedLocation(null);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {position ? (
        <>
          <MapContainer
            key={mapKey}
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            onClick={handleMapClick}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {/* Accuracy circle */}
            {accuracy && (
              <Circle
                center={[position.lat, position.lng]}
                radius={accuracy}
                pathOptions={{
                  color: '#3388ff',
                  fillColor: '#3388ff',
                  fillOpacity: 0.2
                }}
              />
            )}
            {/* User location circle */}
            <Circle
              center={[position.lat, position.lng]}
              radius={10}
              pathOptions={{
                color: '#3388ff',
                fillColor: '#3388ff',
                fillOpacity: 0.8
              }}
            />
            {/* Selected location marker */}
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                eventHandlers={{
                  click: handleMarkerClick
                }}
              />
            )}
            <ChangeView center={[position.lat, position.lng]} zoom={13} />
          </MapContainer>
          <button
            onClick={getCurrentLocation}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              zIndex: 1000,
              padding: "8px 16px",
              backgroundColor: "white",
              border: "2px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
          >
            Center Map
          </button>
        </>
      ) : (
        <div className="loading">Loading map...</div>
      )}
    </div>
  );
}

export default LeafletMap;