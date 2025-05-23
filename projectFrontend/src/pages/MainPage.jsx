import React, { useState } from 'react'
import LeafletMap from '../components/LeafletMap'
import ListLocations from '../components/ListLocations' 

const MainPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locations, setLocations] = useState([]);

  const handleLocationSelect = (location) => {
    console.log('Location selected in MainPage:', location);
    if (location) {
      console.log('Latitude:', location.lat);
      console.log('Longitude:', location.lng);
    }
    setSelectedLocation(location);
  };

  const handleLocationsUpdate = (newLocations) => {
    console.log('Updating locations:', newLocations);
    setLocations(newLocations);
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: '1', height: '100%', overflow: 'auto' }}>
        <ListLocations 
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onLocationsUpdate={handleLocationsUpdate}
        />
      </div>
      <div style={{ flex: '2', height: '100%' }}>
        <LeafletMap 
          selectedLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          locations={locations}
        />
      </div>
    </div>
  )
}

export default MainPage