import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { api } from "../services/api";
import {
  startBackgroundTracking,
  stopBackgroundTracking,
  syncLocations,
} from "../utils/trackingManager";

const CURRENT_SESSION_KEY = "@current_tracking_session";

interface TrackingContextType {
  sessionId: string | null;
  isTracking: boolean;
  startSession: (customSessionId?: string) => Promise<string>;
  stopSession: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType>({
  sessionId: null,
  isTracking: false,
  startSession: async () => "",
  stopSession: async () => {},
});

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CURRENT_SESSION_KEY);
        if (stored) {
          sessionRef.current = stored;
          setSessionId(stored);
          setIsTracking(true);
          void syncLocations();
        }
      } catch {
        // Ignore storage read issues
      }
    })();
  }, []);

  useEffect(() => {
    if (!isTracking) return;
    const interval = setInterval(() => {
      void syncLocations();
    }, 10000);
    return () => clearInterval(interval);
  }, [isTracking]);

  const startSession = useCallback(async (customSessionId?: string): Promise<string> => {
    if (sessionRef.current) {
      return sessionRef.current;
    }

    const nextId =
      customSessionId || `trk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionRef.current = nextId;
    setSessionId(nextId);
    setIsTracking(true);

    try {
      await AsyncStorage.setItem(CURRENT_SESSION_KEY, nextId);
    } catch {
      // Continue tracking in memory
    }

    let startLat: number | undefined;
    let startLng: number | undefined;
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.granted) {
        const fix = await Location.getLastKnownPositionAsync();
        if (fix) {
          startLat = fix.coords.latitude;
          startLng = fix.coords.longitude;
        }
      }
    } catch {
      // Optional initial coords
    }

    try {
      await api.post("/employee/tracking/session/start", {
        session_id: nextId,
        latitude: startLat,
        longitude: startLng,
      });
    } catch {
      // Offline sync will auto-create session on backend when online
    }

    void startBackgroundTracking(nextId);
    return nextId;
  }, []);

  const stopSession = useCallback(async () => {
    const activeId = sessionRef.current || (await AsyncStorage.getItem(CURRENT_SESSION_KEY));
    sessionRef.current = null;
    setSessionId(null);
    setIsTracking(false);

    await stopBackgroundTracking();
    await syncLocations();

    if (activeId) {
      let endLat: number | undefined;
      let endLng: number | undefined;
      try {
        const fix = await Location.getLastKnownPositionAsync();
        if (fix) {
          endLat = fix.coords.latitude;
          endLng = fix.coords.longitude;
        }
      } catch {
        // Optional final coords
      }
      try {
        await api.post("/employee/tracking/session/stop", {
          session_id: activeId,
          latitude: endLat,
          longitude: endLng,
        });
      } catch {
        // Session will close cleanly
      }
    }
  }, []);

  return (
    <TrackingContext.Provider value={{ sessionId, isTracking, startSession, stopSession }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => useContext(TrackingContext);
