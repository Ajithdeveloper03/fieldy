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
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 36, textAlign: "center", lineHeight: 42, marginBottom: 16 }}>
            {t("chooseRole", "Choose Your Path")}
          </Text> 
          <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center", lineHeight: 24, marginBottom: 32 }}>
            {language === "ta"
              ? "உங்கள் கணக்கைத் தொடர உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்."
              : "Select your role to access Facility Management services and portals."}
          </Text>
          <View style={{ gap: 16, marginBottom: 32 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole("employee")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: role === "employee" ? "#0f172a" : "#f1f5f9",
                borderRadius: 999,
                padding: 16,
                borderWidth: role === "employee" ? 0 : 1,
                borderColor: "#e2e8f0"
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: role === "employee" ? "#334155" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                <Briefcase size={24} color={role === "employee" ? "#ffffff" : "#475569"} />
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: role === "employee" ? "#ffffff" : "#000000", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                  {t("fieldOfficer", "Facility Officer / Staff")}
                </Text>
                <Text style={{ color: role === "employee" ? "rgba(255,255,255,0.7)" : "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  {language === "ta" ? "வருகைகளை நிர்வகிக்கவும்" : "Manage site inspections & service tasks"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setRole("farmer")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: role === "farmer" ? "#0f172a" : "#f1f5f9",
                borderRadius: 999,
                padding: 16,
                borderWidth: role === "farmer" ? 0 : 1,
                borderColor: "#e2e8f0"
              }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: role === "farmer" ? "#334155" : "#ffffff", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={24} color={role === "farmer" ? "#ffffff" : "#475569"} />
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ color: role === "farmer" ? "#ffffff" : "#000000", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                  {t("facilityClient", "Facility / Client")}
                </Text>
                <Text style={{ color: role === "farmer" ? "rgba(255,255,255,0.7)" : "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  {language === "ta" ? "சேவைகளைக் கண்காணிக்கவும்" : "Track facility audits & service tickets"}
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
            style={{ width: "100%", backgroundColor: "#15803d", borderRadius: 999, paddingVertical: 20, alignItems: "center", shadowColor: "#15803d", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Get Started</Text>
          </TouchableOpacity>

        </View>

      </SafeAreaView>
      </View>
      </ImageBackground>
    </View>
  );
}
