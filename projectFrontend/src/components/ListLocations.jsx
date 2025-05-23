import React, { useState, useEffect } from 'react';
import { addLocation, getAllLocations } from '../api/locations';

function ListLocations({ selectedLocation, onLocationSelect }) {
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

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await getAllLocations();
      // Handle GeoJSON FeatureCollection format
      const locationsData = response.features || [];
      setLocations(locationsData);
      setError(null);
    } catch (error) {
      setError('Failed to fetch locations');
      console.error('Error fetching locations:', error);
      setLocations([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setNewLocation(prev => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng
      }));
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
      setLoading(true);
      setError(null);

      // Validate coordinates
      if (!newLocation.latitude || !newLocation.longitude) {
        throw new Error('Please select a location on the map');
      }

      const locationData = {
        name: newLocation.name,
        description: newLocation.description,
        latitude: parseFloat(newLocation.latitude),
        longitude: parseFloat(newLocation.longitude)
      };

      await addLocation(locationData);
      await fetchLocations(); // Refresh the list after adding

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
      setError(error.message || 'Failed to add location');
      console.error('Error adding location:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get location properties
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
        borderBottom: '1px solid #ddd'
      }}>
        <button
          onClick={() => setActiveTab('list')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'list' ? '#007bff' : 'transparent',
            color: activeTab === 'list' ? 'white' : '#333',
            cursor: 'pointer',
            marginRight: '10px',
            borderRadius: '4px 4px 0 0'
          }}
        >
          List Locations
        </button>
        <button
          onClick={() => setActiveTab('add')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'add' ? '#007bff' : 'transparent',
            color: activeTab === 'add' ? 'white' : '#333',
            cursor: 'pointer',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Add Location
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {error && (
          <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}
        
        {activeTab === 'list' ? (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
            ) : locations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '20px',
                color: '#666',
                backgroundColor: 'white',
                borderRadius: '4px'
              }}>
                No locations added yet. Click "Add Location" to add your first location.
              </div>
            ) : (
              locations.map((location, index) => {
                const props = getLocationProperties(location);
                const coordinates = location.geometry?.coordinates || [props.longitude, props.latitude];
                return (
                  <div
                    key={location.id || index}
                    style={{
                      backgroundColor: 'white',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '4px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h3 style={{ margin: '0 0 10px 0' }}>{props.name}</h3>
                    <p style={{ margin: '0 0 10px 0', color: '#666' }}>{props.description}</p>
                    <div style={{ color: '#888', fontSize: '0.9em' }}>
                      Coordinates: {coordinates[1]}, {coordinates[0]}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '4px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Location Name</label>
              <input
                type="text"
                name="name"
                value={newLocation.name}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
              <textarea
                name="description"
                value={newLocation.description}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  minHeight: '100px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={newLocation.latitude}
                  onChange={handleInputChange}
                  required
                  step="any"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={newLocation.longitude}
                  onChange={handleInputChange}
                  required
                  step="any"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px', color: '#666', fontSize: '0.9em' }}>
              {selectedLocation ? (
                <div style={{ color: '#28a745' }}>
                  ✓ Location selected on map
                </div>
              ) : (
                <div style={{ color: '#dc3545' }}>
                  Click on the map to select a location
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            >
              {loading ? 'Adding...' : 'Add Location'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ListLocations;