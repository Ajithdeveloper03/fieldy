import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Circle, Marker, Polyline } from "../../../components/MapView";
import { FieldEmployeeMarker } from "../../../components/FieldEmployeeMarker";
import { api, getAuthUser } from "../../../services/api";
import {
  ChevronLeft,
  Navigation,
  ShieldAlert,
  Crosshair,
  X,
} from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";
import { useTracking } from "../../../context/TrackingContext";
import { saveLocationLocally } from "../../../utils/trackingManager";
import {
  haversineDistanceKm,
  sendLiveLocationPing,
} from "../../../utils/locationHelpers";
import {
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function TrackingScreen() {
  const { id, taskId, siteName, siteAddress, farmerId, lat, lng } =
    useLocalSearchParams<{
      id?: string;
      taskId?: string;
      siteName?: string;
      siteAddress?: string;
      farmerId?: string;
      lat?: string;
      lng?: string;
    }>();
  const { serviceConfig } = useService();
  const { sessionId, isTracking, startSession, stopSession } = useTracking();
  const mapRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const sessionStateRef = useRef({ sessionId, isTracking });

  const [activeSite, setActiveSite] = useState({
    name: siteName || "Assigned Site",
    address: siteAddress || "Field Location",
    latitude: lat ? Number(lat) : 13.0827,
    longitude: lng ? Number(lng) : 80.2707,
    hasSiteCoords: Boolean(lat && lng),
    farmerId: farmerId || "",
    taskId: taskId || id || "",
  });

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showStopModal, setShowStopModal] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);
  const [staffName, setStaffName] = useState("You");

  const accentColor = serviceConfig.themeColor || "#16a34a";

  useEffect(() => {
    sessionStateRef.current = { sessionId, isTracking };
  }, [sessionId, isTracking]);

  useEffect(() => {
    getAuthUser()
      .then((user) => {
        if (user?.name) setStaffName(user.name.split(" ")[0]);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedTask = await AsyncStorage.getItem("@active_task");
        if (storedTask && !siteName) {
          const parsed = JSON.parse(storedTask);
          setActiveSite((prev) => ({
            name: parsed.facility || parsed.targetEntity || prev.name,
            address: parsed.address || prev.address,
            latitude: parsed.latitude ? Number(parsed.latitude) : prev.latitude,
            longitude: parsed.longitude ? Number(parsed.longitude) : prev.longitude,
            hasSiteCoords: Boolean(parsed.latitude && parsed.longitude) || prev.hasSiteCoords,
            farmerId: parsed.farmerId ? String(parsed.farmerId) : prev.farmerId,
            taskId: parsed.id ? String(parsed.id) : prev.taskId,
          }));
          return;
        }
        if (!siteName) {
          const sitesRes = await api.get("/employee/sites").catch(() => null);
          const first = Array.isArray(sitesRes?.sites) ? sitesRes.sites[0] : null;
          if (first) {
            setActiveSite((prev) => ({
              name: first.name || prev.name,
              address: first.site_address || first.address || prev.address,
              latitude: first.latitude ? Number(first.latitude) : prev.latitude,
              longitude: first.longitude ? Number(first.longitude) : prev.longitude,
              hasSiteCoords: Boolean(first.latitude && first.longitude) || prev.hasSiteCoords,
              farmerId: String(first.site_contact_id || first.id || prev.farmerId),
              taskId: prev.taskId,
            }));
          }
        }
      } catch {
        // Keep current site params
      }
    })();
  }, [siteName]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let isMounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted" || !isMounted) return;

        const visitSessionId =
          sessionStateRef.current.sessionId && sessionStateRef.current.isTracking
            ? sessionStateRef.current.sessionId
            : `visit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        if (!sessionStateRef.current.isTracking || !sessionStateRef.current.sessionId) {
          await startSession(visitSessionId);
        }

        const initial = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (isMounted && initial) {
          const firstCoord = {
            latitude: initial.coords.latitude,
            longitude: initial.coords.longitude,
          };
          setCurrentLocation(initial);
          setRouteCoordinates([firstCoord]);
          lastCoordRef.current = firstCoord;
          void saveLocationLocally([initial], visitSessionId);
          void sendLiveLocationPing(initial.coords);
          mapRef.current?.animateToRegion(
            {
              latitude: firstCoord.latitude,
              longitude: firstCoord.longitude,
              latitudeDelta: 0.004,
              longitudeDelta: 0.004,
            },
            500
          );
        }

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 2000,
            distanceInterval: 1,
          },
          (location) => {
            if (!isMounted) return;
            const nextCoord = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            const prevCoord = lastCoordRef.current;
            if (prevCoord) {
              const movedKm = haversineDistanceKm(prevCoord, nextCoord);
              if (movedKm > 0) {
                setTotalDistanceKm((d) => d + movedKm);
              }
            }
            lastCoordRef.current = nextCoord;
            setCurrentLocation(location);
            setRouteCoordinates((prev) => [...prev, nextCoord]);
            setSpeed(location.coords.speed && location.coords.speed > 0 ? location.coords.speed : 0);

            void saveLocationLocally([location], visitSessionId);
            void sendLiveLocationPing(location.coords);
            mapRef.current?.animateToRegion(
              {
                latitude: nextCoord.latitude,
                longitude: nextCoord.longitude,
                latitudeDelta: 0.004,
                longitudeDelta: 0.004,
              },
              500
            );
          }
        );

        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } catch (e) {
        console.log("Location watch notice:", e);
      }
    })();

    return () => {
      isMounted = false;
      if (locationSubscription) locationSubscription.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startSession]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const recenterOnUser = () => {
    if (!currentLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      },
      450
    );
  };

  const handleAttemptStop = () => setShowStopModal(true);
  const confirmStop = async () => {
    if (stopReason.trim().length < 3 && adminOtp.trim().length < 4) {
      showToast({
        title: "Reason Required",
        message: "Provide a stop reason to end visit tracking early.",
        type: "error",
      });
      return;
    }
    setSubmittingStop(true);
    await stopSession().catch(() => null);
    setSubmittingStop(false);
    setShowStopModal(false);
    showToast({
      title: "Tracking Ended",
      message: "Visit transit cancelled.",
      type: "info",
    });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(employee)/dashboard");
    }
  };

  const displaySpeed = (speed * 3.6).toFixed(1);
  const displayDistance = totalDistanceKm.toFixed(2);
  const activeCoord = currentLocation
    ? {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }
    : {
        latitude: activeSite.latitude,
        longitude: activeSite.longitude,
      };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType="standard"
        userInterfaceStyle="light"
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        initialRegion={{
          latitude: activeCoord.latitude,
          longitude: activeCoord.longitude,
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

        {currentLocation?.coords?.accuracy && currentLocation.coords.accuracy > 0 && (
          <Circle
            center={activeCoord}
            radius={currentLocation.coords.accuracy}
            fillColor={`${accentColor}22`}
            strokeColor={`${accentColor}88`}
            strokeWidth={1.5}
          />
        )}

        {currentLocation && (
          <FieldEmployeeMarker
            coordinate={activeCoord}
            name={staffName}
            accentColor={accentColor}
          />
        )}

        {activeSite.hasSiteCoords && (
          <Marker
            coordinate={{
              latitude: activeSite.latitude,
              longitude: activeSite.longitude,
            }}
            title={activeSite.name}
            pinColor={accentColor}
          />
        )}
      </MapView>

      <SafeAreaView style={styles.overlaySafe} pointerEvents="box-none">
        {/* TOP HEADER & DESTINATION CARD */}
        <View style={styles.topSection} pointerEvents="box-none">
          <View style={styles.headerRow}>
            <LiquidGlassIconButton
              variant="light"
              size={42}
              onPress={() => router.back()}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </LiquidGlassIconButton>
            <LiquidGlassCard
              variant="light"
              borderRadius={999}
              contentStyle={styles.titlePillContent}
            >
              <Text style={styles.titlePillText}>{serviceConfig.shortName} Live GPS</Text>
            </LiquidGlassCard>
            <LiquidGlassIconButton
              variant="light"
              size={42}
              onPress={recenterOnUser}
            >
              <Crosshair size={20} color="#0f172a" />
            </LiquidGlassIconButton>
          </View>

          <LiquidGlassCard
            variant="light"
            borderRadius={20}
            style={styles.siteCardOuter}
            contentStyle={styles.siteCardInner}
          >
            <LiquidGlassIconBadge
              variant="light"
              size={42}
              borderRadius={21}
              tintColor={accentColor}
              style={{ marginRight: 12 }}
            >
              <Navigation size={20} color={accentColor} />
            </LiquidGlassIconBadge>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.siteName} numberOfLines={1}>
                {activeSite.name}
              </Text>
              <Text style={styles.siteAddr} numberOfLines={1}>
                {currentLocation
                  ? `${activeCoord.latitude.toFixed(5)}° N, ${activeCoord.longitude.toFixed(5)}° E`
                  : activeSite.address}
              </Text>
            </View>
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </LiquidGlassCard>
        </View>

        {/* BOTTOM HUD CARD */}
        <LiquidGlassCard
          variant="light"
          borderRadius={28}
          style={styles.bottomCardOuter}
          contentStyle={styles.bottomCardInner}
        >
          <View style={styles.durationWrap}>
            <Text style={styles.durationLabel}>Visit Transit Duration</Text>
            <Text style={[styles.durationValue, { color: accentColor }]}>
              {formatDuration(duration)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayDistance} km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displaySpeed} km/h</Text>
              <Text style={styles.statLabel}>Speed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentLocation?.coords?.accuracy != null
                  ? `±${Math.round(currentLocation.coords.accuracy)}m`
                  : "--"}
              </Text>
              <Text style={styles.statLabel}>GPS Accuracy</Text>
            </View>
          </View>

          <LiquidGlassButton
            onPress={() =>
              router.push({
                pathname: "/(employee)/visit/check-in",
                params: {
                  id: activeSite.taskId,
                  taskId: activeSite.taskId,
                  farmerId: activeSite.farmerId,
                  siteName: activeSite.name,
                  lat: activeSite.hasSiteCoords ? String(activeSite.latitude) : "",
                  lng: activeSite.hasSiteCoords ? String(activeSite.longitude) : "",
                  distanceKm: displayDistance,
                },
              } as any)
            }
            variant="tinted"
            tintColor="rgba(22, 163, 74, 0.84)"
            dropletColor="#22c55e"
            style={{ width: "100%" }}
            contentStyle={{ paddingVertical: 15, paddingHorizontal: 18 }}
          >
            <Text style={styles.btnText}>
              Arrived at {serviceConfig.vocab.entitySingular}? Field Check-In
            </Text>
          </LiquidGlassButton>

          <LiquidGlassButton
            onPress={handleAttemptStop}
            variant="tinted"
            tintColor="rgba(234, 88, 12, 0.84)"
            dropletColor="#f97316"
            style={{ width: "100%", marginTop: 10 }}
            contentStyle={{ paddingVertical: 15, paddingHorizontal: 18 }}
          >
            <Text style={styles.btnText}>Cancel / Stop Visit Early</Text>
          </LiquidGlassButton>
        </LiquidGlassCard>
      </SafeAreaView>

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
                <ShieldAlert size={24} color="#ef4444" style={{ marginRight: 10 }} />
                <Text style={styles.modalTitle}>Stop Tracking?</Text>
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
              Provide a valid reason or Admin Override PIN to end visit tracking early.
            </Text>

            <Text style={styles.inputLabel}>Reason for stopping early</Text>
            <View style={styles.textAreaBox}>
              <TextInput
                style={styles.textArea}
                multiline
                textAlignVertical="top"
                placeholder="Site rescheduled, vehicle issue, etc."
                placeholderTextColor="#94a3b8"
                value={stopReason}
                onChangeText={setStopReason}
              />
            </View>

            <Text style={styles.inputLabel}>Admin Override OTP (Optional)</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.otpInput}
                placeholder="Enter supervisor PIN"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                secureTextEntry
                value={adminOtp}
                onChangeText={setAdminOtp}
              />
            </View>

            <LiquidGlassButton
              disabled={submittingStop}
              onPress={confirmStop}
              variant="tinted"
              tintColor="rgba(239, 68, 68, 0.84)"
              dropletColor="#ef4444"
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 15 }}
            >
              <Text style={styles.btnText}>{submittingStop ? "Stopping..." : "Confirm & Proceed"}</Text>
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
    backgroundColor: "#ffffff",
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
  titlePillContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  titlePillText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 14,
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
    fontSize: 15,
  },
  siteAddr: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 12,
    marginTop: 2,
  },
  livePill: {
    backgroundColor: "rgba(255, 247, 237, 0.86)",
    borderWidth: 1,
    borderColor: "#fed7aa",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#f97316",
    marginRight: 5,
  },
  liveText: {
    color: "#ea580c",
    fontFamily: "Brandon-Bold",
    fontSize: 11,
  },
  bottomCardOuter: {
    marginHorizontal: 16,
    marginBottom: 18,
  },
  bottomCardInner: {
    padding: 20,
  },
  durationWrap: {
    alignItems: "center",
    marginBottom: 14,
  },
  durationLabel: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 12,
    marginBottom: 2,
  },
  durationValue: {
    fontFamily: "Brandon-Bold",
    fontSize: 32,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
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
    textAlign: "center",
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
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    marginBottom: 16,
  },
  inputLabel: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
    marginBottom: 6,
  },
  textAreaBox: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    height: 92,
    marginBottom: 14,
  },
  textArea: {
    flex: 1,
    color: "#0f172a",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    marginBottom: 20,
  },
  otpInput: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  },
});
