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
  CheckCircle2,
  ListTodo,
  FileText,
  MapPin,
  Clock,
  Award,
  ShieldCheck,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

function buildDatePills() {
  const pills: { key: string; dayLabel: string; numLabel: string }[] = [
    { key: "all", dayLabel: "ALL", numLabel: "All" },
  ];
  const base = new Date();
  for (let offset = -1; offset <= 4; offset++) {
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const dayLabel = offset === 0 ? "TODAY" : d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
    const numLabel = `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;
    pills.push({ key: iso, dayLabel, numLabel });
  }
  return pills;
}

export default function EmployeeTasksScreen() {
  const { serviceConfig } = useService();
  const [selectedTab, setSelectedTab] = useState<"pending" | "completed">("pending");
  const [selectedDateKey, setSelectedDateKey] = useState<string>("all");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const datePills = useMemo(() => buildDatePills(), []);

  const loadTasks = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/tasks");
      setTasks(Array.isArray(res?.tasks) ? res.tasks : []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadTasks(false);
    }, [loadTasks])
  );

  const dateFilteredTasks = useMemo(() => {
    if (selectedDateKey === "all") return tasks;
    return tasks.filter((t) => {
      if (t.dueDateIso) return t.dueDateIso === selectedDateKey;
      return t.createdAtIso === selectedDateKey;
    });
  }, [tasks, selectedDateKey]);

  const pendingTasks = useMemo(
    () => dateFilteredTasks.filter((t) => t.rawStatus !== "done" && t.status !== "Completed"),
    [dateFilteredTasks]
  );
  const completedTasks = useMemo(
    () => dateFilteredTasks.filter((t) => t.rawStatus === "done" || t.status === "Completed"),
    [dateFilteredTasks]
  );

  const totalAll = tasks.length;
  const doneAll = tasks.filter((t) => t.rawStatus === "done" || t.status === "Completed").length;
  const completionRate = totalAll > 0 ? Math.round((doneAll / totalAll) * 100) : 0;
  const totalPoints = tasks
    .filter((t) => t.rawStatus === "done" || t.status === "Completed")
    .reduce((sum, t) => sum + Number(t.points || 0), 0);

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
              {serviceConfig.vocab.tasks}
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              Live Work Orders from Admin
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadTasks(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
        >
          {/* SLA COMPLETION SUMMARY BANNER */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={28}
            dropletColor={themeColor}
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 20 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>
                  WORK ORDER COMPLETION
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 30, marginTop: 4 }}>
                  {completionRate}%
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                  {doneAll} of {totalAll} completed • {totalPoints} SLA pts earned
                </Text>
              </View>
              <LiquidGlassIconBadge size={52} borderRadius={18} variant="dark" tintColor="#4ade80">
                <Award size={26} color="#4ade80" />
              </LiquidGlassIconBadge>
            </View>

            <View
              style={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.14)",
                marginTop: 14,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${Math.min(100, completionRate)}%`,
                  height: "100%",
                  borderRadius: 4,
                  backgroundColor: "#4ade80",
                }}
              />
            </View>
          </LiquidGlassCard>

          {/* DYNAMIC DATE FILTER STRIP */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          >
            {datePills.map((pill) => {
              const active = selectedDateKey === pill.key;
              return (
                <LiquidGlassPill
                  key={pill.key}
                  variant="light"
                  active={active}
                  tintColor="rgba(15, 23, 42, 0.88)"
                  onPress={() => setSelectedDateKey(pill.key)}
                  contentStyle={{ paddingHorizontal: 14, paddingVertical: 9, flexDirection: "column" }}
                >
                  <Text
                    style={{
                      color: active ? "rgba(255,255,255,0.72)" : "#64748b",
                      fontFamily: "Brandon-Bold",
                      fontSize: 10,
                    }}
                  >
                    {pill.dayLabel}
                  </Text>
                  <Text
                    style={{
                      color: active ? "#ffffff" : "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                      marginTop: 1,
                    }}
                  >
                    {pill.numLabel}
                  </Text>
                </LiquidGlassPill>
              );
            })}
          </ScrollView>

          {/* PENDING / COMPLETED SEGMENT TABS */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 18 }}>
            <LiquidGlassPill
              variant="light"
              active={selectedTab === "pending"}
              tintColor={`${themeColor}E6`}
              onPress={() => setSelectedTab("pending")}
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12 }}
            >
              <Text
                style={{
                  color: selectedTab === "pending" ? "#ffffff" : "#334155",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Active ({pendingTasks.length})
              </Text>
            </LiquidGlassPill>

            <LiquidGlassPill
              variant="light"
              active={selectedTab === "completed"}
              tintColor="rgba(16, 185, 129, 0.9)"
              onPress={() => setSelectedTab("completed")}
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12 }}
            >
              <Text
                style={{
                  color: selectedTab === "completed" ? "#ffffff" : "#334155",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Completed ({completedTasks.length})
              </Text>
            </LiquidGlassPill>
          </View>

          {/* TASK CARDS */}
          {loading ? (
            <ActivityIndicator color={themeColor} style={{ marginTop: 32 }} />
          ) : selectedTab === "pending" ? (
            pendingTasks.length > 0 ? (
              <View style={{ gap: 16 }}>
                {pendingTasks.map((task) => (
                  <LiquidGlassCard
                    key={task.id}
                    variant="light"
                    borderRadius={26}
                    contentStyle={{ padding: 20 }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                        {task.workOrderCode} • {task.status}
                      </Text>
                      <View
                        style={{
                          backgroundColor:
                            task.priority === "Urgent"
                              ? "rgba(254, 226, 226, 0.9)"
                              : "rgba(254, 243, 199, 0.9)",
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            color: task.priority === "Urgent" ? "#dc2626" : "#b45309",
                            fontFamily: "Brandon-Bold",
                            fontSize: 11,
                          }}
                        >
                          {task.priority} • {task.due}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, lineHeight: 25, marginBottom: 6 }}>
                      {task.title}
                    </Text>

                    {task.targetEntity ? (
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                        <MapPin size={15} color={themeColor} />
                        <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 6, flex: 1 }}>
                          {task.targetEntity}
                          {task.address ? ` • ${task.address}` : ""}
                        </Text>
                      </View>
                    ) : null}

                    {task.description ? (
                      <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 21, marginBottom: 14 }}>
                        {task.description}
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <FileText size={15} color={themeColor} />
                        <Text style={{ color: "#475569", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 6 }}>
                          {task.checklistTotalCount > 0
                            ? `${task.checklistDoneCount}/${task.checklistTotalCount} Checklist Steps`
                            : "Field Verification"}
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        {task.requires_otp && (
                          <ShieldCheck size={14} color="#0284c7" style={{ marginRight: 4 }} />
                        )}
                        <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 12 }}>
                          +{task.points} Pts{task.requires_otp ? " • OTP" : ""}
                        </Text>
                      </View>
                    </View>

                    <LiquidGlassButton
                      variant="tinted"
                      tintColor="rgba(6, 34, 20, 0.88)"
                      dropletColor="#4ade80"
                      onPress={() => router.push(`/(employee)/task/${task.id}` as any)}
                      contentStyle={{ paddingVertical: 15 }}
                    >
                      <ListTodo size={18} color="#4ade80" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                        Execute {serviceConfig.vocab.taskSingular}
                      </Text>
                    </LiquidGlassButton>
                  </LiquidGlassCard>
                ))}
              </View>
            ) : (
              <LiquidGlassCard
                variant="light"
                borderRadius={26}
                contentStyle={{ padding: 28, alignItems: "center" }}
              >
                <Clock size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                  No Active {serviceConfig.vocab.tasks}
                </Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                  {selectedDateKey === "all"
                    ? "You have no pending work orders right now. Pull down to refresh."
                    : "No active work orders scheduled for this date."}
                </Text>
              </LiquidGlassCard>
            )
          ) : completedTasks.length > 0 ? (
            <View style={{ gap: 14 }}>
              {completedTasks.map((doneTask) => (
                <LiquidGlassCard
                  key={doneTask.id}
                  variant="light"
                  borderRadius={26}
                  onPress={() => router.push(`/(employee)/task/${doneTask.id}` as any)}
                  contentStyle={{ padding: 20 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, flex: 1, marginRight: 10 }}>
                      {doneTask.title}
                    </Text>
                    <CheckCircle2 size={24} color="#10b981" />
                  </View>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 12 }}>
                    {doneTask.workOrderCode}
                    {doneTask.targetEntity ? ` • ${doneTask.targetEntity}` : ""}
                    {doneTask.completedAt ? ` • ${doneTask.completedAt}` : ""}
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ color: "#059669", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                      +{doneTask.points} SLA Points Awarded
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/(employee)/reports" as any)}>
                      <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                        View Reports →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </LiquidGlassCard>
              ))}
            </View>
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={26}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <CheckCircle2 size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                No Completed {serviceConfig.vocab.tasks} Yet
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Completed field work orders and earned SLA points will appear here.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
