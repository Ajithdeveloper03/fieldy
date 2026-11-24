import React, { useCallback, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeft, Clock, CheckCircle2, ClipboardList, CalendarCheck } from "lucide-react-native";
import { api } from "../../services/api";

type PerformanceData = {
  period?: string;
  employee?: { name?: string; employee_code?: string | null; company_name?: string | null };
  metrics?: {
    tasks_total?: number; tasks_completed?: number; tasks_pending?: number;
    task_completion_rate?: number; points_earned?: number; attendance_days?: number;
    workdays_elapsed?: number; attendance_rate?: number; punctual_days?: number;
    hours_worked?: number; visits_total?: number; visits_completed?: number;
  };
  attendance?: Array<{ date: string | null; check_in: string | null; check_out: string | null; hours: number; is_late: boolean }>;
  recent_tasks?: Array<{ id: string; title: string; site?: string | null; status: string; points: number }>;
};

const Card = ({ label, value, detail }: { label: string; value: string; detail: string }) => (
  <View style={{ flex: 1, minWidth: "46%", backgroundColor: "#ffffff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" }}>
    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>{label}</Text>
    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 26, marginTop: 8 }}>{value}</Text>
    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>{detail}</Text>
  </View>
);

export default function EmployeePerformanceScreen() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    api.get("/employee/performance")
      .then((result) => { if (active) { setData(result); setError(false); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []));

  const metrics = data?.metrics;
  const number = (value?: number) => Number(value || 0).toLocaleString();
  const percent = (value?: number) => `${Number(value || 0).toFixed(0)}%`;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999 }}>
            <ChevronLeft size={22} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ marginLeft: 14 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 23 }}>My Performance</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>{data?.period || "Current month"}</Text>
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120, gap: 14 }}>
          {loading && !data ? <ActivityIndicator color="#059669" style={{ marginTop: 32 }} /> : null}
          {error ? <Text style={{ color: "#b91c1c", backgroundColor: "#fee2e2", padding: 14, borderRadius: 12 }}>Performance details could not be loaded. Check your connection and reopen this page.</Text> : null}
          {!loading && !error && data ? <>
            <View style={{ backgroundColor: "#062214", borderRadius: 24, padding: 20 }}>
              <Text style={{ color: "#bbf7d0", fontFamily: "Brandon-Medium", fontSize: 14 }}>{data.employee?.name || "Employee"}{data.employee?.employee_code ? ` • ${data.employee.employee_code}` : ""}</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32, marginTop: 8 }}>{number(metrics?.points_earned)} points</Text>
              <Text style={{ color: "#d1d5db", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 3 }}>Points from completed assigned tasks</Text>
              {data.employee?.company_name ? <Text style={{ color: "#bbf7d0", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 10 }}>{data.employee.company_name}</Text> : null}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              <Card label="Task completion" value={percent(metrics?.task_completion_rate)} detail={`${number(metrics?.tasks_completed)} of ${number(metrics?.tasks_total)} tasks completed`} />
              <Card label="Attendance" value={percent(metrics?.attendance_rate)} detail={`${number(metrics?.attendance_days)} of ${number(metrics?.workdays_elapsed)} weekdays recorded`} />
              <Card label="Time recorded" value={`${number(metrics?.hours_worked)} hrs`} detail={`${number(metrics?.punctual_days)} on-time attendance days`} />
              <Card label="Site visits" value={number(metrics?.visits_completed)} detail={`${number(metrics?.visits_total)} visits recorded this month`} />
            </View>
            <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}><CalendarCheck size={19} color="#059669" /><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginLeft: 8 }}>Attendance records</Text></View>
              {data.attendance?.length ? data.attendance.map((entry, index) => <View key={`${entry.date}-${index}`} style={{ paddingVertical: 12, borderTopWidth: index ? 1 : 0, borderColor: "#f1f5f9", flexDirection: "row", justifyContent: "space-between" }}>
                <View><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>{entry.date || "Date unavailable"}</Text><Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 3 }}>{entry.check_in || "—"} – {entry.check_out || "—"}{entry.is_late ? " • Late" : ""}</Text></View>
                <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 14 }}>{number(entry.hours)} hrs</Text>
              </View>) : <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", paddingVertical: 10 }}>No attendance has been recorded this month.</Text>}
            </View>
            <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 18, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}><ClipboardList size={19} color="#059669" /><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, marginLeft: 8 }}>Recent assigned tasks</Text></View>
              {data.recent_tasks?.length ? data.recent_tasks.map((task) => <View key={task.id} style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: "#f1f5f9", flexDirection: "row", alignItems: "center" }}>
                <CheckCircle2 size={18} color={task.status === "done" ? "#059669" : "#94a3b8"} />
                <View style={{ flex: 1, marginLeft: 10 }}><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>{task.title}</Text><Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>{task.site || "Site not specified"} • {task.status}</Text></View>
                <Text style={{ color: "#059669", fontFamily: "Brandon-Bold", fontSize: 13 }}>{number(task.points)} pts</Text>
              </View>) : <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", paddingVertical: 10 }}>No assigned tasks have been recorded yet.</Text>}
            </View>
            <TouchableOpacity onPress={() => router.push("/(employee)/tasks")} style={{ backgroundColor: "#059669", borderRadius: 18, padding: 16, alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
              <Clock size={18} color="#ffffff" /><Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 8 }}>{number(metrics?.tasks_pending)} pending tasks</Text>
            </TouchableOpacity>
          </> : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
