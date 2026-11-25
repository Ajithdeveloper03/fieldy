import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { api } from "../../services/api";
import {
  ChevronLeft,
  MapPin,
  Fingerprint
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeeAttendanceScreen() {
  const [data, setData] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const res = await api.get("/employee/attendance");
          if (active) setData(res?.data ?? res);
        } catch {
          if (active) setData(null);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const today = data?.today ?? {};
  const isCheckedIn = Boolean(today.checked_in && !today.checked_out);
  const now = new Date();
  const cal = data?.calendar ?? {};
  const todayDay: number = cal.today_day ?? now.getDate();
  const daysInMonth = Array.from(
    { length: cal.days_in_month ?? new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() },
    (_, i) => i + 1
  );
  const startDayOffset: number =
    cal.start_day_offset ?? (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;
  const monthLabel: string =
    cal.month_label ?? now.toLocaleString("en-US", { month: "long", year: "numeric" });
  const dayStatus = (day: number): string | undefined => {
    const days = cal.days;
    if (Array.isArray(days)) {
      const found = days.find((d: any) => Number(d?.day) === day);
      return found?.status;
    }
    return days?.[day]?.status ?? days?.[String(day)];
  };
  const fmtTime = (v?: string | null) =>
    v ? new Date(v).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const siteName: string = data?.target_site?.name ?? "No site assigned";

  const getStatusColor = (day: number) => {
    if (day > todayDay) return "rgba(255,255,255,0.1)"; // Future
    if (day === todayDay) return isCheckedIn ? "#10b981" : "#3b82f6"; // Today
    const status = dayStatus(day);
    if (status === "present") return "#10b981";
    if (status === "absent") return "#ef4444";
    return "rgba(255,255,255,0.1)";
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={44}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>Attendance Hub</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 10, paddingBottom: 110 }}>
          
          {/* BIG CLOCK IN BUTTON */}
          <View style={{ alignItems: "center", marginBottom: 34 }}>
            <LiquidGlassCard
              variant="tinted"
              borderRadius={98}
              tintColor={isCheckedIn ? "rgba(16, 185, 129, 0.24)" : "rgba(59, 130, 246, 0.24)"}
              dropletColor={isCheckedIn ? "#10b981" : "#3b82f6"}
              onPress={() =>
                router.push(
                  (isCheckedIn ? "/(employee)/attendance/clock-out" : "/(employee)/attendance/clock-in") as any
                )
              }
              style={{
                width: 196,
                height: 196,
                shadowColor: isCheckedIn ? "#10b981" : "#3b82f6",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.48,
                shadowRadius: 30,
                elevation: 12,
              }}
              contentStyle={{ alignItems: "center", justifyContent: "center" }}
            >
              <Fingerprint size={68} color={isCheckedIn ? "#10b981" : "#3b82f6"} style={{ marginBottom: 10 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                {isCheckedIn ? "CLOCK OUT" : "CLOCK IN"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>
                {isCheckedIn ? fmtTime(today.check_in_at) : now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
              </Text>
            </LiquidGlassCard>
            
            <LiquidGlassCard
              variant="dark"
              borderRadius={999}
              style={{ marginTop: 24 }}
              contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <MapPin size={16} color="#94a3b8" />
              <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 15, marginLeft: 8 }}>{siteName}</Text>
            </LiquidGlassCard>
          </View>

          {/* NEAT CALENDAR LAYOUT */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginBottom: 16 }}>{monthLabel}</Text>
          <LiquidGlassCard
            variant="dark"
            borderRadius={32}
            style={{ marginBottom: 32 }}
            contentStyle={{ padding: 24 }}
          >
            
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
                  <Text style={{ color: day > todayDay ? "rgba(255,255,255,0.4)" : "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>{day}</Text>
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
          </LiquidGlassCard>

          {/* TIMELINE OF TODAY */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Today&apos;s Log</Text>
          <LiquidGlassCard
            variant="dark"
            borderRadius={32}
            contentStyle={{ padding: 24 }}
          >
            
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: isCheckedIn ? "#10b981" : "rgba(255,255,255,0.2)", marginBottom: 4 }} />
                <View style={{ width: 2, height: 40, backgroundColor: "rgba(255,255,255,0.1)" }} />
              </View>
              <View style={{ flex: 1, paddingBottom: 20 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>{isCheckedIn ? "Clocked In" : "Pending Clock In"}</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>{today.checked_in ? `${fmtTime(today.check_in_at)} • ${siteName}` : "Ensure you are within the site radius."}</Text>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Clock Out</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>{today.checked_out ? `${fmtTime(today.check_out_at)} • ${today.total_hours ?? 0}h total` : "Not clocked out yet"}</Text>
              </View>
            </View>

          </LiquidGlassCard>

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
