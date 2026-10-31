import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { employeeProfile } from './data/mockData';

// --- Constants & Types ---
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface TelemetryData {
  speed: number;
  accuracy: number | null;
  battery: number | null;
  isOnline: boolean;
}

const GEOFENCE_RADIUS = 100; // meters
const MAX_ACCEPTABLE_ACCURACY_METERS = 25;
const MIN_MOVEMENT_METERS = 5;
const LOCATION_TASK_NAME = 'background-location-task';

const farmLocation: Coordinate = {
  latitude: 12.9786,
  longitude: 77.5996,
};

// --- Helper Functions ---
const haversineMeters = (a: Coordinate, b: Coordinate) => {
  const radius = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const value =
    sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

// --- Background Task Definition ---
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Background Location Error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      const { latitude, longitude, accuracy, speed, heading } = location.coords;
      
      // --- SEND REAL-TIME PING TO BACKEND FOR ADMIN DASHBOARD ---
      // This runs even when the app is in the background!
      try {
        fetch('http://10.0.2.2:8000/api/v1/employee/tracking/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            points: [{
              session_id: 'live_tracking_session',
              latitude: latitude,
              longitude: longitude,
              accuracy: accuracy,
              speed: speed,
              heading: heading,
              timestamp: location.timestamp,
            }]
          })
        }).catch(e => console.log('Silent sync error:', e));
      } catch (e) {
        // Ignore fetch errors to not block background task
      }
    }
  }
});

