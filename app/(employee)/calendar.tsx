import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  CalendarDays,
  Target,
  Clock,
  ArrowRight,
  MapPin,
  FileText,
  Fingerprint,
  ClipboardList,
} from "lucide-react-native";
import { api } from "../../services/api";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import { useService } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

interface DayAgendaItem {
  id: string;
  kind: "visit" | "task";
  title: string;
  location: string;
  time: string;
  status: string;
  note: string;
  route: string;
}

interface DayBucket {
  goalsDone: number;
  attendance: {
    checkIn?: string | null;
    checkOut?: string | null;
    hours?: number;
    isLate?: boolean;
  } | null;
  items: DayAgendaItem[];
}

function parseDayInMonth(raw: string | null | undefined, year: number, month: number): number | null {
  if (!raw) return null;
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(raw));
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]) - 1;
    const d = Number(isoMatch[3]);
    return y === year && m === month ? d : null;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.getFullYear() === year && parsed.getMonth() === month ? parsed.getDate() : null;
}

export default function EmployeeCalendarScreen() {
  const { serviceConfig } = useService();
  const [calendarMeta] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return {
      year,
      month,
      day: now.getDate(),
      daysInMonthCount: new Date(year, month + 1, 0).getDate(),
      startDayOffset: (new Date(year, month, 1).getDay() + 6) % 7,
      monthName: now.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    };
  });
  const currentDay = calendarMeta.day;
  const daysInMonthCount = calendarMeta.daysInMonthCount;
  const startDayOffset = calendarMeta.startDayOffset;
  const monthName = calendarMeta.monthName;
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [workReports, setWorkReports] = useState<Record<number, DayBucket>>({});
  const [refreshing, setRefreshing] = useState(false);

  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const loadCalendarData = useCallback(async () => {
    try {
      const [visitsRes, tasksRes, attRes] = await Promise.all([
        api.get("/employee/visits").catch(() => null),
        api.get("/employee/tasks").catch(() => null),
        api.get("/employee/attendance").catch(() => null),
      ]);

      const visitsList: any[] = Array.isArray(visitsRes?.visits)
        ? visitsRes.visits
        : Array.isArray(visitsRes?.data?.visits)
        ? visitsRes.data.visits
        : Array.isArray(visitsRes?.data)
        ? visitsRes.data
        : [];
      const tasksList: any[] = Array.isArray(tasksRes?.tasks)
        ? tasksRes.tasks
        : Array.isArray(tasksRes?.data?.tasks)
        ? tasksRes.data.tasks
        : Array.isArray(tasksRes?.data)
        ? tasksRes.data
        : [];
      const attPayload = attRes?.data ?? attRes ?? {};
      const attDaysMap: Record<string, any> = attPayload?.calendar?.days || {};

      const buckets: Record<number, DayBucket> = {};
      const ensureBucket = (day: number): DayBucket => {
        if (!buckets[day]) {
          buckets[day] = { goalsDone: 0, attendance: null, items: [] };
        }
        return buckets[day];
      };

      // 1. Attendance logs for the month
      Object.entries(attDaysMap).forEach(([dayKey, entry]) => {
        const dayNum = Number(dayKey);
        if (!Number.isFinite(dayNum) || dayNum < 1 || dayNum > calendarMeta.daysInMonthCount) return;
        const bucket = ensureBucket(dayNum);
        bucket.attendance = {
          checkIn: entry?.check_in || null,
          checkOut: entry?.check_out || null,
          hours: Number(entry?.hours || 0),
          isLate: Boolean(entry?.is_late),
        };
      });

      // 2. Real Site Visits
      visitsList.forEach((v: any) => {
        const dayNum = parseDayInMonth(v.dateIso ?? v.date ?? v.created_at, calendarMeta.year, calendarMeta.month);
        if (!dayNum) return;
        const bucket = ensureBucket(dayNum);
        const isDone = v.status === "completed";
        if (isDone) bucket.goalsDone += 1;
        bucket.items.push({
          id: String(v.id),
          kind: "visit",
          title: v.farmerName || `${serviceConfig.vocab.entitySingular} Visit`,
          location: v.address || v.city || "Verified Field Location",
          time: v.time || v.checkInTime || "Logged",
          status: isDone ? "Completed" : v.status === "in_progress" ? "In Progress" : "Pending",
          note: v.remarks || v.siteStatus || "Site visit recorded.",
          route: `/(employee)/report/${v.id}`,
        });
      });

      // 3. Real Assigned Tasks / Work Orders
      tasksList.forEach((t: any) => {
        const dayNum = parseDayInMonth(
          t.dueDateIso ?? t.createdAtIso ?? t.due_date ?? t.created_at,
          calendarMeta.year,
          calendarMeta.month
        );
        if (!dayNum) return;
        const bucket = ensureBucket(dayNum);
        const isDone = t.rawStatus === "done" || t.status === "Completed" || t.status === "done";
        if (isDone) bucket.goalsDone += 1;
        bucket.items.push({
          id: String(t.id),
          kind: "task",
          title: t.title || `${serviceConfig.vocab.taskSingular}`,
          location: t.targetEntity || t.facility || t.address || "Assigned Site",
          time: t.due || "Scheduled",
          status: isDone ? "Completed" : t.rawStatus === "in_progress" ? "In Progress" : "Pending",
          note: t.description || `${t.priority || "Normal"} priority work order.`,
          route: `/(employee)/task/${t.id}`,
        });
      });

      setWorkReports(buckets);
    } catch {
      // Keep previous data on transient network blip
    }
  }, [calendarMeta, serviceConfig.vocab.entitySingular, serviceConfig.vocab.taskSingular]);

  useLiveRefresh(loadCalendarData, 10000);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  }, [loadCalendarData]);

  const activeDayBucket = workReports[selectedDay];

  const renderDay = (day: number) => {
    const isToday = day === currentDay;
    const isSelected = day === selectedDay;
    const bucket = workReports[day];
    const hasActivity = Boolean(bucket && (bucket.items.length > 0 || bucket.attendance));

    let bgColor = "rgba(255,255,255,0.05)";
    let textColor = day > currentDay && !hasActivity ? "rgba(255,255,255,0.35)" : "#ffffff";
    let borderColor = "transparent";

    if (isSelected) {
      bgColor = "#0284c7";
      textColor = "#ffffff";
      borderColor = "#38bdf8";
    } else if (isToday) {
      bgColor = "rgba(2, 132, 199, 0.22)";
      textColor = "#38bdf8";
      borderColor = "#0284c7";
    } else if (hasActivity) {
      bgColor = "rgba(16, 185, 129, 0.16)";
      textColor = "#4ade80";
    }

    return (
      <TouchableOpacity
        key={day}
        onPress={() => setSelectedDay(day)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: bgColor,
          borderWidth: 1,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: textColor, fontFamily: "Brandon-Bold", fontSize: 15 }}>{day}</Text>
        {hasActivity && !isSelected && (
          <View
            style={{
              position: "absolute",
              bottom: 4,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: bucket?.attendance ? "#4ade80" : "#38bdf8",
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 14, paddingBottom: 18 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={42}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 23 }}>Work Calendar</Text>
          <LiquidGlassIconButton variant="dark" size={42} onPress={() => setSelectedDay(currentDay)}>
            <CalendarDays size={20} color="#ffffff" />
          </LiquidGlassIconButton>
        </View>

        <PageHeroBanner
          badge="LIVE SCHEDULE"
          title="Work Calendar"
          subtitle={`${monthName} • Attendance, Visits & Tasks`}
          colors={["#0284c7", "#0369a1"]}
          personIndex={4}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#38bdf8" />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 150 }}
        >
          {/* CALENDAR CARD */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={30}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 20 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22, marginBottom: 18, textAlign: "center" }}>
              {monthName}
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 4 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <View key={i} style={{ width: 40, alignItems: "center" }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13 }}>{d}</Text>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 8, paddingHorizontal: 4 }}>
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: 40, height: 40 }} />
              ))}
              {daysInMonth.map(renderDay)}
            </View>
          </LiquidGlassCard>

          {/* SELECTED DAY HEADER */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 21, marginBottom: 14 }}>
            {selectedDay === currentDay ? "Today's Activity & Schedule" : `Activity on ${monthName.split(" ")[0]} ${selectedDay}`}
          </Text>

          {/* ATTENDANCE SUMMARY FOR SELECTED DAY */}
          {activeDayBucket?.attendance && (
            <LiquidGlassCard
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.20)"
              dropletColor="#10b981"
              borderRadius={20}
              style={{ marginBottom: 16 }}
              contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Fingerprint size={20} color="#4ade80" style={{ marginRight: 10 }} />
                <View>
                  <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                    Present{activeDayBucket.attendance.isLate ? " • Late Arrival" : ""}
                  </Text>
                  <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                    In: {activeDayBucket.attendance.checkIn || "—"} • Out: {activeDayBucket.attendance.checkOut || "On Duty"}
                  </Text>
                </View>
              </View>
              {Number(activeDayBucket.attendance.hours || 0) > 0 && (
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {Number(activeDayBucket.attendance.hours).toFixed(1)}h
                </Text>
              )}
            </LiquidGlassCard>
          )}

          {activeDayBucket && activeDayBucket.items.length > 0 ? (
            <View>
              {activeDayBucket.goalsDone > 0 && (
                <LiquidGlassCard
                  variant="dark"
                  borderRadius={18}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ flexDirection: "row", alignItems: "center", padding: 14 }}
                >
                  <Target size={18} color="#38bdf8" style={{ marginRight: 10 }} />
                  <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                    Completed Items: {activeDayBucket.goalsDone}
                  </Text>
                </LiquidGlassCard>
              )}

              <View style={{ gap: 14 }}>
                {activeDayBucket.items.map((item, index) => {
                  const isCompleted = item.status === "Completed";
                  const badgeBg = isCompleted ? "rgba(16, 185, 129, 0.18)" : "rgba(56, 189, 248, 0.18)";
                  const badgeColor = isCompleted ? "#4ade80" : "#38bdf8";
                  return (
                    <LiquidGlassCard
                      key={`${item.kind}-${item.id}-${index}`}
                      variant="dark"
                      borderRadius={24}
                      contentStyle={{ padding: 18 }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            {item.kind === "task" ? (
                              <ClipboardList size={14} color="#fbbf24" />
                            ) : (
                              <MapPin size={14} color="#4ade80" />
                            )}
                            <Text style={{ color: item.kind === "task" ? "#fbbf24" : "#4ade80", fontFamily: "Brandon-Bold", fontSize: 11, textTransform: "uppercase" }}>
                              {item.kind === "task" ? serviceConfig.vocab.taskSingular : serviceConfig.vocab.visitSingular}
                            </Text>
                          </View>
                          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>{item.title}</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                            <MapPin size={13} color="#94a3b8" />
                            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 5 }} numberOfLines={1}>
                              {item.location}
                            </Text>
                          </View>
                        </View>
                        <View style={{ alignItems: "flex-end" }}>
                          <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 13 }}>{item.time}</Text>
                          <View style={{ backgroundColor: badgeBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 6 }}>
                            <Text style={{ color: badgeColor, fontFamily: "Brandon-Bold", fontSize: 11, textTransform: "uppercase" }}>
                              {item.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={{ backgroundColor: "rgba(0,0,0,0.22)", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 14, borderRadius: 14, marginTop: 4 }}>
                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                          <FileText size={16} color="#64748b" style={{ marginRight: 8, marginTop: 2 }} />
                          <Text style={{ flex: 1, color: "#cbd5e1", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                            {item.note}
                          </Text>
                        </View>
                      </View>

                      <LiquidGlassButton
                        variant="dark"
                        dropletColor="#38bdf8"
                        onPress={() => router.push(item.route as any)}
                        style={{ marginTop: 14 }}
                        contentStyle={{ paddingVertical: 12 }}
                      >
                        <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                          {item.kind === "task" ? "Open Work Order" : "View Visit Report"}
                        </Text>
                        <ArrowRight size={16} color="#38bdf8" style={{ marginLeft: 6 }} />
                      </LiquidGlassButton>
                    </LiquidGlassCard>
                  );
                })}
              </View>
            </View>
          ) : !activeDayBucket?.attendance ? (
            <LiquidGlassCard
              variant="dark"
              borderRadius={24}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <Clock size={42} color="#64748b" style={{ marginBottom: 12 }} />
              <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 15, textAlign: "center" }}>
                {selectedDay > currentDay
                  ? "No work orders scheduled for this upcoming date yet."
                  : "No attendance, visits, or tasks recorded on this date."}
              </Text>
            </LiquidGlassCard>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
