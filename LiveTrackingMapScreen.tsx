import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Polyline, UrlTile } from 'react-native-maps';
import { FieldEmployeeMarker } from './components/FieldEmployeeMarker';
import { useTracking } from './context/TrackingContext';
import { useService } from './context/ServiceContext';
import { getAuthUser } from './services/api';
import { saveLocationLocally } from './utils/trackingManager';
import {
  haversineDistanceKm,
  LIGHT_MAP_TILE_URL,
  sendLiveLocationPing,
} from './utils/locationHelpers';

// --- Constants & Types ---
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface TelemetryData {
  speed: number;
  accuracy: number | null;
  battery: number | null;
  distanceKm: number;
  isOnline: boolean;
}

const MIN_MOVEMENT_METERS = 2;

const defaultCityCoord: Coordinate = {
  latitude: 13.0827,
  longitude: 80.2707,
};

export default function LiveTrackingMapScreen() {
  const { sessionId, isTracking, startSession } = useTracking();
  const { serviceConfig } = useService();
  const mapRef = useRef<MapView>(null);
  const [staffName, setStaffName] = useState('Field Executive');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    accuracy: null,
    battery: 92,
    distanceKm: 0,
    isOnline: false,
  });
  const [is3D, setIs3D] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);

  const [breadcrumbRoute, setBreadcrumbRoute] = useState<Coordinate[]>([]);
  const lastAcceptedRef = useRef<{ coordinate: Coordinate; timestamp: number } | null>(null);

  const destinationSite = serviceConfig.sampleEntities[0];

  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      const storedName = authUser?.name || (await AsyncStorage.getItem('userName'));
      if (storedName) setStaffName(storedName);
    })();
  }, []);

  // Strictly real device GPS tracking (zero simulated movement)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted || foregroundStatus !== 'granted') {
        return;
      }

      if (!isTracking || !sessionId) {
        await startSession(`map_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
      }

      try {
        const initialFix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (isMounted && initialFix) {
          const initialCoord = {
            latitude: initialFix.coords.latitude,
            longitude: initialFix.coords.longitude,
          };
          setCurrentLocation(initialCoord);
          setBreadcrumbRoute([initialCoord]);
          lastAcceptedRef.current = { coordinate: initialCoord, timestamp: initialFix.timestamp };
          setTelemetry((prev) => ({
            ...prev,
            accuracy: initialFix.coords.accuracy,
            speed: initialFix.coords.speed && initialFix.coords.speed > 0 ? Math.round(initialFix.coords.speed * 3.6) : 0,
            isOnline: true,
          }));
          mapRef.current?.animateToRegion(
            {
              latitude: initialCoord.latitude,
              longitude: initialCoord.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            },
            500
          );
          void sendLiveLocationPing(initialFix.coords);
        }
      } catch {
        // Initial GPS fix pending watchPositionAsync
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        async (location) => {
          if (!isMounted) return;

          const { latitude, longitude, accuracy, speed } = location.coords;
          const newCoord = { latitude, longitude };
          const lastAccepted = lastAcceptedRef.current;

          if (lastAccepted && location.timestamp <= lastAccepted.timestamp) return;

          const deltaKm = lastAccepted ? haversineDistanceKm(lastAccepted.coordinate, newCoord) : 0;
          const activeSessionId = sessionId ?? (await AsyncStorage.getItem('@current_tracking_session'));
          if (activeSessionId) void saveLocationLocally([location], activeSessionId);
          void sendLiveLocationPing(location.coords);

          setCurrentLocation(newCoord);
          setBreadcrumbRoute((prev) => [...prev, newCoord]);
          lastAcceptedRef.current = { coordinate: newCoord, timestamp: location.timestamp };

          setTelemetry((prev) => ({
            ...prev,
            speed: speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0,
            accuracy,
            distanceKm: prev.distanceKm + deltaKm,
            isOnline: true,
          }));

          mapRef.current?.animateToRegion(
            {
              latitude: newCoord.latitude,
              longitude: newCoord.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            },
            500
          );
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
    };
  }, [isTracking, sessionId, startSession]);

  const recenterCamera = () => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      },
      500
    );
  };

  const toggle3D = () => {
    setIs3D(!is3D);
    mapRef.current?.animateCamera({ pitch: !is3D ? 45 : 0 }, { duration: 400 });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType={Platform.OS === 'android' ? 'none' : 'standard'}
        userInterfaceStyle="light"
        showsUserLocation
        showsMyLocationButton={false}
        showsTraffic={showTraffic}
        showsCompass={false}
        initialRegion={{
          latitude: currentLocation?.latitude || defaultCityCoord.latitude,
          longitude: currentLocation?.longitude || defaultCityCoord.longitude,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
      >
        <UrlTile
          urlTemplate={LIGHT_MAP_TILE_URL}
          maximumZ={20}
          maximumNativeZ={19}
          doubleTileSize
          flipY={false}
          shouldReplaceMapContent={Platform.OS === 'ios'}
          zIndex={1}
        />

        {breadcrumbRoute.length > 1 && (
          <Polyline
            coordinates={breadcrumbRoute}
            strokeColor={serviceConfig.themeColor}
            strokeWidth={5}
          />
        )}

        {currentLocation && (
          <FieldEmployeeMarker
            coordinate={currentLocation}
            name={staffName}
            accentColor={serviceConfig.themeColor}
          />
        )}
      </MapView>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(employee)/dashboard'))}
      >
        <Ionicons name="chevron-back" size={24} color="#0F172A" />
      </TouchableOpacity>

      {/* Floating Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity style={styles.controlButton} onPress={recenterCamera}>
          <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#0F172A" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={() => setShowTraffic(!showTraffic)}>
          <MaterialCommunityIcons
            name="traffic-light"
            size={22}
            color={showTraffic ? serviceConfig.themeColor : '#0F172A'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={toggle3D}>
          <MaterialCommunityIcons
            name={is3D ? 'video-3d' : 'map-outline'}
            size={22}
            color="#0F172A"
          />
        </TouchableOpacity>
      </View>

      {/* GPS Signal Status */}
      {!telemetry.isOnline && (
        <View style={styles.offlinePill}>
          <Ionicons name="locate" size={16} color="#D97706" />
          <Text style={styles.offlineText}>Waiting for real GPS lock...</Text>
        </View>
      )}

      {/* White Light-Mode Bottom HUD */}
      <View style={styles.bottomHud}>
        <View style={styles.hudTopRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{telemetry.speed}</Text>
            <Text style={styles.statLabel}>km/h</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{telemetry.distanceKm.toFixed(2)}</Text>
            <Text style={styles.statLabel}>km moved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {telemetry.accuracy == null ? '--' : `±${Math.round(telemetry.accuracy)}m`}
            </Text>
            <Text style={styles.statLabel}>GPS</Text>
          </View>
        </View>

        <View style={[styles.geofenceCounter, { backgroundColor: `${serviceConfig.themeColor}14`, borderColor: `${serviceConfig.themeColor}40` }]}>
          <Text style={[styles.geofenceText, { color: serviceConfig.themeColor }]}>
            {serviceConfig.label} • {destinationSite?.name || serviceConfig.vocab.entitySingular}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => router.push('/(employee)/visit/check-in')}
            style={[styles.actionBtn, { backgroundColor: serviceConfig.themeColor }]}
          >
            <Text style={styles.actionBtnText}>Field Check-In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(employee)/tasks')}
            style={[styles.actionBtn, { backgroundColor: '#0F172A' }]}
          >
            <Text style={styles.actionBtnText}>{serviceConfig.vocab.tasks}</Text>
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
    backgroundColor: '#FFFFFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 100,
  },
  markerCore: {
    width: 34,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 2,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pulseAura: {
    position: 'absolute',
    width: 60,
    height: 60,
    top: 26,
    borderRadius: 30,
    zIndex: 1,
  },
  markerLabelContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  markerLabel: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    left: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 40,
    right: 16,
    gap: 10,
  },
  controlButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  offlinePill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 42,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  offlineText: {
    color: '#B45309',
    fontWeight: '600',
    fontSize: 13,
  },
  bottomHud: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 22,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  hudTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: '#E2E8F0',
  },
  geofenceCounter: {
    padding: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  geofenceText: {
    fontWeight: '700',
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
