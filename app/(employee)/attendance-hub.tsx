import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  Fingerprint,
  Clock,
  CheckCircle2,
  MapPin,
  LogIn,
  LogOut,
  CalendarCheck,
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
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function AttendanceHubScreen() {
  const { serviceConfig } = useService();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAttendance = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/attendance");
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
      void loadAttendance(false);
    }, [loadAttendance])
  );

  const today = data?.today || {};
  const calendar = data?.calendar || {};
  const summary = data?.summary || {};
  const recentLogs: any[] = Array.isArray(data?.recent_logs) ? data.recent_logs : [];
  const isOnDuty = Boolean(today.is_on_duty);
  const checkedOut = Boolean(today.checked_out);
  const daysInMonth = Number(calendar.days_in_month || new Date().getDate());
  const startOffset = Number(calendar.start_day_offset || 0);
  const dayMap: Record<string, any> = calendar.days || {};
  const themeColor = serviceConfig.themeColor || "#059669";

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
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
            Attendance & Shift Hub
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <PageHeroBanner
          badge={isOnDuty ? "ON DUTY" : "SHIFT READY"}
          title="Daily Attendance"
          subtitle={isOnDuty ? `Clocked in${today.check_in_label ? ` at ${today.check_in_label}` : ""}` : "Mark GPS clock-in & selfie here"}
          colors={["#059669", "#064e3b"]}
          personIndex={3}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAttendance(true)}
              tintColor="#34d399"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        >
          {loading && !data ? (
            <ActivityIndicator color="#34d399" style={{ marginTop: 48 }} />
          ) : (
            <>
              {/* LIVE SHIFT STATUS CARD */}
              <LiquidGlassCard
                variant="dark"
                borderRadius={30}
                dropletColor={isOnDuty ? "#10b981" : "#38bdf8"}
                style={{ marginBottom: 20 }}
                contentStyle={{ padding: 22, alignItems: "center" }}
              >
                <LiquidGlassIconBadge
                  size={68}
                  borderRadius={24}
                  variant="dark"
                  tintColor={isOnDuty ? "#10b981" : "#38bdf8"}
                  style={{ marginBottom: 12 }}
                >
                  <Fingerprint size={34} color={isOnDuty ? "#34d399" : "#38bdf8"} />
                </LiquidGlassIconBadge>

                <Text
                  style={{
                    color: isOnDuty ? "#4ade80" : checkedOut ? "#38bdf8" : "#cbd5e1",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {isOnDuty ? "ON DUTY" : checkedOut ? "SHIFT COMPLETED" : "OFF DUTY"}
                </Text>

                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4, textAlign: "center" }}>
                  {isOnDuty
                    ? `Clocked in at ${today.check_in_at} • Elapsed ${today.elapsed_label || "0h 00m"}`
                    : checkedOut
                      ? `In ${today.check_in_at || "—"} • Out ${today.check_out_at || "—"} (${Number(today.total_hours || 0).toFixed(1)} hrs)`
                      : "Verify live GPS location to clock in for today's shift"}
                </Text>

                {data?.target_site?.name ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                    <MapPin size={14} color="#34d399" />
                    <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 5 }}>
                      Assigned Zone: {data.target_site.name}
                    </Text>
                  </View>
                ) : null}

                {!checkedOut && (
                  <LiquidGlassButton
                    variant="tinted"
                    tintColor={isOnDuty ? "rgba(239, 68, 68, 0.85)" : "rgba(16, 185, 129, 0.86)"}
                    dropletColor={isOnDuty ? "#f87171" : "#34d399"}
                    onPress={() =>
                      router.push(
                        isOnDuty ? "/(employee)/attendance/clock-out" : "/(employee)/attendance/clock-in"
                      )
                    }
                    style={{ width: "100%", marginTop: 18 }}
                    contentStyle={{ paddingVertical: 16 }}
                  >
                    {isOnDuty ? (
                      <LogOut size={19} color="#ffffff" style={{ marginRight: 8 }} />
                    ) : (
                      <LogIn size={19} color="#ffffff" style={{ marginRight: 8 }} />
                    )}
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                      {isOnDuty ? "Clock Out & End Shift" : "GPS Clock In Now"}
                    </Text>
                  </LiquidGlassButton>
                )}
              </LiquidGlassCard>

              {/* MONTHLY SUMMARY STATS */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                <LiquidGlassCard variant="dark" borderRadius={20} style={{ flex: 1 }} contentStyle={{ padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                    {summary.days_present ?? 0}
                  </Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 2 }}>
                    Days Present
                  </Text>
                </LiquidGlassCard>

                <LiquidGlassCard variant="dark" borderRadius={20} style={{ flex: 1 }} contentStyle={{ padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                    {Number(summary.total_hours ?? 0).toFixed(1)}h
                  </Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 2 }}>
                    Hours Logged
                  </Text>
                </LiquidGlassCard>

                <LiquidGlassCard variant="dark" borderRadius={20} style={{ flex: 1 }} contentStyle={{ padding: 14, alignItems: "center" }}>
                  <Text style={{ color: "#fbbf24", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                    {summary.geofence_compliance_rate ?? 100}%
                  </Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 2 }}>
                    Zone Match
                  </Text>
                </LiquidGlassCard>
              </View>

              {/* REAL CURRENT MONTH ATTENDANCE CALENDAR */}
              <LiquidGlassCard
                variant="dark"
                borderRadius={26}
                style={{ marginBottom: 22 }}
                contentStyle={{ padding: 20 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                    {calendar.month_label ||
                      new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </Text>
                  <CalendarCheck size={18} color="#34d399" />
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <View key={i} style={{ width: "13.5%", alignItems: "center" }}>
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>{d}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 8 }}>
                  {Array.from({ length: startOffset }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={{ width: "14.28%", height: 36 }} />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const entry = dayMap[String(day)];
                    const isToday = Number(calendar.today_day) === day;
                    const isPresent = Boolean(entry);
                    const isLate = Boolean(entry?.is_late);

                    return (
                      <View key={day} style={{ width: "14.28%", alignItems: "center" }}>
                        <View
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isPresent
                              ? isLate
                                ? "rgba(245,158,11,0.25)"
                                : "rgba(16,185,129,0.24)"
                              : isToday
                                ? "rgba(56,189,248,0.22)"
                                : "rgba(255,255,255,0.04)",
                            borderWidth: isToday ? 1.5 : 0,
                            borderColor: "#38bdf8",
                          }}
                        >
                          <Text
                            style={{
                              color: isPresent
                                ? isLate
                                  ? "#fbbf24"
                                  : "#4ade80"
                                : isToday
                                  ? "#38bdf8"
                                  : "#cbd5e1",
                              fontFamily: "Brandon-Bold",
                              fontSize: 13,
                            }}
                          >
                            {day}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </LiquidGlassCard>

              {/* REAL RECENT SHIFT LOGS */}
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19, marginBottom: 12 }}>
                Recent Shift Logs ({recentLogs.length})
              </Text>

              {recentLogs.length > 0 ? (
                <View style={{ gap: 10 }}>
                  {recentLogs.map((log) => (
                    <LiquidGlassCard
                      key={log.id}
                      variant="dark"
                      borderRadius={20}
                      contentStyle={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
                        {log.status === "On Duty" ? (
                          <Clock size={20} color="#38bdf8" style={{ marginRight: 12 }} />
                        ) : (
                          <CheckCircle2 size={20} color={log.is_late ? "#fbbf24" : "#34d399"} style={{ marginRight: 12 }} />
                        )}
                        <View>
                          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                            {log.day_name}
                          </Text>
                          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                            {log.check_in || "—"} – {log.check_out || "On Duty"}
                            {log.is_late ? " • Late" : ""}
                          </Text>
                        </View>
                      </View>

                      <Text style={{ color: themeColor === "#059669" ? "#4ade80" : "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                        {Number(log.hours || 0) > 0 ? `${Number(log.hours).toFixed(1)}h` : log.status}
                      </Text>
                    </LiquidGlassCard>
                  ))}
                </View>
              ) : (
                <LiquidGlassCard variant="dark" borderRadius={22} contentStyle={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                    No Shift Logs Yet
                  </Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                    Clock in above to record your first verified attendance shift.
                  </Text>
                </LiquidGlassCard>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
