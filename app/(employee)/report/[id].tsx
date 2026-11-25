import React, { useCallback, useState } from "react";
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
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  ClipboardCheck,
  Sparkles,
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
  const [loading, setLoading] = useState(true);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);

  const loadReport = useCallback(async () => {
    try {
      const visitsRes = await apiClient.get("/employee/visits").catch(() => null);
      const serverMatch = (Array.isArray(visitsRes?.visits) ? visitsRes.visits : []).find(
        (v: any) => String(v.id) === String(id)
      );

      if (serverMatch) {
        setReport({
          id: serverMatch.id,
          siteName: serverMatch.farmerName || "Assigned Site",
          code: serverMatch.visitCode || `VST-${serverMatch.id}`,
          date: `${serverMatch.date || ""}${serverMatch.checkInTime ? ` • ${serverMatch.checkInTime}` : ""}${
            serverMatch.checkOutTime ? ` – ${serverMatch.checkOutTime}` : ""
          }`,
          address: serverMatch.address || "Field GPS Verified",
          notes: serverMatch.remarks || "No notes entered.",
          recommendations: serverMatch.recommendations || "",
          status: serverMatch.status === "completed" ? "COMPLETED" : "IN PROGRESS",
          dossierUrl: serverMatch.dossier_url || null,
          isServerVisit: true,
        });
        const files =
          Array.isArray(serverMatch.media) && serverMatch.media.length > 0
            ? serverMatch.media
            : await fetchMediaFiles({ visitId: serverMatch.id }).catch(() => []);
        setMediaItems(files);
      } else {
        setReport(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadReport();
    }, [loadReport])
  );

  const handleUploadAttachment = (kind: "image" | "video") => {
    const run = async (source: "camera" | "library") => {
      setUploadingKind(kind);
      try {
        const asset = kind === "image" ? await pickImageAsset(source) : await pickVideoAsset(source);
        if (!asset) return;
        const uploaded = await uploadMediaAsset({
          asset,
          title: `${report?.code || `Report #${id}`} ${kind === "image" ? "Photo" : "Video"}`,
          visitId: report?.isServerVisit ? report.id : undefined,
        });
        setMediaItems((prev) => [uploaded, ...prev]);
        showToast({
          title: kind === "image" ? "Image Uploaded" : "Video Uploaded",
          message: `${uploaded.original_name} synced to Web Admin.`,
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

    Alert.alert(kind === "image" ? "Attach Photo" : "Attach Video", "Choose media source", [
      { text: kind === "image" ? "Take Photo" : "Record Video", onPress: () => void run("camera") },
      { text: "Choose from Gallery", onPress: () => void run("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleDownload = async (url?: string | null, name?: string) => {
    if (!url) {
      showToast({ title: "Unavailable", message: "No downloadable link available yet.", type: "info" });
      return;
    }
    const ok = await downloadRemoteFile(url, name);
    showToast({
      title: ok ? "Download Started" : "Download Failed",
      message: ok ? `Opening ${name || "file"}...` : "Unable to open file link.",
      type: ok ? "success" : "error",
    });
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/reports"))}
            variant="light"
            size={42}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            {report?.code || `Report #${id || ""}`}
          </Text>
          <LiquidGlassIconButton
            variant="light"
            size={42}
            onPress={() =>
              void handleDownload(
                report?.dossierUrl || mediaItems[0]?.download_url,
                `fieldy-visit-${id}-dossier.txt`
              )
            }
          >
            <Download size={20} color="#0f172a" />
          </LiquidGlassIconButton>
        </View>

        {loading ? (
          <ActivityIndicator color="#059669" style={{ marginTop: 48 }} />
        ) : !report ? (
          <View style={{ padding: 22 }}>
            <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 26, alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                Report Not Found
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center", marginTop: 6 }}>
                This report record does not exist in your visit history.
              </Text>
            </LiquidGlassCard>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}>
            {/* Metadata Card */}
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              style={{ marginBottom: 20, marginTop: 4 }}
              contentStyle={{ padding: 22 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 18 }}>
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#0f766e", alignItems: "center", justifyContent: "center", marginRight: 14 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                    {(report.siteName || "S").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                    {report.siteName}
                  </Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                    {report.code}
                  </Text>
                </View>
                <View style={{ backgroundColor: "rgba(220, 252, 231, 0.9)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: "#15803d", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                    {report.status}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: "rgba(255, 255, 255, 0.65)", borderRadius: 16, padding: 14, gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Calendar size={15} color="#64748b" style={{ width: 22 }} />
                  <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 13, flex: 1 }}>
                    {report.date}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MapPin size={15} color="#64748b" style={{ width: 22 }} />
                  <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 13, flex: 1 }}>
                    {report.address}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ShieldCheck size={15} color="#059669" style={{ width: 22 }} />
                  <Text style={{ color: "#059669", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                    Synced with Web Admin Visits & Media Vault
                  </Text>
                </View>
              </View>
            </LiquidGlassCard>

            {/* Field Notes */}
            <LiquidGlassCard variant="light" borderRadius={22} style={{ marginBottom: 16 }} contentStyle={{ padding: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <LiquidGlassIconBadge size={34} borderRadius={11} variant="light" tintColor="#0284c7">
                  <ClipboardCheck size={17} color="#0284c7" />
                </LiquidGlassIconBadge>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 10 }}>
                  Field Work Notes
                </Text>
              </View>
              <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                {report.notes}
              </Text>
            </LiquidGlassCard>

            {report.recommendations ? (
              <LiquidGlassCard variant="light" borderRadius={22} style={{ marginBottom: 20 }} contentStyle={{ padding: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <LiquidGlassIconBadge size={34} borderRadius={11} variant="light" tintColor="#10b981">
                    <Sparkles size={17} color="#10b981" />
                  </LiquidGlassIconBadge>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 10 }}>
                    Recommendations
                  </Text>
                </View>
                <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                  {report.recommendations}
                </Text>
              </LiquidGlassCard>
            ) : null}

            {/* ATTACHED MEDIA */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 19, marginBottom: 12 }}>
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
                  Attach Photo
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
                  Attach Video
                </Text>
              </LiquidGlassButton>
            </View>

            {mediaItems.length === 0 ? (
              <LiquidGlassCard variant="light" borderRadius={20} contentStyle={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center" }}>
                  No photos or videos attached yet. Tap Attach Photo or Attach Video above.
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

                    <View style={{ flex: 1, marginRight: 8 }}>
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
        )}
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
