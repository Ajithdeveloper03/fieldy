import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Check,
  Plus,
  IndianRupee,
  Video,
  Camera,
  Trash2,
  ShieldCheck,
} from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";
import { useTracking } from "../../../context/TrackingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { apiClient } from "../../../api/client";
import {
  LocalMediaAsset,
  pickImageAsset,
  pickVideoAsset,
  uploadMediaAsset,
} from "../../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../../components/LiquidGlass";

export default function SubmitReportScreen() {
  const insets = useSafeAreaInsets();
  const { id, visitId, taskId, farmerId, siteName, lat, lng, distanceKm, method } =
    useLocalSearchParams<{
      id?: string;
      visitId?: string;
      taskId?: string;
      farmerId?: string;
      siteName?: string;
      lat?: string;
      lng?: string;
      distanceKm?: string;
      method?: string;
    }>();

  const { serviceConfig } = useService();
  const { stopSession } = useTracking();

  const [contextState, setContextState] = useState<{
    visitId: string;
    taskId: string;
    farmerId: string;
    siteName: string;
    latitude: number | null;
    longitude: number | null;
    distanceKm: number;
    checkInMediaId: number | null;
    requiresOtp: boolean;
  }>({
    visitId: visitId || "",
    taskId: taskId || id || "",
    farmerId: farmerId || "",
    siteName: siteName || "",
    latitude: lat && !Number.isNaN(Number(lat)) ? Number(lat) : null,
    longitude: lng && !Number.isNaN(Number(lng)) ? Number(lng) : null,
    distanceKm: distanceKm && !Number.isNaN(Number(distanceKm)) ? Number(distanceKm) : 0,
    checkInMediaId: null,
    requiresOtp: false,
  });

  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("None");
  const [amountCollected, setAmountCollected] = useState("");
  const [beforePhoto, setBeforePhoto] = useState<LocalMediaAsset | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<LocalMediaAsset | null>(null);
  const [siteVideo, setSiteVideo] = useState<LocalMediaAsset | null>(null);
  const [recommendations, setRecommendations] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [rawTask, rawCheckin] = await Promise.all([
          AsyncStorage.getItem("@active_task"),
          AsyncStorage.getItem("@active_checkin"),
        ]);
        const parsedTask = rawTask ? JSON.parse(rawTask) : null;
        const parsedCheckin = rawCheckin ? JSON.parse(rawCheckin) : null;

        setContextState((prev) => ({
          visitId: prev.visitId || parsedCheckin?.visitId || "",
          taskId:
            prev.taskId ||
            parsedCheckin?.taskId ||
            (parsedTask?.id ? String(parsedTask.id) : ""),
          farmerId:
            prev.farmerId ||
            parsedCheckin?.farmerId ||
            (parsedTask?.farmerId ? String(parsedTask.farmerId) : ""),
          siteName:
            prev.siteName ||
            parsedCheckin?.siteName ||
            parsedTask?.targetEntity ||
            parsedTask?.facility ||
            parsedTask?.title ||
            "",
          latitude: prev.latitude ?? parsedCheckin?.latitude ?? parsedTask?.latitude ?? null,
          longitude: prev.longitude ?? parsedCheckin?.longitude ?? parsedTask?.longitude ?? null,
          distanceKm: prev.distanceKm || Number(parsedCheckin?.distanceKm || 0),
          checkInMediaId: parsedCheckin?.checkInMediaId ? Number(parsedCheckin.checkInMediaId) : null,
          requiresOtp: Boolean(parsedCheckin?.requiresOtp ?? parsedTask?.requiresOtp),
        }));
      } catch {
        // Proceed with URL params
      }
    })();
  }, []);

  const chooseImageSource = (setter: (asset: LocalMediaAsset) => void, label: string) => {
    const runPick = async (source: "camera" | "library") => {
      try {
        const picked = await pickImageAsset(source);
        if (picked) setter(picked);
      } catch {
        showToast({ title: "Media Notice", message: "Please allow camera or photo library access.", type: "info" });
      }
    };

    if (Platform.OS === "web") {
      void runPick("library");
      return;
    }

    Alert.alert(label, "Choose how to attach this image", [
      { text: "Take Photo", onPress: () => void runPick("camera") },
      { text: "Choose from Gallery", onPress: () => void runPick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const chooseVideoSource = () => {
    const runPick = async (source: "camera" | "library") => {
      try {
        const picked = await pickVideoAsset(source);
        if (picked) {
          setSiteVideo(picked);
          showToast({ title: "Video Attached", message: picked.name, type: "success" });
        }
      } catch {
        showToast({ title: "Video Notice", message: "Please allow camera or media library access.", type: "info" });
      }
    };

    if (Platform.OS === "web") {
      void runPick("library");
      return;
    }

    Alert.alert("Attach Site Video", "Record or select a video (up to 60s)", [
      { text: "Record Video", onPress: () => void runPick("camera") },
      { text: "Choose from Gallery", onPress: () => void runPick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSubmit = async () => {
    if (notes.trim().length < 5) {
      showToast({
        title: "Missing Notes",
        message: "Please write field work notes (at least 5 characters).",
        type: "error",
      });
      return;
    }
    if (contextState.requiresOtp && otpCode.trim().length < 4) {
      showToast({
        title: "Customer OTP Required",
        message: "Enter the 4-digit verification OTP for this work order.",
        type: "error",
      });
      return;
    }
    if (
      paymentMode !== "None" &&
      (!amountCollected || Number.isNaN(Number(amountCollected)) || Number(amountCollected) <= 0)
    ) {
      showToast({
        title: "Invalid Amount",
        message: "Please enter a valid payment amount.",
        type: "error",
      });
      return;
    }

    setLoading(true);

    let resolvedLat = contextState.latitude;
    let resolvedLng = contextState.longitude;
    try {
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.granted) {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        resolvedLat = loc.coords.latitude;
        resolvedLng = loc.coords.longitude;
      }
    } catch {
      // Retain check-in coordinates
    }

    const resolvedSiteName = contextState.siteName || serviceConfig.vocab.entitySingular;
    const mediaIds: number[] = contextState.checkInMediaId ? [contextState.checkInMediaId] : [];
    const uploadedMedia: any[] = [];

    const assetsToUpload: Array<{ asset: LocalMediaAsset; title: string }> = [];
    if (beforePhoto) assetsToUpload.push({ asset: beforePhoto, title: `${resolvedSiteName} - Before Photo` });
    if (afterPhoto) assetsToUpload.push({ asset: afterPhoto, title: `${resolvedSiteName} - After Photo` });
    if (siteVideo) assetsToUpload.push({ asset: siteVideo, title: `${resolvedSiteName} - Site Video` });

    for (const item of assetsToUpload) {
      try {
        const uploaded = await uploadMediaAsset({
          asset: item.asset,
          title: item.title,
          visitId: contextState.visitId || null,
          taskId: contextState.taskId || null,
          farmerId: contextState.farmerId || null,
          latitude: resolvedLat,
          longitude: resolvedLng,
        });
        uploadedMedia.push(uploaded);
        mediaIds.push(uploaded.id);
      } catch {
        // Continue submission smoothly
      }
    }

    const combinedNotes =
      paymentMode !== "None" && Number(amountCollected) > 0
        ? `${notes.trim()} (Collected ₹${Number(amountCollected)} via ${paymentMode})`
        : notes.trim();

    const payload = {
      visit_id: contextState.visitId ? Number(contextState.visitId) : undefined,
      task_id: contextState.taskId || undefined,
      farmer_id: contextState.farmerId ? Number(contextState.farmerId) : undefined,
      farm_condition_notes: combinedNotes,
      notes: combinedNotes,
      recommendations: recommendations.trim() || undefined,
      before_photo: uploadedMedia.find((m) => m.title?.includes("Before"))?.preview_url || undefined,
      after_photo: uploadedMedia.find((m) => m.title?.includes("After"))?.preview_url || undefined,
      media_ids: mediaIds,
      customer_otp: otpCode.trim() || undefined,
      distance_km: contextState.distanceKm > 0 ? contextState.distanceKm : undefined,
      check_in_latitude: contextState.latitude ?? resolvedLat,
      check_in_longitude: contextState.longitude ?? resolvedLng,
      check_out_latitude: resolvedLat,
      check_out_longitude: resolvedLng,
    };

    try {
      const serverResp = await apiClient.post("/employee/visit/submit", payload);

      const summaryRecord = {
        visitId: serverResp?.visit_id ? String(serverResp.visit_id) : contextState.visitId,
        service: serviceConfig.label,
        siteName: resolvedSiteName,
        notes: combinedNotes,
        pointsAwarded: Number(serverResp?.points_awarded || 0),
        mediaCount: mediaIds.length,
        dossierUrl: serverResp?.dossier_url || null,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem("@last_submitted_report", JSON.stringify(summaryRecord));
      await stopSession().catch(() => null);
      await AsyncStorage.multiRemove(["@active_task", "@active_checkin"]).catch(() => null);
      setLoading(false);

      router.replace("/(employee)/visit/success");
    } catch (error: any) {
      setLoading(false);
      showToast({
        title: "Unable to Submit Report",
        message: error?.message || "Please verify your OTP and internet connection.",
        type: "error",
      });
    }
  };

  const headerTitle =
    method === "photo"
      ? `${serviceConfig.shortName} Photo Report`
      : method === "video"
      ? `${serviceConfig.shortName} Video Report`
      : `Submit ${serviceConfig.vocab.report}`;

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <LiquidGlassIconButton
              variant="light"
              size={42}
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </LiquidGlassIconButton>
            <View style={{ alignItems: "center", flex: 1, marginHorizontal: 10 }}>
              <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                {headerTitle}
              </Text>
              {contextState.siteName ? (
                <Text numberOfLines={1} style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
                  {contextState.siteName}
                </Text>
              ) : null}
            </View>
            <View style={{ width: 42 }} />
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
          >
            {/* Progress Steps */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 12 }}>
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: serviceConfig.themeColor,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </View>
                  {index < 3 && (
                    <View style={{ flex: 1, height: 2, backgroundColor: serviceConfig.themeColor }} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Work Notes */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Field Work & Inspection Notes *
            </Text>
            <LiquidGlassCard
              variant="light"
              borderRadius={16}
              style={{ height: 112, marginBottom: 18 }}
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <TextInput
                style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}
                multiline
                textAlignVertical="top"
                placeholder={`Describe work completed at ${contextState.siteName || "site"}...`}
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />
            </LiquidGlassCard>

            {/* OTP Verification */}
            <LiquidGlassCard
              variant="light"
              borderRadius={18}
              style={{ marginBottom: 18 }}
              contentStyle={{ padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <ShieldCheck size={18} color="#059669" style={{ marginRight: 8 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Client Verification OTP {contextState.requiresOtp ? "*" : "(Optional)"}
                </Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginBottom: 10 }}>
                {contextState.requiresOtp
                  ? "Enter the 4-digit OTP generated on this work order in Web Admin."
                  : "Enter client verification code if completing an OTP-protected work order."}
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                }}
              >
                <TextInput
                  style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, textAlign: "center", letterSpacing: 4 }}
                  placeholder="----"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>
            </LiquidGlassCard>

            {/* Before & After Photos + Site Video */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Photos & Site Video Evidence
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <LiquidGlassCard
                variant="light"
                borderRadius={16}
                onPress={() => chooseImageSource(setBeforePhoto, "Before Work Photo")}
                style={{ flex: 1, height: 112 }}
                contentStyle={{ alignItems: "center", justifyContent: "center" }}
              >
                {beforePhoto ? (
                  <Image source={{ uri: beforePhoto.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <>
                    <Camera size={22} color={serviceConfig.themeColor} />
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12, marginTop: 6 }}>
                      Before Photo
                    </Text>
                  </>
                )}
              </LiquidGlassCard>

              <LiquidGlassCard
                variant="light"
                borderRadius={16}
                onPress={() => chooseImageSource(setAfterPhoto, "After Work Photo")}
                style={{ flex: 1, height: 112 }}
                contentStyle={{ alignItems: "center", justifyContent: "center" }}
              >
                {afterPhoto ? (
                  <Image source={{ uri: afterPhoto.uri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <>
                    <Camera size={22} color={serviceConfig.themeColor} />
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12, marginTop: 6 }}>
                      After Photo
                    </Text>
                  </>
                )}
              </LiquidGlassCard>
            </View>

            {/* Video Attachment Card */}
            <LiquidGlassCard
              variant="light"
              borderRadius={16}
              onPress={chooseVideoSource}
              style={{ marginBottom: 18 }}
              contentStyle={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: siteVideo ? "rgba(16, 185, 129, 0.16)" : "rgba(14, 165, 233, 0.14)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Video size={20} color={siteVideo ? "#059669" : "#0284c7"} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }} numberOfLines={1}>
                    {siteVideo ? siteVideo.name : "Upload / Record Site Video"}
                  </Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
                    {siteVideo
                      ? `Video attached${siteVideo.durationMs ? ` • ${Math.max(1, Math.round(siteVideo.durationMs / 1000))}s` : ""}`
                      : "MP4 / MOV walkthrough evidence (up to 60s)"}
                  </Text>
                </View>
              </View>
              {siteVideo ? (
                <TouchableOpacity onPress={() => setSiteVideo(null)} style={{ padding: 6 }}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              ) : (
                <Plus size={20} color="#0284c7" />
              )}
            </LiquidGlassCard>

            {/* Collection / Billing (Optional) */}
            <LiquidGlassCard
              variant="light"
              borderRadius={18}
              style={{ marginBottom: 18 }}
              contentStyle={{ padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <IndianRupee size={17} color="#ea580c" style={{ marginRight: 6 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Payment Collection (If Applicable)
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: paymentMode !== "None" ? 12 : 0 }}>
                {["None", "Cash", "UPI"].map((mode) => (
                  <LiquidGlassPill
                    key={mode}
                    variant="light"
                    active={paymentMode === mode}
                    tintColor="rgba(249, 115, 22, 0.85)"
                    onPress={() => setPaymentMode(mode)}
                    style={{ flex: 1 }}
                    contentStyle={{ paddingVertical: 9 }}
                  >
                    <Text
                      style={{
                        fontFamily: "Brandon-Bold",
                        fontSize: 13,
                        color: paymentMode === mode ? "#ffffff" : "#64748b",
                      }}
                    >
                      {mode}
                    </Text>
                  </LiquidGlassPill>
                ))}
              </View>
              {paymentMode !== "None" && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "#cbd5e1",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 18, marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}
                    placeholder="Amount collected"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={amountCollected}
                    onChangeText={setAmountCollected}
                  />
                </View>
              )}
            </LiquidGlassCard>

            {/* Recommendations */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Follow-up Recommendations
            </Text>
            <LiquidGlassCard
              variant="light"
              borderRadius={16}
              style={{ height: 92, marginBottom: 22 }}
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <TextInput
                style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}
                multiline
                textAlignVertical="top"
                placeholder="Optional follow-up actions for Web Admin..."
                placeholderTextColor="#94a3b8"
                value={recommendations}
                onChangeText={setRecommendations}
              />
            </LiquidGlassCard>

            {/* Submit CTA */}
            <LiquidGlassButton
              onPress={handleSubmit}
              disabled={loading}
              variant="tinted"
              tintColor="rgba(6, 34, 20, 0.90)"
              dropletColor="#4ade80"
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 17 }}
            >
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                {loading ? "Syncing Report..." : `Complete Checkout & Submit ${serviceConfig.vocab.report}`}
              </Text>
            </LiquidGlassButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LiquidGlassBackdrop>
  );
}
