import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react-native";

export default function EmployeeVisitHistoryScreen() {
  const history = [
    {
      id: "8842",
      date: "Today, 11:30 AM",
      farmer: "Apex Cyber Tower",
      crop: "AHU & Chiller System Audit",
      status: "Report Submitted",
      location: "Tidel Park Road, Block B",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "8841",
      date: "Yesterday, 09:15 AM",
      farmer: "Metro Logistics Hub",
      crop: "Dock Leveler & MEP Check",
      status: "Report Submitted",
      location: "Outer Ring Road, Zone 3",
      image: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "8840",
      date: "24 Jan 2026, 04:00 PM",
      farmer: "Grand Horizon Corporate Suites",
      crop: "Fire Alarm & Sprinkler Audit",
      status: "Flagged Issue",
      location: "Central Business District",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    },
    {
      id: "8839",
      date: "22 Jan 2026, 10:30 AM",
      farmer: "Omni Industrial Park",
      crop: "Solar Inverter Performance",
      status: "Report Submitted",
      location: "SIPCOT Phase II",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250 }}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#f8fafc"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Visit History</Text>
          <TouchableOpacity style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <Filter size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Medium", fontSize: 16 }}>Showing 44 past visits</Text>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Calendar size={14} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>This Month</Text>
            </View>
          </View>

          {/* Visit Cards */}
          <View style={{ gap: 16 }}>
            {history.map((visit) => (
              <TouchableOpacity 
                key={visit.id} 
                activeOpacity={0.9}
                onPress={() => router.push(`/(employee)/report/${visit.id}` as any)}
                style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}
              >
                
                {/* Status Bar */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", paddingBottom: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Clock size={14} color="#64748b" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>{visit.date}</Text>
                  </View>
                  <View style={{ backgroundColor: visit.status === "Flagged Issue" ? "#fee2e2" : "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: visit.status === "Flagged Issue" ? "#ef4444" : "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>{visit.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Farmer Info */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <View style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden", backgroundColor: "#e2e8f0", marginRight: 16 }}>
                    <Image source={{ uri: visit.image }} style={{ width: "100%", height: "100%" }} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 2 }}>{visit.farmer}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MapPin size={12} color="#94a3b8" />
                      <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>{visit.location}</Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FileText size={16} color="#0284c7" />
                    <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 8 }}>View Report #{visit.id}</Text>
                  </View>
                  <ArrowRight size={16} color="#0284c7" />
                </View>

              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
