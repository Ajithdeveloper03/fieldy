import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Check,
  Plus,
  ChevronDown,
  IndianRupee,
} from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";
import { useTracking } from "../../../context/TrackingContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { apiClient } from "../../../api/client";

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
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState("");
  const [otpCode, setOtpCode] = useState("4821");
  const [loading, setLoading] = useState(false);

  const capturePhoto = async (setter: (uri: string) => void) => {
    try {
      const camPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (camPerm.granted) {
        const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.6 });
        if (!res.canceled && res.assets?.[0]?.uri) {
          setter(res.assets[0].uri);
          return;
        }
      }
      const libRes = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.6 });
      if (!libRes.canceled && libRes.assets?.[0]?.uri) {
        setter(libRes.assets[0].uri);
      }
    } catch {
      showToast({ title: "Camera Notice", message: "Please allow camera or photo access.", type: "info" });
    }
  };

  const pickBeforePhoto = () => void capturePhoto((uri) => setBeforePhoto(uri));
  const pickAfterPhoto = () => void capturePhoto((uri) => setAfterPhoto(uri));

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
      beforePhoto,
      afterPhoto,
      before_photo: beforePhoto,
      after_photo: afterPhoto,
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
      const existing = await AsyncStorage.getItem("@fieldy_reports");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newReport);
      await AsyncStorage.setItem("@fieldy_reports", JSON.stringify(list));
      await AsyncStorage.setItem("@last_submitted_report", JSON.stringify(newReport));
      await apiClient.post("/employee/visit/submit", newReport).catch(() => null);
      await stopSession().catch(() => null);
      await AsyncStorage.multiRemove(["@active_task", "@active_checkin"]).catch(() => null);
    } catch {
      // Offline fallback already saved
    } finally {
      setLoading(false);
      showToast({
        title: "Report Saved",
        message: `${serviceConfig.vocab.visitSingular} checked out & report saved.`,
        type: "success",
      });
      router.push("/(employee)/visit/success");
    }
  };

  const headerTitle =
    method === "photo"
      ? `${serviceConfig.shortName} Photo`
      : method === "checklist"
      ? `${serviceConfig.vocab.taskSingular} Check`
      : method === "notes"
      ? "Quick Notes"
      : `New ${serviceConfig.vocab.report}`;

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar barStyle="dark-content" />
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
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <ChevronLeft size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
            {headerTitle}
          </Text>
          <View style={{ width: 40 }} />
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
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 14,
              marginBottom: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#f8fafc",
            }}
          >
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15 }}>
              Done & Verified (Good)
            </Text>
            <ChevronDown size={20} color="#64748b" />
          </TouchableOpacity>

          {/* Notes */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
            Work Notes *
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 20,
              backgroundColor: "#f8fafc",
              height: 110,
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
          </View>

          {/* OTP Verification */}
          <View
            style={{
              backgroundColor: "#ecfdf5",
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#a7f3d0",
            }}
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
                borderColor: "#a7f3d0",
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                backgroundColor: "#ffffff",
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
          </View>

          {/* Payment */}
          <View
            style={{
              backgroundColor: "#fff7ed",
              borderRadius: 18,
              padding: 16,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: "#fed7aa",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <IndianRupee size={18} color="#ea580c" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                Payment
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: paymentMode !== "None" ? 12 : 0 }}>
              {["None", "Cash", "UPI"].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setPaymentMode(mode)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    borderWidth: 1,
                    backgroundColor: paymentMode === mode ? "#f97316" : "#ffffff",
                    borderColor: paymentMode === mode ? "#f97316" : "#e2e8f0",
                  }}
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
                </TouchableOpacity>
              ))}
            </View>
            {paymentMode !== "None" && (
              <View
                style={{
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: "#ffffff",
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
          </View>

          {/* Before & After Photos */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
            Before & After Work Photos
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickBeforePhoto}
              style={{
                flex: 1,
                height: 112,
                borderRadius: 16,
                borderWidth: beforePhoto ? 1 : 2,
                borderStyle: beforePhoto ? "solid" : "dashed",
                borderColor: beforePhoto ? "#16a34a" : serviceConfig.themeColor,
                backgroundColor: beforePhoto ? "#f0fdf4" : "#f8fafc",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {beforePhoto ? (
                <Image source={{ uri: beforePhoto }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <>
                  <Plus size={24} color={serviceConfig.themeColor} />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12, marginTop: 4 }}>
                    Before Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickAfterPhoto}
              style={{
                flex: 1,
                height: 112,
                borderRadius: 16,
                borderWidth: afterPhoto ? 1 : 2,
                borderStyle: afterPhoto ? "solid" : "dashed",
                borderColor: afterPhoto ? "#16a34a" : serviceConfig.themeColor,
                backgroundColor: afterPhoto ? "#f0fdf4" : "#f8fafc",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {afterPhoto ? (
                <Image source={{ uri: afterPhoto }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
              ) : (
                <>
                  <Plus size={24} color={serviceConfig.themeColor} />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12, marginTop: 4 }}>
                    After Photo
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Follow-Up Notes */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
            Follow-up Notes
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 10,
              marginBottom: 24,
              backgroundColor: "#f8fafc",
              height: 96,
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
          </View>

          {/* Submit */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              paddingVertical: 16,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: serviceConfig.themeColor,
            }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
              {loading ? "Saving..." : `Save ${serviceConfig.vocab.report}`}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
