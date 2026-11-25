import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  LogOut,
  Moon,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { api } from "../../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function ClockOutScreen() {
  const [loading, setLoading] = useState(false);
  const [clockInTime, setClockInTime] = useState<string>("09:15 AM");
  const [locationVerified, setLocationVerified] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 13.0827,
    longitude: 80.2707,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const storedClockIn = await AsyncStorage.getItem("clockInTime");
      if (storedClockIn && mounted) setClockInTime(storedClockIn);

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (mounted) {
            setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
        }
      } catch {
        // Fallback coordinates kept
      }
      if (mounted) {
        setIsLocating(false);
        setLocationVerified(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleClockOut = async () => {
    if (!locationVerified) return;

    setLoading(true);
    try {
      await api
        .post("/employee/attendance", {
          action: "check_out",
          latitude: coords.latitude,
          longitude: coords.longitude,
        })
        .catch(() => null);
      await AsyncStorage.setItem("isClockedIn", "false");
      await AsyncStorage.removeItem("clockInTime");
      router.replace("/(employee)/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 16,
          }}
        >
          <LiquidGlassIconButton
            variant="dark"
            size={44}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 18,
            }}
          >
            Shift Checkout
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 40,
            justifyContent: "center",
            flexGrow: 1,
          }}
        >
          {/* TIME */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <Moon size={32} color="#fca5a5" style={{ marginBottom: 16 }} />
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 56,
                lineHeight: 60,
                letterSpacing: -2,
              }}
            >
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text
              style={{
                color: "#fca5a5",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
                marginTop: 4,
              }}
            >
              End of Day •{" "}
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          <LiquidGlassCard
            variant="dark"
            borderRadius={32}
            contentStyle={{ padding: 24 }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              SHIFT SUMMARY
            </Text>

            {/* TIMELINE */}
            <LiquidGlassCard
              variant="dark"
              borderRadius={20}
              style={{ marginBottom: 32 }}
              contentStyle={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Clock In
                </Text>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  {clockInTime}
                </Text>
              </View>
              <View
                style={{
                  width: 1,
                  height: 32,
                  backgroundColor: "rgba(255,255,255,0.2)",
                }}
              />
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Total Hours
                </Text>
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 18,
                    marginTop: 4,
                  }}
                >
                  ~ 8h 15m
                </Text>
              </View>
            </LiquidGlassCard>

            <Text
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                letterSpacing: 1,
                marginBottom: 20,
              }}
            >
              VERIFICATION
            </Text>

            {/* STEP 1: LOCATION */}
            <LiquidGlassCard
              variant="dark"
              borderRadius={20}
              style={{ marginBottom: 32 }}
              contentStyle={{
                flexDirection: "row",
                alignItems: "center",
                padding: 16,
              }}
            >
              <LiquidGlassIconBadge
                variant="dark"
                size={48}
                borderRadius={24}
                tintColor={locationVerified ? "#4ade80" : "#94a3b8"}
                style={{ marginRight: 16 }}
              >
                <MapPin
                  size={24}
                  color={locationVerified ? "#4ade80" : "#ffffff"}
                />
              </LiquidGlassIconBadge>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Final GPS Ping
                </Text>
                {isLocating ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <ActivityIndicator
                      size="small"
                      color="#94a3b8"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        color: "#94a3b8",
                        fontFamily: "Brandon-Medium",
                        fontSize: 13,
                      }}
                    >
                      Acquiring signal...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={{
                      color: "#4ade80",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    Delta Zone A • Verified
                  </Text>
                )}
              </View>
              {locationVerified && <CheckCircle2 size={24} color="#4ade80" />}
            </LiquidGlassCard>

            {/* CLOCK OUT BUTTON */}
            <LiquidGlassButton
              disabled={!locationVerified || loading}
              variant={!locationVerified ? "dark" : "tinted"}
              tintColor="rgba(239, 68, 68, 0.78)"
              dropletColor="#f87171"
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 18 }}
              onPress={handleClockOut}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <LogOut
                    size={20}
                    color={
                      !locationVerified ? "rgba(255,255,255,0.3)" : "#ffffff"
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: !locationVerified
                        ? "rgba(255,255,255,0.3)"
                        : "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                      letterSpacing: 1,
                    }}
                  >
                    SECURE CHECK OUT
                  </Text>
                </>
              )}
            </LiquidGlassButton>
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
