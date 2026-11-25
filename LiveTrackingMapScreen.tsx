import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Circle, Marker, Polyline } from "./components/MapView";
import { FieldEmployeeMarker } from "./components/FieldEmployeeMarker";
import { useTracking } from "./context/TrackingContext";
import { useService } from "./context/ServiceContext";
import { api, getAuthUser } from "./services/api";
import { saveLocationLocally } from "./utils/trackingManager";
import { haversineDistanceKm, sendLiveLocationPing } from "./utils/locationHelpers";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface TelemetryData {
  speed: number;
  accuracy: number | null;
  distanceKm: number;
  isOnline: boolean;
}

const MIN_MOVEMENT_METERS = 2;

export default function LiveTrackingMapScreen() {
  const insets = useSafeAreaInsets();
  const { startSession } = useTracking();
  const { serviceConfig } = useService();
  const mapRef = useRef<MapView>(null);

  const [staffName, setStaffName] = useState("Field Staff");
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [assignedSites, setAssignedSites] = useState<any[]>([]);
  const [gpsDenied, setGpsDenied] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    speed: 0,
    accuracy: null,
    distanceKm: 0,
    isOnline: false,
  });
  const [showTraffic, setShowTraffic] = useState(false);
  const [breadcrumbRoute, setBreadcrumbRoute] = useState<Coordinate[]>([]);

  const lastAcceptedRef = useRef<{ coordinate: Coordinate; timestamp: number } | null>(null);
  const activeSessionRef = useRef<string>("");

  // Load real employee name and real assigned sites
  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      const storedName = authUser?.name || (await AsyncStorage.getItem("userName"));
      if (storedName) setStaffName(storedName);

      try {
        const res = await api.get("/employee/sites");
        setAssignedSites(Array.isArray(res?.sites) ? res.sites : []);
      } catch {
        setAssignedSites([]);
      }
    })();
  }, []);

  // Strictly real device GPS tracking without session-restart loops
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    const startTracking = async () => {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;
      if (foregroundStatus !== "granted") {
        setGpsDenied(true);
        return;
      }

      const sid = await startSession(`map_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
      activeSessionRef.current = sid;

      try {
        const initialFix = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
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
            speed:
              initialFix.coords.speed && initialFix.coords.speed > 0
                ? Math.round(initialFix.coords.speed * 3.6)
                : 0,
            isOnline: true,
          }));
          void saveLocationLocally([initialFix], sid);
          void sendLiveLocationPing(initialFix.coords);
          mapRef.current?.animateToRegion(
            {
              latitude: initialCoord.latitude,
              longitude: initialCoord.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            450
          );
        }
      } catch {
        // Watch subscription will acquire initial fix
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: MIN_MOVEMENT_METERS,
        },
        (location) => {
          if (!isMounted) return;

          const { latitude, longitude, accuracy, speed } = location.coords;
          const newCoord = { latitude, longitude };
          const lastAccepted = lastAcceptedRef.current;

          if (lastAccepted && location.timestamp <= lastAccepted.timestamp) return;

          const deltaKm = lastAccepted ? haversineDistanceKm(lastAccepted.coordinate, newCoord) : 0;
          if (activeSessionRef.current) {
            void saveLocationLocally([location], activeSessionRef.current);
          }
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
        }
      );

      if (!isMounted && subscription) {
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
  }, [startSession]);

  const pinnedSites = useMemo(
    () => assignedSites.filter((s) => s.latitude != null && s.longitude != null),
    [assignedSites]
  );

  const nearestSiteInfo = useMemo(() => {
    if (!currentLocation || pinnedSites.length === 0) {
      return assignedSites[0] ? { site: assignedSites[0], distKm: null } : null;
    }
    let best = pinnedSites[0];
    let bestDist = haversineDistanceKm(currentLocation, {
      latitude: Number(best.latitude),
      longitude: Number(best.longitude),
    });
    for (let i = 1; i < pinnedSites.length; i++) {
      const d = haversineDistanceKm(currentLocation, {
        latitude: Number(pinnedSites[i].latitude),
        longitude: Number(pinnedSites[i].longitude),
      });
      if (d < bestDist) {
        best = pinnedSites[i];
        bestDist = d;
      }
    }
    return { site: best, distKm: bestDist };
  }, [assignedSites, currentLocation, pinnedSites]);

  const recenterCamera = () => {
    const target =
      currentLocation ||
      (pinnedSites[0]
        ? { latitude: Number(pinnedSites[0].latitude), longitude: Number(pinnedSites[0].longitude) }
        : null);
    if (!target) return;
    mapRef.current?.animateToRegion(
      {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.0045,
        longitudeDelta: 0.0045,
      },
      450
    );
  };

  const mapAnchor =
    currentLocation ||
    (pinnedSites[0]
      ? { latitude: Number(pinnedSites[0].latitude), longitude: Number(pinnedSites[0].longitude) }
      : null);

  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {mapAnchor ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          mapType="standard"
          userInterfaceStyle="light"
          showsUserLocation
          showsMyLocationButton={false}
          showsTraffic={showTraffic}
          showsCompass={false}
          initialRegion={{
            latitude: mapAnchor.latitude,
            longitude: mapAnchor.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          }}
        >
          {breadcrumbRoute.length > 1 && (
            <Polyline
              coordinates={breadcrumbRoute}
              strokeColor={themeColor}
              strokeWidth={5}
            />
          )}

          {currentLocation && telemetry.accuracy && telemetry.accuracy > 0 && (
            <Circle
              center={currentLocation}
              radius={Math.min(telemetry.accuracy, 150)}
              fillColor={`${themeColor}22`}
              strokeColor={`${themeColor}88`}
              strokeWidth={1.5}
            />
          )}

          {currentLocation && (
            <FieldEmployeeMarker
              coordinate={currentLocation}
              name={staffName}
              accentColor={themeColor}
            />
          )}

          {pinnedSites.map((site) => (
            <Marker
              key={site.id}
              coordinate={{
                latitude: Number(site.latitude),
                longitude: Number(site.longitude),
              }}
              title={site.name}
              description={site.address || site.site_code}
              pinColor="#0284c7"
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.waitingMap}>
          {!gpsDenied && <ActivityIndicator size="large" color={themeColor} style={{ marginBottom: 12 }} />}
          <Text style={styles.waitingTitle}>
            {gpsDenied ? "Location Permission Disabled" : "Acquiring Live GPS Position..."}
          </Text>
          <Text style={styles.waitingSubtitle}>
            {gpsDenied
              ? "Enable location permission in settings to stream live telemetry."
              : "Connecting to GPS satellites for real-time route tracking."}
          </Text>
        </View>
      )}

      {/* NEATLY ALIGNED TOP HEADER BAR (ZERO OVERLAP) */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.roundControl}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
        >
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <View style={styles.statusPill}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: telemetry.isOnline ? "#10B981" : "#F59E0B" },
            ]}
          />
          <Text style={styles.statusPillText} numberOfLines={1}>
            {telemetry.isOnline
              ? `GPS Live • ${assignedSites.length} ${assignedSites.length === 1 ? "Site" : "Sites"}`
              : "Locking GPS..."}
          </Text>
        </View>

        <TouchableOpacity style={styles.roundControl} onPress={recenterCamera}>
          <MaterialCommunityIcons name="crosshairs-gps" size={21} color="#0F172A" />
        </TouchableOpacity>
      </View>

      {/* FLOATING TRAFFIC TOGGLE BELOW TOP BAR */}
      <View style={[styles.secondaryControls, { top: insets.top + 66 }]}>
        <TouchableOpacity
          style={[
            styles.roundControl,
            showTraffic && { borderColor: themeColor, backgroundColor: `${themeColor}15` },
          ]}
          onPress={() => setShowTraffic(!showTraffic)}
        >
          <MaterialCommunityIcons
            name="traffic-light"
            size={20}
            color={showTraffic ? themeColor : "#0F172A"}
          />
        </TouchableOpacity>
      </View>

      {/* CLEAN BOTTOM TELEMETRY & QUICK DISPATCH HUD */}
      <View style={[styles.bottomHud, { paddingBottom: Math.max(insets.bottom + 14, 22) }]}>
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
              {telemetry.accuracy == null ? "--" : `±${Math.round(telemetry.accuracy)}m`}
            </Text>
            <Text style={styles.statLabel}>GPS accuracy</Text>
          </View>
        </View>

        <View
          style={[
            styles.geofenceBanner,
            { backgroundColor: `${themeColor}12`, borderColor: `${themeColor}38` },
          ]}
        >
          <Text numberOfLines={1} style={[styles.geofenceText, { color: themeColor }]}>
            {nearestSiteInfo
              ? `${nearestSiteInfo.site.name}${
                  nearestSiteInfo.distKm != null
                    ? nearestSiteInfo.distKm < 1
                      ? ` • ${Math.round(nearestSiteInfo.distKm * 1000)}m away`
                      : ` • ${nearestSiteInfo.distKm.toFixed(1)} km away`
                    : ""
                }`
              : currentLocation
              ? `Live Coordinates: ${currentLocation.latitude.toFixed(5)}°, ${currentLocation.longitude.toFixed(5)}°`
              : `${serviceConfig.name} • Synced with Web Admin`}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(employee)/visit/check-in",
                params: nearestSiteInfo?.site
                  ? {
                      farmerId: String(nearestSiteInfo.site.id),
                      siteName: nearestSiteInfo.site.name,
                      siteAddress: nearestSiteInfo.site.address || "",
                      lat: nearestSiteInfo.site.latitude != null ? String(nearestSiteInfo.site.latitude) : "",
                      lng: nearestSiteInfo.site.longitude != null ? String(nearestSiteInfo.site.longitude) : "",
                    }
                  : {},
              } as any)
            }
            style={[styles.actionBtn, { backgroundColor: themeColor }]}
          >
            <Text style={styles.actionBtnText}>Site Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(employee)/tasks")}
            style={[styles.actionBtn, { backgroundColor: "#0F172A" }]}
          >
            <Text style={styles.actionBtnText}>{serviceConfig.vocab.tasks}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(employee)/sos")}
            style={[styles.actionBtn, { backgroundColor: "#EF4444", flex: 0.65 }]}
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
    backgroundColor: "#F1F5F9",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  waitingMap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F1F5F9",
  },
  waitingTitle: {
    color: "#0F172A",
    fontFamily: "Brandon-Bold",
    fontSize: 19,
    textAlign: "center",
  },
  waitingSubtitle: {
    color: "#64748B",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryControls: {
    position: "absolute",
    right: 16,
  },
  roundControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxWidth: "62%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  statusPillText: {
    color: "#0F172A",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
  },
  bottomHud: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  hudTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#0F172A",
    fontFamily: "Brandon-Bold",
    fontSize: 20,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: "#64748B",
    fontFamily: "Brandon-Medium",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  geofenceBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
  },
  geofenceText: {
    fontFamily: "Brandon-Bold",
    fontSize: 13,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
  },
});
