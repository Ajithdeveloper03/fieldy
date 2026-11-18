import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import { FieldEmployeeMarker } from "../../../components/FieldEmployeeMarker";
import { getAuthUser } from "../../../services/api";
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
  const mapRef = useRef<MapView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastCoordRef = useRef<{ latitude: number; longitude: number } | null>(null);

  const [activeSite, setActiveSite] = useState({
    name: siteName || serviceConfig.sampleEntities[0]?.name || "Assigned Site",
    address: siteAddress || serviceConfig.sampleEntities[0]?.address || "Chennai, Tamil Nadu",
    latitude: lat ? Number(lat) : 13.0827,
    longitude: lng ? Number(lng) : 80.2707,
    farmerId: farmerId || "",
    taskId: taskId || id || "",
  });

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    Array<{ latitude: number; longitude: number }>
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
            farmerId: parsed.farmerId ? String(parsed.farmerId) : prev.farmerId,
            taskId: parsed.id ? String(parsed.id) : prev.taskId,
          }));
        }
      } catch {
        // Use params or service default
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
          sessionId && isTracking
            ? sessionId
            : `visit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        if (!isTracking || !sessionId) {
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
  }, [sessionId, isTracking, startSession]);

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
    if (!stopReason.trim() && adminOtp !== "1234") {
      showToast({
        title: "Reason Required",
        message: "Provide a stop reason or override PIN to abort tracking.",
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
      message: "Proceeding to check-in & checkout.",
      type: "info",
    });
    router.push({
      pathname: "/(employee)/visit/check-in",
      params: {
        id: activeSite.taskId,
        taskId: activeSite.taskId,
        farmerId: activeSite.farmerId,
        siteName: activeSite.name,
      },
    } as any);
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
        style={StyleSheet.absoluteFill}
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

        <Marker
          coordinate={{
            latitude: activeSite.latitude,
            longitude: activeSite.longitude,
          }}
          title={activeSite.name}
          pinColor={accentColor}
        />
      </MapView>

      <SafeAreaView style={styles.overlaySafe} pointerEvents="box-none">
        {/* TOP HEADER & DESTINATION CARD */}
        <View style={styles.topSection} pointerEvents="box-none">
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <ChevronLeft size={22} color="#0f172a" />
            </TouchableOpacity>
            <View style={styles.titlePill}>
              <Text style={styles.titlePillText}>{serviceConfig.shortName} Live GPS</Text>
            </View>
            <TouchableOpacity onPress={recenterOnUser} style={styles.circleBtn}>
              <Crosshair size={20} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={styles.siteCard}>
            <View style={[styles.siteIconBox, { backgroundColor: `${accentColor}15` }]}>
              <Navigation size={20} color={accentColor} />
            </View>
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
          </View>
        </View>

        {/* BOTTOM HUD CARD */}
        <View style={styles.bottomCard}>
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

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(employee)/visit/check-in",
                params: {
                  id: activeSite.taskId,
                  taskId: activeSite.taskId,
                  farmerId: activeSite.farmerId,
                  siteName: activeSite.name,
                },
              } as any)
            }
            style={[styles.primaryBtn, { backgroundColor: "#16a34a" }]}
          >
            <Text style={styles.btnText}>
              Arrived at {serviceConfig.vocab.entitySingular}? Field Check-In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleAttemptStop}
            style={[styles.primaryBtn, { backgroundColor: "#ea580c", marginTop: 10 }]}
          >
            <Text style={styles.btnText}>Cancel / Stop Visit Early</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <Modal visible={showStopModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ShieldAlert size={24} color="#ef4444" style={{ marginRight: 10 }} />
                <Text style={styles.modalTitle}>Stop Tracking?</Text>
              </View>
              <TouchableOpacity onPress={() => setShowStopModal(false)} style={styles.closeBtn}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
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
                placeholder="Enter 4-digit PIN (1234)"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                secureTextEntry
                value={adminOtp}
                onChangeText={setAdminOtp}
              />
            </View>

            <TouchableOpacity
              disabled={submittingStop}
              onPress={confirmStop}
              style={[styles.primaryBtn, { backgroundColor: "#ef4444" }]}
            >
              <Text style={styles.btnText}>{submittingStop ? "Stopping..." : "Confirm & Proceed"}</Text>
            </TouchableOpacity>
          </View>
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
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  titlePill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  titlePillText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 14,
  },
  siteCard: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  siteIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
    backgroundColor: "#fff7ed",
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
  bottomCard: {
    marginHorizontal: 16,
    marginBottom: 18,
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 10,
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
    backgroundColor: "#e2e8f0",
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
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
  modalSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
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
  closeBtn: {
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 999,
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
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
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
    borderColor: "#cbd5e1",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 20,
  },
  otpInput: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  },
});
