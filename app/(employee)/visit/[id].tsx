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
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Target,
  ClipboardList,
  Navigation,
  Camera,
  AlertTriangle
} from "lucide-react-native";

export default function EmployeeVisitPurposeScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* Hero Header Gradient */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250 }}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "#f8fafc"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Visit Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          {/* Target Profile Card */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10, marginBottom: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#e2e8f0", overflow: "hidden", marginRight: 16 }}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }} style={{ width: "100%", height: "100%" }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>Ramesh Kumar</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>Annur North • 12km away</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", backgroundColor: "#f8fafc", padding: 16, borderRadius: 16, alignItems: "center" }}>
              <CalendarDays size={20} color="#0284c7" style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Today, 11:30 AM</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Scheduled Appointment</Text>
              </View>
            </View>
          </View>

          {/* VISIT PURPOSE */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Service Purpose</Text>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: "#e0f2fe" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Target size={24} color="#0284c7" />
              <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 18, marginLeft: 12 }}>HVAC & Preventive Maintenance Audit</Text>
            </View>
            <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24 }}>
              The client reported an airflow irregularity in Air Handling Unit 4 (Floor 3). You are required to physically inspect the chilled water valves, verify thermostat calibration, record refrigerant pressures, and check air filter cleanliness.
            </Text>
          </View>

          {/* REQUIRED TASKS CHECKLIST */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Required Action Items</Text>
          <View style={{ gap: 12, marginBottom: 32 }}>
            {[
              { text: "Verify Geofence On-Site Check-in", icon: MapPin, color: "#10b981" },
              { text: "Take photos of equipment condition & serial plates", icon: Camera, color: "#8b5cf6" },
              { text: "Log AHU pressure & temperature readings", icon: ClipboardList, color: "#f59e0b" },
              { text: "Inspect electrical panel & circuit breakers", icon: AlertTriangle, color: "#ef4444" },
            ].map((task, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", padding: 16, borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${task.color}15`, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                  <task.icon size={18} color={task.color} />
                </View>
                <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 15, flex: 1 }}>{task.text}</Text>
              </View>
            ))}
          </View>

          {/* START VISIT ACTIONS */}
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/(employee)/visit/tracking")} style={{ flex: 1, backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Navigation size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Start GPS</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(employee)/visit/check-in")} style={{ flex: 1, backgroundColor: "#10b981", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Camera size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Check-In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
