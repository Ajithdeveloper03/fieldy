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
    <View style={{ flex: 1, backgroundColor: "#f8faf9" }}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/profile")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
              <ChevronLeft size={26} color="#0f172a" />
            </TouchableOpacity>
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
              <View style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 }}>
                <Image source={require("../../assets/images/image3.jpg")} style={{ width: "100%", height: "100%", borderRadius: 56 }} />
                <TouchableOpacity style={{ position: "absolute", bottom: -4, right: -4, width: 40, height: 40, borderRadius: 20, backgroundColor: "#15803d", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#ffffff" }}>
                  <Camera size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* IT LOCK MESSAGE */}
            <View style={{ backgroundColor: "#e0f2fe", padding: 18, borderRadius: 20, marginBottom: 28, flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderColor: "#bae6fd" }}>
              <Lock size={22} color="#0284c7" style={{ marginTop: 2, marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0369a1", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                Service role & Employee ID are synced from {serviceConfig.name}. Contact your Admin to change core HR records.
              </Text>
            </View>

            {/* FORM */}
            <View style={{ gap: 20 }}>
              
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>FULL NAME</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 18, paddingHorizontal: 18, height: 60 }}>
                  <User size={22} color="#64748b" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#334155" }}
                    value={form.fullName}
                    editable={false}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>SERVICE / DEPARTMENT & ID</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 18, paddingHorizontal: 18, height: 60 }}>
                  <Building size={22} color="#64748b" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 17, color: "#334155" }}
                    value={`${form.department} (${form.empId})`}
                    editable={false}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>MOBILE NUMBER</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 18, paddingHorizontal: 18, height: 60, borderWidth: 1, borderColor: "#cbd5e1" }}>
                  <Phone size={22} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#0f172a" }}
                    value={form.mobile}
                    onChangeText={(val) => setForm({ ...form, mobile: val })}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>EMAIL ADDRESS</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 18, paddingHorizontal: 18, height: 60, borderWidth: 1, borderColor: "#cbd5e1" }}>
                  <Mail size={22} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#0f172a" }}
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* SAVE BUTTON */}
            <TouchableOpacity
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
              style={{ backgroundColor: "#15803d", borderRadius: 999, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 36, shadowColor: "#15803d", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
            >
              <Save size={22} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Save Changes</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
