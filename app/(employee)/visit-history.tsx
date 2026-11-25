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
import { router } from "expo-router";
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

export default function EmployeeVisitHistoryScreen() {
  const history = [
    {
      id: "8842",
      date: "Today, 11:30 AM",
      site_contact: "Apex Cyber Tower",
      project: "AHU & Chiller System Audit",
      status: "Report Submitted",
      location: "Tidel Park Road, Block B",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
    },
    {
      id: "8841",
      date: "Yesterday, 09:15 AM",
      site_contact: "Metro Logistics Hub",
      project: "Dock Leveler & MEP Check",
      status: "Report Submitted",
      location: "Outer Ring Road, Zone 3",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=project&q=80",
    },
    {
      id: "8840",
      date: "24 Jan 2026, 04:00 PM",
      site_contact: "Grand Horizon Corporate Suites",
      project: "Fire Alarm & Sprinkler Audit",
      status: "Flagged Issue",
      location: "Central Business District",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=project&q=80",
    },
    {
      id: "8839",
      date: "22 Jan 2026, 10:30 AM",
      site_contact: "Omni Industrial Park",
      project: "Solar Inverter Performance",
      status: "Report Submitted",
      location: "SIPCOT Phase II",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=project&q=80",
    },
  ];

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
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Showing 44 past visits</Text>
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
                    <Image source={{ uri: visit.image }} style={{ width: "100%", height: "100%" }} />
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
