import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Camera,
  CheckCircle2,
  MapPin,
  LogIn,
  RefreshCw,
} from "lucide-react-native";
import { api } from "../../../services/api";
import { pickImageAsset, uploadMediaAsset } from "../../../services/media";
import { haversineDistanceKm, sendLiveLocationPing } from "../../../utils/locationHelpers";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function ClockInScreen() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [targetSite, setTargetSite] = useState<any | null>(null);
  const [selfieAsset, setSelfieAsset] = useState<any | null>(null);
  const [locating, setLocating] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchGpsAndAnchor = async () => {
    setLocating(true);
    try {
      const attRes = await api.get("/employee/attendance").catch(() => null);
      if (attRes?.target_site) {
        setTargetSite(attRes.target_site);
      }

      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        showToast({
          title: "Location Permission Required",
          message: "Enable GPS access to clock in for your shift.",
          type: "error",
        });
        return;
      }

      const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({
        latitude: fix.coords.latitude,
        longitude: fix.coords.longitude,
        accuracy: fix.coords.accuracy ?? null,
      });
      void sendLiveLocationPing(fix.coords);
    } catch {
      showToast({
        title: "GPS Lock Pending",
        message: "Tap refresh to acquire live coordinates.",
        type: "info",
      });
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const attRes = await api.get("/employee/attendance").catch(() => null);
        if (active && attRes?.target_site) {
          setTargetSite(attRes.target_site);
        }

        const perm = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (perm.status !== "granted") {
          showToast({
            title: "Location Permission Required",
            message: "Enable GPS access to clock in for your shift.",
            type: "error",
          });
          return;
        }

        const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        if (!active) return;
        setCoords({
          latitude: fix.coords.latitude,
          longitude: fix.coords.longitude,
          accuracy: fix.coords.accuracy ?? null,
        });
        void sendLiveLocationPing(fix.coords);
      } catch {
        if (active) {
          showToast({
            title: "GPS Lock Pending",
            message: "Tap refresh to acquire live coordinates.",
            type: "info",
          });
        }
      } finally {
        if (active) setLocating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const captureSelfie = async () => {
    try {
      const picked = await pickImageAsset("camera");
      if (picked) setSelfieAsset(picked);
    } catch {
      showToast({ title: "Camera Notice", message: "Please allow camera access.", type: "info" });
    }
  };

  const distanceToZoneMeters =
    coords && targetSite?.latitude != null && targetSite?.longitude != null
      ? Math.round(
          haversineDistanceKm(coords, {
            latitude: Number(targetSite.latitude),
            longitude: Number(targetSite.longitude),
          }) * 1000
        )
      : null;

  const handleClockIn = async () => {
    if (!coords) {
      showToast({
        title: "Waiting for GPS",
        message: "Acquire live GPS coordinates before clocking in.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    try {
      let selfieUrl: string | undefined;
      if (selfieAsset) {
        try {
          const uploaded = await uploadMediaAsset({
            asset: selfieAsset,
            title: "Morning Shift Clock-In Selfie",
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          selfieUrl = uploaded.preview_url;
        } catch {
          // Proceed with GPS clock-in even if selfie upload is skipped
        }
      }

      const res = await api.post("/employee/attendance", {
        action: "check_in",
        latitude: coords.latitude,
        longitude: coords.longitude,
        selfie_image_path: selfieUrl,
        site_latitude: targetSite?.latitude ?? undefined,
        site_longitude: targetSite?.longitude ?? undefined,
      });

      await AsyncStorage.setItem("isClockedIn", "true");
      showToast({
        title: "Clocked In On Duty",
        message: res?.check_in_at
          ? `Shift started at ${res.check_in_at} • Synced with Admin`
          : "Attendance recorded successfully.",
        type: "success",
      });
      router.replace("/(employee)/attendance-hub");
    } catch (err: any) {
      showToast({
        title: "Clock-In Failed",
        message: err?.message || "Unable to record attendance. Check your connection.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/attendance-hub"))}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
            Morning Clock-In
          </Text>
          <LiquidGlassIconButton variant="dark" size={44} onPress={fetchGpsAndAnchor}>
            <RefreshCw size={18} color="#ffffff" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          {/* LIVE GPS VERIFICATION */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={28}
            dropletColor="#10b981"
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 22 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {locating && !coords ? (
                <ActivityIndicator color="#34d399" style={{ marginRight: 12 }} />
              ) : (
                <CheckCircle2 size={24} color={coords ? "#34d399" : "#fbbf24"} style={{ marginRight: 12 }} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                  {coords ? "Live GPS Position Verified" : "Acquiring GPS Position..."}
                </Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                  {coords
                    ? `${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E`
                    : "Please allow location access"}
                </Text>
              </View>
            </View>

            {targetSite?.name ? (
              <View
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 14,
                  backgroundColor: "rgba(255,255,255,0.06)",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <MapPin size={16} color="#38bdf8" />
                <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8, flex: 1 }}>
                  {targetSite.name}
                  {distanceToZoneMeters != null
                    ? ` • ${
                        distanceToZoneMeters < 1000
                          ? `${distanceToZoneMeters}m`
                          : `${(distanceToZoneMeters / 1000).toFixed(1)} km`
                      } away`
                    : ""}
                </Text>
              </View>
            ) : null}
          </LiquidGlassCard>

          {/* OPTIONAL SELFIE VERIFICATION */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={26}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 20 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17, marginBottom: 4 }}>
              Attendance Selfie (Optional)
            </Text>
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 14 }}>
              Attach a live selfie for supervisor verification in Web Admin.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={captureSelfie}
              style={{
                height: 200,
                borderRadius: 20,
                borderWidth: 1.5,
                borderStyle: selfieAsset ? "solid" : "dashed",
                borderColor: selfieAsset ? "#34d399" : "rgba(255,255,255,0.24)",
                backgroundColor: "rgba(255,255,255,0.05)",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {selfieAsset ? (
                <Image source={{ uri: selfieAsset.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <LiquidGlassIconBadge size={54} borderRadius={18} variant="dark" tintColor="#34d399">
                    <Camera size={26} color="#34d399" />
                  </LiquidGlassIconBadge>
                  <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 10 }}>
                    Tap to Capture Selfie
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LiquidGlassCard>

          <LiquidGlassButton
            disabled={submitting || !coords}
            onPress={handleClockIn}
            variant="tinted"
            tintColor="rgba(16, 185, 129, 0.86)"
            dropletColor="#34d399"
            contentStyle={{ paddingVertical: 17 }}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <LogIn size={19} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  Confirm GPS Clock-In
                </Text>
              </>
            )}
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