// --- Components ---
const SmoothMarker = ({ coordinate }: { coordinate: Coordinate }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.markerContainer}>
        <Animated.View
          style={[
            styles.pulseAura,
            {
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.5],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
        <View style={styles.markerCore}>
          <Image 
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeProfile.name)}&background=10B981&color=fff&size=64` }}
            style={{ width: 28, height: 28, borderRadius: 14 }}
          />
        </View>
        <View style={styles.markerLabelContainer}>
          <Text style={styles.markerLabel}>{employeeProfile.name}</Text>
        </View>
      </View>
    </Marker>
  );
};

export default function LiveTrackingMapScreen() {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    accuracy: null,
    battery: null,
    isOnline: false,
  });
  const [inGeofence, setInGeofence] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);

  const [breadcrumbRoute, setBreadcrumbRoute] = useState<Coordinate[]>([]);
  const lastAcceptedRef = useRef<{ coordinate: Coordinate; timestamp: number } | null>(null);

  // Real GPS tracking (Foreground UI updates + Background setup)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted || foregroundStatus !== 'granted') {
        return;
      }

      // Request background permissions for secure live tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: MIN_MOVEMENT_METERS,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Live Tracking Active",
            notificationBody: "Your location is being securely shared with the admin.",
            notificationColor: "#10B981",
          }
        });
      }

      // UI Update Subscription (Foreground)
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: MIN_MOVEMENT_METERS,
        },
        (location) => {
          if (!isMounted) return;

          const { latitude, longitude, accuracy, speed, heading } = location.coords;
          const newCoord = { latitude, longitude };
          const lastAccepted = lastAcceptedRef.current;

          if (accuracy != null && accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
            setTelemetry((prev) => ({ ...prev, accuracy, isOnline: false }));
            return;
          }

          if (lastAccepted && location.timestamp <= lastAccepted.timestamp) return;

          if (
            lastAccepted &&
            haversineMeters(lastAccepted.coordinate, newCoord) <
              Math.max(MIN_MOVEMENT_METERS, accuracy ?? MIN_MOVEMENT_METERS)
          ) {
            setTelemetry((prev) => ({ ...prev, speed: 0, accuracy, isOnline: true }));
            return;
          }

          setCurrentLocation(newCoord);
          setBreadcrumbRoute((prev) => [...prev, newCoord]);
          lastAcceptedRef.current = { coordinate: newCoord, timestamp: location.timestamp };

          setTelemetry((prev) => ({
            ...prev,
            speed: speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0,
            accuracy,
            isOnline: true,
          }));

          // Smoothly animate map camera
          mapRef.current?.animateCamera({
            center: newCoord,
            heading: heading != null && heading >= 0 ? heading : 0,
          }, { duration: 700 });

          // Geofence check
          const latDiff = Math.abs(farmLocation.latitude - newCoord.latitude);
          const lngDiff = Math.abs(farmLocation.longitude - newCoord.longitude);
          const approxDistance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000;

          setInGeofence((prevInGeofence) => {
            if (approxDistance < GEOFENCE_RADIUS && !prevInGeofence) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              return true;
            } else if (approxDistance >= GEOFENCE_RADIUS && prevInGeofence) {
              return false;
            }
            return prevInGeofence;
          });
        }
      );

      if (!isMounted) {
        subscription.remove();
        subscription = null;
      }
    };

    void startTracking();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
      // Note: We deliberately do NOT stop the background task (Location.stopLocationUpdatesAsync)
      // here because we want tracking to continue securely when the user leaves this screen or apps.
    };
  }, []);

  const recenterCamera = () => {
    if (!currentLocation) return;
    mapRef.current?.animateCamera({
      center: currentLocation,
      pitch: is3D ? 45 : 0,
      heading: 0,
      zoom: 17,
    }, { duration: 1000 });
  };

  const toggle3D = () => {
    setIs3D(!is3D);
    mapRef.current?.animateCamera({ pitch: !is3D ? 45 : 0 }, { duration: 500 });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation={false} // Custom marker handles this
        showsTraffic={showTraffic}
        showsCompass={false}
        initialRegion={{
          latitude: farmLocation.latitude,
          longitude: farmLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {/* Breadcrumb Route */}
        {breadcrumbRoute.length > 1 && (
          <Polyline
            coordinates={breadcrumbRoute}
            strokeColor="#10B981"
            strokeWidth={5}
          />
        )}

        {/* Moving Marker */}
        {currentLocation && <SmoothMarker coordinate={currentLocation} />}

        {/* Destination Marker */}
        <Marker coordinate={farmLocation}>
          <Ionicons name="location-sharp" size={32} color="#EF4444" />
        </Marker>
      </MapView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(employee)/dashboard'))}
      >
        <Ionicons name="chevron-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Floating Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity style={styles.controlButton} onPress={recenterCamera}>
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowTraffic(!showTraffic)}
        >
          <MaterialCommunityIcons
            name="traffic-light"
            size={24}
            color={showTraffic ? '#10B981' : '#fff'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggle3D}>
          <MaterialCommunityIcons
            name={is3D ? 'video-3d' : 'map-outline'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Offline Warning */}
      {!telemetry.isOnline && (
        <View style={styles.offlinePill}>
          <Ionicons name="warning" size={16} color="#F59E0B" />
          <Text style={styles.offlineText}>Reconnecting to GPS...</Text>
        </View>
      )}

      {/* Bottom HUD */}
      <View style={styles.bottomHud}>
        <View style={styles.hudTopRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{telemetry.speed}</Text>
            <Text style={styles.statLabel}>km/h</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {telemetry.accuracy == null ? '--' : `±${Math.round(telemetry.accuracy)}m`}
            </Text>
            <Text style={styles.statLabel}>Signal</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons
              name="battery-80"
              size={24}
              color="#10B981"
            />
            <Text style={styles.statLabel}>
              {telemetry.battery == null ? '--' : `${telemetry.battery}%`}
            </Text>
          </View>
        </View>

        <View style={styles.geofenceCounter}>
          <Text style={styles.geofenceText}>
            {inGeofence
              ? 'Arrived at Farm'
              : 'Approaching Selvam Vetiver Farm'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push('/(employee)/visit/check-in')}
            style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
          >
            <Text style={styles.actionBtnText}>Check-in Farm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowTraffic(!showTraffic)}
            style={[styles.actionBtn, { backgroundColor: '#F59E0B' }]}
          >
            <Text style={styles.actionBtnText}>Traffic</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(employee)/sos')}
            style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
          >
            <Text style={styles.actionBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 100,
  },
  markerCore: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 2,
    marginTop: 20,
  },
  pulseAura: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: 26,
    borderRadius: 30,
    backgroundColor: '#10B981',
    zIndex: 1,
  },
  markerLabelContainer: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  markerLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  floatingControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 16,
    gap: 12,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  offlinePill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  offlineText: {
    color: '#F59E0B',
    fontWeight: '600',
    fontSize: 14,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  geofenceCounter: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  geofenceText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
