import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  FileText,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeeCalendarScreen() {
  const { serviceConfig } = useService();
  const now = useMemo(() => new Date(), []);
  const [cursorYear, setCursorYear] = useState(now.getFullYear());
  const [cursorMonth, setCursorMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState(now.getDate());
  const [visits, setVisits] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCalendarData = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const [vRes, tRes] = await Promise.all([
        api.get("/employee/visits"),
        api.get("/employee/tasks"),
      ]);
      setVisits(Array.isArray(vRes?.visits) ? vRes.visits : []);
      setTasks(Array.isArray(tRes?.tasks) ? tRes.tasks : []);
    } catch {
      setVisits([]);
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadCalendarData(false);
    }, [loadCalendarData])
  );

  const daysInMonthCount = new Date(cursorYear, cursorMonth + 1, 0).getDate();
  const firstJsDay = new Date(cursorYear, cursorMonth, 1).getDay(); // 0=Sun..6=Sat
  const startDayOffset = firstJsDay === 0 ? 6 : firstJsDay - 1; // Monday=0..Sunday=6
  const monthLabel = new Date(cursorYear, cursorMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (delta: number) => {
    const next = new Date(cursorYear, cursorMonth + delta, 1);
    setCursorYear(next.getFullYear());
    setCursorMonth(next.getMonth());
    setSelectedDay(1);
  };

  const formatIso = (year: number, month0: number, day: number) =>
    `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const activityByIso = useMemo(() => {
    const map: Record<string, { visits: any[]; tasks: any[] }> = {};
    visits.forEach((v) => {
      const iso = v.dateIso;
      if (!iso) return;
      if (!map[iso]) map[iso] = { visits: [], tasks: [] };
      map[iso].visits.push(v);
    });
    tasks.forEach((t) => {
      const iso = t.dueDateIso || t.createdAtIso;
      if (!iso) return;
      if (!map[iso]) map[iso] = { visits: [], tasks: [] };
      map[iso].tasks.push(t);
    });
    return map;
  }, [visits, tasks]);

  const selectedIso = formatIso(cursorYear, cursorMonth, selectedDay);
  const selectedData = activityByIso[selectedIso] || { visits: [], tasks: [] };
  const isCurrentMonth = cursorYear === now.getFullYear() && cursorMonth === now.getMonth();

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <LiquidGlassIconButton
            variant="dark"
            size={42}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
            Work Calendar
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadCalendarData(true)}
              tintColor="#38bdf8"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        >
          {/* DYNAMIC REAL MONTH CALENDAR */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={30}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 20 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <LiquidGlassIconButton variant="dark" size={36} onPress={() => changeMonth(-1)}>
                <ChevronLeft size={18} color="#ffffff" />
              </LiquidGlassIconButton>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 21 }}>
                {monthLabel}
              </Text>
              <LiquidGlassIconButton variant="dark" size={36} onPress={() => changeMonth(1)}>
                <ChevronRight size={18} color="#ffffff" />
              </LiquidGlassIconButton>
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={{ width: "13.5%", alignItems: "center" }}>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13 }}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 8 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <View key={`pad-${i}`} style={{ width: "14.28%", height: 40 }} />
              ))}

              {Array.from({ length: daysInMonthCount }, (_, i) => i + 1).map((day) => {
                const iso = formatIso(cursorYear, cursorMonth, day);
                const hasActivity = Boolean(activityByIso[iso]);
                const isToday = isCurrentMonth && day === now.getDate();
                const isSelected = day === selectedDay;

                return (
                  <View key={day} style={{ width: "14.28%", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => setSelectedDay(day)}
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected
                          ? "#0284c7"
                          : isToday
                          ? "rgba(56,189,248,0.2)"
                          : hasActivity
                          ? "rgba(16,185,129,0.16)"
                          : "rgba(255,255,255,0.04)",
                        borderWidth: isSelected || isToday ? 1.5 : 0,
                        borderColor: isSelected ? "#7dd3fc" : "#38bdf8",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? "#ffffff" : hasActivity ? "#34d399" : "#e2e8f0",
                          fontFamily: "Brandon-Bold",
                          fontSize: 14,
                        }}
                      >
                        {day}
                      </Text>
                      {hasActivity && !isSelected && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: 4,
                            width: 4,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: "#34d399",
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </LiquidGlassCard>

          {/* SELECTED DATE AGENDA & LOGS */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 14 }}>
            {isCurrentMonth && selectedDay === now.getDate()
              ? "Today's Activity"
              : new Date(cursorYear, cursorMonth, selectedDay).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
          </Text>

          {loading ? (
            <ActivityIndicator color="#38bdf8" style={{ marginTop: 24 }} />
          ) : selectedData.visits.length === 0 && selectedData.tasks.length === 0 ? (
            <LiquidGlassCard
              variant="dark"
              borderRadius={24}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <Clock size={38} color="#64748b" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                No Visits or Tasks Logged
              </Text>
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                No field visits or scheduled work orders were recorded on this date.
              </Text>
            </LiquidGlassCard>
          ) : (
            <View style={{ gap: 14 }}>
              {selectedData.tasks.map((task: any) => (
                <LiquidGlassCard
                  key={`task-${task.id}`}
                  variant="dark"
                  borderRadius={24}
                  onPress={() => router.push(`/(employee)/task/${task.id}` as any)}
                  contentStyle={{ padding: 18 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Target size={16} color="#38bdf8" style={{ marginRight: 7 }} />
                      <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                        {task.workOrderCode} • {task.status}
                      </Text>
                    </View>
                    <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      +{task.points} Pts
                    </Text>
                  </View>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 6 }}>
                    {task.title}
                  </Text>
                  {task.targetEntity ? (
                    <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 3 }}>
                      {task.targetEntity}
                    </Text>
                  ) : null}
                </LiquidGlassCard>
              ))}

              {selectedData.visits.map((visit: any) => {
                const isDone = visit.status === "completed";
                return (
                  <LiquidGlassCard
                    key={`visit-${visit.id}`}
                    variant="dark"
                    borderRadius={24}
                    contentStyle={{ padding: 18 }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                          {visit.farmerName}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <MapPin size={13} color="#94a3b8" />
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 5 }}>
                            {visit.address || visit.visitCode}
                          </Text>
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                          {visit.checkInTime}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                          <CheckCircle2 size={13} color={isDone ? "#34d399" : "#fbbf24"} style={{ marginRight: 4 }} />
                          <Text style={{ color: isDone ? "#34d399" : "#fbbf24", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                            {isDone ? "Completed" : "Active"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {visit.remarks ? (
                      <View
                        style={{
                          backgroundColor: "rgba(255,255,255,0.06)",
                          padding: 12,
                          borderRadius: 14,
                          marginTop: 12,
                          flexDirection: "row",
                        }}
                      >
                        <FileText size={15} color="#94a3b8" style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={{ flex: 1, color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 19 }}>
                          {visit.remarks}
                        </Text>
                      </View>
                    ) : null}

                    {isDone && (
                      <LiquidGlassButton
                        variant="dark"
                        dropletColor="#38bdf8"
                        onPress={() => router.push(`/(employee)/report/${visit.id}` as any)}
                        style={{ marginTop: 12 }}
                        contentStyle={{ paddingVertical: 11 }}
                      >
                        <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                          View Submitted Report
                        </Text>
                        <ArrowRight size={15} color="#38bdf8" style={{ marginLeft: 6 }} />
                      </LiquidGlassButton>
                    )}
                  </LiquidGlassCard>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
