import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Beaker,
  Download,
  Camera,
  Video,
  FileText,
} from "lucide-react-native";
import { apiClient } from "../../../api/client";
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

export default function EmployeeReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [report, setReport] = useState<any | null>(null);
  const [mediaItems, setMediaItems] = useState<ServerMediaFile[]>([]);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("@fieldy_reports");
      const localList = stored ? JSON.parse(stored) : [];
      const localMatch = localList.find(
        (r: any) => String(r.id) === String(id) || String(r.serverVisitId) === String(id)
      );

      const visitsRes = await apiClient.get("/employee/visits").catch(() => null);
      const serverMatch = (visitsRes?.visits || []).find((v: any) => String(v.id) === String(id));

      if (serverMatch) {
        setReport({
          id: serverMatch.id,
          siteName: serverMatch.farmerName || "Client Site",
          code: serverMatch.farmerCode || `SITE-${serverMatch.id}`,
          date: `${serverMatch.date || "Today"}, ${serverMatch.time || ""}`,
          address: serverMatch.address || "Verified Field Location",
          notes: serverMatch.remarks || "Field visit completed and verified.",
          recommendations: serverMatch.recommendations || "No follow-up recommendations.",
          status: serverMatch.status === "completed" ? "APPROVED" : "PENDING",
          dossierUrl: serverMatch.dossier_url || null,
          isServerVisit: true,
        });
        const files = Array.isArray(serverMatch.media) && serverMatch.media.length > 0
          ? serverMatch.media
          : await fetchMediaFiles({ visitId: serverMatch.id }).catch(() => []);
        setMediaItems(files);
        return;
      }

      if (localMatch) {
        setReport({
          id: localMatch.serverVisitId || localMatch.id,
          siteName: localMatch.siteName || "Field Site",
          code: String(localMatch.id),
          date: new Date(localMatch.createdAt || Date.now()).toLocaleString(),
          address: localMatch.service || "Field Operations",
          notes: localMatch.notes || "Field report submitted.",
          recommendations: localMatch.recommendations || "No follow-up recommendations.",
          status: "APPROVED",
          dossierUrl: localMatch.dossierUrl || null,
          isServerVisit: Boolean(localMatch.serverVisitId),
        });
        if (Array.isArray(localMatch.uploadedMedia)) {
          setMediaItems(localMatch.uploadedMedia);
        }
      }
    } catch {
      // keep fallback view
    }
  }, [id]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  const handleUploadAttachment = (kind: "image" | "video") => {
    const run = async (source: "camera" | "library") => {
      setUploadingKind(kind);
      try {
        const asset = kind === "image" ? await pickImageAsset(source) : await pickVideoAsset(source);
        if (!asset) return;
        const uploaded = await uploadMediaAsset({
          asset,
          title: `Report #${id || "Field"} ${kind === "image" ? "Photo" : "Video"}`,
          visitId: report?.isServerVisit ? report.id : undefined,
        });
        setMediaItems((prev) => [uploaded, ...prev]);
        showToast({
          title: kind === "image" ? "Image Uploaded" : "Video Uploaded",
          message: `${uploaded.original_name} attached successfully.`,
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

    Alert.alert(
      kind === "image" ? "Attach Photo" : "Attach Video",
      "Choose media source",
      [
        { text: kind === "image" ? "Take Photo" : "Record Video", onPress: () => void run("camera") },
        { text: "Choose from Gallery", onPress: () => void run("library") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleDownload = async (url?: string | null, name?: string) => {
    if (!url) {
      showToast({ title: "Unavailable", message: "No downloadable file link for this record yet.", type: "info" });
      return;
    }
    const ok = await downloadRemoteFile(url, name);
    showToast({
      title: ok ? "Download Started" : "Download Failed",
      message: ok ? `Downloading ${name || "file"}...` : "Unable to open file link.",
      type: ok ? "success" : "error",
    });
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/reports"))}
            variant="light"
            size={42}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            Report #{id || "8842"}
          </Text>
          <LiquidGlassIconButton
            variant="light"
            size={42}
            onPress={() => void handleDownload(report?.dossierUrl || mediaItems[0]?.download_url, `fieldy-report-${id || "dossier"}.html`)}
          >
            <Download size={20} color="#0f172a" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {/* Metadata Card */}
          <LiquidGlassCard
            variant="light"
            borderRadius={24}
            style={{ marginBottom: 24, marginTop: 8 }}
            contentStyle={{ padding: 24 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#0f766e", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                  {(report?.siteName || "R").charAt(0)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                  {report?.siteName || "Site Inspection"}
                </Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  {report?.code || `REPORT-${id || "8842"}`}
                </Text>
              </View>
              <View style={{ backgroundColor: "rgba(220, 252, 231, 0.85)", borderWidth: 1, borderColor: "rgba(22, 163, 74, 0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                  {report?.status || "APPROVED"}
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: "rgba(255, 255, 255, 0.45)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.85)", borderRadius: 16, padding: 16, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Calendar size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>
                  Submitted: {report?.date || "Verified Session"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>
                  Location: {report?.address || "Assigned Field Sector"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ShieldCheck size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>
                  Verified by Fieldy Operations Portal
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>
            Field Notes & Findings
          </Text>

          <LiquidGlassCard variant="light" borderRadius={24} style={{ marginBottom: 16 }} contentStyle={{ padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <LiquidGlassIconBadge size={36} borderRadius={12} variant="light" tintColor="#ef4444">
                <AlertTriangle size={18} color="#ef4444" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 10 }}>
                Observed Details
              </Text>
            </View>
            <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24 }}>
              {report?.notes || "Site inspection completed; safety checks, photo/video proof, and operational measurements recorded."}
            </Text>
          </LiquidGlassCard>

          <LiquidGlassCard variant="light" borderRadius={24} style={{ marginBottom: 20 }} contentStyle={{ padding: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <LiquidGlassIconBadge size={36} borderRadius={12} variant="light" tintColor="#10b981">
                <Beaker size={18} color="#10b981" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 10 }}>
                Recommendations
              </Text>
            </View>
            <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24 }}>
              {report?.recommendations || "Schedule next verification cycle and review attached evidence files."}
            </Text>
          </LiquidGlassCard>

          {/* ATTACHED MEDIA: UPLOAD IMAGE / VIDEO & DOWNLOAD FILES */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 12 }}>
            Photos, Videos & Downloads ({mediaItems.length})
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
            <LiquidGlassButton
              onPress={() => handleUploadAttachment("image")}
              disabled={uploadingKind !== null}
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.85)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12 }}
            >
              {uploadingKind === "image" ? <ActivityIndicator size="small" color="#ffffff" /> : <Camera size={16} color="#ffffff" />}
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 6 }}>
                Upload Image
              </Text>
            </LiquidGlassButton>
            <LiquidGlassButton
              onPress={() => handleUploadAttachment("video")}
              disabled={uploadingKind !== null}
              variant="tinted"
              tintColor="rgba(2, 132, 199, 0.85)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12 }}
            >
              {uploadingKind === "video" ? <ActivityIndicator size="small" color="#ffffff" /> : <Video size={16} color="#ffffff" />}
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 6 }}>
                Upload Video
              </Text>
            </LiquidGlassButton>
          </View>

          {mediaItems.length === 0 ? (
            <LiquidGlassCard variant="light" borderRadius={20} contentStyle={{ padding: 20, alignItems: "center" }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center" }}>
                No media uploaded to this report yet. Tap Upload Image or Upload Video above to attach evidence.
              </Text>
            </LiquidGlassCard>
          ) : (
            <View style={{ gap: 12 }}>
              {mediaItems.map((item) => (
                <LiquidGlassCard
                  key={item.id}
                  variant="light"
                  borderRadius={18}
                  contentStyle={{ flexDirection: "row", alignItems: "center", padding: 14 }}
                >
                  {item.category === "image" ? (
                    <Image
                      source={{ uri: item.preview_url }}
                      style={{ width: 54, height: 54, borderRadius: 12, marginRight: 12, backgroundColor: "#e2e8f0" }}
                    />
                  ) : (
                    <LiquidGlassIconBadge
                      size={54}
                      borderRadius={14}
                      variant="light"
                      tintColor={item.category === "video" ? "#0284c7" : "#0f766e"}
                      style={{ marginRight: 12 }}
                    >
                      {item.category === "video" ? <Video size={22} color="#0284c7" /> : <FileText size={22} color="#0f766e" />}
                    </LiquidGlassIconBadge>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                      {item.category.toUpperCase()} • {item.size_human}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => void handleDownload(item.download_url, item.original_name)}
                    style={{
                      backgroundColor: "#0f766e",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Download size={14} color="#ffffff" />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>Download</Text>
                  </TouchableOpacity>
                </LiquidGlassCard>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
