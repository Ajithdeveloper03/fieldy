import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startBackgroundTracking, stopBackgroundTracking } from '../utils/trackingManager';
import { api } from '../services/api';
import * as Location from 'expo-location';

interface TrackingContextType {
  sessionId: string | null;
  isTracking: boolean;
  startSession: (id: string) => Promise<void>;
  stopSession: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Restore session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const storedSession = await AsyncStorage.getItem('@current_tracking_session');
        if (storedSession) {
          setSessionId(storedSession);
          setIsTracking(true);
        }
      } catch (e) {
        console.error('Failed to load tracking session', e);
      }
    };
    checkExistingSession();
  }, []);

  const startSession = useCallback(async (id: string) => {
    setSessionId(id);
    setIsTracking(true);
    
    // Call backend to start session
    try {
      let loc = await Location.getLastKnownPositionAsync();
      if (!loc) loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (loc) {
        await api.post('/employee/tracking/session/start', {
          session_id: id,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
      }
    } catch (e) {
      console.log('Failed to start session on backend', e);
    }
    
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === 'granted') {
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') await startBackgroundTracking(id);
    }
  }, []);

  const stopSession = useCallback(async () => {
    if (sessionId) {
        try {
            let loc = await Location.getLastKnownPositionAsync();
            if (!loc) loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (loc) {
                await api.post('/employee/tracking/session/stop', {
                    session_id: sessionId,
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                });
            }
        } catch (e) {
            console.log('Failed to stop session on backend', e);
        }
    }
    setSessionId(null);
    setIsTracking(false);
    await stopBackgroundTracking();
  }, [sessionId]);

  return (
    <TrackingContext.Provider value={{ sessionId, isTracking, startSession, stopSession }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
