import React, { useState } from 'react';
import LeafletMap from './LeafletMap';
import ListLocations from './ListLocations';

function MainPage() {
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
    };

    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        }}>
            <ListLocations 
                selectedLocation={selectedLocation}
                onLocationSelect={handleLocationSelect}
            />
            <div style={{ flex: 1 }}>
                <LeafletMap 
                    onLocationSelect={handleLocationSelect}
                />
            </div>
        </div>
    );
}

export default MainPage; 