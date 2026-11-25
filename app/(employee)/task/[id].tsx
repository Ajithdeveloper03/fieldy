import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  MapPin,
  Navigation,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Phone,
  Sparkles,
  FileText,
  MapPinned,
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../../components/LiquidGlass";

export default function EmployeeTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { serviceConfig } = useService();
  const [task, setTask] = useState<any | null>(null);
  const [checklist, setChecklist] = useState<Array<{ id: number | string; text: string; done: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [savingChecklist, setSavingChecklist] = useState(false);

  const loadTask = useCallback(async () => {
    try {
      const res = await api.get("/employee/tasks");
      const found = (Array.isArray(res?.tasks) ? res.tasks : []).find(
        (item: any) => String(item.id) === String(id)
      );
      setTask(found || null);
      if (found && Array.isArray(found.checklist)) {
        setChecklist(
          found.checklist.map((entry: any, idx: number) =>
            typeof entry === "string"
              ? { id: idx + 1, text: entry, done: false }
              : { id: entry.id ?? idx + 1, text: entry.text || `Step ${idx + 1}`, done: Boolean(entry.done) }
          )
        );
      }
    } catch {
      setTask(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadTask();
    }, [loadTask])
  );

  const toggleChecklistItem = async (index: number) => {
    if (!task || task.rawStatus === "done" || savingChecklist) return;
    const next = checklist.map((item, idx) =>
      idx === index ? { ...item, done: !item.done } : item
    );
    setChecklist(next);
    setSavingChecklist(true);
    try {
      const res = await api.post(`/employee/tasks/${task.id}/checklist`, { checklist: next });
      if (res?.task_status) {
        setTask((prev: any) => (prev ? { ...prev, rawStatus: res.task_status, status: res.task_status === "in_progress" ? "In Progress" : prev.status } : prev));
      }
    } catch {
      showToast({
        title: "Sync Notice",
        message: "Could not save checklist step right now.",
        type: "info",
      });
    } finally {
      setSavingChecklist(false);
    }
  };

  const persistActiveTaskAndNavigate = async (destination: "tracking" | "checkin") => {
    if (!task) return;
    try {
      if (task.rawStatus === "pending") {
        await api.post(`/employee/tasks/${task.id}/status`, { status: "in_progress" }).catch(() => {});
      }
      await AsyncStorage.setItem(
        "@active_task",
        JSON.stringify({
          id: String(task.id),
          workOrderCode: task.workOrderCode,
          title: task.title,
          facility: task.targetEntity || "",
          targetEntity: task.targetEntity || "",
          farmerId: task.farmerId ? String(task.farmerId) : "",
          address: task.address || "",
          latitude: task.latitude ?? null,
          longitude: task.longitude ?? null,
          requiresOtp: Boolean(task.requires_otp),
        })
      );
    } catch {
      // Continue navigation smoothly
    }

    const navParams = {
      taskId: String(task.id),
      farmerId: task.farmerId ? String(task.farmerId) : "",
      siteName: task.targetEntity || task.title || "",
      siteAddress: task.address || "",
      lat: task.latitude != null ? String(task.latitude) : "",
      lng: task.longitude != null ? String(task.longitude) : "",
    };

    if (destination === "tracking") {
      router.push({ pathname: "/(employee)/visit/tracking", params: navParams } as any);
    } else {
      router.push({ pathname: "/(employee)/visit/check-in", params: navParams } as any);
    }
  };

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
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/tasks"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>

          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            {serviceConfig.vocab.taskSingular} Details
          </Text>

          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <ActivityIndicator color={themeColor} style={{ marginTop: 48 }} />
        ) : !task ? (
          <View style={{ padding: 24 }}>
            <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 26, alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                Work Order Not Found
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center", marginTop: 6 }}>
                This work order may have been reassigned or removed by your Admin.
              </Text>
              <LiquidGlassButton
                variant="dark"
                onPress={() => router.replace("/(employee)/tasks")}
                style={{ marginTop: 18, width: "100%" }}
                contentStyle={{ paddingVertical: 14 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Back to {serviceConfig.vocab.tasks}
                </Text>
              </LiquidGlassButton>
            </LiquidGlassCard>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
          >
            {/* MAIN WORK ORDER CARD */}
            <LiquidGlassCard
              variant="dark"
              borderRadius={28}
              dropletColor={themeColor}
              style={{ marginBottom: 18 }}
              contentStyle={{ padding: 22 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#93c5fd", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                  {task.workOrderCode} • +{task.points} PTS
                </Text>
                <LiquidGlassPill
                  variant="dark"
                  active
                  tintColor={
                    task.rawStatus === "done"
                      ? "rgba(16,185,129,0.85)"
                      : task.priority === "Urgent"
                      ? "rgba(239,68,68,0.85)"
                      : "rgba(245,158,11,0.85)"
                  }
                  contentStyle={{ paddingHorizontal: 10, paddingVertical: 4 }}
                >
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                    {task.status} • {task.priority}
                  </Text>
                </LiquidGlassPill>
              </View>

              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, lineHeight: 30, marginBottom: 8 }}>
                {task.title}
              </Text>

              {task.description ? (
                <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 21, marginBottom: 14 }}>
                  {task.description}
                </Text>
              ) : null}

              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 18,
                  padding: 14,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={16} color="#4ade80" />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 8, flex: 1 }}>
                    {task.targetEntity || "General Field Assignment"}
                  </Text>
                </View>
                {task.address ? (
                  <Text style={{ color: "rgba(255,255,255,0.72)", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 24 }}>
                    {task.address}
                  </Text>
                ) : null}
                <Text style={{ color: "rgba(255,255,255,0.72)", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 24 }}>
                  Deadline: {task.due}
                  {task.requires_otp ? " • Client OTP Required on Completion" : ""}
                </Text>
              </View>

              {task.sitePhone ? (
                <LiquidGlassButton
                  variant="dark"
                  onPress={() => Linking.openURL(`tel:${task.sitePhone}`)}
                  style={{ marginTop: 14 }}
                  contentStyle={{ paddingVertical: 11 }}
                >
                  <Phone size={16} color="#38bdf8" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                    Call Site Contact ({task.sitePhone})
                  </Text>
                </LiquidGlassButton>
              ) : null}
            </LiquidGlassCard>

            {/* AI / ADMIN GUIDANCE */}
            {task.aiDiagnostic ? (
              <LiquidGlassCard
                variant="light"
                borderRadius={22}
                style={{ marginBottom: 18 }}
                contentStyle={{ padding: 16, flexDirection: "row", alignItems: "flex-start" }}
              >
                <Sparkles size={20} color={themeColor} style={{ marginRight: 12, marginTop: 2 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                    Operational Instructions
                  </Text>
                  <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 19, marginTop: 3 }}>
                    {task.aiDiagnostic}
                  </Text>
                </View>
              </LiquidGlassCard>
            ) : null}

            {/* INTERACTIVE CHECKLIST */}
            {checklist.length > 0 && (
              <LiquidGlassCard
                variant="light"
                borderRadius={24}
                style={{ marginBottom: 18 }}
                contentStyle={{ padding: 20 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                    Field Execution Checklist
                  </Text>
                  <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 13 }}>
                    {checklist.filter((c) => c.done).length}/{checklist.length} Done
                  </Text>
                </View>

                <View style={{ gap: 10 }}>
                  {checklist.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id ?? idx}
                      activeOpacity={0.8}
                      disabled={task.rawStatus === "done"}
                      onPress={() => toggleChecklistItem(idx)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 12,
                        borderRadius: 14,
                        backgroundColor: item.done ? "rgba(16,185,129,0.10)" : "rgba(241,245,249,0.8)",
                        borderWidth: 1,
                        borderColor: item.done ? "rgba(16,185,129,0.35)" : "rgba(226,232,240,0.9)",
                      }}
                    >
                      {item.done ? (
                        <CheckCircle2 size={20} color="#10b981" style={{ marginRight: 10 }} />
                      ) : (
                        <Circle size={20} color="#94a3b8" style={{ marginRight: 10 }} />
                      )}
                      <Text
                        style={{
                          flex: 1,
                          color: item.done ? "#065f46" : "#1e293b",
                          fontFamily: "Brandon-Medium",
                          fontSize: 14,
                          textDecorationLine: item.done ? "line-through" : "none",
                        }}
                      >
                        {item.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </LiquidGlassCard>
            )}

            {/* SAFETY / PPE TAGS */}
            {Array.isArray(task.safety_requirements) && task.safety_requirements.length > 0 && (
              <LiquidGlassCard
                variant="light"
                borderRadius={22}
                style={{ marginBottom: 22 }}
                contentStyle={{ padding: 18 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <ShieldCheck size={18} color="#0284c7" />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15, marginLeft: 8 }}>
                    Required Safety & Equipment
                  </Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {task.safety_requirements.map((req: string, idx: number) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: "rgba(224,242,254,0.8)",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ color: "#0369a1", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                        {req}
                      </Text>
                    </View>
                  ))}
                </View>
              </LiquidGlassCard>
            )}

            {/* PRIMARY EXECUTION CTAs */}
            {task.rawStatus === "done" ? (
              <LiquidGlassButton
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.86)"
                dropletColor="#34d399"
                onPress={() => router.push("/(employee)/reports")}
                contentStyle={{ paddingVertical: 16 }}
              >
                <FileText size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  View Submitted {serviceConfig.vocab.report}s
                </Text>
              </LiquidGlassButton>
            ) : (
              <View style={{ gap: 12 }}>
                <LiquidGlassButton
                  variant="tinted"
                  tintColor="rgba(6, 34, 20, 0.90)"
                  dropletColor="#4ade80"
                  onPress={() => persistActiveTaskAndNavigate("tracking")}
                  contentStyle={{ paddingVertical: 17 }}
                >
                  <Navigation size={19} color="#4ade80" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                    Start Live GPS & Navigate to Site
                  </Text>
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="light"
                  onPress={() => persistActiveTaskAndNavigate("checkin")}
                  contentStyle={{ paddingVertical: 15 }}
                >
                  <MapPinned size={18} color="#0f172a" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                    Already at Site • Check In Now
                  </Text>
                </LiquidGlassButton>
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
