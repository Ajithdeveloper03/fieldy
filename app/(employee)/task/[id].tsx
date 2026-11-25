import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Image, Alert, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft, Clock, MapPin, Sparkles, ShieldCheck, Award, Check, Navigation, Camera, Video, Download, FileText
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import { showToast } from "../../../components/ui/ToastMessage";
import {
  ServerMediaFile,
  downloadRemoteFile,
  fetchMediaFiles,
  pickImageAsset,
  pickVideoAsset,
  uploadMediaAsset,
} from "../../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { serviceConfig } = useService();
  const [liveTask, setLiveTask] = useState<any | null>(null);
  const [taskMedia, setTaskMedia] = useState<ServerMediaFile[]>([]);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);

  const loadTaskMedia = useCallback(async (taskIdStr?: string) => {
    const targetId = taskIdStr || id;
    if (!targetId || !/^\d+$/.test(String(targetId))) return;
    const files = await fetchMediaFiles({ taskId: String(targetId) }).catch(() => []);
    setTaskMedia(files);
  }, [id]);

  useEffect(() => {
    api
      .get("/employee/tasks")
      .then((res) => {
        const found = (res?.tasks || []).find((item: any) => String(item.id) === String(id));
        if (found) {
          setLiveTask(found);
          void loadTaskMedia(String(found.id));
        }
      })
      .catch(() => null);
    void loadTaskMedia(id);
  }, [id, loadTaskMedia]);

  // Match real backend task or service fallback
  const matchedTask =
    liveTask ||
    serviceConfig.sampleTasks.find((t) => String(t.id) === String(id)) ||
    serviceConfig.sampleTasks[0];

  const [safetyChecklist, setSafetyChecklist] = useState([
    { id: 1, text: `Wear certified PPE & credentials for ${serviceConfig.label}`, checked: true },
    { id: 2, text: `Verify access clearance at ${serviceConfig.vocab.entitySingular}`, checked: true },
    { id: 3, text: `Review site hazards and ${serviceConfig.shortName.toLowerCase()} SOP before starting visit`, checked: false },
  ]);

  const task = {
    id: String(matchedTask?.id || id || "1"),
    workOrderCode: matchedTask?.workOrderCode || `WO-${String(id || "10482")}`,
    industry: serviceConfig.label,
    title: matchedTask?.title || `${serviceConfig.label} Field Verification`,
    facility: matchedTask?.facility || matchedTask?.targetEntity || serviceConfig.sampleEntities[0]?.name || "Assigned Site",
    address: matchedTask?.address || serviceConfig.sampleEntities[0]?.address || "Chennai, Tamil Nadu",
    latitude: matchedTask?.latitude || null,
    longitude: matchedTask?.longitude || null,
    farmerId: matchedTask?.farmerId || null,
    status: matchedTask?.status || "Pending",
    priority: matchedTask?.priority ? `${String(matchedTask.priority).toUpperCase()} PRIORITY` : "HIGH PRIORITY",
    due: matchedTask?.due || "Today",
    points: matchedTask?.points || 40,
    aiSuggestions:
      matchedTask?.aiDiagnostic ||
      `Verify baseline ${serviceConfig.shortName.toLowerCase()} inspection points and capture before/after photos in the field report after arrival & checkout.`,
    description:
      matchedTask?.description ||
      `Execute assigned ${serviceConfig.vocab.taskSingular.toLowerCase()} at ${serviceConfig.vocab.entitySingular.toLowerCase()}.`,
  };

  const toggleSafetyItem = (itemId: number) => {
    setSafetyChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleTaskUpload = (kind: "image" | "video") => {
    const run = async (source: "camera" | "library") => {
      setUploadingKind(kind);
      try {
        const asset = kind === "image" ? await pickImageAsset(source) : await pickVideoAsset(source);
        if (!asset) return;
        const uploaded = await uploadMediaAsset({
          asset,
          title: `${task.workOrderCode} - ${kind === "image" ? "Photo" : "Video"}`,
          taskId: /^\d+$/.test(task.id) ? task.id : null,
          farmerId: task.farmerId || null,
        });
        setTaskMedia((prev) => [uploaded, ...prev]);
        showToast({
          title: kind === "image" ? "Image Uploaded" : "Video Uploaded",
          message: `${uploaded.original_name} attached to task.`,
          type: "success",
        });
      } catch (err: any) {
        showToast({
          title: "Upload Failed",
          message: err?.message || "Could not upload media file.",
          type: "error",
        });
      } finally {
        setUploadingKind(null);
      }
    };

    if (Platform.OS === "web") {
      void run("library");
      return;
    }

    Alert.alert(kind === "image" ? "Upload Task Photo" : "Upload Task Video", "Choose media source", [
      { text: kind === "image" ? "Take Photo" : "Record Video", onPress: () => void run("camera") },
      { text: "Choose from Gallery", onPress: () => void run("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDownloadAttachment = async (file: ServerMediaFile) => {
    const ok = await downloadRemoteFile(file.download_url, file.original_name);
    showToast({
      title: ok ? "Download Started" : "Download Notice",
      message: ok ? `Downloading ${file.original_name}...` : "Could not open download link.",
      type: ok ? "success" : "error",
    });
  };

  const handleStartVisit = async () => {
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

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.72)", backgroundColor: "rgba(255, 255, 255, 0.34)" }}>
          <LiquidGlassIconButton variant="light" size={42} onPress={() => router.back()}>
            <ChevronLeft size={22} color="#0f172a" />
          </LiquidGlassIconButton>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>{serviceConfig.vocab.taskSingular} Details</Text>
            <Text style={{ color: serviceConfig.color, fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1 }}>{task.workOrderCode}</Text>
          </View>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {/* TITLE & FACILITY CARD */}
          <LiquidGlassCard variant="light" borderRadius={28} style={{ marginBottom: 20 }} contentStyle={{ padding: 22 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(254, 226, 226, 0.78)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.85)" }}>
                <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 12 }}>{task.priority}</Text>
              </View>
              <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: `${serviceConfig.color}18`, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.85)" }}>
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
            <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "rgba(15, 23, 42, 0.08)", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Award size={18} color="#16a34a" style={{ marginRight: 6 }} />
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 13 }}>+{task.points} Performance Points</Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>After Visit Checkout</Text>
            </View>

            {/* START VISIT WITH LIVE GPS TRACKING */}
            <LiquidGlassButton
              variant="tinted"
              tintColor={`${serviceConfig.color}CC`}
              dropletColor={serviceConfig.color}
              onPress={handleStartVisit}
              style={{ marginTop: 16 }}
              contentStyle={{ paddingVertical: 16 }}
            >
              <Navigation size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                Start Visit (Live GPS Map)
              </Text>
            </LiquidGlassButton>
          </LiquidGlassCard>

          {/* ADVISORY BOX */}
          <LiquidGlassCard variant="light" borderRadius={20} style={{ marginBottom: 20 }} contentStyle={{ padding: 18 }}>
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
          </LiquidGlassCard>

          {/* MANDATORY SAFETY & PPE CHECKLIST */}
          <LiquidGlassCard variant="light" borderRadius={20} style={{ marginBottom: 20 }} contentStyle={{ padding: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <ShieldCheck size={20} color={serviceConfig.color} style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Pre-Visit Safety Checklist</Text>
            </View>
            <View style={{ gap: 10 }}>
              {safetyChecklist.map((item) => (
                <LiquidGlassCard
                  key={item.id}
                  variant="light"
                  borderRadius={12}
                  onPress={() => toggleSafetyItem(item.id)}
                  contentStyle={{ flexDirection: "row", alignItems: "center", padding: 12 }}
                >
                  <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: item.checked ? "#16a34a" : "rgba(255, 255, 255, 0.72)", borderWidth: item.checked ? 0 : 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    {item.checked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text style={{ flex: 1, color: item.checked ? "#166534" : "#475569", fontFamily: "Brandon-Bold", fontSize: 13 }}>{item.text}</Text>
                </LiquidGlassCard>
              ))}
            </View>
          </LiquidGlassCard>

          {/* TASK MEDIA: UPLOAD PHOTOS / VIDEOS & DOWNLOAD FILES */}
          <LiquidGlassCard variant="light" borderRadius={20} style={{ marginBottom: 20 }} contentStyle={{ padding: 20 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>
              Task Attachments & Downloads ({taskMedia.length})
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginBottom: 14 }}>
              Upload task photos or videos, or download files shared by your admin.
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginBottom: taskMedia.length > 0 ? 14 : 0 }}>
              <LiquidGlassButton
                onPress={() => handleTaskUpload("image")}
                disabled={uploadingKind !== null}
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.85)"
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 11 }}
              >
                {uploadingKind === "image" ? <ActivityIndicator size="small" color="#ffffff" /> : <Camera size={15} color="#ffffff" />}
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 6 }}>Upload Image</Text>
              </LiquidGlassButton>
              <LiquidGlassButton
                onPress={() => handleTaskUpload("video")}
                disabled={uploadingKind !== null}
                variant="tinted"
                tintColor="rgba(2, 132, 199, 0.85)"
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 11 }}
              >
                {uploadingKind === "video" ? <ActivityIndicator size="small" color="#ffffff" /> : <Video size={15} color="#ffffff" />}
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 6 }}>Upload Video</Text>
              </LiquidGlassButton>
            </View>

            {taskMedia.length > 0 && (
              <View style={{ gap: 10 }}>
                {taskMedia.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.72)",
                      borderRadius: 14,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: "rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    {item.category === "image" ? (
                      <Image source={{ uri: item.preview_url }} style={{ width: 42, height: 42, borderRadius: 10, marginRight: 10, backgroundColor: "#e2e8f0" }} />
                    ) : (
                      <LiquidGlassIconBadge
                        size={42}
                        borderRadius={10}
                        variant="light"
                        tintColor={item.category === "video" ? "#0284c7" : "#0f766e"}
                        style={{ marginRight: 10 }}
                      >
                        {item.category === "video" ? <Video size={18} color="#0284c7" /> : <FileText size={18} color="#0f766e" />}
                      </LiquidGlassIconBadge>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>
                        {item.category.toUpperCase()} • {item.size_human}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => void handleDownloadAttachment(item)}
                      style={{
                        backgroundColor: "#0f766e",
                        paddingHorizontal: 10,
                        paddingVertical: 7,
                        borderRadius: 9,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Download size={13} color="#ffffff" />
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 11 }}>Download</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
