import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronDown,
  CalendarDays,
  FileText,
  Download,
  MoreHorizontal,
  Plus,
  Filter,
  Camera,
  Video,
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
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function EmployeeReportsScreen() {
  const { serviceConfig } = useService();
  const currentYear = String(new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [submittedReports, setSubmittedReports] = useState<any[]>([]);
  const [mediaFiles, setMediaFiles] = useState<ServerMediaFile[]>([]);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);

  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem("@fieldy_reports");
      const localReports = stored ? JSON.parse(stored) : [];
      const [visitsRes, serverMedia] = await Promise.all([
        apiClient.get("/employee/visits").catch(() => null),
        fetchMediaFiles().catch(() => [] as ServerMediaFile[]),
      ]);
      setMediaFiles(serverMedia);

      const serverReports = (visitsRes?.visits || []).map((v: any) => ({
        id: String(v.id),
        title: `${v.farmerName || serviceConfig.vocab.entitySingular} • ${serviceConfig.shortName} Report`,
        date: v.date || "Today",
        size: v.media_count ? `${v.media_count} file(s)` : "Synced",
        type: "REPORT",
        status: v.status === "completed" ? "Approved" : "Pending",
        downloadUrl: v.dossier_url || null,
        filename: `fieldy-visit-report-${v.id}.html`,
      }));
      const serverIds = new Set(serverReports.map((s: any) => s.id));
      const formattedLocal = localReports
        .filter((r: any) => !r.serverVisitId || !serverIds.has(String(r.serverVisitId)))
        .map((r: any) => ({
        id: r.serverVisitId || r.id,
        title: `${r.siteName || r.service || serviceConfig.shortName} • ${r.notes?.slice(0, 28) || "Field Report"}`,
        date: new Date(r.createdAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        size: r.uploadedMedia?.length ? `${r.uploadedMedia.length} file(s)` : r.beforePhoto || r.afterPhoto ? "Photo Log" : "Text Log",
        type: "FIELD",
        status: "Approved",
        downloadUrl: r.dossierUrl || r.uploadedMedia?.[0]?.download_url || null,
        filename: `fieldy-report-${r.id}.html`,
      }));
      setSubmittedReports([...formattedLocal, ...serverReports]);
    } catch {
      // Fallback smoothly
    }
  }, [serviceConfig.shortName, serviceConfig.vocab.entitySingular]);

  useEffect(() => {
    (async () => {
      await Promise.resolve();
      await loadData();
    })();
  }, [loadData, serviceConfig.key]);

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
          message: `${uploaded.original_name} (${uploaded.size_human}) synced to portal.`,
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
        message: "Submit or upload a synced file first to download it.",
        type: "info",
      });
      return;
    }
    const ok = await downloadRemoteFile(url, filename);
    showToast({
      title: ok ? "Download Started" : "Download Notice",
      message: ok ? `Downloading ${title || filename || "file"}...` : "Could not open download link.",
      type: ok ? "success" : "error",
    });
  };

  const archiveImages = [
    require("../../assets/images/image10.jpg"),
    require("../../assets/images/image4.jpg"),
    require("../../assets/images/image14.jpg"),
  ];
  const monthGroups: Record<string, { count: number; reportId: string }> = {};
  submittedReports.forEach((r: any) => {
    const d = new Date(r.date);
    if (isNaN(d.getTime()) || String(d.getFullYear()) !== selectedYear) return;
    const label = d.toLocaleDateString("en-US", { month: "long" });
    if (!monthGroups[label]) monthGroups[label] = { count: 0, reportId: String(r.id) };
    monthGroups[label].count += 1;
  });
  const monthlyArchives = Object.entries(monthGroups)
    .slice(0, 3)
    .map(([month, g], idx) => ({
      month,
      count: `${g.count} report${g.count === 1 ? "" : "s"}`,
      image: archiveImages[idx % archiveImages.length],
      reportId: g.reportId,
    }));

  const documents = submittedReports;

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* TOP HEADER (Reference Image 1: "2026 v" on left, Calendar & New Report on right) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setSelectedYear(
                selectedYear === currentYear ? String(Number(currentYear) - 1) : currentYear
              )
            }
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 24,
                letterSpacing: 0.4,
              }}
            >
              {selectedYear}
            </Text>
            <ChevronDown
              size={20}
              color="rgba(255,255,255,0.75)"
              style={{ marginLeft: 5, marginTop: 2 }}
            />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/report/select-method")}
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.34)"
              contentStyle={{
                paddingHorizontal: 14,
                paddingVertical: 8,
              }}
            >
              <Plus size={16} color="#ffffff" />
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                  marginLeft: 4,
                }}
              >
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

        <PageHeroBanner
          badge="MEDIA VAULT"
          title={`${serviceConfig.vocab.report}s`}
          subtitle={`${submittedReports.length} Reports • ${mediaFiles.length} Files Synced`}
          colors={["#7c3aed", "#1e3a8a"]}
          personIndex={5}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
          }}
        >
          {/* STACKED SCENIC MONTHLY CARDS (Reference Image 1) */}
          <View style={{ gap: 18, marginBottom: 32 }}>
            {monthlyArchives.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.92}
                onPress={() =>
                  router.push(`/(employee)/report/${item.reportId}` as any)
                }
                style={{
                  height: 184,
                  borderRadius: 28,
                  overflow: "hidden",
                  backgroundColor: "#0f172a",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.14)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Image
                  source={item.image}
                  style={[
                    StyleSheet.absoluteFillObject,
                    { width: "100%", height: "100%" },
                  ]}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={[
                    "rgba(6, 34, 20, 0.25)",
                    "rgba(6, 34, 20, 0.45)",
                    "rgba(6, 34, 20, 0.9)",
                  ]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Top Floating Pill Badge ("23 reports") + "..." Circle Button */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingTop: 18,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      paddingHorizontal: 16,
                      paddingVertical: 7,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 13,
                        letterSpacing: 0.3,
                      }}
                    >
                      {item.count}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/(employee)/report/${item.reportId}` as any)
                    }
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MoreHorizontal size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Oversized Editorial Month Display Typography at Bottom */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.9)",
                      fontFamily: "Brandon-Bold",
                      fontSize: 44,
                      letterSpacing: -1,
                      lineHeight: 50,
                    }}
                    numberOfLines={1}
                  >
                    {item.month}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* QUICK IMAGE & VIDEO UPLOAD BAR */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
            <LiquidGlassButton
              onPress={() => handleQuickUpload("image")}
              disabled={uploadingKind !== null}
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.34)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
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
              tintColor="rgba(14, 165, 233, 0.36)"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
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

          {/* SYNCED MEDIA & FILES (IMAGES, VIDEOS, DOCUMENTS) */}
          {mediaFiles.length > 0 && (
            <View style={{ marginBottom: 26 }}>
              <Text
                style={{
                  color: "#38bdf8",
                  fontFamily: "Brandon-Bold",
                  fontSize: 11,
                  letterSpacing: 1.1,
                }}
              >
                MEDIA VAULT ({mediaFiles.length})
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 19,
                  marginBottom: 12,
                }}
              >
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

                      <View style={{ flex: 1 }}>
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
                        <Download size={15} color="#ffffff" />
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 11 }}>Download</Text>
                      </TouchableOpacity>
                    </LiquidGlassCard>
                  );
                })}
              </View>
            </View>
          )}

          {/* RECENT FIELD DOCUMENTS DOSSIER LIST */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 11,
                  letterSpacing: 1.1,
                }}
              >
                RECORDS & LOGS
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 19,
                }}
              >
                Recent Field Documents
              </Text>
            </View>
            <LiquidGlassPill
              variant="dark"
              onPress={() => router.push("/(employee)/visit-history")}
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 8 }}
            >
              <Filter
                size={13}
                color="#ffffff"
                style={{ marginRight: 5 }}
              />
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                }}
              >
                All Logs
              </Text>
            </LiquidGlassPill>
          </View>

          <View style={{ gap: 14 }}>
            {documents.length === 0 && (
              <LiquidGlassCard variant="dark" borderRadius={22} contentStyle={{ padding: 22, alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>No field documents yet</Text>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4, textAlign: "center" }}>
                  Submitted visit reports and dossiers appear here.
                </Text>
              </LiquidGlassCard>
            )}
            {documents.map((doc) => {
              const iconColor =
                doc.type === "PDF"
                  ? "#f87171"
                  : doc.type === "DOCX"
                    ? "#38bdf8"
                    : "#4ade80";
              return (
                <LiquidGlassCard
                  key={doc.id}
                  variant="dark"
                  borderRadius={22}
                  dropletColor={iconColor}
                  onPress={() => router.push(`/(employee)/report/${doc.id}` as any)}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 15,
                  }}
                >
                  {/* ICON */}
                  <LiquidGlassIconBadge
                    size={46}
                    borderRadius={15}
                    variant="dark"
                    tintColor={iconColor}
                    style={{ marginRight: 14 }}
                  >
                    <FileText size={22} color={iconColor} />
                  </LiquidGlassIconBadge>

                  {/* DETAILS */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 15,
                        lineHeight: 20,
                        marginBottom: 3,
                      }}
                      numberOfLines={1}
                    >
                      {doc.title}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.65)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 12,
                      }}
                    >
                      {doc.date} • {doc.size}
                    </Text>
                  </View>

                  {/* ACTION/STATUS */}
                  <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor:
                          doc.status === "Approved"
                            ? "rgba(74, 222, 128, 0.2)"
                            : doc.status === "Pending"
                              ? "rgba(251, 191, 36, 0.2)"
                              : "rgba(239, 68, 68, 0.2)",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            doc.status === "Approved"
                              ? "#4ade80"
                              : doc.status === "Pending"
                                ? "#fbbf24"
                                : "#f87171",
                          fontFamily: "Brandon-Bold",
                          fontSize: 10,
                        }}
                      >
                        {doc.status}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        void handleDownload(doc.downloadUrl, doc.title, doc.filename)
                      }
                    >
                      <Download size={18} color="rgba(255,255,255,0.85)" />
                    </TouchableOpacity>
                  </View>
                </LiquidGlassCard>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
