import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Lightbulb,
  Droplet,
  Sun,
  ShieldAlert,
  Sprout,
  Calendar,
  CheckCircle2
} from "lucide-react-native";

export default function FarmerRecommendationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" />

      {/* Premium Faint Organic Background */}
      <ImageBackground
        source={require("../../assets/images/image10.jpg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(255,255,255,0.85)" }]} />
        <View style={{ position: "absolute", top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(16, 185, 129, 0.1)" }} />

        <SafeAreaView style={{ flex: 1 }}>
          
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(farmer)/dashboard")} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Advisory & Tips</Text>
            <TouchableOpacity style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
              <Lightbulb size={20} color="#f59e0b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}>
            
            {/* HERO ACTIVE ADVISORY */}
            <LinearGradient
              colors={["#15803d", "#16a34a"]}
              style={{ borderRadius: 32, padding: 24, shadowColor: "#15803d", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 12, marginBottom: 32 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <View style={{ backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, flexDirection: "row", alignItems: "center" }}>
                  <ShieldAlert size={14} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1 }}>PRIORITY ACTION</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 13 }}>Due Tomorrow</Text>
              </View>
              
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginBottom: 8, lineHeight: 30 }}>
                Bio-Fertilizer Application Required
              </Text>
              
              <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 15, marginBottom: 24, lineHeight: 22 }}>
                Officer Robert Walker has assigned a priority task. Due to recent rains washing out topsoil nutrients, apply 2kg of Vetiver Bio-fertilizer per acre immediately.
              </Text>
              
              <TouchableOpacity style={{ backgroundColor: "#ffffff", alignSelf: "flex-start", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999, flexDirection: "row", alignItems: "center" }}>
                <CheckCircle2 size={18} color="#15803d" />
                <Text style={{ color: "#15803d", fontFamily: "Brandon-Bold", fontSize: 15, marginLeft: 8 }}>Mark as Completed</Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* AI SMART RECOMMENDATIONS */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Smart Farming Tips</Text>
            
            <View style={{ gap: 16 }}>
              {/* Tip 1 */}
              <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <Droplet size={24} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Reduce Irrigation</Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>Current soil moisture is high at 45%. Halt drip irrigation for the next 48 hours to prevent root rot.</Text>
                </View>
              </View>

              {/* Tip 2 */}
              <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <Sun size={24} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Optimal Sun Exposure</Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>Expected high UV index tomorrow. Ensure young banana saplings have partial shade protection.</Text>
                </View>
              </View>

              {/* Tip 3 */}
              <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <Sprout size={24} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Harvest Preparation</Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>Vetiver is nearing maturity (Day 45). Begin preparing organic storage bags for harvesting next month.</Text>
                </View>
              </View>
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
