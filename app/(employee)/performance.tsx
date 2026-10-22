import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Hexagon,
  Calendar,
  CheckCircle2,
  PlusCircle,
  BarChart3,
  User
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeePerformanceScreen() {
  const userName = "Field Officer";

  return (
    <View style={{ flex: 1, backgroundColor: "#0284c7" }}>
      <StatusBar barStyle="light-content" />

      {/* Top Gradient Background */}
      <LinearGradient
        colors={["#0ea5e9", "#0284c7", "#0369a1"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
          <View>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32 }}>Hello, Officer</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 16, marginTop: 4 }}>You're on track to...</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Hexagon size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* MASSIVE CIRCULAR RING (Image 3 Inspiration) */}
          <View style={{ alignItems: "center", marginTop: 40, marginBottom: 40 }}>
            <View style={{ width: 260, height: 260, borderRadius: 130, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              {/* Outer Progress Ring Simulation */}
              <View style={{ position: "absolute", width: 260, height: 260, borderRadius: 130, borderLeftWidth: 4, borderTopWidth: 4, borderColor: "#6ee7b7", transform: [{ rotate: "45deg" }] }} />
              
              {/* Inner Content */}
              <View style={{ alignItems: "center", transform: [{ translateY: -10 }] }}>
                <Hexagon size={24} color="#ffffff" style={{ marginBottom: 12 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center", lineHeight: 22 }}>
                  Achieve Monthly{"\n"}Visit Quota
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 64, marginTop: 8, letterSpacing: -2 }}>
                  86<Text style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>%</Text>
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 8 }}>Efficiency Level</Text>
              </View>

              {/* Dots at bottom inside ring */}
              <View style={{ position: "absolute", bottom: 24, flexDirection: "row", gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff" }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" }} />
              </View>
            </View>
          </View>

          {/* HORIZONTAL CALENDAR STRIP */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 32, marginBottom: 32 }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => {
              const isToday = index === 2; // W is active
              return (
                <View key={index} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: isToday ? "#ffffff" : "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", borderWidth: index === 0 || index === 1 ? 1 : 0, borderColor: "rgba(255,255,255,0.3)", borderStyle: index === 0 || index === 1 ? "dashed" : "solid" }}>
                  <Text style={{ color: isToday ? "#0284c7" : "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 14 }}>{day}</Text>
                </View>
              );
            })}
          </View>

          {/* BOTTOM WHITE CARD AGENDA */}
          <View style={{ backgroundColor: "#ffffff", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, minHeight: 400 }}>
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Today, 26 Jan 2026</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>1/3 • 2h 23m mins gap</Text>
              </View>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
                <Calendar size={18} color="#0f172a" />
              </View>
            </View>

            {/* Timeline Item 1 */}
            <View style={{ flexDirection: "row", marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 24, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>AHU Maintenance <Text style={{ color: "#10b981" }}>(+40 pts)</Text></Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>Metro Tower • OTP Verified</Text>
                </View>
                <CheckCircle2 size={24} color="#0f172a" />
              </View>
              <View style={{ width: 60, alignItems: "center" }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12, marginBottom: 8 }}>09:01</Text>
                <View style={{ width: 2, flex: 1, backgroundColor: "#e2e8f0" }} />
              </View>
            </View>

            {/* Timeline Item 2 */}
            <View style={{ flexDirection: "row", marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 24, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Fire Safety Audit <Text style={{ color: "#38bdf8" }}>(+35 pts)</Text></Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>Apex Logistics • In Progress</Text>
                </View>
                <PlusCircle size={24} color="#0284c7" />
              </View>
              <View style={{ width: 60, alignItems: "center" }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: "#0284c7", backgroundColor: "#ffffff", marginBottom: 8 }} />
                <View style={{ width: 2, flex: 1, backgroundColor: "#e2e8f0" }} />
              </View>
            </View>

          </View>

        </ScrollView>

        {/* Floating Bottom Nav Bar embedded in card */}
        <View style={{ position: "absolute", bottom: 40, left: 24, right: 24, backgroundColor: "#1e293b", borderRadius: 32, paddingVertical: 20, paddingHorizontal: 32, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>
          <View style={{ alignItems: "center" }}>
            <Calendar size={24} color="#ffffff" />
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#ffffff", marginTop: 4 }} />
          </View>
          <View style={{ alignItems: "center" }}><BarChart3 size={24} color="#64748b" /></View>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" }}><PlusCircle size={24} color="#ffffff" /></View>
          <View style={{ alignItems: "center" }}><User size={24} color="#64748b" /></View>
        </View>

      </SafeAreaView>
    </View>
  );
}
