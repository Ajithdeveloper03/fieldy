import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  LogOut,
  Moon,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../../../context/LanguageContext";

export default function ClockOutScreen() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [clockInTime, setClockInTime] = useState<string>("09:15 AM");
  const [locationVerified, setLocationVerified] = useState(false);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    (async () => {
      const storedClockIn = await AsyncStorage.getItem("clockInTime");
      if (storedClockIn) setClockInTime(storedClockIn);
    })();

    const timer = setTimeout(() => {
      setIsLocating(false);
      setLocationVerified(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClockOut = async () => {
    if (!locationVerified) return;

    setLoading(true);
    setTimeout(async () => {
      await AsyncStorage.setItem("isClockedIn", "false");
      await AsyncStorage.removeItem("clockInTime");
      setLoading(false);
      router.replace("/(employee)/dashboard");
    }, 1500);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* DRONE MAP BACKGROUND - TINTED DARK FOR EVENING/CLOCKOUT */}
      <Image
        source={require("../../../assets/images/image1.jpg")}
        style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(6, 34, 20, 0.7)", "rgba(0, 0, 0, 0.9)", "#000000"]}
        style={StyleSheet.absoluteFillObject}
      />

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
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
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

          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 32,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: 16,
                borderRadius: 20,
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
            </View>

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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
                backgroundColor: "rgba(0,0,0,0.3)",
                padding: 16,
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: locationVerified
                    ? "rgba(74,222,128,0.2)"
                    : "rgba(255,255,255,0.1)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <MapPin
                  size={24}
                  color={locationVerified ? "#4ade80" : "#ffffff"}
                />
              </View>
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
            </View>

            {/* CLOCK OUT BUTTON */}
            <TouchableOpacity
              disabled={!locationVerified || loading}
              style={{
                backgroundColor: !locationVerified
                  ? "rgba(255,255,255,0.1)"
                  : "#ef4444",
                borderRadius: 999,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: !locationVerified ? "transparent" : "#ef4444",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
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
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
