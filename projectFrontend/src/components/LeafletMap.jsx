import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle, useMap, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Loading spinner component
const LoadingSpinner = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    textAlign: 'center'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 10px'
    }}></div>
    <div>Loading map...</div>
  </div>
);

// Error message component
const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '300px'
  }}>
    <div style={{ color: '#dc3545', marginBottom: '15px' }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div style={{ marginBottom: '15px' }}>{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

// Component to handle map center updates and click events
function MapController({ onLocationSelect }) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      const handleClick = (e) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked at coordinates:');
        console.log('Latitude:', lat);
        console.log('Longitude:', lng);
        
        if (onLocationSelect) {
          onLocationSelect({ lat, lng });
        }
      };

      map.on('click', handleClick);
      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, onLocationSelect]);

  return null;
}

function LeafletMap({ selectedLocation, onLocationSelect, locations = [] }) {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentLocation = () => {
    setIsLoading(true);
    setError(null);
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Current location:', newPosition);
          setPosition(newPosition);
          setAccuracy(position.coords.accuracy);
          setMapKey(prev => prev + 1);
          setIsLoading(false);
        },
        (error) => {
          let errorMessage = "Unable to retrieve your location";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Please allow location access to use this feature";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setError(errorMessage);
          console.error("Error getting location:", error);
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleMarkerClick = (e) => {
    e.originalEvent.stopPropagation();
    console.log('Marker clicked, clearing selection');
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  const getLocationCoordinates = (location) => {
    if (location.geometry?.coordinates) {
      return {
        lat: location.geometry.coordinates[1],
        lng: location.geometry.coordinates[0]
      };
    }
    return {
      lat: location.latitude || location.lat,
      lng: location.longitude || location.lng
    };
  };

  return (
    <div style={{ height: "100vh", width: "100%", position: "relative" }}>
      {isLoading && <LoadingSpinner />}
      
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={getCurrentLocation}
        />
      )}

      {position && !error && (
        <>
          <MapContainer
            key={mapKey}
            center={[position.lat, position.lng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapController onLocationSelect={onLocationSelect} />
            
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

            {/* Saved locations markers */}
            {locations.map((location, index) => {
              const coords = getLocationCoordinates(location);
              const props = location.properties || location;
              return (
                <Marker
                  key={location.id || index}
                  position={[coords.lat, coords.lng]}
                  icon={createCustomIcon('#ff4444')}
                >
                  <Popup>
                    <div style={{ padding: '5px' }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>{props.name}</h3>
                      <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{props.description}</p>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666',
                        borderTop: '1px solid #eee',
                        paddingTop: '5px'
                      }}>
                        <div>Latitude: {coords.lat.toFixed(6)}</div>
                        <div>Longitude: {coords.lng.toFixed(6)}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Selected location marker */}
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                eventHandlers={{
                  click: handleMarkerClick
                }}
                icon={createCustomIcon('#3388ff')}
              >
                <Popup>
                  <div style={{ padding: '5px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Selected Location</h3>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666',
                      borderTop: '1px solid #eee',
                      paddingTop: '5px'
                    }}>
                      <div>Latitude: {selectedLocation.lat.toFixed(6)}</div>
                      <div>Longitude: {selectedLocation.lng.toFixed(6)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
          
          {/* Instructions overlay */}
          {showInstructions && !selectedLocation && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              zIndex: 1000,
              textAlign: "center",
              pointerEvents: "none",
              maxWidth: "300px"
            }}>
              <div style={{ 
                fontSize: "24px", 
                marginBottom: "10px",
                color: "#007bff"
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 style={{ margin: "0 0 10px 0" }}>Select a Location</h3>
              <p style={{ margin: "0 0 5px 0", color: "#666" }}>Click anywhere on the map to select a location</p>
              <p style={{ margin: "0", color: "#666" }}>The coordinates will be automatically saved</p>
            </div>
          )}

          {/* Center map button */}
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
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            Center Map
          </button>

          {/* Selected coordinates display */}
          {selectedLocation && (
            <div style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "white",
              padding: "15px 25px",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              zIndex: 1000,
              pointerEvents: "none",
              textAlign: "center"
            }}>
              <div style={{ 
                fontSize: "14px", 
                color: "#007bff",
                marginBottom: "5px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <strong>Selected Location</strong>
              <div style={{ 
                fontSize: "12px", 
                color: "#666",
                marginTop: "5px"
              }}>
                Latitude: {selectedLocation.lat.toFixed(6)}<br />
                Longitude: {selectedLocation.lng.toFixed(6)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default LeafletMap;