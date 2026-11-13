import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export const LOCATION_TASK_NAME = 'BACKGROUND_LOCATION_TASK';
const STORAGE_KEY = '@offline_location_queue';
const CURRENT_SESSION_KEY = '@current_tracking_session';

export interface LocationPoint {
  id: string;
  sessionId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

// Function to save locations to the offline queue
export const saveLocationLocally = async (locations: Location.LocationObject[], sessionId: string) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const queue: LocationPoint[] = existingData ? JSON.parse(existingData) : [];

    const newPoints = locations
      .filter((loc) => (loc.coords.accuracy || 100) < 30) // Filter inaccurate points (>30m accuracy)
      .map((loc) => ({
        id: `loc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        sessionId,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
        speed: loc.coords.speed,
        heading: loc.coords.heading,
        timestamp: loc.timestamp,
      }));

    if (newPoints.length > 0) {
      queue.push(...newPoints);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      console.log(`Saved ${newPoints.length} points locally. Total queue length: ${queue.length}`);
      
      // Attempt to sync immediately if internet is available
      syncLocations();
    }
  } catch (error) {
    console.error('Error saving location locally:', error);
  }
};

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    try {
      const sessionId = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
      if (sessionId) {
        await saveLocationLocally(locations, sessionId);
      }
    } catch (e) {
      console.error('Error reading session for background task:', e);
    }
  }
});

// Start tracking session
export const startBackgroundTracking = async (sessionId: string) => {
  try {
    await AsyncStorage.setItem(CURRENT_SESSION_KEY, sessionId);
    
    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 10000, // Every 10 seconds
      distanceInterval: 10, // Or every 10 meters
      deferredUpdatesInterval: 10000,
      deferredUpdatesDistance: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Active Tracking',
        notificationBody: 'Your location is being tracked for the current session.',
        notificationColor: '#15803d',
      },
    });
    console.log('Background tracking started for session:', sessionId);
  } catch (error) {
    console.log('Background tracking notice:', error);
  }
};

// Stop tracking session
export const stopBackgroundTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    await AsyncStorage.removeItem(CURRENT_SESSION_KEY);
    console.log('Background tracking stopped.');
  } catch (error) {
    console.error('Error stopping background tracking:', error);
  }
};

// Sync function to send data to backend API
export const syncLocations = async () => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    if (existingData) {
      const queue: LocationPoint[] = JSON.parse(existingData);
      if (queue.length > 0) {
        console.log(`Syncing ${queue.length} points to backend...`);
        
        // Convert to backend format
        const points = queue.map(p => ({
          session_id: p.sessionId,
          latitude: p.latitude,
          longitude: p.longitude,
          accuracy: p.accuracy,
          speed: p.speed,
          heading: p.heading,
          timestamp: p.timestamp,
        }));

        try {
          await api.post('/employee/tracking/sync', { points });
          // Clear queue only on success
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          console.log('Sync complete.');
        } catch (apiError) {
          console.error('API sync error:', apiError);
        }
      }
    }
  } catch (error) {
    console.error('Error syncing locations:', error);
  }
};
