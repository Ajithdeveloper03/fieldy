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
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import { uploadMediaAsset } from "../../../services/media";
import { haversineDistanceKm, sendLiveLocationPing } from "../../../utils/locationHelpers";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function VisitCheckInScreen() {
  const { taskId, farmerId, siteId, siteName, siteAddress, lat, lng, liveLat, liveLng, distanceKm } =
    useLocalSearchParams<{
      taskId?: string;
      farmerId?: string;
      siteId?: string;
      siteName?: string;
      siteAddress?: string;
      lat?: string;
      lng?: string;
      liveLat?: string;
      liveLng?: string;
      distanceKm?: string;
    }>();

  const { serviceConfig } = useService();
  const [target, setTarget] = useState<{
    taskId: string;
    farmerId: string;
    siteName: string;
    siteAddress: string;
    siteLat: number | null;
    siteLng: number | null;
    requiresOtp: boolean;
  }>({
    taskId: taskId || "",
    farmerId: farmerId || siteId || "",
    siteName: siteName || "",
    siteAddress: siteAddress || "",
    siteLat: lat && !Number.isNaN(Number(lat)) ? Number(lat) : null,
    siteLng: lng && !Number.isNaN(Number(lng)) ? Number(lng) : null,
    requiresOtp: false,
  });

  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(
    liveLat && liveLng && !Number.isNaN(Number(liveLat)) && !Number.isNaN(Number(liveLng))
      ? { latitude: Number(liveLat), longitude: Number(liveLng), accuracy: null }
      : null
  );
  const [locating, setLocating] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const acquireGps = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        showToast({
          title: "Location Required",
          message: "Enable GPS access to verify your arrival on site.",
          type: "error",
        });
        setLocating(false);
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
        title: "GPS Signal Weak",
        message: "Tap refresh to retry acquiring satellite lock.",
        type: "info",
      });
    } finally {
      setLocating(false);
    }
  };

  useEffect(() => {
    void acquireGps();

    (async () => {
      try {
        const storedTask = await AsyncStorage.getItem("@active_task");
        if (storedTask) {
          const parsed = JSON.parse(storedTask);
          setTarget((prev) => ({
            taskId: prev.taskId || (parsed.id ? String(parsed.id) : ""),
            farmerId: prev.farmerId || (parsed.farmerId ? String(parsed.farmerId) : ""),
            siteName: prev.siteName || parsed.targetEntity || parsed.facility || parsed.title || "",
            siteAddress: prev.siteAddress || parsed.address || "",
            siteLat: prev.siteLat ?? (parsed.latitude != null ? Number(parsed.latitude) : null),
            siteLng: prev.siteLng ?? (parsed.longitude != null ? Number(parsed.longitude) : null),
            requiresOtp: Boolean(parsed.requiresOtp),
          }));
        }

        if (!farmerId && !siteId && !siteName) {
          const sitesRes = await api.get("/employee/sites");
          const firstSite = Array.isArray(sitesRes?.sites) ? sitesRes.sites[0] : null;
          if (firstSite) {
            setTarget((prev) => ({
              ...prev,
              farmerId: prev.farmerId || String(firstSite.id),
              siteName: prev.siteName || firstSite.name || "",
              siteAddress: prev.siteAddress || firstSite.address || "",
              siteLat: prev.siteLat ?? (firstSite.latitude != null ? Number(firstSite.latitude) : null),
              siteLng: prev.siteLng ?? (firstSite.longitude != null ? Number(firstSite.longitude) : null),
            }));
          }
        }
      } catch {
        // Proceed with available params
      }
    })();
  }, [farmerId, siteId, siteName]);

  const captureArrivalPhoto = async () => {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.granted) {
        const snap = await ImagePicker.launchCameraAsync({ quality: 0.65 });
        if (!snap.canceled && snap.assets?.[0]?.uri) {
          setPhotoUri(snap.assets[0].uri);
          return;
        }
      }
      const gallery = await ImagePicker.launchImageLibraryAsync({ quality: 0.65 });
      if (!gallery.canceled && gallery.assets?.[0]?.uri) {
        setPhotoUri(gallery.assets[0].uri);
      }
    } catch {
      showToast({ title: "Camera Notice", message: "Allow camera permission to attach arrival photo.", type: "info" });
    }
  };

  const distanceMeters =
    coords && target.siteLat != null && target.siteLng != null
      ? Math.round(
          haversineDistanceKm(coords, {
            latitude: target.siteLat,
            longitude: target.siteLng,
          }) * 1000
        )
      : null;

  const isWithinPerimeter = distanceMeters == null ? Boolean(coords) : distanceMeters <= 250;

  const handleConfirmCheckIn = async () => {
    if (!coords) {
      showToast({
        title: "Waiting for GPS",
        message: "Please acquire a live GPS lock before checking in.",
        type: "error",
      });
      return;
    }

    setSubmitting(true);
    let uploadedMediaId: number | undefined;

    try {
      if (photoUri) {
        try {
          const uploaded = await uploadMediaAsset({
            asset: {
              uri: photoUri,
              name: `checkin_${Date.now()}.jpg`,
              mimeType: "image/jpeg",
              category: "image",
            },
            title: "Site Arrival Check-In Photo",
            taskId: target.taskId || undefined,
            farmerId: target.farmerId || undefined,
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
          if (uploaded?.id) {
            uploadedMediaId = Number(uploaded.id);
          }
        } catch {
          // Continue check-in even if photo upload retries later
        }
      }

      let visitId = "";
      let requiresOtp = target.requiresOtp;

      try {
        const res = await api.post("/employee/visit/check-in", {
          farmer_id: target.farmerId ? Number(target.farmerId) : undefined,
          task_id: target.taskId || undefined,
          latitude: coords.latitude,
          longitude: coords.longitude,
          media_id: uploadedMediaId,
        });
        if (res?.visit_id) {
          visitId = String(res.visit_id);
        }
        if (typeof res?.requires_otp === "boolean") {
          requiresOtp = res.requires_otp;
        }
      } catch {
        // Offline fallback — submitVisit will create & complete record
      }

      await AsyncStorage.setItem(
        "@active_checkin",
        JSON.stringify({
          visitId,
          taskId: target.taskId,
          farmerId: target.farmerId,
          siteName: target.siteName || "Field Visit",
          siteAddress: target.siteAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
          distanceKm: distanceKm ? Number(distanceKm) : 0,
          checkInMediaId: uploadedMediaId || null,
          photoUri,
          requiresOtp,
          checkedInAt: new Date().toISOString(),
        })
      );

      router.replace({
        pathname: "/(employee)/visit/report",
        params: {
          visitId,
          taskId: target.taskId,
          farmerId: target.farmerId,
          siteName: target.siteName || "Field Visit",
          lat: String(coords.latitude),
          lng: String(coords.longitude),
          distanceKm: distanceKm || "0",
        },
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            variant="light"
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>

          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 21 }}>
            Site Arrival Check-In
          </Text>

          <LiquidGlassIconButton variant="light" size={44} onPress={acquireGps}>
            <RefreshCw size={19} color="#0f172a" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        >
          {/* TARGET SITE & LIVE GPS VERIFICATION CARD */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={28}
            dropletColor={themeColor}
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 22 }}
          >
            <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>
              ARRIVAL VERIFICATION
            </Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 23, marginTop: 6 }}>
              {target.siteName || `Assigned ${serviceConfig.vocab.entitySingular}`}
            </Text>
            {target.siteAddress ? (
              <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                {target.siteAddress}
              </Text>
            ) : null}

            <View
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.08)",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {locating && !coords ? (
                <ActivityIndicator color="#4ade80" style={{ marginRight: 12 }} />
              ) : isWithinPerimeter ? (
                <CheckCircle2 size={22} color="#4ade80" style={{ marginRight: 12 }} />
              ) : (
                <AlertTriangle size={22} color="#fbbf24" style={{ marginRight: 12 }} />
              )}

              <View style={{ flex: 1 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {!coords
                    ? "Acquiring Live GPS Coordinates..."
                    : distanceMeters != null
                    ? isWithinPerimeter
                      ? `Within Site Perimeter (${distanceMeters}m from pin)`
                      : `${distanceMeters < 1000 ? `${distanceMeters}m` : `${(distanceMeters / 1000).toFixed(2)} km`} from Site Pin`
                    : "Live GPS Coordinates Verified"}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                  {coords
                    ? `${coords.latitude.toFixed(6)}° N, ${coords.longitude.toFixed(6)}° E${
                        coords.accuracy ? ` (±${Math.round(coords.accuracy)}m)` : ""
                      }`
                    : "Please ensure outdoor GPS visibility"}
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* ARRIVAL PHOTO PROOF */}
          <LiquidGlassCard
            variant="light"
            borderRadius={24}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 20 }}
          >
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginBottom: 4 }}>
              Arrival Site / Selfie Proof
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 14 }}>
              Optional geo-tagged arrival photo synced directly to Web Admin Media Vault.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={captureArrivalPhoto}
              style={{
                height: 196,
                borderRadius: 20,
                borderWidth: photoUri ? 1 : 2,
                borderStyle: photoUri ? "solid" : "dashed",
                borderColor: photoUri ? "#10b981" : themeColor,
                backgroundColor: "rgba(255,255,255,0.6)",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <View style={{ alignItems: "center" }}>
                  <LiquidGlassIconBadge size={54} borderRadius={18} variant="light" tintColor={themeColor}>
                    <Camera size={26} color={themeColor} />
                  </LiquidGlassIconBadge>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 10 }}>
                    Tap to Capture Arrival Photo
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </LiquidGlassCard>

          {/* CONFIRM CHECK-IN & PROCEED TO REPORT */}
          <LiquidGlassButton
            disabled={submitting || !coords}
            onPress={handleConfirmCheckIn}
            variant="tinted"
            tintColor="rgba(6, 34, 20, 0.90)"
            dropletColor="#4ade80"
            contentStyle={{ paddingVertical: 17 }}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <MapPin size={18} color="#4ade80" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginRight: 6 }}>
                  Confirm Check-In & Open Report
                </Text>
                <ArrowRight size={18} color="#ffffff" />
              </>
            )}
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
