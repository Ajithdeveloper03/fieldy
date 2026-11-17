import React, { useState } from "react";
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
  ChevronLeft,
  Calendar,
  Clock,
  CheckCircle2,
  MapPin,
  Fingerprint
} from "lucide-react-native";

export default function EmployeeAttendanceScreen() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Generate a neat calendar grid for Jan 2026
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 3; // Jan 1st is Thursday (example)
  
  const getStatusColor = (day: number) => {
    if (day > 26) return "rgba(255,255,255,0.1)"; // Future
    if (day === 26) return isCheckedIn ? "#10b981" : "#3b82f6"; // Today
    if (day % 7 === 0) return "#ef4444"; // Absent/Sunday
    return "#10b981"; // Present
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />

      {/* Background ambient glow */}
      <View style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(16, 185, 129, 0.2)" }} />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Attendance Hub</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
          
          {/* BIG CLOCK IN BUTTON */}
          <View style={{ alignItems: "center", marginBottom: 32 }}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setIsCheckedIn(!isCheckedIn)}
              style={{ width: 160, height: 160, borderRadius: 80, backgroundColor: isCheckedIn ? "rgba(16, 185, 129, 0.15)" : "rgba(59, 130, 246, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: isCheckedIn ? "#10b981" : "#3b82f6", shadowColor: isCheckedIn ? "#10b981" : "#3b82f6", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 }}
            >
              <Fingerprint size={56} color={isCheckedIn ? "#10b981" : "#3b82f6"} style={{ marginBottom: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                {isCheckedIn ? "CLOCK OUT" : "CLOCK IN"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>
                09:01 AM
              </Text>
            </TouchableOpacity>
            
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
              <MapPin size={14} color="#94a3b8" />
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8 }}>HQ Geofence • Connected</Text>
            </View>
          </View>

          {/* NEAT CALENDAR LAYOUT */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>January 2026</Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 32 }}>
            
            {/* Days of week */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={{ width: 32, alignItems: "center" }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 14 }}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: 32, height: 32 }} />
              ))}
              {daysInMonth.map((day) => (
                <View key={day} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: getStatusColor(day), alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: day > 26 ? "rgba(255,255,255,0.4)" : "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981", marginRight: 6 }} />
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Present</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444", marginRight: 6 }} />
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Absent</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3b82f6", marginRight: 6 }} />
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Today</Text>
              </View>
            </View>
          </View>

          {/* TIMELINE OF TODAY */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Today&apos;s Log</Text>
          <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
            
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isCheckedIn ? "#10b981" : "rgba(255,255,255,0.2)", marginBottom: 4 }} />
                <View style={{ width: 2, height: 40, backgroundColor: "rgba(255,255,255,0.1)" }} />
              </View>
              <View style={{ flex: 1, paddingBottom: 20 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>{isCheckedIn ? "Clocked In" : "Pending Clock In"}</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>{isCheckedIn ? "09:01 AM • Headquarters Geofence" : "Ensure you are within HQ radius."}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Clock Out</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>Expected at 06:00 PM</Text>
              </View>
            </View>

          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
