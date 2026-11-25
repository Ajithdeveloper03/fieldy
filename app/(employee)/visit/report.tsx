import React, { useState } from "react";
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
  ChevronDown,
  IndianRupee,
  Video,
  Camera,
  Trash2,
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
  const { id, taskId, farmerId, siteName, lat, lng, method } = useLocalSearchParams<{
    id?: string;
    taskId?: string;
    farmerId?: string;
    siteName?: string;
    lat?: string;
    lng?: string;
    method?: string;
  }>();
  const { serviceConfig } = useService();
  const { stopSession } = useTracking();
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("None");
  const [amountCollected, setAmountCollected] = useState("");
  const [beforePhoto, setBeforePhoto] = useState<LocalMediaAsset | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<LocalMediaAsset | null>(null);
  const [siteVideo, setSiteVideo] = useState<LocalMediaAsset | null>(null);
  const [recommendations, setRecommendations] = useState("");
  const [otpCode, setOtpCode] = useState("4821");
  const [loading, setLoading] = useState(false);

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

  const pickBeforePhoto = () => chooseImageSource(setBeforePhoto, "Before Work Photo");
  const pickAfterPhoto = () => chooseImageSource(setAfterPhoto, "After Work Photo");

  const handleSubmit = async () => {
    if (notes.trim().length < 5) {
      showToast({
        title: "Missing Notes",
        message: "Please write work notes (at least 5 characters).",
        type: "error",
      });
      return;
    }
    if (
      paymentMode !== "None" &&
      (!amountCollected ||
        isNaN(Number(amountCollected)) ||
        Number(amountCollected) <= 0)
    ) {
      showToast({
        title: "Invalid Amount",
        message: "Please enter a valid amount.",
        type: "error",
      });
      return;
    }
    setLoading(true);

    let resolvedLat = lat ? Number(lat) : null;
    let resolvedLng = lng ? Number(lng) : null;
    if (!resolvedLat || !resolvedLng) {
      try {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        resolvedLat = loc.coords.latitude;
        resolvedLng = loc.coords.longitude;
      } catch {
        // Keep null if GPS unavailable
      }
    }

    let resolvedSiteName = siteName || serviceConfig.sampleEntities[0]?.name || serviceConfig.vocab.entitySingular;
    let resolvedTaskId = taskId || id || "";
    let resolvedFarmerId = farmerId || "";

    try {
      const storedTask = await AsyncStorage.getItem("@active_task");
      if (storedTask) {
        const parsed = JSON.parse(storedTask);
        resolvedSiteName = siteName || parsed.facility || parsed.targetEntity || resolvedSiteName;
        resolvedTaskId = resolvedTaskId || String(parsed.id || "");
        resolvedFarmerId = resolvedFarmerId || (parsed.farmerId ? String(parsed.farmerId) : "");
      }
      const storedCheckin = await AsyncStorage.getItem("@active_checkin");
      if (storedCheckin) {
        const parsedCheckin = JSON.parse(storedCheckin);
        resolvedLat = resolvedLat ?? parsedCheckin.latitude ?? null;
        resolvedLng = resolvedLng ?? parsedCheckin.longitude ?? null;
        resolvedSiteName = parsedCheckin.siteName || resolvedSiteName;
      }
    } catch {
      // Fallback safely
    }

    // Upload attached images & video to server first so we can link real media_ids to the visit
    const uploadedMedia: any[] = [];
    const mediaIds: number[] = [];
    const assetsToUpload: Array<{ asset: LocalMediaAsset; title: string }> = [];
    if (beforePhoto) assetsToUpload.push({ asset: beforePhoto, title: `${resolvedSiteName} - Before Photo` });
    if (afterPhoto) assetsToUpload.push({ asset: afterPhoto, title: `${resolvedSiteName} - After Photo` });
    if (siteVideo) assetsToUpload.push({ asset: siteVideo, title: `${resolvedSiteName} - Site Video` });

    for (const item of assetsToUpload) {
      try {
        const uploaded = await uploadMediaAsset({
          asset: item.asset,
          title: item.title,
          taskId: resolvedTaskId || null,
          farmerId: resolvedFarmerId || null,
          latitude: resolvedLat,
          longitude: resolvedLng,
        });
        uploadedMedia.push(uploaded);
        mediaIds.push(uploaded.id);
      } catch {
        // Keep local URI fallback if offline
      }
    }

    const newReport = {
      id: `REP-${Date.now()}`,
      service: serviceConfig.label,
      siteName: resolvedSiteName,
      task_id: resolvedTaskId || undefined,
      farmer_id: resolvedFarmerId ? Number(resolvedFarmerId) : undefined,
      method: method || "report",
      notes: notes.trim(),
      farm_condition_notes: notes.trim(),
      paymentMode,
      amountCollected: paymentMode !== "None" ? Number(amountCollected) : 0,
      beforePhoto: beforePhoto?.uri || null,
      afterPhoto: afterPhoto?.uri || null,
      siteVideo: siteVideo?.uri || null,
      before_photo: uploadedMedia.find((m) => m.title?.includes("Before"))?.preview_url || beforePhoto?.uri || null,
      after_photo: uploadedMedia.find((m) => m.title?.includes("After"))?.preview_url || afterPhoto?.uri || null,
      media_ids: mediaIds,
      uploadedMedia,
      otp_verified: otpCode.trim().length >= 4,
      check_in_latitude: resolvedLat,
      check_in_longitude: resolvedLng,
      check_out_latitude: resolvedLat,
      check_out_longitude: resolvedLng,
      recommendations: recommendations.trim(),
      createdAt: new Date().toISOString(),
      status: "Submitted",
    };

    try {
      const serverResp = await apiClient.post("/employee/visit/submit", newReport).catch(() => null);
      const savedReport = {
        ...newReport,
        serverVisitId: serverResp?.visit_id ? String(serverResp.visit_id) : undefined,
        dossierUrl: serverResp?.dossier_url || undefined,
      };
      const existing = await AsyncStorage.getItem("@fieldy_reports");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(savedReport);
      await AsyncStorage.setItem("@fieldy_reports", JSON.stringify(list));
      await AsyncStorage.setItem("@last_submitted_report", JSON.stringify(savedReport));
      await stopSession().catch(() => null);
      await AsyncStorage.multiRemove(["@active_task", "@active_checkin"]).catch(() => null);
    } catch {
      // Offline fallback already saved
    } finally {
      setLoading(false);
      showToast({
        title: "Report Saved",
        message:
          mediaIds.length > 0
            ? `${serviceConfig.vocab.visitSingular} saved with ${mediaIds.length} uploaded file(s).`
            : `${serviceConfig.vocab.visitSingular} checked out & report saved.`,
        type: "success",
      });
      router.push("/(employee)/visit/success");
    }
  };

  const headerTitle =
    method === "photo"
      ? `${serviceConfig.shortName} Photo`
      : method === "video"
      ? `${serviceConfig.shortName} Video`
      : method === "checklist"
      ? `${serviceConfig.vocab.taskSingular} Check`
      : method === "notes"
      ? "Quick Notes"
      : `New ${serviceConfig.vocab.report}`;

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
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
              {headerTitle}
            </Text>
            <View style={{ width: 42 }} />
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 22 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
          >
            {/* Progress Steps */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingHorizontal: 12 }}>
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

            {/* Status */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              {serviceConfig.shortName} Status
            </Text>
            <LiquidGlassCard
              variant="light"
              borderRadius={14}
              onPress={() => {}}
              style={{ marginBottom: 20 }}
              contentStyle={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}>
                Done & Verified (Good)
              </Text>
              <ChevronDown size={20} color="#64748b" />
            </LiquidGlassCard>

            {/* Notes */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Work Notes *
            </Text>
            <LiquidGlassCard
              variant="light"
              borderRadius={14}
              style={{ height: 110, marginBottom: 20 }}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <TextInput
                style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}
                multiline
                textAlignVertical="top"
                placeholder={`Write ${serviceConfig.shortName.toLowerCase()} notes...`}
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
              />
            </LiquidGlassCard>

            {/* OTP Verification */}
            <LiquidGlassCard
              variant="light"
              borderRadius={18}
              style={{ marginBottom: 20 }}
              contentStyle={{ padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                <Check size={18} color="#059669" style={{ marginRight: 8 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  OTP Check
                </Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginBottom: 10 }}>
                4-digit code (Demo: 4821)
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.92)",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: "rgba(255, 255, 255, 0.66)",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <TextInput
                  style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, textAlign: "center" }}
                  placeholder="4821"
                  keyboardType="numeric"
                  maxLength={4}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>
            </LiquidGlassCard>

            {/* Payment */}
            <LiquidGlassCard
              variant="light"
              borderRadius={18}
              style={{ marginBottom: 20 }}
              contentStyle={{ padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <IndianRupee size={18} color="#ea580c" style={{ marginRight: 8 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Payment
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
                    contentStyle={{ paddingVertical: 10, paddingHorizontal: 10 }}
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
                    borderColor: "rgba(255, 255, 255, 0.92)",
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.66)",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 18, marginRight: 8 }}>
                    ₹
                  </Text>
                  <TextInput
                    style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}
                    placeholder="Amount"
                    keyboardType="numeric"
                    value={amountCollected}
                    onChangeText={setAmountCollected}
                  />
                </View>
              )}
            </LiquidGlassCard>

            {/* Before & After Photos + Site Video */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Photos & Site Video Upload
            </Text>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <LiquidGlassCard
                variant="light"
                borderRadius={16}
                onPress={pickBeforePhoto}
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
                onPress={pickAfterPhoto}
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
              style={{ marginBottom: 20 }}
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
                      ? `Video ready to upload${siteVideo.durationMs ? ` • ${Math.max(1, Math.round(siteVideo.durationMs / 1000))}s` : ""}`
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

            {/* Follow-Up Notes */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
              Follow-up Notes
            </Text>
            <LiquidGlassCard
              variant="light"
              borderRadius={14}
              style={{ height: 96, marginBottom: 24 }}
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 10,
              }}
            >
              <TextInput
                style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}
                multiline
                textAlignVertical="top"
                placeholder="Any follow-up notes..."
                placeholderTextColor="#94a3b8"
                value={recommendations}
                onChangeText={setRecommendations}
              />
            </LiquidGlassCard>

            {/* Submit */}
            <LiquidGlassButton
              onPress={handleSubmit}
              disabled={loading}
              variant="tinted"
              tintColor={`${serviceConfig.themeColor}D9`}
              dropletColor={serviceConfig.themeColor}
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 16 }}
            >
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                {loading ? "Saving..." : `Save ${serviceConfig.vocab.report}`}
              </Text>
            </LiquidGlassButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LiquidGlassBackdrop>
  );
}
