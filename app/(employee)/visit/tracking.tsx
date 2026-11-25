import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Circle, Marker, Polyline } from "../../../components/MapView";
import { FieldEmployeeMarker } from "../../../components/FieldEmployeeMarker";
import {
  ChevronLeft,
  Navigation,
  MapPin,
  ShieldAlert,
  X,
  Crosshair,
} from "lucide-react-native";
import { useTracking } from "../../../context/TrackingContext";
import { useService } from "../../../context/ServiceContext";
import { getAuthUser } from "../../../services/api";
import { saveLocationLocally, syncLocations } from "../../../utils/trackingManager";
import { haversineDistanceKm, sendLiveLocationPing } from "../../../utils/locationHelpers";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../../components/LiquidGlass";

interface Coord {
  latitude: number;
  longitude: number;
}

export default function TrackingScreen() {
  const { id, taskId, farmerId, siteId, siteName, siteAddress, lat, lng } = useLocalSearchParams<{
    id?: string;
    taskId?: string;
    farmerId?: string;
    siteId?: string;
    siteName?: string;
    siteAddress?: string;
    lat?: string;
    lng?: string;
  }>();

  const { startSession, stopSession } = useTracking();
  const { serviceConfig } = useService();
  const mapRef = useRef<MapView>(null);

  const parsedLat = lat && !Number.isNaN(Number(lat)) ? Number(lat) : null;
  const parsedLng = lng && !Number.isNaN(Number(lng)) ? Number(lng) : null;

  const [activeSite, setActiveSite] = useState<{
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    farmerId: string;
    taskId: string;
  }>({
    name: siteName || "",
    address: siteAddress || "",
    latitude: parsedLat,
    longitude: parsedLng,
    farmerId: farmerId || siteId || "",
    taskId: taskId || id || "",
  });

  const [staffName, setStaffName] = useState("Field Staff");
  const [currentCoord, setCurrentCoord] = useState<Coord | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<Coord[]>([]);
  const [distanceMovedKm, setDistanceMovedKm] = useState(0);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [showStopModal, setShowStopModal] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);

  const lastPointRef = useRef<{ coord: Coord; timestamp: number } | null>(null);
  const activeSessionRef = useRef<string>("");

  // Load user & fallback active task info from AsyncStorage (strictly real data)
  useEffect(() => {
    (async () => {
      const user = await getAuthUser();
      if (user?.name) setStaffName(user.name);

      if (!siteName || (!farmerId && !siteId)) {
        try {
          const rawTask = await AsyncStorage.getItem("@active_task");
          if (rawTask) {
            const t = JSON.parse(rawTask);
            setActiveSite((prev) => ({
              name: prev.name || t.targetEntity || t.facility || t.title || "",
              address: prev.address || t.address || "",
              latitude: prev.latitude ?? (t.latitude != null ? Number(t.latitude) : null),
              longitude: prev.longitude ?? (t.longitude != null ? Number(t.longitude) : null),
              farmerId: prev.farmerId || (t.farmerId ? String(t.farmerId) : ""),
              taskId: prev.taskId || (t.id ? String(t.id) : ""),
            }));
          }
        } catch {
          // Ignore storage parse error
        }
      }
    })();
  }, [farmerId, siteId, siteName]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Single uninterrupted real GPS subscription (never torn down by session state updates)
  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    const beginGpsWatch = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!isMounted) return;
      if (status !== "granted") {
        setGpsError("Location permission is required for live route tracking.");
        return;
      }

      const sid = await startSession(`visit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
      activeSessionRef.current = sid;

      try {
        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (isMounted && initial) {
          const firstCoord = {
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
          };
          setCurrentCoord(firstCoord);
          setRouteCoordinates([firstCoord]);
          setAccuracyMeters(initial.coords.accuracy ?? null);
          setSpeedKmh(
            initial.coords.speed && initial.coords.speed > 0
              ? Math.round(initial.coords.speed * 3.6)
              : 0
          );
          lastPointRef.current = { coord: firstCoord, timestamp: initial.timestamp };
          void saveLocationLocally([initial], sid);
          void sendLiveLocationPing(initial.coords);
          mapRef.current?.animateToRegion(
            {
              ...firstCoord,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            450
          );
        }
      } catch {
        // Watch subscription will acquire lock shortly
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (loc) => {
          if (!isMounted) return;
          const nextCoord = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
          const prev = lastPointRef.current;
          if (prev && loc.timestamp <= prev.timestamp) return;

          const deltaKm = prev ? haversineDistanceKm(prev.coord, nextCoord) : 0;
          lastPointRef.current = { coord: nextCoord, timestamp: loc.timestamp };

          setCurrentCoord(nextCoord);
          setRouteCoordinates(( existing ) => [...existing, nextCoord]);
          setDistanceMovedKm((d) => d + deltaKm);
          setAccuracyMeters(loc.coords.accuracy ?? null);
          setSpeedKmh(loc.coords.speed && loc.coords.speed > 0 ? Math.round(loc.coords.speed * 3.6) : 0);

          if (activeSessionRef.current) {
            void saveLocationLocally([loc], activeSessionRef.current);
          }
          void sendLiveLocationPing(loc.coords);
        }
      );

      if (!isMounted && subscription) {
        subscription.remove();
        subscription = null;
      }
    };

    void beginGpsWatch();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [startSession]);

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${String(hrs).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
    }
    return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
  };

  const recenterMap = () => {
    const target =
      currentCoord ||
      (activeSite.latitude != null && activeSite.longitude != null
        ? { latitude: activeSite.latitude, longitude: activeSite.longitude }
        : null);
    if (!target) return;
    mapRef.current?.animateToRegion(
      {
        ...target,
        latitudeDelta: 0.0045,
        longitudeDelta: 0.0045,
      },
      400
    );
  };

  const distanceToDestinationKm =
    currentCoord && activeSite.latitude != null && activeSite.longitude != null
      ? haversineDistanceKm(currentCoord, {
          latitude: activeSite.latitude,
          longitude: activeSite.longitude,
        })
      : null;

  const handleArriveCheckIn = async () => {
    await syncLocations();
    router.push({
      pathname: "/(employee)/visit/check-in",
      params: {
        taskId: activeSite.taskId,
        farmerId: activeSite.farmerId,
        siteName: activeSite.name,
        siteAddress: activeSite.address,
        lat: activeSite.latitude != null ? String(activeSite.latitude) : "",
        lng: activeSite.longitude != null ? String(activeSite.longitude) : "",
        liveLat: currentCoord ? String(currentCoord.latitude) : "",
        liveLng: currentCoord ? String(currentCoord.longitude) : "",
        distanceKm: distanceMovedKm.toFixed(2),
      },
    } as any);
  };

  const confirmStop = async () => {
    if (!stopReason.trim()) {
      showToast({
        title: "Reason Required",
        message: "Please enter a brief reason before ending tracking.",
        type: "error",
      });
      return;
    }
    setSubmittingStop(true);
    try {
      await stopSession();
      setShowStopModal(false);
      router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard");
    } finally {
      setSubmittingStop(false);
    }
  };

  const mapCenter =
    currentCoord ||
    (activeSite.latitude != null && activeSite.longitude != null
      ? { latitude: activeSite.latitude, longitude: activeSite.longitude }
      : null);

  const accentColor = serviceConfig.themeColor || "#059669";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {mapCenter ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          mapType="standard"
          userInterfaceStyle="light"
          showsUserLocation
          showsMyLocationButton={false}
          showsCompass={false}
          initialRegion={{
            latitude: mapCenter.latitude,
            longitude: mapCenter.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          }}
        >
          {routeCoordinates.length > 1 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={accentColor}
              strokeWidth={5}
            />
          )}

          {currentCoord && accuracyMeters != null && accuracyMeters > 0 && (
            <Circle
              center={currentCoord}
              radius={Math.min(accuracyMeters, 150)}
              fillColor={`${accentColor}20`}
              strokeColor={`${accentColor}75`}
              strokeWidth={1.5}
            />
          )}

          {currentCoord && (
            <FieldEmployeeMarker
              coordinate={currentCoord}
              name={staffName}
              accentColor={accentColor}
            />
          )}

          {activeSite.latitude != null && activeSite.longitude != null && (
            <Marker
              coordinate={{
                latitude: activeSite.latitude,
                longitude: activeSite.longitude,
              }}
              title={activeSite.name || "Target Site"}
              description={activeSite.address || undefined}
              pinColor="#dc2626"
            />
          )}
        </MapView>
      ) : (
        <View style={styles.waitingContainer}>
          {gpsError ? (
            <ShieldAlert size={38} color="#ef4444" style={{ marginBottom: 12 }} />
          ) : (
            <ActivityIndicator size="large" color={accentColor} style={{ marginBottom: 12 }} />
          )}
          <Text style={styles.waitingTitle}>
            {gpsError ? "GPS Access Needed" : "Acquiring Live Satellite Lock..."}
          </Text>
          <Text style={styles.waitingSub}>
            {gpsError || "Connecting to device GPS to stream your real-time route to Admin Monitor."}
          </Text>
        </View>
      )}

      {/* NEAT NON-OVERLAPPING TOP & BOTTOM HUD */}
      <SafeAreaView style={styles.overlaySafe} pointerEvents="box-none">
        <View style={styles.topSection} pointerEvents="box-none">
          {/* Balanced 3-Column Header Row */}
          <View style={styles.headerRow}>
            <LiquidGlassIconButton
              variant="light"
              size={44}
              onPress={() => setShowStopModal(true)}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </LiquidGlassIconButton>

            <LiquidGlassPill
              variant="light"
              contentStyle={{ paddingHorizontal: 16, paddingVertical: 9 }}
            >
              <View style={[styles.liveDot, { backgroundColor: currentCoord ? "#10b981" : "#f59e0b" }]} />
              <Text style={styles.titlePillText}>
                {currentCoord ? "Live Route Syncing" : "Locating..."}
              </Text>
            </LiquidGlassPill>

            <LiquidGlassIconButton
              variant="light"
              size={44}
              onPress={recenterMap}
            >
              <Crosshair size={20} color="#0f172a" />
            </LiquidGlassIconButton>
          </View>

          {/* Neatly Aligned Destination Info Card */}
          <LiquidGlassCard
            variant="light"
            borderRadius={22}
            style={styles.siteCardOuter}
            contentStyle={styles.siteCardInner}
          >
            <LiquidGlassIconBadge
              size={42}
              borderRadius={14}
              variant="light"
              tintColor={accentColor}
              style={{ marginRight: 12 }}
            >
              <MapPin size={20} color={accentColor} />
            </LiquidGlassIconBadge>

            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.siteName} numberOfLines={1}>
                {activeSite.name || "Active Field Route"}
              </Text>
              <Text style={styles.siteAddr} numberOfLines={1}>
                {activeSite.address
                  ? activeSite.address
                  : currentCoord
                  ? `${currentCoord.latitude.toFixed(5)}° N, ${currentCoord.longitude.toFixed(5)}° E`
                  : "Streaming live telemetry to Web Admin"}
              </Text>
            </View>

            {distanceToDestinationKm != null && (
              <View style={[styles.etaBadge, { backgroundColor: `${accentColor}18` }]}>
                <Text style={[styles.etaBadgeText, { color: accentColor }]}>
                  {distanceToDestinationKm < 1
                    ? `${Math.round(distanceToDestinationKm * 1000)} m`
                    : `${distanceToDestinationKm.toFixed(1)} km`}
                </Text>
              </View>
            )}
          </LiquidGlassCard>
        </View>

        {/* Neatly Aligned Bottom Telemetry & Arrival Card */}
        <LiquidGlassCard
          variant="light"
          borderRadius={28}
          style={styles.bottomCardOuter}
          contentStyle={styles.bottomCardInner}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: accentColor }]}>
                {formatDuration(elapsedSeconds)}
              </Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{distanceMovedKm.toFixed(2)} km</Text>
              <Text style={styles.statLabel}>Traveled</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{speedKmh} km/h</Text>
              <Text style={styles.statLabel}>Speed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {accuracyMeters == null ? "--" : `±${Math.round(accuracyMeters)}m`}
              </Text>
              <Text style={styles.statLabel}>GPS Lock</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <LiquidGlassButton
              onPress={handleArriveCheckIn}
              variant="tinted"
              tintColor="rgba(6, 34, 20, 0.90)"
              dropletColor="#4ade80"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 16 }}
            >
              <Navigation size={18} color="#4ade80" style={{ marginRight: 8 }} />
              <Text style={styles.btnText}>Arrived • Check In Now</Text>
            </LiquidGlassButton>
          </View>
        </LiquidGlassCard>
      </SafeAreaView>

      {/* STOP TRACKING MODAL */}
      <Modal visible={showStopModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <LiquidGlassCard
            variant="light"
            borderRadius={28}
            style={styles.modalSheetOuter}
            contentStyle={styles.modalSheetInner}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ShieldAlert size={22} color="#ef4444" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>End Route Tracking?</Text>
              </View>
              <LiquidGlassIconButton
                variant="light"
                size={36}
                onPress={() => setShowStopModal(false)}
              >
                <X size={18} color="#64748b" />
              </LiquidGlassIconButton>
            </View>

            <Text style={styles.modalDesc}>
              Enter a brief note if you are pausing or rescheduling before site check-in.
            </Text>

            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                textAlignVertical="top"
                placeholder="e.g. Client rescheduled visit, returning to base..."
                placeholderTextColor="#94a3b8"
                value={stopReason}
                onChangeText={setStopReason}
              />
            </View>

            <LiquidGlassButton
              disabled={submittingStop}
              onPress={confirmStop}
              variant="tinted"
              tintColor="rgba(239, 68, 68, 0.86)"
              dropletColor="#ef4444"
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 15 }}
            >
              <Text style={styles.btnText}>
                {submittingStop ? "Stopping..." : "Stop Tracking & Exit"}
              </Text>
            </LiquidGlassButton>
          </LiquidGlassCard>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  waitingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#f1f5f9",
  },
  waitingTitle: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 19,
    textAlign: "center",
  },
  waitingSub: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  overlaySafe: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },
  titlePillText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
  },
  siteCardOuter: {
    marginTop: 10,
  },
  siteCardInner: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  siteName: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  },
  siteAddr: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 12,
    marginTop: 2,
  },
  etaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaBadgeText: {
    fontFamily: "Brandon-Bold",
    fontSize: 12,
  },
  bottomCardOuter: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bottomCardInner: {
    padding: 18,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(15, 23, 42, 0.12)",
  },
  btnText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 15,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  modalSheetOuter: {
    width: "100%",
  },
  modalSheetInner: {
    padding: 24,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 20,
  },
  modalDesc: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    marginBottom: 14,
  },
  textAreaBox: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    height: 92,
    marginBottom: 18,
  },
  textArea: {
    flex: 1,
    color: "#0f172a",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
  },
});
