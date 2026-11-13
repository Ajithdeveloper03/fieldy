import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  Camera,
  CheckCircle2,
  Fingerprint,
} from "lucide-react-native";
import { useLanguage } from "../../../context/LanguageContext";

export default function ClockInScreen() {
  const { t, language } = useLanguage();
  const [isLocating, setIsLocating] = useState(true);
  const [locationVerified, setLocationVerified] = useState(false);
  const [cameraVerified, setCameraVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock location verification delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLocating(false);
      setLocationVerified(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCameraVerify = () => {
    setCameraVerified(true);
  };

  const handleClockIn = async () => {
    if (!locationVerified || !cameraVerified) return;

    setIsProcessing(true);
    setTimeout(async () => {
      await AsyncStorage.setItem("isClockedIn", "true");
      await AsyncStorage.setItem(
        "clockInTime",
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
      setIsProcessing(false);
      router.replace("/(employee)/dashboard");
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* GRADIENT BACKGROUND */}
      <LinearGradient
        colors={["#062214", "#0a331c", "#04140b"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
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
            Secure Clock In
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* MAIN ACTION CARD */}
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
                color: "#4ade80",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
                marginTop: 4,
              }}
            >
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
              VERIFICATION STEPS
            </Text>

            {/* STEP 1: LOCATION */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 20,
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
                  GPS Location
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

            {/* STEP 2: CAMERA/SELFIE */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCameraVerify}
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
                  backgroundColor: cameraVerified
                    ? "rgba(74,222,128,0.2)"
                    : "rgba(59,130,246,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                  overflow: "hidden",
                }}
              >
                {cameraVerified ? (
                  <Image
                    source={require("../../../assets/images/image1.jpg")}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Camera size={24} color="#60a5fa" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Selfie Verification
                </Text>
                <Text
                  style={{
                    color: cameraVerified ? "#4ade80" : "#60a5fa",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  {cameraVerified ? "Identity matched" : "Tap to capture selfie"}
                </Text>
              </View>
              {cameraVerified && <CheckCircle2 size={24} color="#4ade80" />}
            </TouchableOpacity>

            {/* CLOCK IN BUTTON */}
            <TouchableOpacity
              disabled={!locationVerified || !cameraVerified || isProcessing}
              style={{
                backgroundColor:
                  !locationVerified || !cameraVerified
                    ? "rgba(255,255,255,0.1)"
                    : "#10b981",
                borderRadius: 999,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor:
                  !locationVerified || !cameraVerified
                    ? "transparent"
                    : "#10b981",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8,
              }}
              onPress={handleClockIn}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Fingerprint
                    size={20}
                    color={
                      !locationVerified || !cameraVerified
                        ? "rgba(255,255,255,0.3)"
                        : "#ffffff"
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color:
                        !locationVerified || !cameraVerified
                          ? "rgba(255,255,255,0.3)"
                          : "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                      letterSpacing: 1,
                    }}
                  >
                    CONFIRM CLOCK IN
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
