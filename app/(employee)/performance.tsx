import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  Award,
  CheckCircle2,
  ClipboardList,
  CalendarCheck,
  Clock,
  TrendingUp,
  MapPin,
} from "lucide-react-native";
import { api } from "../../services/api";
import { useService } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeePerformanceScreen() {
  const { serviceConfig } = useService();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPerformance = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/performance");
      setData(res);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPerformance(false);
    }, [loadPerformance])
  );

  const metrics = data?.metrics || {};
  const weeklyBars: any[] = Array.isArray(data?.weekly_bars) ? data.weekly_bars : [];
  const recentTasks: any[] = Array.isArray(data?.recent_tasks) ? data.recent_tasks : [];
  const attendanceRows: any[] = Array.isArray(data?.attendance) ? data.attendance : [];
  const maxWeeklyVal = Math.max(1, ...weeklyBars.map((b) => Number(b.total_actions || 0)));
  const score = Number(data?.score ?? metrics.score ?? 0);
  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            variant="light"
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>

          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
              My Performance
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              {data?.period || "Current Month"} • Live Score
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPerformance(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        >
          {loading && !data ? (
            <ActivityIndicator color={themeColor} style={{ marginTop: 48 }} />
          ) : (
            <>
              {/* HERO PERFORMANCE SCORE CARD (SYNCED WITH WEB ADMIN /admin/performance) */}
              <LiquidGlassCard
                variant="dark"
                borderRadius={30}
                dropletColor={themeColor}
                style={{ marginBottom: 18 }}
                contentStyle={{ padding: 22 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {data?.employee?.name || "Field Staff"}
                      {data?.employee?.employee_code ? ` • ${data.employee.employee_code}` : ""}
                    </Text>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 36, marginTop: 6 }}>
                      {score}%
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                      Overall SLA & Attendance Score • {Number(metrics.points_earned || 0)} Pts earned
                    </Text>
                  </View>

                  <LiquidGlassIconBadge size={60} borderRadius={22} variant="dark" tintColor="#4ade80">
                    <Award size={30} color="#4ade80" />
                  </LiquidGlassIconBadge>
                </View>

                <View
                  style={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255,255,255,0.14)",
                    marginTop: 16,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${Math.min(100, Math.max(0, score))}%`,
                      height: "100%",
                      borderRadius: 4,
                      backgroundColor: "#4ade80",
                    }}
                  />
                </View>
              </LiquidGlassCard>

              {/* REAL METRICS BENTO GRID */}
              <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 12 }}>
                {[
                  {
                    label: "Task Completion",
                    value: `${Number(metrics.task_completion_rate || 0).toFixed(0)}%`,
                    sub: `${metrics.tasks_completed ?? 0} of ${metrics.tasks_total ?? 0} completed`,
                    icon: ClipboardList,
                    color: "#ea580c",
                  },
                  {
                    label: "Attendance Rate",
                    value: `${Number(metrics.attendance_rate || 0).toFixed(0)}%`,
                    sub: `${metrics.attendance_days ?? 0} of ${metrics.workdays_elapsed ?? 0} workdays`,
                    icon: CalendarCheck,
                    color: "#0284c7",
                  },
                  {
                    label: "Hours Logged",
                    value: `${Number(metrics.hours_worked || 0).toFixed(1)}h`,
                    sub: `${metrics.punctual_days ?? 0} on-time shifts`,
                    icon: Clock,
                    color: "#7c3aed",
                  },
                  {
                    label: "Site Visits",
                    value: `${metrics.visits_completed ?? 0}`,
                    sub: `${Number(metrics.distance_km_month || 0).toFixed(1)} km this month`,
                    icon: MapPin,
                    color: "#059669",
                  },
                ].map((item, idx) => {
                  const IconComp = item.icon;
                  return (
                    <LiquidGlassCard
                      key={idx}
                      variant="light"
                      borderRadius={22}
                      style={{ width: "48.2%", marginBottom: 12 }}
                      contentStyle={{ padding: 16 }}
                    >
                      <LiquidGlassIconBadge size={38} borderRadius={13} variant="light" tintColor={item.color}>
                        <IconComp size={19} color={item.color} />
                      </LiquidGlassIconBadge>
                      <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 25, marginTop: 10 }}>
                        {item.value}
                      </Text>
                      <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                        {item.label}
                      </Text>
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 2 }}>
                        {item.sub}
                      </Text>
                    </LiquidGlassCard>
                  );
                })}
              </View>

              {/* REAL 7-DAY WEEKLY ACTIVITY BAR CHART */}
              <LiquidGlassCard
                variant="light"
                borderRadius={26}
                style={{ marginBottom: 18 }}
                contentStyle={{ padding: 20 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TrendingUp size={19} color={themeColor} />
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginLeft: 8 }}>
                      This Week&apos;s Field Activity
                    </Text>
                  </View>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
                    Tasks + Visits
                  </Text>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 116, paddingTop: 14 }}>
                  {(weeklyBars.length > 0
                    ? weeklyBars
                    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
                        day: d,
                        total_actions: 0,
                        is_today: false,
                      }))
                  ).map((bar, idx) => {
                    const count = Number(bar.total_actions || 0);
                    const barHeight = count > 0 ? Math.max(18, Math.round((count / maxWeeklyVal) * 76)) : 6;
                    return (
                      <View key={idx} style={{ flex: 1, alignItems: "center" }}>
                        <Text style={{ color: count > 0 ? "#0f172a" : "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 11, marginBottom: 5 }}>
                          {count}
                        </Text>
                        <View
                          style={{
                            width: 22,
                            height: barHeight,
                            borderRadius: 8,
                            backgroundColor:
                              count > 0
                                ? bar.is_today
                                  ? themeColor
                                  : "#10b981"
                                : "rgba(148,163,184,0.28)",
                          }}
                        />
                        <Text
                          style={{
                            color: bar.is_today ? themeColor : "#64748b",
                            fontFamily: "Brandon-Bold",
                            fontSize: 11,
                            marginTop: 6,
                          }}
                        >
                          {bar.day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </LiquidGlassCard>

              {/* REAL RECENT WORK ORDERS */}
              <LiquidGlassCard
                variant="light"
                borderRadius={24}
                style={{ marginBottom: 18 }}
                contentStyle={{ padding: 20 }}
              >
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginBottom: 10 }}>
                  Recent Work Orders ({recentTasks.length})
                </Text>

                {recentTasks.length > 0 ? (
                  recentTasks.map((t, index) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => router.push(`/(employee)/task/${t.id}` as any)}
                      style={{
                        paddingVertical: 12,
                        borderTopWidth: index ? 1 : 0,
                        borderColor: "rgba(226,232,240,0.9)",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <CheckCircle2
                        size={19}
                        color={t.status === "done" ? "#10b981" : "#94a3b8"}
                      />
                      <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
                        <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                          {t.title}
                        </Text>
                        <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                          {t.site || t.workOrderCode} • {t.status === "done" ? "Completed" : "Pending"}
                        </Text>
                      </View>
                      <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 13 }}>
                        +{t.points} pts
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                    No assigned tasks recorded yet this month.
                  </Text>
                )}
              </LiquidGlassCard>

              {/* REAL ATTENDANCE SUMMARY LIST */}
              <LiquidGlassCard
                variant="light"
                borderRadius={24}
                style={{ marginBottom: 20 }}
                contentStyle={{ padding: 20 }}
              >
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginBottom: 10 }}>
                  Monthly Shift Records ({attendanceRows.length})
                </Text>

                {attendanceRows.length > 0 ? (
                  attendanceRows.slice(0, 7).map((entry, idx) => (
                    <View
                      key={`${entry.date}-${idx}`}
                      style={{
                        paddingVertical: 11,
                        borderTopWidth: idx ? 1 : 0,
                        borderColor: "rgba(226,232,240,0.9)",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                          {entry.date_label || entry.date}
                        </Text>
                        <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                          {entry.check_in || "—"} – {entry.check_out || "On Duty"}
                          {entry.is_late ? " • Late" : ""}
                        </Text>
                      </View>
                      <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                        {Number(entry.hours || 0).toFixed(1)} hrs
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                    No attendance shifts logged yet this month.
                  </Text>
                )}
              </LiquidGlassCard>

              <LiquidGlassButton
                variant="tinted"
                tintColor={`${themeColor}E6`}
                dropletColor={themeColor}
                onPress={() => router.push("/(employee)/tasks")}
                contentStyle={{ paddingVertical: 16 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Open Active Work Orders ({metrics.tasks_pending ?? 0})
                </Text>
              </LiquidGlassButton>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
