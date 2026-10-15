import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { Users, Building2, Briefcase } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ImageBackground
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage, LanguageTogglePill } from "../context/LanguageContext";
export default function IntroScreen() {
  const [role, setRole] = useState<"farmer" | "employee">("employee");
  const { t, language } = useLanguage();
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground 
        source={require("../assets/images/image18.jpg")} 
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.9 }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(15,23,42,0.45)" }}>
          <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
            {/* TOP FLOATING TOGGLE */}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, paddingTop: 16 }}>
              <LanguageTogglePill />
            </View>
            {/* MASSIVE CENTRAL ILLUSTRATION */}
            <View style={{ alignItems: "center", justifyContent: "center", flex: 1, paddingHorizontal: 24, zIndex: 0 }}>
              <View style={{ width: "100%", alignItems: "center", justifyContent: "center" }}>
                <View style={{ width: 280, height: 160, borderRadius: 32, backgroundColor: "#ffffff", borderWidth: 4, borderColor: "rgba(255,255,255,0.4)", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
                  <Image 
                    source={require("../assets/images/logo.png")} 
                    style={{ width: 240, height: 110 }} 
                    resizeMode="contain"
                  />
                </View>
                {/* Floating flower/star accents */}
                
              </View>
            </View>

        <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 32, paddingTop: 40, paddingBottom: 48, shadowColor: "#000", shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.1, shadowRadius: 32, zIndex: 10 }}>
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 32, textAlign: "center", lineHeight: 38, marginBottom: 12 }}>
            Field Operations Portal
          </Text> 
          <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 28 }}>
            Field staff & technician operational workspace for real-time facility inspections, attendance, and SLA task execution.
          </Text>
          <View style={{ gap: 12, marginBottom: 28 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole("employee")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: role === "employee" ? "#0f172a" : "#f1f5f9",
                borderRadius: 24,
                padding: 16,
                borderWidth: role === "employee" ? 2 : 1,
                borderColor: role === "employee" ? "#334155" : "#e2e8f0"
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: role === "employee" ? "#334155" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={24} color={role === "employee" ? "#ffffff" : "#475569"} />
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ color: role === "employee" ? "#ffffff" : "#000000", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                    Facility Staff / Technician
                  </Text>
                  <View style={{ backgroundColor: "#22c55e", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ color: "#ffffff", fontSize: 10, fontFamily: "Brandon-Bold" }}>PRIMARY</Text>
                  </View>
                </View>
                <Text style={{ color: role === "employee" ? "rgba(255,255,255,0.7)" : "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                  GPS Tracking, Attendance, Audits & Work Orders
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole("farmer")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: role === "farmer" ? "#0f172a" : "#f8fafc",
                borderRadius: 20,
                padding: 14,
                borderWidth: 1,
                borderColor: role === "farmer" ? "#0f172a" : "#e2e8f0",
                opacity: 0.8
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: role === "farmer" ? "#334155" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={20} color={role === "farmer" ? "#ffffff" : "#64748b"} />
              </View>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: role === "farmer" ? "#ffffff" : "#475569", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Facility / Client Access
                </Text>
                <Text style={{ color: role === "farmer" ? "rgba(255,255,255,0.7)" : "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>
                  Client reporting & tickets (Optional)
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* GET STARTED ACTION */}
          <TouchableOpacity 
            onPress={() => {
              if (role === "employee") {
                router.replace("/(auth)/login");
              } else {
                router.replace("/(auth)/farmer-login");
              }
            }}
            style={{ width: "100%", backgroundColor: "#0f172a", borderRadius: 999, paddingVertical: 18, alignItems: "center", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17 }}>
              {role === "employee" ? "Login to Staff Workspace" : "Access Client Portal"}
            </Text>
          </TouchableOpacity>

        </View>

      </SafeAreaView>
      </View>
      </ImageBackground>
    </View>
  );
}
