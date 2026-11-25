import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  CalendarDays,
  FileText,
  Download,
  Plus,
  Filter,
  Camera,
  Video,
  FolderOpen,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useService } from "../../context/ServiceContext";
import { apiClient } from "../../api/client";
import { showToast } from "../../components/ui/ToastMessage";
import {
  ServerMediaFile,
  downloadRemoteFile,
  fetchMediaFiles,
  pickImageAsset,
  pickVideoAsset,
  uploadMediaAsset,
} from "../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

const ARCHIVE_IMAGES = [
  require("../../assets/images/image10.jpg"),
  require("../../assets/images/image4.jpg"),
  require("../../assets/images/image14.jpg"),
];

export default function EmployeeReportsScreen() {
  const { serviceConfig } = useService();
  const [visits, setVisits] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<ServerMediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);

  const loadData = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const [visitsRes, serverMedia] = await Promise.all([
        apiClient.get("/employee/visits").catch(() => null),
        fetchMediaFiles().catch(() => [] as ServerMediaFile[]),
      ]);
      setVisits(Array.isArray(visitsRes?.visits) ? visitsRes.visits : []);
      setMediaFiles(Array.isArray(serverMedia) ? serverMedia : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadData(false);
    }, [loadData])
  );

  // Build 100% real monthly groups from actual recorded visits
  const monthlyArchives = useMemo(() => {
    const groups = new Map<string, { label: string; count: number; latestVisitId: string }>();
    visits.forEach((v) => {
      const key = v.monthKey || "current";
      const label = v.monthLabel || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const existing = groups.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        groups.set(key, { label, count: 1, latestVisitId: String(v.id) });
      }
    });
    return Array.from(groups.values()).slice(0, 3);
  }, [visits]);

  const submittedReports = useMemo(
    () =>
      visits.map((v) => ({
        id: String(v.id),
        title: `${v.farmerName || serviceConfig.vocab.entitySingular} • ${v.visitCode || `VST-${v.id}`}`,
        date: `${v.date || ""}${v.checkInTime ? ` • ${v.checkInTime}` : ""}`,
        size: v.media_count ? `${v.media_count} attachment(s)` : "Synced Dossier",
        status: v.status === "completed" ? "Completed" : "In Progress",
        downloadUrl: v.dossier_url || null,
        filename: `fieldy-visit-${v.id}-dossier.txt`,
      })),
    [visits, serviceConfig.vocab.entitySingular]
  );

  const handleQuickUpload = (kind: "image" | "video") => {
    const runUpload = async (source: "camera" | "library") => {
      setUploadingKind(kind);
      try {
        const asset = kind === "image" ? await pickImageAsset(source) : await pickVideoAsset(source);
        if (!asset) return;
        const uploaded = await uploadMediaAsset({
          asset,
          title: `${serviceConfig.shortName} ${kind === "image" ? "Site Photo" : "Site Video"}`,
        });
        setMediaFiles((prev) => [uploaded, ...prev]);
        showToast({
          title: kind === "image" ? "Image Uploaded" : "Video Uploaded",
          message: `${uploaded.original_name} (${uploaded.size_human}) synced to Web Admin.`,
          type: "success",
        });
      } catch (err: any) {
        showToast({
          title: "Upload Failed",
          message: err?.message || "Could not upload file. Check connection & permissions.",
          type: "error",
        });
      } finally {
        setUploadingKind(null);
      }
    };

    if (Platform.OS === "web") {
      void runUpload("library");
      return;
    }

    Alert.alert(
      kind === "image" ? "Upload Image" : "Upload Video",
      kind === "image" ? "Capture a site photo or pick from gallery" : "Record a video or choose from gallery",
      [
        { text: kind === "image" ? "Take Photo" : "Record Video", onPress: () => void runUpload("camera") },
        { text: "Choose from Gallery", onPress: () => void runUpload("library") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleDownload = async (url?: string | null, title?: string, filename?: string) => {
    if (!url) {
      showToast({
        title: "No Downloadable File",
        message: "Complete checkout to generate a downloadable dossier.",
        type: "info",
      });
      return;
    }
    const ok = await downloadRemoteFile(url, filename);
    showToast({
      title: ok ? "Download Started" : "Download Notice",
      message: ok ? `Opening ${title || filename || "file"}...` : "Could not open download link.",
      type: ok ? "success" : "error",
    });
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* TOP HEADER */}
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
          <View>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>
              {serviceConfig.vocab.report}s
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.68)", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              {submittedReports.length} dossiers • {mediaFiles.length} media files
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/report/select-method")}
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.45)"
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 9 }}
            >
              <Plus size={16} color="#ffffff" />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4 }}>
                New Report
              </Text>
            </LiquidGlassButton>
            <LiquidGlassIconButton
              onPress={() => router.push("/(employee)/calendar")}
              size={42}
              variant="dark"
            >
              <CalendarDays size={20} color="#ffffff" />
            </LiquidGlassIconButton>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
              tintColor="#4ade80"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        >
          {/* DYNAMIC REAL MONTHLY SUMMARY CARDS */}
          {monthlyArchives.length > 0 && (
            <View style={{ gap: 16, marginBottom: 24 }}>
              {monthlyArchives.map((item, idx) => (
                <TouchableOpacity
                  key={item.label}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(employee)/report/${item.latestVisitId}` as any)}
                  style={{
                    height: 152,
                    borderRadius: 26,
                    overflow: "hidden",
                    backgroundColor: "#0f172a",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.16)",
                  }}
                >
                  <Image
                    source={ARCHIVE_IMAGES[idx % ARCHIVE_IMAGES.length]}
                    style={[StyleSheet.absoluteFill, { width: "100%", height: "100%" }]}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(6, 34, 20, 0.28)", "rgba(6, 34, 20, 0.88)"]}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={{ flex: 1, justifyContent: "space-between", padding: 18 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.22)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.4)",
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                          borderRadius: 999,
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                          {item.count} {item.count === 1 ? "report" : "reports"}
                        </Text>
                      </View>
                      <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                        Synced Live
                      </Text>
                    </View>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 30 }}>
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* QUICK IMAGE & VIDEO UPLOAD BAR */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            <LiquidGlassButton
              onPress={() => handleQuickUpload("image")}
              disabled={uploadingKind !== null}
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.38)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 13 }}
            >
              {uploadingKind === "image" ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Camera size={16} color="#ffffff" />
              )}
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 6 }}>
                {uploadingKind === "image" ? "Uploading..." : "Upload Image"}
              </Text>
            </LiquidGlassButton>

            <LiquidGlassButton
              onPress={() => handleQuickUpload("video")}
              disabled={uploadingKind !== null}
              variant="tinted"
              tintColor="rgba(14, 165, 233, 0.40)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 13 }}
            >
              {uploadingKind === "video" ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Video size={16} color="#ffffff" />
              )}
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 6 }}>
                {uploadingKind === "video" ? "Uploading..." : "Upload Video"}
              </Text>
            </LiquidGlassButton>
          </View>

          {/* SYNCED MEDIA VAULT */}
          {mediaFiles.length > 0 && (
            <View style={{ marginBottom: 26 }}>
              <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>
                MEDIA VAULT ({mediaFiles.length})
              </Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19, marginBottom: 12 }}>
                Uploaded Photos, Videos & Files
              </Text>
              <View style={{ gap: 12 }}>
                {mediaFiles.slice(0, 12).map((file) => {
                  const tint =
                    file.category === "image"
                      ? "#4ade80"
                      : file.category === "video"
                      ? "#38bdf8"
                      : "#fbbf24";
                  return (
                    <LiquidGlassCard
                      key={`media-${file.id}`}
                      variant="dark"
                      borderRadius={20}
                      dropletColor={tint}
                      onPress={() => void handleDownload(file.download_url, file.title, file.original_name)}
                      contentStyle={{ flexDirection: "row", alignItems: "center", padding: 14 }}
                    >
                      {file.category === "image" ? (
                        <Image
                          source={{ uri: file.preview_url }}
                          style={{ width: 46, height: 46, borderRadius: 12, marginRight: 12, backgroundColor: "#1e293b" }}
                        />
                      ) : (
                        <LiquidGlassIconBadge size={46} borderRadius={14} variant="dark" tintColor={tint} style={{ marginRight: 12 }}>
                          {file.category === "video" ? <Video size={20} color={tint} /> : <FileText size={20} color={tint} />}
                        </LiquidGlassIconBadge>
                      )}

                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }} numberOfLines={1}>
                          {file.title}
                        </Text>
                        <Text style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                          {file.category.toUpperCase()} • {file.size_human} • {file.date_label}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => void handleDownload(file.download_url, file.title, file.original_name)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 12,
                          backgroundColor: "rgba(255,255,255,0.14)",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Download size={14} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 11 }}>Download</Text>
                      </TouchableOpacity>
                    </LiquidGlassCard>
                  );
                })}
              </View>
            </View>
          )}

          {/* SUBMITTED VISIT REPORTS LIST */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View>
              <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>
                RECORDS & DOSSIERS
              </Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19 }}>
                Submitted Field Reports
              </Text>
            </View>
            <LiquidGlassPill
              variant="dark"
              onPress={() => router.push("/(employee)/visit-history")}
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Filter size={13} color="#ffffff" style={{ marginRight: 5 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                History
              </Text>
            </LiquidGlassPill>
          </View>

          {loading ? (
            <ActivityIndicator color="#4ade80" style={{ marginTop: 28 }} />
          ) : submittedReports.length > 0 ? (
            <View style={{ gap: 12 }}>
              {submittedReports.map((doc) => (
                <LiquidGlassCard
                  key={doc.id}
                  variant="dark"
                  borderRadius={22}
                  dropletColor="#4ade80"
                  onPress={() => router.push(`/(employee)/report/${doc.id}` as any)}
                  contentStyle={{ flexDirection: "row", alignItems: "center", padding: 15 }}
                >
                  <LiquidGlassIconBadge
                    size={46}
                    borderRadius={15}
                    variant="dark"
                    tintColor="#4ade80"
                    style={{ marginRight: 14 }}
                  >
                    <FileText size={22} color="#4ade80" />
                  </LiquidGlassIconBadge>

                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }} numberOfLines={1}>
                      {doc.title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                      {doc.date} • {doc.size}
                    </Text>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                        borderRadius: 999,
                        backgroundColor:
                          doc.status === "Completed" ? "rgba(74, 222, 128, 0.2)" : "rgba(251, 191, 36, 0.2)",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: doc.status === "Completed" ? "#4ade80" : "#fbbf24",
                          fontFamily: "Brandon-Bold",
                          fontSize: 10,
                        }}
                      >
                        {doc.status}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => void handleDownload(doc.downloadUrl, doc.title, doc.filename)}>
                      <Download size={18} color="rgba(255,255,255,0.85)" />
                    </TouchableOpacity>
                  </View>
                </LiquidGlassCard>
              ))}
            </View>
          ) : (
            <LiquidGlassCard
              variant="dark"
              borderRadius={24}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <FolderOpen size={36} color="#64748b" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                No Reports Submitted Yet
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.68)", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Reports, photos, videos, and downloadable dossiers created from real site visits appear here.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
