import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  StyleSheet
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Sprout,
  Droplets,
  Sun,
  ThermometerSun,
  Activity,
  AlertTriangle,
  ChevronRight,
  ClipboardList
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProjectHealthScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("construction");

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* CLEAN GEOMETRIC HEADER */}
      <View style={{ width: "100%", backgroundColor: "#ffffff", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 5 }}>
        <SafeAreaView edges={["top"]} style={{ paddingTop: 10 }}>
          
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 16 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Project Intelligence</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* CUSTOM TAB SELECTOR */}
          <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
            <TouchableOpacity 
              onPress={() => setActiveTab("construction")} 
              style={{ flex: 1, backgroundColor: activeTab === "construction" ? "#10b981" : "#f1f5f9", borderRadius: 16, paddingVertical: 12, alignItems: "center", shadowColor: activeTab === "construction" ? "#10b981" : "transparent", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 }}
            >
              <Text style={{ color: activeTab === "construction" ? "#ffffff" : "#64748b", fontFamily: "Brandon-Bold", fontSize: 15 }}>Construction (Sector 1)</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab("banana")} 
              style={{ flex: 1, backgroundColor: activeTab === "banana" ? "#10b981" : "#f1f5f9", borderRadius: 16, paddingVertical: 12, alignItems: "center", shadowColor: activeTab === "banana" ? "#10b981" : "transparent", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 }}
            >
              <Text style={{ color: activeTab === "banana" ? "#ffffff" : "#64748b", fontFamily: "Brandon-Bold", fontSize: 15 }}>Banana (Sec 2)</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 24 }}>
        
        {/* VITAL SIGNS OVAL DASHBOARD */}
        <View style={{ backgroundColor: "#064e3b", borderRadius: 32, padding: 24, marginBottom: 32, shadowColor: "#064e3b", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <View>
              <Text style={{ color: "#34d399", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>GROWTH STAGE</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28 }}>Vegetative</Text>
            </View>
            <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: "#064e3b", fontFamily: "Brandon-Bold", fontSize: 14 }}>Day 45 of 90</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 24, padding: 16 }}>
            <View style={{ alignItems: "center" }}>
              <Droplets size={24} color="#60a5fa" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Moisture</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>68%</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View style={{ alignItems: "center" }}>
              <ThermometerSun size={24} color="#fbbf24" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Soil Temp</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>24°C</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View style={{ alignItems: "center" }}>
              <Activity size={24} color="#a78bfa" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Health</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>98%</Text>
            </View>
          </View>
        </View>

        {/* PRIORITY ALERTS */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Project Alerts</Text>
        
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
          {activeTab === "construction" ? (
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Sprout size={24} color="#10b981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Project is perfectly optimal</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>No immediate action required. Continue current watering schedule.</Text>
              </View>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <AlertTriangle size={24} color="#ef4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Drought Stress Detected</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>A guardrail is missing near the stairwell. Restrict access and log a corrective work order.</Text>
                <TouchableOpacity onPress={() => router.push("/(site-contact)/documents" as any)} style={{ backgroundColor: "#fef2f2", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginTop: 12, alignSelf: "flex-start" }}>
                  <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 14 }}>View Rescue Guide</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* RECENT INSPECTIONS - DYNAMIC CARDS */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Officer Inspections</Text>
          <TouchableOpacity onPress={() => router.push("/(site-contact)/history")}>
            <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 14 }}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(site-contact)/support")} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <ClipboardList size={24} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Last Visit: Oct 2, 2026</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Officer Robert Walker</Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
