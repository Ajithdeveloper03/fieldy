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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Lock,
  Save,
  User,
  Mail,
  Phone,
  Building,
  ShieldAlert,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api, getAuthUser } from "../../services/api";
import { showToast } from "../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EditProfileScreen() {
  const { serviceConfig } = useService();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    empId: "",
    mobile: "",
    email: "",
    emergencyPhone: "",
    department: serviceConfig.name,
  });

  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      if (authUser) {
        setForm((prev) => ({
          ...prev,
          fullName: authUser.name || "",
          empId: authUser.employee_code || "",
          mobile: authUser.phone || "",
          email: authUser.email || "",
          department: authUser.company_name || serviceConfig.name,
        }));
      }
      try {
        const dash = await api.get("/employee/dashboard");
        const emp = dash?.data?.employee;
        if (emp) {
          setForm((prev) => ({
            ...prev,
            fullName: emp.name || prev.fullName,
            empId: emp.employee_code || prev.empId,
            mobile: emp.phone || prev.mobile,
            email: emp.email || prev.email,
            department: emp.company_name || serviceConfig.name,
          }));
        }
      } catch {
        // Retain cached values
      }
    })();
  }, [serviceConfig.name]);

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.mobile.trim()) {
      showToast({
        title: "Missing Details",
        message: "Name and mobile number are required.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/employee/profile", {
        name: form.fullName.trim(),
        phone: form.mobile.trim(),
        email: form.email.trim() || null,
        emergency_phone: form.emergencyPhone.trim() || null,
      });

      const updatedUser = res?.user;
      const existing = await getAuthUser();
      await AsyncStorage.setItem(
        "@auth_user",
        JSON.stringify({
          ...(existing || {}),
          ...(updatedUser || {}),
          name: form.fullName.trim(),
          phone: form.mobile.trim(),
          email: form.email.trim(),
        })
      );
      await AsyncStorage.setItem("userName", form.fullName.trim());
      await AsyncStorage.setItem("userPhone", form.mobile.trim());

      Alert.alert("Profile Synced", "Your details have been updated in Web Admin.", [
        {
          text: "OK",
          onPress: () =>
            router.canGoBack() ? router.back() : router.replace("/(employee)/profile"),
        },
      ]);
    } catch (err: any) {
      showToast({
        title: "Update Failed",
        message: err?.message || "Could not update profile right now.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 }}>
            <LiquidGlassIconButton
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/profile"))}
              variant="light"
              size={44}
            >
              <ChevronLeft size={26} color="#0f172a" />
            </LiquidGlassIconButton>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
              Staff Profile Details
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 130 }}
          >
            {/* AVATAR */}
            <View style={{ alignItems: "center", marginBottom: 22 }}>
              <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: "#ffffff", overflow: "hidden" }}>
                <Image
                  source={require("../../assets/images/image3.jpg")}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </View>

            {/* COMPANY INFO BANNER */}
            <LiquidGlassCard
              variant="light"
              borderRadius={20}
              style={{ marginBottom: 22 }}
              contentStyle={{ padding: 16, flexDirection: "row", alignItems: "center" }}
            >
              <LiquidGlassIconBadge size={38} borderRadius={12} variant="light" tintColor="#0284c7" style={{ marginRight: 12 }}>
                <Lock size={18} color="#0284c7" />
              </LiquidGlassIconBadge>
              <Text style={{ flex: 1, color: "#0369a1", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 19 }}>
                Organization & Staff Code are managed by {form.department}. Contact changes sync live to Web Admin.
              </Text>
            </LiquidGlassCard>

            {/* FORM */}
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 4, marginBottom: 6 }}>
                  ORGANIZATION & STAFF ID
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 56 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                >
                  <Building size={20} color="#64748b" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontFamily: "Brandon-Bold", fontSize: 16, color: "#475569" }}
                    value={`${form.department}${form.empId ? ` (${form.empId})` : ""}`}
                    editable={false}
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 4, marginBottom: 6 }}>
                  FULL NAME
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 56 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                >
                  <User size={20} color="#059669" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
                    value={form.fullName}
                    onChangeText={(val) => setForm({ ...form, fullName: val })}
                    placeholder="Your full name"
                    placeholderTextColor="#94a3b8"
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 4, marginBottom: 6 }}>
                  MOBILE NUMBER
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 56 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                >
                  <Phone size={20} color="#059669" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
                    value={form.mobile}
                    onChangeText={(val) => setForm({ ...form, mobile: val })}
                    keyboardType="phone-pad"
                    placeholder="Mobile number"
                    placeholderTextColor="#94a3b8"
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 4, marginBottom: 6 }}>
                  EMAIL ADDRESS
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 56 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                >
                  <Mail size={20} color="#059669" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="Work email"
                    placeholderTextColor="#94a3b8"
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 4, marginBottom: 6 }}>
                  EMERGENCY ESCALATION PHONE (OPTIONAL)
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 56 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}
                >
                  <ShieldAlert size={20} color="#ef4444" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 10, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
                    value={form.emergencyPhone}
                    onChangeText={(val) => setForm({ ...form, emergencyPhone: val })}
                    keyboardType="phone-pad"
                    placeholder="Emergency contact phone"
                    placeholderTextColor="#94a3b8"
                  />
                </LiquidGlassCard>
              </View>
            </View>

            <LiquidGlassButton
              disabled={saving}
              onPress={handleSave}
              variant="tinted"
              tintColor="rgba(21, 128, 61, 0.86)"
              dropletColor="#4ade80"
              style={{ marginTop: 28 }}
              contentStyle={{ paddingVertical: 17 }}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Save size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                    Save & Sync Profile
                  </Text>
                </>
              )}
            </LiquidGlassButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
