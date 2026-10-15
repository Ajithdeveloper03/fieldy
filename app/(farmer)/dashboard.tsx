import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  MapPin,
  Sprout,
  Package,
  TrendingUp,
  Sun,
  ShieldAlert,
  ChevronRight,
  Bell,
  HelpCircle
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function FarmerDashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* HEADER HERO SECTION */}
        <View style={{ width: "100%", height: 340, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, backgroundColor: "#064e3b" }}>
          <ImageBackground
            source={require("../../assets/images/image4.jpg")}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["rgba(6, 78, 59, 0.9)", "rgba(6, 78, 59, 0.4)", "rgba(0,0,0,0)"]}
              style={StyleSheet.absoluteFill}
            />
            
            {/* Header Content Top */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: Math.max(insets.top, 20) + 10 }}>
              <View>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 26, letterSpacing: 0.5 }}>Good morning,</Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 26, letterSpacing: 0.5, marginTop: -4 }}>Muthuvel</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Brandon-Medium", fontSize: 15, marginTop: 4 }}>You've got a great day ahead.</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(farmer)/notifications")} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}>
                <Bell size={22} color="#ffffff" />
                <View style={{ position: "absolute", top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)" }} />
              </TouchableOpacity>
            </View>

            {/* Weather Overlay inside header */}
            <View style={{ position: "absolute", bottom: 30, left: 24, right: 24, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 }}>
              <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Sun size={28} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>28°C Clear</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14 }}>Coimbatore South, TN</Text>
              </View>
            </View>

          </ImageBackground>
        </View>

        {/* QUICK ACTIONS GRID */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 20 }}>Quick Actions</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {[
              { label: "My Facility", icon: MapPin, route: "/(farmer)/farm", bg: "#dbeafe", color: "#2563eb" },
              { label: "Equipment", icon: Package, route: "/(farmer)/crop-health", bg: "#f1f5f9", color: "#475569" },
              { label: "Service Logs", icon: TrendingUp, route: "/(farmer)/orders", bg: "#fee2e2", color: "#dc2626" },
              { label: "Helpdesk", icon: HelpCircle, route: "/(farmer)/support", bg: "#e0e7ff", color: "#4f46e5" },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} onPress={() => router.push(item.route as any)} style={{ width: "23%", alignItems: "center", marginBottom: 20 }}>
                <View style={{ width: 64, height: 64, borderRadius: 24, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3, marginBottom: 12, borderWidth: 1, borderColor: "#f1f5f9" }}>
                  <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: item.bg, alignItems: "center", justifyContent: "center" }}>
                    <item.icon size={20} color={item.color} />
                  </View>
                </View>
                <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 12, textAlign: "center" }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* LIVE ASSET / HVAC STATUS (Horizontal Cards) */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>Live Asset & Facility Status</Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Package size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text style={{ color: "#3b82f6", fontFamily: "Brandon-Bold", fontSize: 12, textTransform: "uppercase" }}>CHILLER UNIT #1</Text>
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 12 }}>AHU Plant (Tower A)</Text>
              <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start" }}>
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>Active • 52 psi</Text>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Sun size={16} color="#f59e0b" style={{ marginRight: 6 }} />
                <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 12, textTransform: "uppercase" }}>DG BACKUP 500KVA</Text>
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 12 }}>Basement Substation</Text>
              <View style={{ backgroundColor: "#ecfdf5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start" }}>
                <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 11 }}>Standby • Fuel 92%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* FINANCIAL & SLA OVERVIEW */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>SLA & Service Billing</Text>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Annual SLA Contract Value</Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24 }}>₹ 4,80,000</Text>
              </View>
              <View style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 16 }}>
                <TrendingUp size={24} color="#0f172a" />
              </View>
            </View>
            <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9", marginBottom: 16 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Last Billed Cycle</Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>₹ 40,000</Text>
              </View>
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Next Audit Date</Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Oct 22, 2026</Text>
              </View>
            </View>
          </View>
        </View>

        {/* COMING UP BANNER */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>Coming Up</Text>
          <TouchableOpacity onPress={() => router.push("/(farmer)/recommendations")} style={{ width: "100%", height: 160, borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 }}>
            <ImageBackground
              source={require("../../assets/images/image14.jpg")}
              style={{ width: "100%", height: "100%", justifyContent: "flex-end" }}
            >
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={{ position: "absolute", bottom: 0, width: "100%", height: "70%" }}
              />
              <View style={{ padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <ShieldAlert size={14} color="#fcd34d" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#fcd34d", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>PRIORITY ADVISORY</Text>
                  </View>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, lineHeight: 22 }}>Bio-Fertilizer Application Due Tomorrow</Text>
                </View>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" }}>
                  <ChevronRight size={18} color="#0f172a" />
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* RECENT FARM ACTIVITY */}
        <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push("/(farmer)/history")}>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 14 }}>View Log</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#10b981", marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 14 }}>Officer Robert completed a routine check.</Text>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>2h ago</Text>
            </View>
            <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9" }} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#3b82f6", marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 14 }}>Order #4921 delivered successfully.</Text>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Yesterday</Text>
            </View>
            <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9" }} />
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#f59e0b", marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 14 }}>Weather alert: Heavy rain expected.</Text>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Oct 7</Text>
            </View>
          </View>
        </View>

        {/* SUPPORT HUB BANNER */}
        <TouchableOpacity onPress={() => router.push("/(farmer)/support")} style={{ marginHorizontal: 24, marginBottom: 32, backgroundColor: "#0f172a", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 }}>
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <HelpCircle size={24} color="#ffffff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Need Assistance?</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 13 }}>Visit the 24/7 Help Center</Text>
          </View>
          <ChevronRight size={20} color="#ffffff" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
