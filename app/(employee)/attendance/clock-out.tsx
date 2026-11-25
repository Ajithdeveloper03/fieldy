import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Clock,
  LogOut,
  MapPin,
} from "lucide-react-native";
import { api } from "../../../services/api";
import { useTracking } from "../../../context/TrackingContext";
import { sendLiveLocationPing } from "../../../utils/locationHelpers";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function ClockOutScreen() {
  const { stopSession } = useTracking();
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [todayInfo, setTodayInfo] = useState<{
    checkInAt: string | null;
    elapsedLabel: string;
  }>({
    checkInAt: null,
    elapsedLabel: "0h 00m",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/employee/attendance");
        if (res?.today) {
          setTodayInfo({
            checkInAt: res.today.check_in_at || null,
            elapsedLabel: res.today.elapsed_label || "0h 00m",
          });
        }
      } catch {
        // Ignore fetch errors
      }

      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status === "granted") {
          const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setCoords({ latitude: fix.coords.latitude, longitude: fix.coords.longitude });
          void sendLiveLocationPing(fix.coords);
        }
      } catch {
        // Retry on submit if needed
      }
    })();
  }, []);

  const handleClockOut = async () => {
    setSubmitting(true);
    try {
      let finalCoords = coords;
      if (!finalCoords) {
        const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        finalCoords = { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
      }

      const res = await api.post("/employee/attendance", {
        action: "check_out",
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude,
      });

      await AsyncStorage.setItem("isClockedIn", "false");
      await stopSession().catch(() => {});

      showToast({
        title: "Shift Completed",
        message: `Logged ${Number(res?.total_hours || 0).toFixed(2)} hrs today • Synced with Admin.`,
        type: "success",
      });
      router.replace("/(employee)/attendance-hub");
    } catch (err: any) {
      showToast({
        title: "Clock-Out Notice",
        message: err?.message || "Could not complete clock-out. Check GPS & network.",
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
            End Shift Clock-Out
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
          <LiquidGlassCard
            variant="dark"
            borderRadius={30}
            dropletColor="#f87171"
            style={{ marginBottom: 24, marginTop: 12 }}
            contentStyle={{ padding: 26, alignItems: "center" }}
          >
            <LiquidGlassIconBadge size={68} borderRadius={24} variant="dark" tintColor="#f87171" style={{ marginBottom: 14 }}>
              <Clock size={34} color="#f87171" />
            </LiquidGlassIconBadge>

            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1 }}>
              ELAPSED SHIFT DURATION
            </Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 38, marginTop: 6 }}>
              {todayInfo.elapsedLabel}
            </Text>
            <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>
              {todayInfo.checkInAt ? `Started today at ${todayInfo.checkInAt}` : "Active duty session"}
            </Text>

            <View
              style={{
                marginTop: 18,
                padding: 12,
                borderRadius: 14,
                backgroundColor: "rgba(255,255,255,0.06)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <MapPin size={15} color="#34d399" />
              <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 7 }}>
                {coords
                  ? `Checkout GPS: ${coords.latitude.toFixed(5)}° N, ${coords.longitude.toFixed(5)}° E`
                  : "Acquiring live checkout coordinates..."}
              </Text>
            </View>
          </LiquidGlassCard>

          <LiquidGlassButton
            disabled={submitting}
            onPress={handleClockOut}
            variant="tinted"
            tintColor="rgba(239, 68, 68, 0.86)"
            dropletColor="#f87171"
            contentStyle={{ paddingVertical: 17 }}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <LogOut size={19} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  Confirm Clock-Out & Close Shift
                </Text>
              </>
            )}
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
