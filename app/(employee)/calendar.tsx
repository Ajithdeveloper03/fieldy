import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  CalendarDays,
  Target,
  Clock,
  ArrowRight,
  MapPin,
  FileText,
} from "lucide-react-native";

import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function EmployeeCalendarScreen() {
  const [todayDate] = useState(() => new Date());
  const currentDay = todayDate.getDate();
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [workReports, setWorkReports] = useState<Record<number, any>>({});

  const daysInMonthCount = new Date(
    todayDate.getFullYear(),
    todayDate.getMonth() + 1,
    0
  ).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const startDayOffset =
    (new Date(todayDate.getFullYear(), todayDate.getMonth(), 1).getDay() + 6) %
    7;
  const monthName = todayDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [visitsRes, tasksRes] = await Promise.all([
            api.get("/employee/visits").catch(() => ({ data: [] })),
            api.get("/employee/tasks").catch(() => ({ data: [] })),
          ]);
          if (!active) return;
          const visitsList: any[] = Array.isArray(visitsRes?.data)
            ? visitsRes.data
            : Array.isArray(visitsRes)
            ? visitsRes
            : [];
          const tasksList: any[] = Array.isArray(tasksRes?.data)
            ? tasksRes.data
            : Array.isArray(tasksRes)
            ? tasksRes
            : [];

          const reports: Record<number, any> = {};
          visitsList.forEach((v: any) => {
            const rawDate = v.created_at ?? v.visit_date;
            if (!rawDate) return;
            const d = new Date(rawDate);
            if (
              d.getMonth() === todayDate.getMonth() &&
              d.getFullYear() === todayDate.getFullYear()
            ) {
              const dayNum = d.getDate();
              if (!reports[dayNum]) {
                reports[dayNum] = { goalsDone: 0, visits: [] };
              }
              if (v.status === "completed") {
                reports[dayNum].goalsDone += 1;
              }
              reports[dayNum].visits.push({
                site_contact: v.site?.name ?? v.client_name ?? "Site Visit",
                location: v.site?.city ?? v.site?.address ?? "Assigned Sector",
                time: d.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status:
                  v.status === "completed"
                    ? "Completed"
                    : v.status === "in_progress"
                    ? "In Progress"
                    : "Scheduled",
                note: v.summary ?? v.purpose ?? "Site inspection log verified.",
              });
            }
          });

          tasksList.forEach((t: any) => {
            const rawDate = t.due_date ?? t.created_at;
            if (!rawDate) return;
            const d = new Date(rawDate);
            if (
              d.getMonth() === todayDate.getMonth() &&
              d.getFullYear() === todayDate.getFullYear()
            ) {
              const dayNum = d.getDate();
              if (!reports[dayNum]) {
                reports[dayNum] = { goalsDone: 0, visits: [] };
              }
              if (t.status === "completed") {
                reports[dayNum].goalsDone += 1;
              }
              reports[dayNum].visits.push({
                site_contact: t.site?.name ?? t.title ?? "Assigned Task",
                location: t.site?.city ?? "On-site",
                time: "Due Today",
                status: t.status === "completed" ? "Completed" : "Pending",
                note: t.description ?? "Work order protocol.",
              });
            }
          });

          setWorkReports(reports);
        } catch {
          if (active) setWorkReports({});
        }
      })();
      return () => {
        active = false;
      };
    }, [todayDate])
  );

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
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={42}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>Work Calendar</Text>
          <LiquidGlassIconButton variant="dark" size={42}>
            <CalendarDays size={20} color="#ffffff" />
          </LiquidGlassIconButton>
        </View>

        <PageHeroBanner
          badge="SCHEDULE"
          title="Work Calendar"
          subtitle={`${monthName} • Visits & Tasks`}
          colors={["#0284c7", "#0369a1"]}
          personIndex={4}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}>
          
          {/* EXACT CALENDAR LAYOUT */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={34}
            style={{ marginBottom: 32 }}
            contentStyle={{ padding: 24 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28, marginBottom: 24, textAlign: "center" }}>{monthName}</Text>
            
            {/* Days of week */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16, paddingHorizontal: 8 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={{ width: 40, alignItems: "center" }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 15 }}>{d}</Text>
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
          </LiquidGlassCard>

          {/* DETAILED WORK REPORT FOR SELECTED DATE */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginBottom: 18 }}>
            {selectedDay === currentDay ? "Today's Agenda" : `Work Report: Day ${selectedDay}`}
          </Text>

          {workReports[selectedDay] ? (
            <View>
              {/* Daily Stats Summary */}
              {selectedDay !== currentDay && (
                <LiquidGlassCard
                  variant="tinted"
                  tintColor="rgba(16, 185, 129, 0.18)"
                  dropletColor="#10b981"
                  borderRadius={20}
                  style={{ marginBottom: 24 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", padding: 18 }}
                >
                  <Target size={22} color="#10b981" style={{ marginRight: 12 }} />
                  <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 18 }}>Goals Accomplished: {workReports[selectedDay].goalsDone} Tasks</Text>
                </LiquidGlassCard>
              )}

              {/* Visits List */}
              <View style={{ gap: 18 }}>
                {workReports[selectedDay].visits.map((visit: any, index: number) => (
                  <LiquidGlassCard
                    key={index}
                    variant="dark"
                    borderRadius={28}
                    contentStyle={{ padding: 22 }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 21 }}>{visit.site_contact}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                          <MapPin size={14} color="#94a3b8" />
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 15, marginLeft: 5 }}>{visit.location}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 16 }}>{visit.time}</Text>
                        <View style={{ backgroundColor: visit.status === "Flagged Issue" ? "rgba(239, 68, 68, 0.18)" : "rgba(16, 185, 129, 0.18)", borderWidth: 1, borderColor: visit.status === "Flagged Issue" ? "rgba(239, 68, 68, 0.35)" : "rgba(16, 185, 129, 0.35)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 6 }}>
                          <Text style={{ color: visit.status === "Flagged Issue" ? "#ef4444" : "#10b981", fontFamily: "Brandon-Bold", fontSize: 12, textTransform: "uppercase" }}>{visit.status}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <View style={{ backgroundColor: "rgba(0,0,0,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", padding: 18, borderRadius: 18, marginTop: 8 }}>
                      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                        <FileText size={18} color="#64748b" style={{ marginRight: 10, marginTop: 2 }} />
                        <Text style={{ flex: 1, color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold" }}>Visit Notes: </Text>
                          {visit.note}
                        </Text>
                      </View>
                    </View>

                    {visit.status === "Completed" && (
                       <LiquidGlassButton
                         variant="dark"
                         dropletColor="#38bdf8"
                         onPress={() => router.push("/(employee)/report/1")}
                         style={{ marginTop: 18 }}
                         contentStyle={{ paddingVertical: 14 }}
                       >
                         <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 16 }}>View Submitted Report</Text>
                         <ArrowRight size={18} color="#38bdf8" style={{ marginLeft: 6 }} />
                       </LiquidGlassButton>
                    )}
                  </LiquidGlassCard>
                ))}
              </View>
            </View>
          ) : (
            <LiquidGlassCard
              variant="dark"
              borderRadius={24}
              contentStyle={{ padding: 32, alignItems: "center" }}
            >
              <Clock size={48} color="#64748b" style={{ marginBottom: 16 }} />
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center" }}>
                {selectedDay > currentDay ? "No goals scheduled for this upcoming date yet." : "No visits or work logged on this date."}
              </Text>
            </LiquidGlassCard>
          )}

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
