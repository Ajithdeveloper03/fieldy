import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { api } from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Calendar,
  Filter,
  FileText,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

const HISTORY_IMAGES = [
  require("../../assets/images/image2.jpg"),
  require("../../assets/images/image5.jpg"),
  require("../../assets/images/image3.jpg"),
  require("../../assets/images/image11.jpg"),
];

export default function EmployeeVisitHistoryScreen() {
  const [rawVisits, setRawVisits] = React.useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        const res = await api.get("/employee/visits").catch(() => null);
        if (active) setRawVisits(Array.isArray(res?.visits) ? res.visits : []);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const history = rawVisits.map((v: any, i: number) => ({
    id: String(v.id),
    date: [v.date, v.time].filter(Boolean).join(", "),
    site_contact: v.farmerName || v.site || "Field Site",
    status: v.status === "completed" ? "Report Submitted" : "In Progress",
    location: v.address || v.farmerCode || "Field Location",
    image: HISTORY_IMAGES[i % HISTORY_IMAGES.length],
  }));

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250 }}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "rgba(243, 241, 236, 0)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={44}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>Visit History</Text>
          <LiquidGlassIconButton variant="dark" size={44}>
            <Filter size={22} color="#ffffff" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 110 }}>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Showing {history.length} past visits</Text>
            <LiquidGlassPill
              variant="dark"
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Calendar size={16} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>This Month</Text>
            </LiquidGlassPill>
          </View>

          {/* Visit Cards */}
          <View style={{ gap: 20 }}>
            {history.length === 0 && (
              <LiquidGlassCard variant="light" borderRadius={28} contentStyle={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>No past visits yet</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4, textAlign: "center" }}>
                  Submitted visit reports appear here automatically.
                </Text>
              </LiquidGlassCard>
            )}
            {history.map((visit) => (
              <LiquidGlassCard
                key={visit.id}
                variant="light"
                borderRadius={28}
                onPress={() => router.push(`/(employee)/report/${visit.id}` as any)}
                contentStyle={{ padding: 22 }}
              >
                
                {/* Status Bar */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottomWidth: 1, borderBottomColor: "rgba(15, 23, 42, 0.08)", paddingBottom: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={16} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 14 }}>{visit.date}</Text>
                  </View>
                  <View style={{ backgroundColor: visit.status === "Flagged Issue" ? "rgba(254, 226, 226, 0.85)" : "rgba(220, 252, 231, 0.85)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                    <Text style={{ color: visit.status === "Flagged Issue" ? "#ef4444" : "#16a34a", fontFamily: "Brandon-Bold", fontSize: 12 }}>{visit.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* SiteContact Info */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
                  <View style={{ width: 76, height: 76, borderRadius: 26, overflow: "hidden", backgroundColor: "#e2e8f0", marginRight: 16 }}>
                    <Image source={visit.image} style={{ width: "100%", height: "100%" }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, lineHeight: 26, marginBottom: 4 }}>{visit.site_contact}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MapPin size={14} color="#64748b" />
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 15, marginLeft: 5 }}>{visit.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255, 255, 255, 0.62)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.92)", paddingHorizontal: 18, paddingVertical: 14, borderRadius: 18 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FileText size={18} color="#0284c7" />
                    <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 8 }}>View Report #{visit.id}</Text>
                  </View>
                  <ArrowRight size={18} color="#0284c7" />
                </View>

              </LiquidGlassCard>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
