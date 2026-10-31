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
  CalendarDays,
  Target,
  CheckCircle2,
  FileText,
  MapPin,
  Clock,
  ArrowRight
} from "lucide-react-native";

export default function EmployeeCalendarScreen() {
  const currentDay = 18;
  const [selectedDay, setSelectedDay] = useState(18);

  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDayOffset = 3; // Offset to start month on Thursday

  // Mock data for previous dates
  const workReports: Record<number, any> = {
    14: {
      goalsDone: 4,
      visits: [
        { farmer: "Ramesh Kumar", location: "Annur North", time: "09:30 AM", status: "Completed", note: "Routine health check. No issues found." },
        { farmer: "Senthil", location: "Coimbatore South", time: "01:15 PM", status: "Flagged Issue", note: "Early signs of leaf spot disease." }
      ]
    },
    15: {
      goalsDone: 6,
      visits: [
        { farmer: "Muthuvel", location: "Erode East", time: "10:00 AM", status: "Completed", note: "Soil moisture testing completed." },
        { farmer: "Kumar", location: "Thanjavur West", time: "03:45 PM", status: "Completed", note: "Delivered organic fertilizers." }
      ]
    },
    16: {
      goalsDone: 2,
      visits: [
        { farmer: "Rajesh", location: "Salem", time: "11:00 AM", status: "Completed", note: "Initial field mapping." }
      ]
    },
    17: {
      goalsDone: 5,
      visits: [
        { farmer: "Vijay", location: "Pollachi", time: "08:30 AM", status: "Completed", note: "Harvest inspection." },
        { farmer: "Suresh Rajan", location: "Annur South", time: "02:00 PM", status: "Flagged Issue", note: "Pest infestation reported." }
      ]
    },
    18: {
      goalsDone: 1, // Today
      visits: [
        { farmer: "Kuppusamy", location: "Tiruppur", time: "11:30 AM", status: "Pending", note: "Scheduled: NPK soil analysis." }
      ]
    }
  };

  const renderDay = (day: number) => {
    const isToday = day === currentDay;
    const isSelected = day === selectedDay;
    const isFuture = day > currentDay;
    const hasData = workReports[day] !== undefined;

    let bgColor = "rgba(255,255,255,0.05)";
    let textColor = "#ffffff";
    let borderColor = "transparent";

    if (isFuture) {
      textColor = "rgba(255,255,255,0.2)";
    } else if (isSelected) {
      bgColor = "#0284c7";
      textColor = "#ffffff";
      borderColor = "#38bdf8";
    } else if (isToday) {
      bgColor = "rgba(2, 132, 199, 0.2)";
      textColor = "#38bdf8";
      borderColor = "#0284c7";
    } else if (hasData) {
      bgColor = "rgba(16, 185, 129, 0.1)";
      textColor = "#10b981";
    }

    return (
      <TouchableOpacity
        key={day}
        disabled={isFuture}
        onPress={() => setSelectedDay(day)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor: borderColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: textColor, fontFamily: "Brandon-Bold", fontSize: 16 }}>{day}</Text>
        {hasData && !isSelected && !isToday && (
          <View style={{ position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: "#10b981" }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />

      {/* Ambient background glow */}
      <View style={{ position: "absolute", top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(2, 132, 199, 0.15)" }} />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Work Calendar</Text>
          <TouchableOpacity style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
            <CalendarDays size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}>
          
          {/* EXACT CALENDAR LAYOUT */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", marginBottom: 32 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginBottom: 24, textAlign: "center" }}>October 2026</Text>
            
            {/* Days of week */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingHorizontal: 8 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={{ width: 40, alignItems: "center" }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 14 }}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8, paddingHorizontal: 8 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: 40, height: 40 }} />
              ))}
              {daysInMonth.map(renderDay)}
            </View>
          </View>

          {/* DETAILED WORK REPORT FOR SELECTED DATE */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>
            {selectedDay === currentDay ? "Today's Agenda" : `Work Report: Oct ${selectedDay}, 2026`}
          </Text>

          {workReports[selectedDay] ? (
            <View>
              {/* Daily Stats Summary */}
              {selectedDay !== currentDay && (
                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16, 185, 129, 0.1)", padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" }}>
                  <Target size={20} color="#10b981" style={{ marginRight: 12 }} />
                  <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 16 }}>Goals Accomplished: {workReports[selectedDay].goalsDone} Tasks</Text>
                </View>
              )}

              {/* Visits List */}
              <View style={{ gap: 16 }}>
                {workReports[selectedDay].visits.map((visit: any, index: number) => (
                  <View key={index} style={{ backgroundColor: "#1e293b", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <View>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>{visit.farmer}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <MapPin size={12} color="#94a3b8" />
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>{visit.location}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 14 }}>{visit.time}</Text>
                        <View style={{ backgroundColor: visit.status === "Flagged Issue" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 }}>
                          <Text style={{ color: visit.status === "Flagged Issue" ? "#ef4444" : "#10b981", fontFamily: "Brandon-Bold", fontSize: 10, textTransform: "uppercase" }}>{visit.status}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: 16, borderRadius: 16, marginTop: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <FileText size={16} color="#64748b" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={{ flex: 1, color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold" }}>Visit Notes: </Text>
                          {visit.note}
                        </Text>
                      </View>
                    </View>

                    {visit.status === "Completed" && (
                       <TouchableOpacity
                         onPress={() => router.push("/(employee)/report/1")}
                         style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.05)", paddingVertical: 12, borderRadius: 12, marginTop: 16 }}
                       >
                         <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 14 }}>View Submitted Report</Text>
                         <ArrowRight size={16} color="#38bdf8" style={{ marginLeft: 6 }} />
                       </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={{ backgroundColor: "rgba(255,255,255,0.02)", borderRadius: 24, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
              <Clock size={48} color="#334155" style={{ marginBottom: 16 }} />
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center" }}>
                {selectedDay > currentDay ? "No goals scheduled for this upcoming date yet." : "No visits or work logged on this date."}
              </Text>
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
