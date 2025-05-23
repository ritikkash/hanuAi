import axiosInstance from './axiosInstance';

// Get all locations (GeoJSON FeatureCollection)
export const getAllLocations = async () => {
    try {
        const response = await axiosInstance.get('/locations/');
        return response.data;
    } catch (error) {
        console.error('Error fetching locations:', error);
        throw error;
    }
};

// Get location statistics
export const getLocationStatistics = async () => {
    try {
        const response = await axiosInstance.get('/locations/statistics/');
        return response.data;
    } catch (error) {
        console.error('Error fetching location statistics:', error);
        throw error;
    }
};

// Add a new location
export const addLocation = async (locationData) => {
    try {
        // Format the data according to the backend's expected structure
        const formattedData = {
            name: locationData.name,
            category: locationData.category || '',
            latitude: locationData.latitude,
            longitude: locationData.longitude
        };
        const response = await axiosInstance.post('/locations/', formattedData);
        return response.data;
    } catch (error) {
        console.error('Error adding location:', error);
        throw error;
    }
};

// Get a single location by ID
export const getLocationById = async (locationId) => {
    try {
        const response = await axiosInstance.get(`/locations/${locationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching location with ID ${locationId}:`, error);
        throw error;
    }
};

// Update a location by ID
export const updateLocation = async (locationId, locationData) => {
    try {
        const formattedData = {
            name: locationData.name,
            category: locationData.category || '',
            latitude: locationData.latitude,
            longitude: locationData.longitude
        };
        const response = await axiosInstance.put(`/locations/${locationId}/`, formattedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating location with ID ${locationId}:`, error);
        throw error;
    }
};

// Partially update a location by ID
export const partialUpdateLocation = async (locationId, locationData) => {
    try {
        const response = await axiosInstance.patch(`/locations/${locationId}/`, locationData);
        return response.data;
    } catch (error) {
        console.error(`Error partially updating location with ID ${locationId}:`, error);
        throw error;
    }
};

// Delete a location by ID
export const deleteLocation = async (locationId) => {
    try {
        const response = await axiosInstance.delete(`/locations/${locationId}/`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting location with ID ${locationId}:`, error);
        throw error;
    }
};