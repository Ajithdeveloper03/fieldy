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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Lock, Camera, Save, User, Mail, Phone, Building } from "lucide-react-native";

export default function EditProfileScreen() {
  const [form, setForm] = useState({
    fullName: "Robert Walker",
    empId: "EMP1008",
    mobile: "+91 98765 43210",
    email: "robert.walker@infinity.com",
    department: "Field Operations",
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f8faf9" }}>
      <StatusBar barStyle="dark-content" />
      
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/profile")} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Edit Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 24 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* AVATAR EDIT */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#ffffff", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                <Image source={require("../../assets/images/image1.jpg")} style={{ width: "100%", height: "100%", borderRadius: 46 }} />
                <TouchableOpacity style={{ position: "absolute", bottom: -5, right: -5, width: 36, height: 36, borderRadius: 18, backgroundColor: "#15803d", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#ffffff" }}>
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* IT LOCK MESSAGE */}
            <View style={{ backgroundColor: "#e0f2fe", padding: 16, borderRadius: 16, marginBottom: 32, flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderColor: "#bae6fd" }}>
              <Lock size={20} color="#0284c7" style={{ marginTop: 2, marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0369a1", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                Certain fields are managed by the administrator. To update your Core Details (ID, Name), please contact HR.
              </Text>
            </View>

            {/* FORM */}
            <View style={{ gap: 24 }}>
              
              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>FULL NAME</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 16, paddingHorizontal: 16, height: 56 }}>
                  <User size={20} color="#94a3b8" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 16, color: "#64748b" }}
                    value={form.fullName}
                    editable={false}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>EMPLOYEE ID</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 16, paddingHorizontal: 16, height: 56 }}>
                  <Building size={20} color="#94a3b8" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 16, color: "#64748b" }}
                    value={form.empId}
                    editable={false}
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>MOBILE NUMBER</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#e2e8f0" }}>
                  <Phone size={20} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
                    value={form.mobile}
                    onChangeText={(val) => setForm({ ...form, mobile: val })}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4, marginBottom: 8 }}>EMAIL ADDRESS</Text>
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#e2e8f0" }}>
                  <Mail size={20} color="#15803d" />
                  <TextInput
                    style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
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
              onPress={() => {
                Alert.alert("Profile Updated", "Your contact details have been saved.", [
                  { text: "OK", onPress: () => router.canGoBack() ? router.back() : router.replace("/(employee)/profile") }
                ]);
              }}
              style={{ backgroundColor: "#15803d", borderRadius: 999, paddingVertical: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 40, shadowColor: "#15803d", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
            >
              <Save size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Save Changes</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
