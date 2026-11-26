import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  LiquidGlassPill,
} from "../../../components/LiquidGlass";
import {
  ChevronLeft,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  FileText,
  MoreVertical,
  ShieldCheck,
  Camera,
  Video,
  Download,
} from "lucide-react-native";

export default function EmployeeSiteContactProfileScreen() {
  const { id } = useLocalSearchParams();
  const { serviceConfig } = useService();
  const [selectedService, setSelectedService] = useState<"audit" | "full">(
    "audit"
  );
  const [siteMedia, setSiteMedia] = useState<ServerMediaFile[]>([]);
  const [uploadingKind, setUploadingKind] = useState<"image" | "video" | null>(null);
  const [liveSite, setLiveSite] = useState<any | null>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);

  const loadSiteMedia = useCallback(async () => {
    if (!id || !/^\d+$/.test(String(id))) return;
    const files = await fetchMediaFiles({ farmerId: String(id) }).catch(() => []);
    setSiteMedia(files);
  }, [id]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [sitesRes, visitsRes] = await Promise.all([
        api.get("/employee/sites").catch(() => null),
        api.get("/employee/visits").catch(() => null),
      ]);
      if (!active) return;
      const sitesList = Array.isArray(sitesRes?.sites)
        ? sitesRes.sites
        : Array.isArray(sitesRes?.data?.sites)
        ? sitesRes.data.sites
        : [];
      const foundSite = sitesList.find(
        (s: any) =>
          String(s.site_contact_id) === String(id) ||
          String(s.id) === String(id) ||
          String(s.site_code || s.code) === String(id)
      );
      if (foundSite) {
        setLiveSite(foundSite);
      }
      const targetFarmerId = String(foundSite?.site_contact_id || foundSite?.id || id || "");
      const allVisits = Array.isArray(visitsRes?.visits) ? visitsRes.visits : [];
      const filtered = allVisits.filter(
        (v: any) =>
          (targetFarmerId && String(v.farmerId) === targetFarmerId) ||
          (foundSite?.name && String(v.site || v.siteName || "").toLowerCase() === String(foundSite.name).toLowerCase())
      );
      setSiteVisits(filtered);
      await loadSiteMedia();
    })();
    return () => {
      active = false;
    };
  }, [id, loadSiteMedia]);

  const handleSiteUpload = (kind: "image" | "video") => {
    const run = async (source: "camera" | "library") => {
      setUploadingKind(kind);
      try {
        const asset = kind === "image" ? await pickImageAsset(source) : await pickVideoAsset(source);
        if (!asset) return;
        const uploaded = await uploadMediaAsset({
          asset,
          title: `${matchedEntity?.name || "Site"} - ${kind === "image" ? "Photo" : "Video"}`,
          farmerId: id && /^\d+$/.test(String(id)) ? String(id) : null,
        });
        setSiteMedia((prev) => [uploaded, ...prev]);
        showToast({
          title: kind === "image" ? "Image Uploaded" : "Video Uploaded",
          message: `${uploaded.original_name} synced to site files.`,
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

    Alert.alert(kind === "image" ? "Upload Site Photo" : "Upload Site Video", "Choose media source", [
      { text: kind === "image" ? "Take Photo" : "Record Video", onPress: () => void run("camera") },
      { text: "Choose from Gallery", onPress: () => void run("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSiteDownload = async (file: ServerMediaFile) => {
    const ok = await downloadRemoteFile(file.download_url, file.original_name);
    showToast({
      title: ok ? "Download Started" : "Download Notice",
      message: ok ? `Downloading ${file.original_name}...` : "Could not open download link.",
      type: ok ? "success" : "error",
    });
  };

  const matchedEntity = {
    id: String(liveSite?.site_contact_id || liveSite?.id || id || ""),
    name: liveSite?.name || serviceConfig.vocab.entitySingular,
    type: liveSite?.type || liveSite?.permit_status || serviceConfig.vocab.entitySingular,
    address: liveSite?.site_address || liveSite?.address || liveSite?.area || "Assigned Zone",
    size: liveSite?.size || liveSite?.site_area || "—",
    sizeUnit: liveSite?.sizeUnit || serviceConfig.vocab.sizeUnit,
    contactPhone: liveSite?.contactPhone || liveSite?.phone || "",
    contactName: liveSite?.contactName || liveSite?.name || serviceConfig.vocab.customerRole,
    latitude: liveSite?.latitude || null,
    longitude: liveSite?.longitude || null,
    image: liveSite?.image ? { uri: liveSite.image } : require("../../../assets/images/image5.jpg"),
  };

  const handleStartSiteVisit = async () => {
    await AsyncStorage.setItem(
      "@active_task",
      JSON.stringify({
        id: "",
        facility: matchedEntity.name,
        address: matchedEntity.address,
        farmerId: matchedEntity.id,
        latitude: matchedEntity.latitude,
        longitude: matchedEntity.longitude,
      })
    );
    router.push({
      pathname: "/(employee)/visit/tracking",
      params: {
        farmerId: matchedEntity.id,
        siteName: matchedEntity.name,
        siteAddress: matchedEntity.address,
        lat: matchedEntity.latitude ? String(matchedEntity.latitude) : "",
        lng: matchedEntity.longitude ? String(matchedEntity.longitude) : "",
      },
    } as any);
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* TOP FULL-BLEED ROUNDED PHOTO CARD WITH OVERLAID PILL & VERIFIED TITLE (Reference Image 2 Left Panel) */}
        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
          <View
            style={{
              height: 410,
              borderRadius: 36,
              overflow: "hidden",
              backgroundColor: "#062214",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Image
              source={matchedEntity.image || require("../../../assets/images/image5.jpg")}
              style={[
                StyleSheet.absoluteFillObject,
                { width: "100%", height: "100%" },
              ]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(6, 34, 20, 0.35)",
                "rgba(6, 34, 20, 0.15)",
                "rgba(6, 34, 20, 0.92)",
              ]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Floating Top Header Buttons */}
            <SafeAreaView>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 18,
                  paddingTop: 10,
                }}
              >
                <LiquidGlassIconButton
                  variant="dark"
                  size={44}
                  onPress={() =>
                    router.canGoBack()
                      ? router.back()
                      : router.replace("/(employee)/my-sites")
                  }
                >
                  <ChevronLeft size={22} color="#ffffff" />
                </LiquidGlassIconButton>
                <LiquidGlassIconButton
                  variant="dark"
                  size={44}
                  onPress={() => router.push("/(employee)/reports")}
                >
                  <MoreVertical size={20} color="#ffffff" />
                </LiquidGlassIconButton>
              </View>
            </SafeAreaView>

            {/* Bottom Overlaid Tag Pill + Verified Facility Title */}
            <View
              style={{
                position: "absolute",
                bottom: 24,
                left: 22,
                right: 22,
              }}
            >
              <LiquidGlassCard
                variant="dark"
                borderRadius={999}
                style={{ alignSelf: "flex-start", marginBottom: 10 }}
                contentStyle={{ paddingHorizontal: 14, paddingVertical: 6 }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 12,
                  }}
                >
                  {matchedEntity.type} • {serviceConfig.badge}
                </Text>
              </LiquidGlassCard>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {matchedEntity.name}
                </Text>
                <LiquidGlassIconBadge
                  size={26}
                  borderRadius={13}
                  variant="dark"
                  tintColor={serviceConfig.themeColor}
                  style={{ marginLeft: 10 }}
                >
                  <ShieldCheck size={15} color="#ffffff" />
                </LiquidGlassIconBadge>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <MapPin size={14} color="rgba(255,255,255,0.75)" />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  {matchedEntity.address} • {matchedEntity.size} {matchedEntity.sizeUnit}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RADIO SELECTION CARDS + PRIMARY BLACK PILL CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <Text
            style={{
              color: "#475569",
              fontFamily: "Brandon-Bold",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Select {serviceConfig.name} Inspection Protocol
          </Text>

          {/* Option 1 with Floating Top-Left Badge */}
          <View style={{ position: "relative", marginBottom: 12 }}>
            <LiquidGlassCard
              variant="light"
              borderRadius={22}
              onPress={() => setSelectedService("audit")}
              style={{
                borderWidth: 1.5,
                borderColor:
                  selectedService === "audit"
                    ? serviceConfig.themeColor
                    : "transparent",
              }}
              contentStyle={{
                paddingHorizontal: 18,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor:
                      selectedService === "audit" ? serviceConfig.themeColor : "#94a3b8",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  {selectedService === "audit" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: serviceConfig.themeColor,
                      }}
                    />
                  )}
                </View>
                <View>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    Routine {serviceConfig.vocab.visit}
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                    }}
                  >
                    Geofence Check-In & OTP Sign-off
                  </Text>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  45 mins
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    textDecorationLine: "line-through",
                  }}
                >
                  90 mins
                </Text>
              </View>
            </LiquidGlassCard>

            {/* Floating Top-Left Pill Badge */}
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: -10,
                left: 18,
                zIndex: 10,
                backgroundColor: "#0f172a",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255, 255, 255, 0.35)",
              }}
            >
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 10,
                }}
              >
                +40 PTS
              </Text>
            </View>
          </View>

          {/* Option 2 */}
          <LiquidGlassCard
            variant="light"
            borderRadius={22}
            onPress={() => setSelectedService("full")}
            style={{
              marginBottom: 20,
              borderWidth: 1.5,
              borderColor:
                selectedService === "full"
                  ? serviceConfig.themeColor
                  : "transparent",
            }}
            contentStyle={{
              paddingHorizontal: 18,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor:
                    selectedService === "full" ? serviceConfig.themeColor : "#94a3b8",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {selectedService === "full" && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: serviceConfig.themeColor,
                    }}
                  />
                )}
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Full {serviceConfig.vocab.entitySingular} Overhaul
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Complete Quality & Inspection Audit
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
              }}
            >
              2.5 hrs
            </Text>
          </LiquidGlassCard>

          {/* Primary CTA Button */}
          <LiquidGlassButton
            variant="tinted"
            tintColor="rgba(15, 23, 42, 0.86)"
            dropletColor="#4ade80"
            onPress={handleStartSiteVisit}
            style={{ marginBottom: 14 }}
            contentStyle={{ paddingVertical: 18 }}
          >
            <Calendar size={18} color="#4ade80" style={{ marginRight: 10 }} />
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
              }}
            >
              {selectedService === "audit"
                ? `Start Routine ${serviceConfig.vocab.visit} • Check-In`
                : `Start Full ${serviceConfig.vocab.entitySingular} Overhaul`}
            </Text>
          </LiquidGlassButton>

          {/* Quick Contact Row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
            <LiquidGlassButton
              variant="light"
              onPress={() =>
                matchedEntity.contactPhone
                  ? Linking.openURL(`tel:${matchedEntity.contactPhone}`)
                  : Alert.alert("Contact unavailable", "No phone number is registered for this site.")
              }
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 13, paddingHorizontal: 12 }}
            >
              <Phone size={16} color="#0f172a" style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Call {serviceConfig.vocab.customerRole}
              </Text>
            </LiquidGlassButton>
            <LiquidGlassButton
              variant="light"
              onPress={() =>
                Alert.alert(
                  `${serviceConfig.vocab.entitySingular} Chat`,
                  `Connecting to ${matchedEntity.contactName} (${serviceConfig.vocab.customerRole})...`
                )
              }
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 13, paddingHorizontal: 12 }}
            >
              <MessageSquare
                size={16}
                color="#0f172a"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Direct Chat
              </Text>
            </LiquidGlassButton>
          </View>

          {/* RECENT VISIT REPORTS TIMELINE */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 20,
              }}
            >
              Visit History
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/reports")}>
              <Text
                style={{
                  color: "#15803d",
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <LiquidGlassCard
            variant="light"
            borderRadius={28}
            contentStyle={{ padding: 20 }}
          >
            {siteVisits.length === 0 ? (
              <Text
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Medium",
                  fontSize: 14,
                  textAlign: "center",
                  paddingVertical: 8,
                }}
              >
                No past visits recorded for this {serviceConfig.vocab.entitySingular.toLowerCase()} yet.
              </Text>
            ) : (
              siteVisits.map((v: any, idx: number) => {
                const isLast = idx === siteVisits.length - 1;
                return (
                  <View
                    key={v.id || idx}
                    style={{ flexDirection: "row", marginBottom: isLast ? 0 : 20 }}
                  >
                    <View style={{ alignItems: "center", marginRight: 16 }}>
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: idx === 0 ? "#10b981" : "#cbd5e1",
                          marginBottom: 4,
                        }}
                      />
                      {!isLast && (
                        <View
                          style={{ width: 2, flex: 1, backgroundColor: "rgba(15, 23, 42, 0.12)" }}
                        />
                      )}
                    </View>
                    <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "#0f172a",
                            fontFamily: "Brandon-Bold",
                            fontSize: 16,
                          }}
                        >
                          {v.type || serviceConfig.vocab.visit}
                        </Text>
                        <Text
                          style={{
                            color: "#94a3b8",
                            fontFamily: "Brandon-Medium",
                            fontSize: 12,
                          }}
                        >
                          {v.date || v.time || ""}
                        </Text>
                      </View>
                      <Text
                        style={{
                          color: "#64748b",
                          fontFamily: "Brandon-Medium",
                          fontSize: 14,
                          lineHeight: 20,
                        }}
                      >
                        {v.notes || `${v.status || "Completed"} visit recorded.`}
                      </Text>
                      <LiquidGlassPill
                        variant="light"
                        onPress={() => router.push(`/(employee)/report/${v.id}` as any)}
                        style={{ marginTop: 12, alignSelf: "flex-start" }}
                        contentStyle={{ paddingHorizontal: 14, paddingVertical: 7 }}
                      >
                        <FileText size={14} color="#15803d" />
                        <Text
                          style={{
                            color: "#15803d",
                            fontFamily: "Brandon-Bold",
                            fontSize: 12,
                            marginLeft: 6,
                          }}
                        >
                          Open Report
                        </Text>
                      </LiquidGlassPill>
                    </View>
                  </View>
                );
              })
            )}
          </LiquidGlassCard>

          {/* SITE MEDIA & DOCUMENTS: UPLOAD PHOTOS / VIDEOS & DOWNLOAD FILES */}
          <Text
            style={{
              color: "#0f172a",
              fontFamily: "Brandon-Bold",
              fontSize: 20,
              marginTop: 26,
              marginBottom: 12,
            }}
          >
            Site Photos, Videos & Files ({siteMedia.length})
          </Text>
          <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 18 }}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: siteMedia.length > 0 ? 14 : 0 }}>
              <LiquidGlassButton
                onPress={() => handleSiteUpload("image")}
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
                onPress={() => handleSiteUpload("video")}
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

            {siteMedia.length > 0 && (
              <View style={{ gap: 10 }}>
                {siteMedia.map((item) => (
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
                      onPress={() => void handleSiteDownload(item)}
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
        </View>
      </ScrollView>
    </LiquidGlassBackdrop>
  );
}
