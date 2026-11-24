import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft, Clock, MapPin, Sparkles, ShieldCheck, Award, Check, Navigation
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { serviceConfig } = useService();
  const [liveTask, setLiveTask] = useState<any | null>(null);
  const [taskLoaded, setTaskLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/employee/tasks")
      .then((res) => {
        const found = (res?.tasks || []).find((item: any) => String(item.id) === String(id));
        setLiveTask(found || null);
      })
      .catch(() => setLiveTask(null))
      .finally(() => setTaskLoaded(true));
  }, [id]);

  const [safetyChecklist, setSafetyChecklist] = useState<any[]>([]);
  useEffect(() => {
    const list = liveTask?.safety_requirements || liveTask?.checklist || [];
    setSafetyChecklist(Array.isArray(list) ? list.map((item: any, index: number) => ({
      id: item.id ?? index,
      text: typeof item === "string" ? item : item.label || item.text || item.title || "",
      checked: Boolean(item.completed ?? item.checked),
    })).filter((item: any) => item.text) : []);
  }, [liveTask]);

  const task = liveTask ? {
    id: String(liveTask.id),
    workOrderCode: liveTask.workOrderCode,
    industry: serviceConfig.label,
    title: liveTask.title,
    facility: liveTask.facility || liveTask.targetEntity,
    address: liveTask.address,
    latitude: liveTask.latitude ?? null,
    longitude: liveTask.longitude ?? null,
    farmerId: liveTask.farmerId ?? null,
    status: liveTask.status,
    priority: liveTask.priority ? `${String(liveTask.priority).toUpperCase()} PRIORITY` : null,
    due: liveTask.due,
    points: liveTask.points ?? 0,
    aiSuggestions: liveTask.aiDiagnostic,
    description: liveTask.description,
  } : null;

  const toggleSafetyItem = (itemId: number) => {
    setSafetyChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleStartVisit = async () => {
    if (!task) return;
    await AsyncStorage.setItem("@active_task", JSON.stringify(task));
    await api.post(`/employee/tasks/${task.id}/status`, { status: "in_progress" }).catch(() => null);
    router.push({
      pathname: "/(employee)/visit/tracking",
      params: {
        id: task.id,
        taskId: task.id,
        siteName: task.facility,
        siteAddress: task.address,
        farmerId: task.farmerId ? String(task.farmerId) : "",
        lat: task.latitude ? String(task.latitude) : "",
        lng: task.longitude ? String(task.longitude) : "",
      },
    } as any);
  };

  if (!task) {
    return <View style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 19, textAlign: "center" }}>{taskLoaded ? "This task is not assigned to your account." : "Loading assigned task…"}</Text>
      {taskLoaded ? <TouchableOpacity onPress={() => router.replace("/(employee)/tasks")} style={{ marginTop: 18, padding: 12, backgroundColor: "#062214", borderRadius: 12 }}><Text style={{ color: "#fff", fontFamily: "Brandon-Bold" }}>Back to tasks</Text></TouchableOpacity> : null}
    </View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", backgroundColor: "#ffffff" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, backgroundColor: "#f8fafc", borderRadius: 999, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <ChevronLeft size={22} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>{serviceConfig.vocab.taskSingular} Details</Text>
            <Text style={{ color: serviceConfig.color, fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1 }}>{task.workOrderCode}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {/* TITLE & FACILITY CARD */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 28, padding: 22, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 5, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: "#fee2e2" }}>
                <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 12 }}>{task.priority}</Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: `${serviceConfig.color}15` }}>
                <Text style={{ color: serviceConfig.color, fontFamily: "Brandon-Bold", fontSize: 12 }}>{task.industry}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={16} color="#64748b" />
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 5 }}>{task.due}</Text>
              </View>
            </View>

            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24, marginBottom: 10, lineHeight: 30 }}>{task.title}</Text>
            <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 16, marginBottom: 14, lineHeight: 24 }}>{task.description}</Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={15} color={serviceConfig.color} />
              <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6 }}>{task.facility}</Text>
            </View>

            {/* Performance Reward Badge */}
            <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Award size={18} color="#16a34a" style={{ marginRight: 6 }} />
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 13 }}>+{task.points} Performance Points</Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>After Visit Checkout</Text>
            </View>

            {/* START VISIT WITH LIVE GPS TRACKING */}
            <TouchableOpacity
              onPress={handleStartVisit}
              style={{
                marginTop: 16,
                backgroundColor: serviceConfig.color,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: serviceConfig.color,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Navigation size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                Start Visit (Live GPS Map)
              </Text>
            </TouchableOpacity>
          </View>

          {/* ADVISORY BOX */}
          <View style={{ backgroundColor: "#fefce8", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#fef08a", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Sparkles size={18} color="#ca8a04" style={{ marginRight: 6 }} />
              <Text style={{ color: "#854d0e", fontFamily: "Brandon-Bold", fontSize: 14 }}>{serviceConfig.shortName} Field Brief</Text>
            </View>
            <Text style={{ color: "#713f12", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 20 }}>
              {task.aiSuggestions}
            </Text>
            <Text style={{ color: "#a16207", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 6 }}>
              Field reports (before/after photos, notes & OTP) unlock automatically after arrival Check-In & Checkout.
            </Text>
          </View>

          {/* MANDATORY SAFETY & PPE CHECKLIST */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <ShieldCheck size={20} color={serviceConfig.color} style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Pre-Visit Safety Checklist</Text>
            </View>
            <View style={{ gap: 10 }}>
              {safetyChecklist.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggleSafetyItem(item.id)}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: item.checked ? "#f0fdf4" : "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: item.checked ? "#bbf7d0" : "#e2e8f0" }}
                >
                  <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: item.checked ? "#16a34a" : "#ffffff", borderWidth: item.checked ? 0 : 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    {item.checked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text style={{ flex: 1, color: item.checked ? "#166534" : "#475569", fontFamily: "Brandon-Bold", fontSize: 13 }}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
