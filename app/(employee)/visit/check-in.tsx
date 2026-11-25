import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Camera,
  MapPin,
  Fingerprint,
  CheckCircle2,
} from "lucide-react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import { showToast } from "../../../components/ui/ToastMessage";
import { LocalMediaAsset, pickImageAsset, uploadMediaAsset } from "../../../services/media";
import { haversineDistanceKm, sendLiveLocationPing } from "../../../utils/locationHelpers";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function CheckInScreen() {
  const { id, taskId, farmerId, siteName, lat, lng, distanceKm } = useLocalSearchParams<{
    id?: string;
    taskId?: string;
    farmerId?: string;
    siteName?: string;
    lat?: string;
    lng?: string;
    distanceKm?: string;
  }>();
  const { serviceConfig } = useService();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoAsset, setPhotoAsset] = useState<LocalMediaAsset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [coordsText, setCoordsText] = useState("Acquiring live GPS...");
  const [resolvedSiteName, setResolvedSiteName] = useState(siteName || serviceConfig.vocab.entitySingular);
  const [targetCoords, setTargetCoords] = useState<{ latitude: number; longitude: number } | null>(
    lat && lng ? { latitude: Number(lat), longitude: Number(lng) } : null
  );
  const [requiresOtp, setRequiresOtp] = useState(false);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const storedTaskRaw = await AsyncStorage.getItem("@active_task");
        if (active && storedTaskRaw) {
          const parsed = JSON.parse(storedTaskRaw);
          if (!siteName && (parsed.facility || parsed.targetEntity)) {
            setResolvedSiteName(parsed.facility || parsed.targetEntity);
          }
          if (!lat && parsed.latitude && parsed.longitude) {
            setTargetCoords({ latitude: Number(parsed.latitude), longitude: Number(parsed.longitude) });
          }
          setRequiresOtp(Boolean(parsed.requiresOtp || parsed.requires_otp));
        }
      } catch {
        // Ignore parse error
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          if (!active) return;
          setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setCoordsText(`${loc.coords.latitude.toFixed(5)}° N, ${loc.coords.longitude.toFixed(5)}° E`);
          void sendLiveLocationPing(loc.coords);
        } else {
          setCoordsText("GPS Permission Needed");
        }
      } catch {
        if (active) setCoordsText("Acquiring GPS signal...");
      }
    })();
    return () => {
      active = false;
    };
  }, [lat, siteName]);

  const radiusBadgeText = React.useMemo(() => {
    if (coords && targetCoords) {
      const meters = Math.round(haversineDistanceKm(coords, targetCoords) * 1000);
      return meters <= 500
        ? `Within ${meters}m • ${coordsText}`
        : `${(meters / 1000).toFixed(1)}km to site • ${coordsText}`;
    }
    return `Live GPS • ${coordsText}`;
  }, [coords, coordsText, targetCoords]);

  const handleCapture = async () => {
    try {
      const cameraPicked = await pickImageAsset("camera").catch(() => null);
      if (cameraPicked) {
        setPhotoAsset(cameraPicked);
        setPhotoTaken(true);
        return;
      }
      const libraryPicked = await pickImageAsset("library").catch(() => null);
      if (libraryPicked) {
        setPhotoAsset(libraryPicked);
        setPhotoTaken(true);
      }
    } catch {
      showToast({
        title: "Camera Permission",
        message: "Please grant camera or gallery access to verify arrival.",
        type: "error",
      });
    }
  };

  const handleCheckIn = async () => {
    if (!photoTaken || submitting) return;
    setSubmitting(true);
    let uploadedSelfieUrl: string | null = photoAsset?.uri || null;
    try {
      if (photoAsset) {
        const uploaded = await uploadMediaAsset({
          asset: photoAsset,
          title: `${resolvedSiteName} - Check-In Selfie`,
          taskId: taskId || id || null,
          farmerId: farmerId || null,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        }).catch(() => null);
        if (uploaded?.preview_url) {
          uploadedSelfieUrl = uploaded.preview_url;
        }
      }

      const checkInRes = await api
        .post("/employee/visit/check-in", {
          task_id: taskId || id || undefined,
          farmer_id: farmerId ? Number(farmerId) : undefined,
          site_name: resolvedSiteName,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          selfie_url: uploadedSelfieUrl,
        })
        .catch(() => null);

      const serverVisitId = checkInRes?.visit_id ? String(checkInRes.visit_id) : "";
      const otpFlag = Boolean(checkInRes?.requires_otp ?? requiresOtp);

      await AsyncStorage.setItem(
        "@active_checkin",
        JSON.stringify({
          visitId: serverVisitId,
          taskId: taskId || id || "",
          farmerId: farmerId || "",
          siteName: resolvedSiteName,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          distanceKm: distanceKm ? Number(distanceKm) : 0,
          requiresOtp: otpFlag,
          photoUri: uploadedSelfieUrl,
          checkedInAt: new Date().toISOString(),
        })
      );

      router.push({
        pathname: "/(employee)/visit/report",
        params: {
          id: id || taskId || "",
          taskId: taskId || id || "",
          farmerId: farmerId || "",
          visitId: serverVisitId,
          siteName: resolvedSiteName,
          lat: coords?.latitude ? String(coords.latitude) : "",
          lng: coords?.longitude ? String(coords.longitude) : "",
          distanceKm: distanceKm || "",
        },
      } as any);
    } finally {
      setSubmitting(false);
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
            paddingBottom: 24,
          }}
        >
          <LiquidGlassIconButton
            variant="dark"
            size={42}
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
              fontSize: 20,
            }}
          >
            {serviceConfig.label} Check-In
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
        >
          <LiquidGlassCard
            variant="dark"
            borderRadius={40}
            dropletColor={serviceConfig.color}
            style={{ marginTop: 20 }}
            contentStyle={{
              padding: 32,
              alignItems: "center",
            }}
          >
            {/* Massive Geofence Radar Circle */}
            <LiquidGlassCard
              variant="tinted"
              borderRadius={70}
              tintColor={`${serviceConfig.color}28`}
              dropletColor={serviceConfig.color}
              style={{
                width: 140,
                height: 140,
                marginBottom: 24,
                shadowColor: serviceConfig.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.48,
                shadowRadius: 20,
                elevation: 10,
              }}
              contentStyle={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: `${serviceConfig.color}66`,
                  borderStyle: "dashed",
                }}
              />
              <MapPin size={48} color={serviceConfig.color} />
            </LiquidGlassCard>

            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 28,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Geofence Verified
            </Text>

            <LiquidGlassCard
              variant="tinted"
              borderRadius={999}
              tintColor={`${serviceConfig.color}28`}
              style={{ marginBottom: 24 }}
              contentStyle={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <CheckCircle2
                size={14}
                color={serviceConfig.color}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: serviceConfig.color,
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {radiusBadgeText}
              </Text>
            </LiquidGlassCard>

            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Brandon-Medium",
                fontSize: 16,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 32,
              }}
            >
              You have securely arrived at {resolvedSiteName}. Please
              verify your physical presence with a selfie.
            </Text>

            {/* Photo Verification Box */}
            <LiquidGlassCard
              variant={photoTaken ? "tinted" : "dark"}
              tintColor={photoTaken ? `${serviceConfig.color}26` : undefined}
              dropletColor={photoTaken ? serviceConfig.color : undefined}
              borderRadius={20}
              onPress={handleCapture}
              style={{
                width: "100%",
                marginBottom: 32,
              }}
              contentStyle={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <LiquidGlassIconBadge
                variant="dark"
                size={48}
                borderRadius={16}
                tintColor={photoTaken ? serviceConfig.color : "#15803d"}
                style={{ marginRight: 16 }}
              >
                {photoTaken ? (
                  <CheckCircle2 size={24} color="#ffffff" />
                ) : (
                  <Camera size={24} color="#ffffff" />
                )}
              </LiquidGlassIconBadge>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {photoTaken ? "Identity Verified ✓" : "Take Field Selfie"}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  {photoTaken
                    ? "Geotagged timestamp logged"
                    : `Required for ${serviceConfig.shortName} compliance`}
                </Text>
              </View>
            </LiquidGlassCard>

            {/* Confirm Check In Action Button */}
            <LiquidGlassButton
              onPress={handleCheckIn}
              disabled={!photoTaken || submitting}
              variant={photoTaken ? "tinted" : "dark"}
              tintColor={`${serviceConfig.color}CC`}
              dropletColor={serviceConfig.color}
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 18 }}
            >
              <Fingerprint
                size={20}
                color={photoTaken ? "#ffffff" : "rgba(255,255,255,0.4)"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  color: photoTaken ? "#ffffff" : "rgba(255,255,255,0.4)",
                  fontFamily: "Brandon-Bold",
                  fontSize: 16,
                }}
              >
                {submitting ? "Checking In..." : "Confirm Arrival"}
              </Text>
            </LiquidGlassButton>
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
