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

export default function SubmitReportScreen() {
  const insets = useSafeAreaInsets();
  const { method } = useLocalSearchParams<{ method?: string }>();
  const { serviceConfig } = useService();
  const [notes, setNotes] = useState("");
  const [paymentMode, setPaymentMode] = useState("None");
  const [amountCollected, setAmountCollected] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState("");
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    setPhotos((prev) => [
      ...prev,
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80",
    ]);
  };

  const handleSubmit = () => {
    if (notes.trim().length < 5) {
      showToast({
        title: "Missing Notes",
        message: "Please write short notes (at least 5 characters).",
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
    setTimeout(() => {
      setLoading(false);
      showToast({
        title: "Report Saved",
        message: `${serviceConfig.vocab.visitSingular} marked done.`,
        type: "success",
      });
      router.push("/(employee)/visit/success");
    }, 1000);
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
                defaultValue="4821"
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

          {/* Photos */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
            Add Photo
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            {photos.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={{ width: 88, height: 88, borderRadius: 14, marginRight: 10 }}
              />
            ))}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={pickImage}
              style={{
                width: 88,
                height: 88,
                borderRadius: 14,
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: serviceConfig.themeColor,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <Plus size={28} color={serviceConfig.themeColor} />
            </TouchableOpacity>
          </ScrollView>

          {/* Recommendations */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginBottom: 8 }}>
            Next Steps (Optional)
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
