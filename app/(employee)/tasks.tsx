import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  FileText,
  ListTodo,
  TrendingUp,
} from "lucide-react-native";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import { apiClient } from "../../api/client";
import { getAuthUser } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function EmployeeTasksScreen() {
  const { serviceConfig } = useService();
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [backendTasks, setBackendTasks] = useState<any[]>([]);
  const [isTenant, setIsTenant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    const authUser = await getAuthUser();
    setIsTenant(Boolean(authUser?.company_id));
    const res = await apiClient.get("/employee/tasks").catch(() => null);
    setBackendTasks(Array.isArray(res?.tasks) ? res.tasks : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!active) return;
        await loadTasks();
      })();
      return () => {
        active = false;
      };
    }, [loadTasks])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const dateStrip = useMemo(() => {
    const items: { label: string; iso: string }[] = [{ label: "All", iso: "all" }];
    const base = new Date();
    for (let offset = -1; offset <= 3; offset++) {
      const d = new Date(base);
      d.setDate(base.getDate() + offset);
      const iso = d.toISOString().slice(0, 10);
      const label =
        offset === 0
          ? "Today"
          : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
      items.push({ label, iso });
    }
    return items;
  }, []);

  const selectedDate = dateStrip[selectedDateIdx] || dateStrip[0];
  const allTasks = useMemo(() => {
    if (!selectedDate || selectedDate.iso === "all") {
      return backendTasks;
    }
    return backendTasks.filter(
      (item: any) =>
        item.dueDateIso === selectedDate.iso ||
        (selectedDate.label === "Today" && item.due === "Today")
    );
  }, [backendTasks, selectedDate]);

  const pendingTasks = allTasks.filter((item: any) => item.status !== "Completed");
  const completedTasks = allTasks.filter((item: any) => item.status === "Completed");
  const totalCompletedCount = backendTasks.filter((item: any) => item.status === "Completed").length;
  const completionRate =
    backendTasks.length > 0 ? Math.round((totalCompletedCount / backendTasks.length) * 100) : 0;

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER (Reference Screen 4 Right Panel: "Community" + Filter Circle Button) */}
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LiquidGlassIconButton
              variant="light"
              size={42}
              style={{ marginRight: 12 }}
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(employee)/dashboard")
              }
            >
              <ChevronLeft size={22} color="#0f172a" />
            </LiquidGlassIconButton>
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 26,
              }}
            >
              {serviceConfig.vocab.tasks}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ServiceSelectorPill compact locked={isTenant} />
            <LiquidGlassIconButton
              variant="light"
              size={42}
              onPress={() => router.push("/(employee)/calendar")}
            >
              <Calendar size={19} color="#0f172a" />
            </LiquidGlassIconButton>
          </View>
        </View>

        <PageHeroBanner
          badge={serviceConfig.shortName}
          title={serviceConfig.vocab.tasks}
          subtitle={`${pendingTasks.length} Pending • ${completionRate}% Done`}
          colors={["#059669", "#0284c7"]}
          personIndex={0}
        />

        {/* HORIZONTAL DATE PILL STRIP (Reference Screen 4: "12 Jul | 12 Jul | Today (black pill) | 12 Jul") */}
        <View style={{ marginBottom: 18 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, gap: 10 }}
          >
            {dateStrip.map((d, idx) => {
              const isSelected = selectedDateIdx === idx;
              return (
                <LiquidGlassPill
                  key={idx}
                  variant="light"
                  active={isSelected}
                  tintColor="rgba(6, 34, 20, 0.86)"
                  onPress={() => setSelectedDateIdx(idx)}
                  contentStyle={{
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#ffffff" : "#475569",
                      fontFamily: "Brandon-Bold",
                      fontSize: 15,
                    }}
                  >
                    {d.label}
                  </Text>
                </LiquidGlassPill>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={serviceConfig.themeColor}
            />
          }
        >
          {/* COMPLETION BENTO BANNER */}
          <LiquidGlassCard
            variant="tinted"
            tintColor="rgba(6, 34, 20, 0.84)"
            dropletColor="#10b981"
            borderRadius={32}
            style={{ marginBottom: 22 }}
            contentStyle={{
              padding: 22,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, marginRight: 18 }}>
              <LiquidGlassCard
                variant="tinted"
                tintColor="rgba(21, 128, 61, 0.72)"
                dropletColor="#4ade80"
                borderRadius={24}
                contentStyle={{ padding: 18 }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Brandon-Bold",
                    fontSize: 10,
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  WORK COMPLETION
                </Text>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 54,
                    lineHeight: 58,
                  }}
                >
                  {completionRate}%
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 8,
                  }}
                >
                  <TrendingUp size={16} color="#a7f3d0" />
                  <Text
                    style={{
                      color: "#a7f3d0",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                      marginLeft: 6,
                    }}
                  >
                    {serviceConfig.shortName} Active Work
                  </Text>
                </View>
              </LiquidGlassCard>
            </View>

            <View style={{ width: "32%", gap: 14 }}>
              <View>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {completedTasks.length}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                  }}
                >
                  Completed
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {pendingTasks.length}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.68)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                  }}
                >
                  Pending
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* TABS */}
          <LiquidGlassCard
            variant="light"
            borderRadius={999}
            style={{ marginBottom: 24 }}
            contentStyle={{
              flexDirection: "row",
              alignItems: "center",
              padding: 5,
            }}
          >
            {["Pending", "Completed"].map((tab) => {
              const isActive = activeTab === tab;
              if (isActive) {
                return (
                  <LiquidGlassPill
                    key={tab}
                    active
                    variant="light"
                    tintColor="rgba(6, 34, 20, 0.86)"
                    onPress={() => setActiveTab(tab)}
                    style={{ flex: 1 }}
                    contentStyle={{ paddingVertical: 13, paddingHorizontal: 10 }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 16,
                      }}
                    >
                      {tab} Orders
                    </Text>
                  </LiquidGlassPill>
                );
              }
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    paddingVertical: 13,
                    paddingHorizontal: 10,
                    borderRadius: 999,
                    borderWidth: 1.4,
                    borderColor: "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#475569",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    {tab} Orders
                  </Text>
                </TouchableOpacity>
              );
            })}
          </LiquidGlassCard>

          {/* WORK ORDER CARDS */}
          <View style={{ gap: 20 }}>
            {activeTab === "Pending" ? (
              pendingTasks.length === 0 ? (
                <LiquidGlassCard
                  variant="light"
                  borderRadius={34}
                  contentStyle={{ padding: 28, alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 19,
                      textAlign: "center",
                    }}
                  >
                    No Pending {serviceConfig.vocab.tasks}
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 14,
                      textAlign: "center",
                      marginTop: 6,
                    }}
                  >
                    New work orders assigned by your admin appear here in real time.
                  </Text>
                </LiquidGlassCard>
              ) : (
                pendingTasks.map((task: any) => (
                  <LiquidGlassCard
                    key={task.id}
                    variant="light"
                    borderRadius={34}
                    contentStyle={{ padding: 24 }}
                  >
                    {/* Top Author / Facility Row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 16,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
                        <Image
                          source={require("../../assets/images/image3.jpg")}
                          style={{
                            width: 64,
                            height: 64,
                            borderRadius: 22,
                            marginRight: 14,
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: "#64748b",
                              fontFamily: "Brandon-Bold",
                              fontSize: 13,
                            }}
                          >
                            {task.workOrderCode} • {task.targetEntity}
                          </Text>
                          <Text
                            style={{
                              color: "#0f172a",
                              fontFamily: "Brandon-Bold",
                              fontSize: 21,
                              lineHeight: 26,
                              marginTop: 2,
                            }}
                          >
                            {task.title}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={{
                          backgroundColor:
                            task.priority === "Urgent"
                              ? "rgba(254, 226, 226, 0.78)"
                              : "rgba(254, 243, 199, 0.78)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.85)",
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 999,
                        }}
                      >
                        <Text
                          style={{
                            color: task.priority === "Urgent" ? "#ef4444" : "#b45309",
                            fontFamily: "Brandon-Bold",
                            fontSize: 12,
                          }}
                        >
                          {task.due}
                        </Text>
                      </View>
                    </View>

                    {/* Description Text */}
                    <Text
                      style={{
                        color: "#334155",
                        fontFamily: "Brandon-Medium",
                        fontSize: 16,
                        lineHeight: 24,
                        marginBottom: 18,
                      }}
                    >
                      {task.description}
                    </Text>

                    {/* AI Diagnostic Spec Box */}
                    <LiquidGlassCard
                      variant="light"
                      borderRadius={20}
                      style={{ marginBottom: 20 }}
                      contentStyle={{
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <LiquidGlassIconBadge
                        size={48}
                        borderRadius={16}
                        variant="light"
                        tintColor={serviceConfig.themeColor}
                        style={{ marginRight: 14 }}
                      >
                        <FileText size={24} color={serviceConfig.themeColor} />
                      </LiquidGlassIconBadge>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#0f172a",
                            fontFamily: "Brandon-Bold",
                            fontSize: 15,
                            lineHeight: 20,
                          }}
                        >
                          {task.aiDiagnostic}
                        </Text>
                        <Text
                          style={{
                            color: "#64748b",
                            fontFamily: "Brandon-Bold",
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          +{task.points} Points • Check-In Required
                        </Text>
                      </View>
                    </LiquidGlassCard>

                    {/* CTA Button */}
                    <LiquidGlassButton
                      variant="tinted"
                      tintColor="rgba(6, 34, 20, 0.86)"
                      dropletColor="#4ade80"
                      onPress={() => router.push(`/(employee)/task/${task.id}` as any)}
                      contentStyle={{ paddingVertical: 18 }}
                    >
                      <ListTodo
                        size={19}
                        color="#4ade80"
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Brandon-Bold",
                          fontSize: 17,
                        }}
                      >
                        Execute {serviceConfig.vocab.taskSingular}
                      </Text>
                    </LiquidGlassButton>
                  </LiquidGlassCard>
                ))
              )
            ) : completedTasks.length === 0 ? (
              <LiquidGlassCard
                variant="light"
                borderRadius={30}
                contentStyle={{ padding: 28, alignItems: "center" }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 19,
                    textAlign: "center",
                  }}
                >
                  No Completed {serviceConfig.vocab.tasks} Yet
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                    textAlign: "center",
                    marginTop: 6,
                  }}
                >
                  Completed work orders appear here once checked out with a field report.
                </Text>
              </LiquidGlassCard>
            ) : (
              completedTasks.map((doneTask: any, idx: number) => (
                <LiquidGlassCard
                  key={doneTask.id || idx}
                  variant="light"
                  borderRadius={30}
                  contentStyle={{ padding: 24 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#64748b",
                        fontFamily: "Brandon-Bold",
                        fontSize: 20,
                        textDecorationLine: "line-through",
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {doneTask?.title || "Inspection Complete"}
                    </Text>
                    <CheckCircle2 size={26} color="#10b981" />
                  </View>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 15,
                      marginBottom: 18,
                    }}
                  >
                    {doneTask.workOrderCode || `WO-${doneTask.id}`} • Verified & Submitted
                  </Text>
                  <LiquidGlassButton
                    variant="light"
                    onPress={() =>
                      router.push(
                        (doneTask.visitId
                          ? `/(employee)/report/${doneTask.visitId}`
                          : "/(employee)/reports") as any
                      )
                    }
                    contentStyle={{ paddingVertical: 16 }}
                  >
                    <Text
                      style={{
                        color: "#0f172a",
                        fontFamily: "Brandon-Bold",
                        fontSize: 16,
                      }}
                    >
                      View {serviceConfig.vocab.report}
                    </Text>
                  </LiquidGlassButton>
                </LiquidGlassCard>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
