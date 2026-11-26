import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { api } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import {
  ChevronLeft,
  Settings,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  ShieldCheck,
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeePerformanceScreen() {
  const { t } = useLanguage();
  const [perfData, setPerfData] = useState<any>(null);

  const loadPerformance = useCallback(async () => {
    try {
      const res = await api.get("/employee/performance");
      setPerfData(res?.data ?? res);
    } catch {
      setPerfData(null);
    }
  }, []);

  useLiveRefresh(loadPerformance, 15000);

  const metrics = perfData?.metrics ?? {};
  const efficiency = Number(metrics.efficiency_score ?? metrics.efficiency ?? 0);
  const pointsEarned = Number(metrics.points_earned ?? metrics.points ?? 0);
  const tasksCompleted = Number(metrics.tasks_completed ?? 0);
  const tasksTotal = Number(metrics.tasks_total ?? 0);
  const visitsCompleted = Number(metrics.visits_completed ?? 0);
  const attendanceDays = Number(metrics.attendance_days ?? 0);
  const hoursWorked = Number(metrics.hours_worked ?? metrics.hours ?? 0);
  const distanceKm = Number(metrics.distance_month_km ?? 0);
  const periodLabel =
    perfData?.period_label ??
    new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const rawBars: any[] = Array.isArray(perfData?.weekly_bars)
    ? perfData.weekly_bars
    : [
        { day: "Mon", total_actions: 0, is_today: false },
        { day: "Tue", total_actions: 0, is_today: false },
        { day: "Wed", total_actions: 0, is_today: false },
        { day: "Thu", total_actions: 0, is_today: false },
        { day: "Fri", total_actions: 0, is_today: false },
        { day: "Sat", total_actions: 0, is_today: false },
        { day: "Sun", total_actions: 0, is_today: false },
      ];
  const maxActions = Math.max(1, ...rawBars.map((b) => Number(b.total_actions ?? b.h ?? 0)));
  const recentTasks: any[] = Array.isArray(perfData?.recent_tasks)
    ? perfData.recent_tasks
    : [];

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
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            variant="light"
            size={44}
          >
            <ChevronLeft size={22} color="#0f172a" />
          </LiquidGlassIconButton>

          <Text
            style={{
              color: "#0f172a",
              fontFamily: "Brandon-Bold",
              fontSize: 24,
            }}
          >
            {t("myPerformance", "Performance & Stats")}
          </Text>

          <LiquidGlassIconButton
            onPress={() => router.push("/(employee)/menu")}
            variant="light"
            size={44}
          >
            <Settings size={20} color="#0f172a" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            paddingTop: 6,
          }}
        >
          {/* TOP HERO DIAL CARD */}
          <LiquidGlassCard
            variant="light"
            borderRadius={36}
            style={{ marginBottom: 20 }}
            contentStyle={{ padding: 24 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 20,
                }}
              >
                {t("workQuality", "Work Quality Score")}
              </Text>
              <View
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.14)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#059669",
                    fontFamily: "Brandon-Bold",
                    fontSize: 12,
                  }}
                >
                  Live Sync
                </Text>
              </View>
            </View>

            {/* 3 Minimal Sub-Columns */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  {t("targetQuota", "Completed Work")}
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {tasksCompleted}/{tasksTotal} Tasks
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  {t("loggedTime", "Logged Hours")}
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {hoursWorked.toFixed(1)}h Logged
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Site Visits
                </Text>
                <Text
                  style={{
                    color: "#10b981",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {visitsCompleted} Done
                </Text>
              </View>
            </View>

            {/* Glowing Semi-Circular Arc Gauge */}
            <View style={{ alignItems: "center", paddingTop: 6 }}>
              <View
                style={{
                  width: 240,
                  height: 125,
                  overflow: "hidden",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: 120,
                    borderWidth: 16,
                    borderColor: "rgba(148, 163, 184, 0.25)",
                    borderTopColor: "#10b981",
                    borderLeftColor: "#34d399",
                    borderRightColor: "#059669",
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    100%
                  </Text>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 56,
                      lineHeight: 60,
                    }}
                  >
                    {efficiency}%
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 14,
                    }}
                  >
                    Earned {pointsEarned} pts this month
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: 240,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                  }}
                >
                  0%
                </Text>
                <Text
                  style={{
                    color: "#10b981",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                  }}
                >
                  Real-Time Score
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* ANALYTICS & WEEKLY BREAKDOWN CARD */}
          <LiquidGlassCard
            variant="light"
            borderRadius={32}
            style={{ marginBottom: 20 }}
            contentStyle={{ padding: 22 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 32,
                  }}
                >
                  {pointsEarned} Pts
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Monthly Performance • {periodLabel}
                </Text>
              </View>
              <LiquidGlassIconBadge
                size={58}
                borderRadius={16}
                variant="light"
                tintColor="#10b981"
              >
                <Zap size={20} color="#10b981" />
                <Text
                  style={{
                    color: "#15803d",
                    fontFamily: "Brandon-Bold",
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  {attendanceDays}d
                </Text>
              </LiquidGlassIconBadge>
            </View>

            {/* Real Weekly Activity Bars */}
            <View style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  {t("weeklyOutput", "Weekly Output")}
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: 96,
                  paddingTop: 10,
                  paddingHorizontal: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.85)",
                  borderRadius: 20,
                  paddingBottom: 10,
                }}
              >
                {rawBars.map((bar, i) => {
                  const val = Number(bar.total_actions ?? 0);
                  const barHeight = val > 0 ? Math.max(16, Math.round((val / maxActions) * 62)) : 8;
                  const isToday = Boolean(bar.is_today);
                  return (
                    <View key={i} style={{ alignItems: "center", flex: 1 }}>
                      <View
                        style={{
                          width: 18,
                          height: barHeight,
                          borderRadius: 9,
                          backgroundColor: isToday ? "#10b981" : val > 0 ? "#38bdf8" : "#cbd5e1",
                          marginBottom: 6,
                        }}
                      />
                      <Text
                        style={{
                          color: isToday ? "#0f172a" : "#94a3b8",
                          fontFamily: isToday ? "Brandon-Bold" : "Brandon-Medium",
                          fontSize: 10,
                        }}
                      >
                        {bar.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Real Monthly Activity Summary */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "rgba(148, 163, 184, 0.22)",
                paddingTop: 16,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  Verified Monthly Breakdown
                </Text>
                <ArrowUpRight size={16} color="#64748b" />
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  Attendance Days Logged
                </Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {attendanceDays} Days ({hoursWorked.toFixed(1)} hrs)
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  Completed Site Visits
                </Text>
                <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {visitsCompleted} Visits
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  Distance Tracked This Month
                </Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {distanceKm.toFixed(1)} km
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* RECENT TASKS BENTO TILES */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 18,
              }}
            >
              {t("recentTasks", "Recent Tasks")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/tasks")}>
              <Text
                style={{
                  color: "#15803d",
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                }}
              >
                {t("viewAll", "View All")}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {recentTasks.length > 0 ? (
              recentTasks.slice(0, 2).map((task, idx) => (
                <LiquidGlassCard
                  key={task.id ?? idx}
                  variant="light"
                  borderRadius={28}
                  onPress={() => router.push(`/(employee)/task/${task.id}` as any)}
                  style={{ flex: 1 }}
                  contentStyle={{ padding: 18 }}
                >
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 15,
                    }}
                    numberOfLines={1}
                  >
                    {task.title ?? "Assigned Task"}
                  </Text>
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Brandon-Medium",
                      fontSize: 11,
                      marginBottom: 14,
                    }}
                    numberOfLines={1}
                  >
                    {task.site ?? task.priority ?? "Active Site"} • +{task.points ?? 0} pts
                  </Text>
                  <LiquidGlassIconBadge
                    size={64}
                    borderRadius={32}
                    variant="light"
                    tintColor={idx === 0 ? "#10b981" : "#0284c7"}
                    style={{ alignSelf: "center" }}
                  >
                    {idx === 0 ? (
                      <CheckCircle2 size={28} color="#10b981" />
                    ) : (
                      <ShieldCheck size={28} color="#0284c7" />
                    )}
                  </LiquidGlassIconBadge>
                </LiquidGlassCard>
              ))
            ) : (
              <LiquidGlassCard
                variant="light"
                borderRadius={28}
                style={{ flex: 1 }}
                contentStyle={{ padding: 22, alignItems: "center" }}
              >
                <LiquidGlassIconBadge
                  size={56}
                  borderRadius={28}
                  variant="light"
                  tintColor="#10b981"
                  style={{ marginBottom: 10 }}
                >
                  <CheckCircle2 size={26} color="#10b981" />
                </LiquidGlassIconBadge>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  {t("noPendingTasks", "All Tasks Completed")}
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Zero pending tasks queued for your route.
                </Text>
              </LiquidGlassCard>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
