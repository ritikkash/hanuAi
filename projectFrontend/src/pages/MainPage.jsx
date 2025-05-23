import React, { useState } from 'react'
import LeafletMap from '../components/LeafletMap'
import ListLocations from '../components/ListLocations' 

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2" style={{ marginBottom: '20px' }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h2 style={{ 
              margin: '0 0 15px 0',
              color: '#dc3545',
              fontSize: '24px'
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              margin: '0 0 20px 0',
              color: '#6c757d',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);

  const handleLocationSelect = (location) => {
    try {
      console.log('Location selected in MainPage:', location);
      if (location) {
        console.log('Latitude:', location.lat);
        console.log('Longitude:', location.lng);
      }
      setSelectedLocation(location);
      setError(null);
    } catch (err) {
      console.error('Error handling location selection:', err);
      setError('Failed to select location. Please try again.');
    }
  };

  const handleLocationsUpdate = (newLocations) => {
    try {
      console.log('Updating locations:', newLocations);
      setLocations(newLocations);
      setError(null);
    } catch (err) {
      console.error('Error updating locations:', err);
      setError('Failed to update locations. Please try again.');
    }
  };

  return (
    <ErrorBoundary>
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ 
          flex: '1', 
          height: '100%', 
          overflow: 'auto',
          borderRight: '1px solid #dee2e6'
        }}>
          <ListLocations 
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            onLocationsUpdate={handleLocationsUpdate}
          />
        </div>
        <div style={{ 
          flex: '2', 
          height: '100%',
          position: 'relative'
        }}>
          {error && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '6px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
          <LeafletMap 
            selectedLocation={selectedLocation}
            onLocationSelect={handleLocationSelect}
            locations={locations}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default MainPage