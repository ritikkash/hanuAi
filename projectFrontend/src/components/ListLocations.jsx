import React, { useState, useEffect } from 'react';
import { addLocation, getAllLocations } from '../api/locations';

// Loading spinner component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  }}>
    <div style={{
      width: '30px',
      height: '30px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #3498db',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
  </div>
);

// Error message component
const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <div style={{ flex: 1 }}>{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '6px 12px',
          backgroundColor: '#c62828',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Retry
      </button>
    )}
  </div>
);

function ListLocations({ selectedLocation, onLocationSelect, onLocationsUpdate }) {
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: ''
  });
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllLocations();
      const locationsData = response.features || [];
      setLocations(locationsData);
      if (onLocationsUpdate) {
        onLocationsUpdate(locationsData);
      }
    } catch (error) {
      setError('Failed to fetch locations. Please try again.');
      console.error('Error fetching locations:', error);
      setLocations([]);
      if (onLocationsUpdate) {
        onLocationsUpdate([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      console.log('ListLocations received new selected location:', selectedLocation);
      console.log('Latitude:', selectedLocation.lat);
      console.log('Longitude:', selectedLocation.lng);
      setNewLocation(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }));
      setActiveTab('add');
    }
  }, [selectedLocation]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);

      if (!newLocation.latitude || !newLocation.longitude) {
        throw new Error('Please select a location on the map');
      }

      const locationData = {
        name: newLocation.name,
        description: newLocation.description,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude)
      };

      console.log('Submitting location:', locationData);
      await addLocation(locationData);
      await fetchLocations();

      // Reset form
      setNewLocation({
        name: '',
        description: '',
        latitude: '',
        longitude: ''
      });
      setActiveTab('list');
      if (onLocationSelect) {
        onLocationSelect(null);
      }
    } catch (error) {
      setError(error.message || 'Failed to add location. Please try again.');
      console.error('Error adding location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLocationProperties = (location) => {
    if (location.properties) {
      return location.properties;
    }
    return location;
  };

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '20px',
        borderBottom: '1px solid #ddd',
        backgroundColor: 'white',
        borderRadius: '8px 8px 0 0',
        overflow: 'hidden'
      }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            backgroundColor: activeTab === 'list' ? '#007bff' : 'transparent',
            color: activeTab === 'list' ? 'white' : '#333',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
        >
          List Locations
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            flex: 1,
            padding: '12px 20px',
            border: 'none',
            backgroundColor: activeTab === 'add' ? '#007bff' : 'transparent',
            color: activeTab === 'add' ? 'white' : '#333',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
        >
          Add Location
        </button>
      </div>

      {/* Content */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto',
        backgroundColor: 'white',
        borderRadius: '0 0 8px 8px',
        padding: '20px'
      }}>
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={activeTab === 'list' ? fetchLocations : undefined}
          />
        )}
        
        {activeTab === 'list' ? (
          <div>
            {loading ? (
              <LoadingSpinner />
            ) : locations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#666',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '15px' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>No Locations Added</h3>
                <p style={{ margin: '0', color: '#6c757d' }}>
                  Click "Add Location" to add your first location
                </p>
              </div>
            ) : (
              locations.map((location, index) => {
                const props = getLocationProperties(location);
                const coordinates = location.geometry?.coordinates || [props.longitude, props.latitude];
                return (
                  <div
                    key={location.id || index}
                    style={{
                      backgroundColor: '#fff',
                      padding: '20px',
                      marginBottom: '15px',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      border: '1px solid #e9ecef',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      cursor: 'pointer',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <h3 style={{ 
                      margin: '0 0 10px 0',
                      color: '#212529',
                      fontSize: '18px'
                    }}>
                      {props.name}
                    </h3>
                    <p style={{ 
                      margin: '0 0 15px 0', 
                      color: '#6c757d',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {props.description}
                    </p>
                    <div style={{ 
                      color: '#868e96', 
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {coordinates[1].toFixed(6)}, {coordinates[0].toFixed(6)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ 
            backgroundColor: '#fff',
            padding: '25px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: '#495057',
                fontWeight: '500'
              }}>
                Location Name
              </label>
              <input
                type="text"
                name="name"
                value={newLocation.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s ease',
                  ':focus': {
                    borderColor: '#007bff',
                    outline: 'none'
                  }
                }}
                placeholder="Enter location name"
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px',
                color: '#495057',
                fontWeight: '500'
              }}>
                Description
              </label>
              <textarea
                name="description"
                value={newLocation.description}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '6px',
                  minHeight: '100px',
                  fontSize: '14px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                  ':focus': {
                    borderColor: '#007bff',
                    outline: 'none'
                  }
                }}
                placeholder="Enter location description"
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#495057',
                  fontWeight: '500'
                }}>
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={newLocation.latitude}
                  onChange={handleInputChange}
                  required
                  step="any"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#6c757d'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  color: '#495057',
                  fontWeight: '500'
                }}>
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={newLocation.longitude}
                  onChange={handleInputChange}
                  required
                  step="any"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#f8f9fa',
                    color: '#6c757d'
                  }}
                />
              </div>
            </div>
            <div style={{ 
              marginBottom: '20px',
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: selectedLocation ? '#e8f5e9' : '#fff3e0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              {selectedLocation ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span style={{ color: '#2e7d32' }}>Location selected on map</span>
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f57c00" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span style={{ color: '#f57c00' }}>Click on the map to select a location</span>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !selectedLocation}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isSubmitting || !selectedLocation ? '#e9ecef' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSubmitting || !selectedLocation ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #fff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Adding Location...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Location
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ListLocations;