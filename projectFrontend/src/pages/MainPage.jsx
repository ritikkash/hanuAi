import React, { useState } from 'react'
import LeafletMap from '../components/LeafletMap'
import ListLocations from '../components/ListLocations' 

const MainPage = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: '1', height: '100%' }}>
        <ListLocations 
          selectedLocation={selectedLocation}
          onLocationSelect={setSelectedLocation}
        />
      </div>
      <div style={{ flex: '2', height: '100%' }}>
        <LeafletMap 
          onLocationSelect={setSelectedLocation}
        />
      </div>
    </div>
  )
}

export default MainPage