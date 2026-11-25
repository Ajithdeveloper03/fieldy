import React, { useEffect, useState } from "react";
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Lock, Camera, Save, User, Mail, Phone, Building } from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api, getAuthUser } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EditProfileScreen() {
  const { serviceConfig } = useService();
  const [form, setForm] = useState({
    fullName: "Field Officer",
    empId: "EMP-001",
    mobile: "+91 98400 00000",
    email: "officer@fieldy.app",
    department: serviceConfig.name,
  });

  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      const storedName = await AsyncStorage.getItem("userName");
      setForm((prev) => ({
        ...prev,
        fullName: authUser?.name || storedName || prev.fullName,
        empId: authUser?.employee_code || prev.empId,
        mobile: authUser?.phone || prev.mobile,
        email: authUser?.email || prev.email,
        department: serviceConfig.name,
      }));
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
            department: emp.company?.name || serviceConfig.name,
          }));
        }
      } catch {
        // Fallback smoothly
      }
    })();
  }, [serviceConfig.name]);

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }}>
            <LiquidGlassIconButton
              onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/profile")}
              variant="light"
              size={44}
            >
              <ChevronLeft size={26} color="#0f172a" />
            </LiquidGlassIconButton>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24 }}>Officer Credentials</Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 22 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* AVATAR EDIT */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "rgba(255, 255, 255, 0.94)", shadowColor: "#1A1D24", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 6 }}>
                <Image source={require("../../assets/images/image3.jpg")} style={{ width: "100%", height: "100%", borderRadius: 56 }} />
                <LiquidGlassIconButton
                  variant="tinted"
                  tintColor="rgba(21, 128, 61, 0.84)"
                  dropletColor="#4ade80"
                  size={40}
                  style={{ position: "absolute", bottom: -4, right: -4 }}
                >
                  <Camera size={18} color="#ffffff" />
                </LiquidGlassIconButton>
              </View>
            </View>

            {/* IT LOCK MESSAGE */}
            <LiquidGlassCard
              variant="light"
              borderRadius={20}
              style={{ marginBottom: 28 }}
              contentStyle={{ padding: 18, flexDirection: "row", alignItems: "flex-start" }}
            >
              <LiquidGlassIconBadge
                size={38}
                borderRadius={12}
                variant="light"
                tintColor="#0284c7"
                style={{ marginRight: 12 }}
              >
                <Lock size={18} color="#0284c7" />
              </LiquidGlassIconBadge>
              <Text style={{ flex: 1, color: "#0369a1", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                Service role & Employee ID are synced from {serviceConfig.name}. Contact your Admin to change core HR records.
              </Text>
            </LiquidGlassCard>

            {/* FORM */}
            <View style={{ gap: 20 }}>
              
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>FULL NAME</Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  intensity={64}
                  style={{ height: 60 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}
                >
                  <User size={22} color="#64748b" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#334155" }}
                    value={form.fullName}
                    editable={false}
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>SERVICE / DEPARTMENT & ID</Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  intensity={64}
                  style={{ height: 60 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}
                >
                  <Building size={22} color="#64748b" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 17, color: "#334155" }}
                    value={`${form.department} (${form.empId})`}
                    editable={false}
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>MOBILE NUMBER</Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 60 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}
                >
                  <Phone size={22} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#0f172a" }}
                    value={form.mobile}
                    onChangeText={(val) => setForm({ ...form, mobile: val })}
                    keyboardType="phone-pad"
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>EMAIL ADDRESS</Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 60 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18 }}
                >
                  <Mail size={22} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#0f172a" }}
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </LiquidGlassCard>
              </View>
            </View>

            {/* SAVE BUTTON */}
            <LiquidGlassButton
              onPress={async () => {
                const existing = await getAuthUser();
                await AsyncStorage.setItem(
                  "@fieldy_user",
                  JSON.stringify({
                    ...(existing || {}),
                    name: form.fullName,
                    employee_code: form.empId,
                    phone: form.mobile,
                    email: form.email,
                  })
                );
                Alert.alert("Profile Updated", "Your contact details have been saved.", [
                  { text: "OK", onPress: () => router.canGoBack() ? router.back() : router.replace("/(employee)/profile") }
                ]);
              }}
              variant="tinted"
              tintColor="rgba(21, 128, 61, 0.84)"
              dropletColor="#4ade80"
              style={{ marginTop: 36 }}
              contentStyle={{ paddingVertical: 18 }}
            >
              <Save size={22} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Save Changes</Text>
            </LiquidGlassButton>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
