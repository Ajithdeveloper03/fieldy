import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  ClipboardCheck,
  Users,
  ShieldCheck,
  ArrowRight,
  AlertOctagon,
  Sparkles,
  MoreVertical,
  MapPin,
  Fingerprint,
  Calendar,
  Clock,
  FileText,
} from "lucide-react-native";
import { LanguageTogglePill, useLanguage } from "../../context/LanguageContext";
import { useService, ServiceSelectorPill, ALL_SERVICE_KEYS } from "../../context/ServiceContext";
import { api, getAuthUser } from "../../services/api";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import { FirstTimeTutorialModal } from "../../components/FirstTimeTutorialModal";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

const DEFAULT_SITE_IMAGE = require("../../assets/images/default-site.jpg");

const HERO_LOCAL_IMAGES: Record<string, any> = {
  real_estate: require("../../assets/images/default-site.jpg"),
  facility_fmcg: require("../../assets/images/default-site.jpg"),
  construction: require("../../assets/images/employee1.jpg"),
  security: require("../../assets/images/default-site.jpg"),
  cleaning: require("../../assets/images/default-site.jpg"),
  maintenance: require("../../assets/images/default-site.jpg"),
  solar: require("../../assets/images/default-site.jpg"),
  pest_control: require("../../assets/images/default-site.jpg"),
  logistics: require("../../assets/images/default-site.jpg"),
};

function getInitials(name: string): string {
  const parts = (name || "FE").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0] || "FE").slice(0, 2).toUpperCase();
}

export default function EmployeeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { serviceConfig, setService } = useService();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [userName, setUserName] = useState("Field Executive");
  const [employeeCode, setEmployeeCode] = useState("EMP");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [apiSites, setApiSites] = useState<any[]>([]);
  const [serverTasks, setServerTasks] = useState<any[]>([]);
  const [serverVisits, setServerVisits] = useState<any[]>([]);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const loadDashboard = useCallback(async () => {
    const status = await AsyncStorage.getItem("isClockedIn");
    const name = await AsyncStorage.getItem("userName");
    const authUser = await getAuthUser();
    if (status === "true") setIsClockedIn(true);
    if (authUser?.name) setUserName(authUser.name);
    else if (name) setUserName(name);
    if (authUser?.employee_code) setEmployeeCode(authUser.employee_code);
    if (authUser?.avatar_url) setAvatarUrl(authUser.avatar_url);

    try {
      const [dash, tasksRes, visitsRes, sitesRes] = await Promise.all([
        api.get("/employee/dashboard").catch(() => null),
        api.get("/employee/tasks").catch(() => null),
        api.get("/employee/visits").catch(() => null),
        api.get("/employee/sites").catch(() => null),
      ]);
      const payload = dash?.data ?? dash;
      const emp = payload?.employee;
      const att = payload?.attendance;
      const stats = payload?.stats;
      if (emp?.name) setUserName(emp.name);
      if (emp?.employee_code) setEmployeeCode(emp.employee_code);
      if (emp) {
        const serverPhoto = emp.avatar_url || emp.photo_url || null;
        setAvatarLoadError(false);
        setAvatarUrl(serverPhoto);
        if (serverPhoto) {
          await AsyncStorage.setItem("@user_avatar_uri", serverPhoto);
        } else {
          await AsyncStorage.removeItem("@user_avatar_uri");
        }
        if (authUser) {
          await AsyncStorage.setItem(
            "@auth_user",
            JSON.stringify({
              ...authUser,
              name: emp.name || authUser.name,
              phone: emp.phone || authUser.phone,
              email: emp.email ?? authUser.email,
              employee_code: emp.employee_code || authUser.employee_code,
              designation: emp.designation ?? authUser.designation,
              region: emp.assigned_region ?? emp.region ?? authUser.region,
              company_name: emp.company_name ?? authUser.company_name,
              avatar_url: serverPhoto,
            })
          );
        }
      }
      if (emp?.industry && ALL_SERVICE_KEYS.includes(emp.industry)) {
        await setService(emp.industry);
      }
      if (att && typeof att.checked_in === "boolean") {
        const clockedIn = att.checked_in && !att.checked_out;
        setIsClockedIn(clockedIn);
        await AsyncStorage.setItem("isClockedIn", clockedIn ? "true" : "false");
      }
      if (stats) {
        if (typeof stats.points_earned === "number") setPointsEarned(stats.points_earned);
        const resolvedScore = Number(stats.score ?? stats.efficiency_score ?? stats.task_completion_rate ?? 0);
        if (!Number.isNaN(resolvedScore)) setEfficiencyScore(resolvedScore);
      }

      const tList = Array.isArray(tasksRes?.tasks)
        ? tasksRes.tasks
        : Array.isArray(tasksRes?.data?.tasks)
          ? tasksRes.data.tasks
          : Array.isArray(tasksRes?.data)
            ? tasksRes.data
            : Array.isArray(tasksRes)
              ? tasksRes
              : [];
      const vList = Array.isArray(visitsRes?.visits)
        ? visitsRes.visits
        : Array.isArray(visitsRes?.data?.visits)
          ? visitsRes.data.visits
          : Array.isArray(visitsRes?.data)
            ? visitsRes.data
            : Array.isArray(visitsRes)
              ? visitsRes
              : [];
      const sList = Array.isArray(sitesRes?.sites)
        ? sitesRes.sites
        : Array.isArray(sitesRes?.data?.sites)
          ? sitesRes.data.sites
          : Array.isArray(sitesRes?.data)
            ? sitesRes.data
            : Array.isArray(sitesRes)
              ? sitesRes
              : [];
      setServerTasks(tList);
      setServerVisits(vList);
      setApiSites(sList);
    } catch {
      // Offline mode uses stored session state
    }
  }, [setService]);

  useLiveRefresh(loadDashboard, 10000);

  const projectSiteProfiles = React.useMemo(() => {
    return apiSites.map((s: any, idx: number) => ({
      id: String(s.site_contact_id || s.id),
      code: s.site_code || s.code || `SITE-${String(idx + 1).padStart(3, "0")}`,
      name: s.name || "Project Site",
      type: s.type || serviceConfig.vocab.entitySingular,
      size: s.size || "",
      sizeUnit: s.sizeUnit || serviceConfig.vocab.sizeUnit,
      area: s.area || s.city || "Assigned Zone",
      city: s.city || "Assigned Sector",
      contactName: s.contactName || s.phone || "Site Coordinator",
      status: s.status || "verified",
      image: s.image || s.photo_url || DEFAULT_SITE_IMAGE,
    }));
  }, [apiSites, serviceConfig.vocab]);
  const renderActionIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case "ClipboardCheck": return <ClipboardCheck size={24} color={color} />;
      case "Users": return <Users size={24} color={color} />;
      case "AlertOctagon": return <AlertOctagon size={24} color={color} />;
      case "Fingerprint": return <Fingerprint size={24} color={color} />;
      case "Calendar": return <Calendar size={24} color={color} />;
      case "Bell": return <Bell size={24} color={color} />;
      case "FileText": return <FileText size={24} color={color} />;
      default: return <ClipboardCheck size={24} color={color} />;
    }
  };
  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        {showStickyHeader && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              backgroundColor: "#ffffff",
              paddingTop: insets.top + 6,
              paddingBottom: 10,
              paddingHorizontal: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottomWidth: 1,
              borderBottomColor: "#e2e8f0",
              elevation: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 16,
                  flexShrink: 1,
                }}
              >
                {userName}
              </Text>
              <ServiceSelectorPill compact />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <LanguageTogglePill />
              <TouchableOpacity
                onPress={() => router.push("/(employee)/notifications")}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "#f1f5f9",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (y > 180 && !showStickyHeader) setShowStickyHeader(true);
            else if (y <= 180 && showStickyHeader) setShowStickyHeader(false);
          }}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* HERO BACKGROUND IMAGE WRAPPING HEADER + TRANSPARENT OFF-DUTY SECTION (View + Image + Dark Black Overlay) */}
          <View
            style={{
              width: "100%",
              overflow: "hidden",
              borderBottomLeftRadius: 44,
              borderBottomRightRadius: 44,
              backgroundColor: "#000000",
            }}
          >
            <Image
              source={HERO_LOCAL_IMAGES[serviceConfig.key] || require("../../assets/images/employee1.jpg")}
              resizeMode="cover"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: undefined,
                height: undefined,
                opacity: 0.62,
              }}
            />
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: "rgba(0, 0, 0, 0.28)", zIndex: 1 },
              ]}
            />
            <LinearGradient
              colors={[
                "rgba(0, 0, 0, 0.40)",
                "rgba(0, 0, 0, 0.62)",
                "rgba(0, 0, 0, 0.52)",
              ]}
              locations={[0, 0.45, 1]}
              style={[StyleSheet.absoluteFillObject, { zIndex: 1 }]}
              pointerEvents="none"
            />

            {/* HEADER */}
            <View
              style={{
                zIndex: 2,
                paddingHorizontal: 20,
                paddingTop: insets.top + 10,
                paddingBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
                  <TouchableOpacity
                    onPress={() => router.push("/(employee)/profile")}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 29,
                      borderWidth: 2.5,
                      borderColor: "#4ade80",
                      overflow: "hidden",
                      marginRight: 12,
                      flexShrink: 0,
                      backgroundColor: "#0f766e",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {avatarUrl && !avatarLoadError ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        onError={() => setAvatarLoadError(true)}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>
                        {getInitials(userName)}
                      </Text>
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.88)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 14,
                      }}
                    >
                      {t("today", "Today")}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          color: "#ffffff",
                          fontFamily: "Brandon-Bold",
                          fontSize: 24,
                          flexShrink: 1,
                        }}
                      >
                        {userName}
                      </Text>
                      <ShieldCheck
                        size={18}
                        color="#4ade80"
                        style={{ marginLeft: 6 }}
                      />
                      <View
                        style={{
                          backgroundColor: "rgba(74, 222, 128, 0.24)",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 10,
                          marginLeft: 6,
                          flexShrink: 0,
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "#4ade80",
                            fontFamily: "Brandon-Bold",
                            fontSize: 12,
                            letterSpacing: 0.8,
                          }}
                        >
                          {employeeCode}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <LiquidGlassIconButton
                  onPress={() => router.push("/(employee)/notifications")}
                  size={46}
                  variant="dark"
                  style={{ flexShrink: 0 }}
                >
                  <Bell size={22} color="#ffffff" />
                  <View
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: "#ef4444",
                    }}
                  />
                </LiquidGlassIconButton>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 12 }}>
                <ServiceSelectorPill dark compact />
                <LanguageTogglePill dark />
              </View>
            </View>

            {/* TRANSPARENT OFF-DUTY & TELEMETRY OVER BOTTOM OVERLAY */}
            <View style={{ zIndex: 2, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: 6,
                      backgroundColor: isClockedIn ? "#4ade80" : "#f87171",
                      marginRight: 8,
                    }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                      letterSpacing: 0.6,
                    }}
                  >
                    {isClockedIn ? "On Duty" : "Off Duty"}
                  </Text>
                </View>
                <LiquidGlassButton
                  onPress={() => router.push("/(employee)/performance")}
                  variant="tinted"
                  tintColor="rgba(37, 99, 235, 0.42)"
                  contentStyle={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    {pointsEarned} Pts
                  </Text>
                </LiquidGlassButton>
              </View>

              <View style={{ alignItems: "center", marginVertical: 4 }}>
                <View
                  style={{
                    width: 244,
                    height: 126,
                    overflow: "hidden",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 244,
                      height: 244,
                      borderRadius: 122,
                      borderWidth: 11,
                      borderColor: "rgba(255, 255, 255, 0.18)",
                      borderTopColor: serviceConfig.accentColor,
                      borderLeftColor: serviceConfig.accentColor,
                      borderRightColor: serviceConfig.themeColor,
                      transform: [{ rotate: "-15deg" }],
                    }}
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 4,
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 48,
                        lineHeight: 54,
                      }}
                    >
                      {efficiencyScore}%
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.88)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 14,
                        marginTop: 2,
                      }}
                    >
                      {t("efficiency", "Work Score")}
                    </Text>
                  </View>
                </View>

                <LiquidGlassButton
                  onPress={() => router.push("/(employee)/tasks")}
                  variant="tinted"
                  tintColor="rgba(13, 148, 136, 0.74)"
                  style={{
                    marginTop: 12,
                    marginBottom: 18,
                  }}
                  contentStyle={{
                    paddingHorizontal: 30,
                    paddingVertical: 14,
                  }}
                >
                  <Sparkles size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 17,
                    }}
                  >
                    {t("viewTasks", "View My Tasks")}
                  </Text>
                  <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </LiquidGlassButton>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  paddingTop: 14,
                  borderTopWidth: 1,
                  borderTopColor: "rgba(255, 255, 255, 0.18)",
                }}
              >
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/my-sites")}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    borderRightWidth: 1,
                    borderRightColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 24,
                    }}
                  >
                    {projectSiteProfiles.length}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {t("sites", serviceConfig.vocab.entities)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/tasks")}
                  style={{
                    flex: 1,
                    alignItems: "center",
                    borderRightWidth: 1,
                    borderRightColor: "rgba(255,255,255,0.18)",
                  }}
                >
                  <Text
                    style={{
                      color: "#4ade80",
                      fontFamily: "Brandon-Bold",
                      fontSize: 24,
                    }}
                  >
                    {serverTasks.length}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {t("tasks", serviceConfig.vocab.tasks)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/visits")}
                  style={{ flex: 1, alignItems: "center" }}
                >
                  <Text
                    style={{
                      color: "#fbbf24",
                      fontFamily: "Brandon-Bold",
                      fontSize: 24,
                    }}
                  >
                    {serverVisits.length}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {t("visits", serviceConfig.vocab.visits)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
            {/* DUAL BENTO SUMMARY CARDS (Plain Colorless Apple Liquid Glass) */}
            <View
              style={{
                flexDirection: "row",
                gap: 14,
                marginBottom: 26,
              }}
            >
              {/* Left Bento Card: Active Work Orders with Avatar Stack */}
              <LiquidGlassCard
                variant="light"
                borderRadius={30}
                onPress={() => router.push("/(employee)/tasks")}
                style={{ flex: 1 }}
                contentStyle={{ padding: 20 }}
              >
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Active {serviceConfig.vocab.tasks}
                </Text>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                    lineHeight: 34,
                    marginTop: 4,
                    marginBottom: 14,
                  }}
                >
                  {serverTasks.length} Orders
                </Text>

              {/* Avatar Stack + Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                {[
                  require("../../assets/images/person1.png"),
                  require("../../assets/images/person2.png"),
                  require("../../assets/images/person3.png"),
                ].map((imgSrc, i) => (
                  <Image
                    key={i}
                    source={imgSrc}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      backgroundColor: "#e2e8f0",
                      marginLeft: i === 0 ? 0 : -10,
                    }}
                    resizeMode="cover"
                  />
                ))}
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.72)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.96)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 999,
                      marginLeft: 6,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      style={{
                        color: serviceConfig.themeColor,
                        fontFamily: "Brandon-Bold",
                        fontSize: 12,
                      }}
                    >
                      +{projectSiteProfiles.length}
                    </Text>
                  </View>
                </View>

              <Text
                numberOfLines={2}
                style={{
                  color: "#475569",
                  fontFamily: "Brandon-Medium",
                  fontSize: 13,
                  lineHeight: 18,
                }}
              >
                {serverTasks[0]?.title || "All assigned orders on track"}
              </Text>
            </LiquidGlassCard>

            {/* Right Bento Card: Assigned Facilities & Reports */}
            {/* <LiquidGlassCard
              variant="light"
              borderRadius={30}
              onPress={() => router.push("/(employee)/my-sites")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 20, justifyContent: "space-between", flex: 1 }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <LiquidGlassIconBadge
                  size={56}
                  borderRadius={28}
                  variant="light"
                  tintColor="#0284c7"
                >
                  <Users size={28} color="#0284c7" />
                </LiquidGlassIconBadge>
                <MoreVertical size={20} color="#94a3b8" />
              </View>

              <View style={{ marginTop: 16 }}>
                <Text
                  numberOfLines={2}
                  style={{
                    color: "#475569",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    lineHeight: 18,
                  }}
                >
                  {serverTasks[0]?.title || "All assigned orders on track"}
                </Text>
              </View>
              </LiquidGlassCard> */}

              {/* Right Bento Card: Assigned Facilities & Reports */}
              <LiquidGlassCard
                variant="light"
                borderRadius={30}
                onPress={() => router.push("/(employee)/my-sites")}
                style={{ flex: 1 }}
                contentStyle={{ padding: 20, justifyContent: "space-between", flex: 1 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <LiquidGlassIconBadge
                    size={56}
                    borderRadius={28}
                    variant="light"
                    tintColor="#0284c7"
                  >
                    <Users size={28} color="#0284c7" />
                  </LiquidGlassIconBadge>
                  <MoreVertical size={20} color="#94a3b8" />
                </View>

                <View style={{ marginTop: 16 }}>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 27,
                      lineHeight: 32,
                    }}
                  >
                    {projectSiteProfiles.length} {t("sites", serviceConfig.vocab.entities)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{
                        color: "#059669",
                        fontFamily: "Brandon-Bold",
                        fontSize: 13,
                      }}
                    >
                       {efficiencyScore}% {t("efficiency", "Score")}
                    </Text>
                  </View>
                </View>
              </LiquidGlassCard>
            </View>

            {/* FULL-WIDTH DECORATIVE INFO / CTA BANNER (Reference Image 2) */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/tasks")}
              style={{ marginHorizontal: -22, marginBottom: 22 }}
            >
              <LinearGradient
                colors={["#1e1b4b", "#1d4ed8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingHorizontal: 22,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                    {serverTasks.length} {t("tasks", "Tasks")} • {projectSiteProfiles.length} {t("sites", "Sites")} Ready
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                    Live synced with Web Admin • Tap to open route
                  </Text>
                </View>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(250, 204, 21, 0.22)",
                    borderWidth: 1.5,
                    borderColor: "#facc15",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Sparkles size={20} color="#fde047" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* COLORFUL BENTO CARDS */}
            <View style={{ flexDirection: "row", gap: 14, marginBottom: 28, height: 256 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/(employee)/tasks")}
                style={{
                  flex: 1,
                  backgroundColor: "#065f46",
                  borderRadius: 28,
                  padding: 20,
                  overflow: "hidden",
                  justifyContent: "space-between",
                  elevation: 5,
                }}
              >
                <Image
                  source={require("../../assets/images/person1.png")}
                  style={{
                    position: "absolute",
                    right: -40,
                    bottom: -22,
                    width: 146,
                    height: 138,
                    opacity: 0.96,
                  }}
                  resizeMode="contain"
                />
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Sparkles size={16} color="#fde047" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#fde047", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 0.8 }}>
                      {serviceConfig.shortName.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, lineHeight: 29 }}>
                    Active {serviceConfig.vocab.tasks}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 6 }}>
                    {serverTasks.length} assigned orders
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginRight: 5 }}>
                    Start
                  </Text>
                  <ArrowRight size={16} color="#ffffff" />
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1, gap: 14 }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/(employee)/map")}
                  style={{
                    flex: 1,
                    backgroundColor: "#ea580c",
                    borderRadius: 26,
                    padding: 18,
                    overflow: "hidden",
                    justifyContent: "center",
                    elevation: 5,
                  }}
                >
                  <Image
                    source={require("../../assets/images/image13.jpg")}
                    style={{
                      position: "absolute",
                      right: -8,
                      bottom: -6,
                      width: 96,
                      height: 108,
                      opacity: 0,
                    }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "#fef08a", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.8 }}>
                    GPS TRACKING
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 21, lineHeight: 25, marginTop: 2 }}>
                    Live GPS Map
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => router.push("/(employee)/reports")}
                  style={{
                    flex: 1,
                    backgroundColor: "#3730a3",
                    borderRadius: 26,
                    padding: 18,
                    overflow: "hidden",
                    justifyContent: "center",
                    elevation: 5,
                  }}
                >
                  <Image
                    source={require("../../assets/images/person3.png")}
                    style={{
                      position: "absolute",
                      right: -8,
                      bottom: -12,
                      width: 68,
                      height: 76,
                      opacity: 0,
                    }}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "#a5b4fc", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.8 }}>
                    FIELD PROOF
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, lineHeight: 25, marginTop: 2 }}>
                    {serviceConfig.vocab.report}s
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* QUICK SERVICE ACTIONS (Plain Colorless Apple Liquid Glass Tiles) */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 30,
              }}
            >
              {serviceConfig.quickActions.map((action, idx) => (
                <LiquidGlassCard
                  key={idx}
                  variant="light"
                  borderRadius={26}
                  onPress={() => router.push(action.route as any)}
                  style={{ flex: 1, marginHorizontal: 4 }}
                  contentStyle={{
                    paddingVertical: 16,
                    paddingHorizontal: 8,
                    alignItems: "center",
                  }}
                >
                  <LiquidGlassIconBadge
                    size={54}
                    borderRadius={27}
                    variant="light"
                    tintColor={action.color}
                    style={{ marginBottom: 10 }}
                  >
                    {renderActionIcon(action.icon, action.color)}
                  </LiquidGlassIconBadge>
                  <Text
                    numberOfLines={2}
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                      textAlign: "center",
                      lineHeight: 16,
                    }}
                  >
                    {action.title}
                  </Text>
                </LiquidGlassCard>
              ))}
            </View>

            {/* MY PROJECT SITES (ROUNDED IMAGE + SIMPLE OVERVIEW, VERTICAL PADDING) */}
            <View style={{ marginBottom: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 2,
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 26,
                    lineHeight: 32,
                  }}
                >
                  My {serviceConfig.vocab.entities}
                </Text>
                <TouchableOpacity onPress={() => router.push("/(employee)/my-sites")}>
                  <Text
                    style={{
                      color: serviceConfig.themeColor,
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                      textTransform: "uppercase",
                    }}
                  >
                    View All
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 18,
                  paddingHorizontal: 22,
                  paddingVertical: 6,
                }}
                style={{ marginHorizontal: -22 }}
              >
                {projectSiteProfiles.map((entity: any, idx: number) => {
                  const cardImg =
                    typeof entity.image === "string"
                      ? { uri: entity.image }
                      : entity.image || DEFAULT_SITE_IMAGE;

                  return (
                    <TouchableOpacity
                      key={`${entity.id}-${idx}`}
                      activeOpacity={0.9}
                      onPress={() =>
                        router.push(`/(employee)/site/${entity.id}` as any)
                      }
                      style={{ width: 144 }}
                    >
                      <View
                        style={{
                          width: 144,
                          height: 144,
                          borderRadius: 22,
                          overflow: "hidden",
                          backgroundColor: "#e2e8f0",
                          marginBottom: 8,
                          elevation: 3,
                        }}
                      >
                        <Image
                          source={cardImg}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={["transparent", "rgba(0,0,0,0.78)"]}
                          style={{
                            position: "absolute",
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: 62,
                            justifyContent: "flex-end",
                            paddingHorizontal: 10,
                            paddingBottom: 8,
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            style={{
                              color: "#ffffff",
                              fontFamily: "Brandon-Bold",
                              fontSize: 13,
                              letterSpacing: 0.4,
                            }}
                          >
                            {entity.code || "SITE"}
                          </Text>
                        </LinearGradient>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={{
                          color: "#0f172a",
                          fontFamily: "Brandon-Bold",
                          fontSize: 15,
                          lineHeight: 20,
                        }}
                      >
                        {entity.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 2,
                        }}
                      >
                        <MapPin size={12} color={serviceConfig.themeColor} style={{ marginRight: 3 }} />
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "#64748b",
                            fontFamily: "Brandon-Medium",
                            fontSize: 12,
                            flexShrink: 1,
                          }}
                        >
                          {entity.area || entity.city}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* COLORFUL HORIZONTAL SLIDER (Maximalist cards placed below My Project Sites) */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 16, paddingHorizontal: 22, paddingVertical: 14 }}
              style={{ marginHorizontal: -22, marginBottom: 24 }}
            >
              {[
                {
                  tag: "START OF DAY",
                  title: "Attendance & Selfie",
                  sub: "Verify GPS clock-in now",
                  bg: "#0f766e",
                  img: require("../../assets/images/person6.png"),
                  route: "/(employee)/attendance-hub",
                },
                {
                  tag: serviceConfig.shortName.toUpperCase(),
                  title: `My ${serviceConfig.vocab.entities}`,
                  sub: `Open all ${projectSiteProfiles.length} site profiles`,
                  bg: "#ea580c",
                  img: require("../../assets/images/person4.png"),
                  route: "/(employee)/my-sites",
                },
                {
                  tag: "CHECKED OUT",
                  title: "Visit Logs & Proof",
                  sub: `All ${serviceConfig.vocab.visits.toLowerCase()} & notes`,
                  bg: "#7c3aed",
                  img: require("../../assets/images/person2.png"),
                  route: "/(employee)/visit-history",
                },
                {
                  tag: "PERFORMANCE",
                  title: "My Score & SLA",
                  sub: `${serviceConfig.kpis.efficiencyRate} â€¢ ${serviceConfig.kpis.points}`,
                  bg: "#0369a1",
                  img: require("../../assets/images/person7.png"),
                  route: "/(employee)/performance",
                },
              ].map((slide, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => router.push(slide.route as any)}
                  style={{
                    width: 328,
                    height: 196,
                    backgroundColor: slide.bg,
                    borderRadius: 30,
                    padding: 22,
                    overflow: "hidden",
                    justifyContent: "space-between",
                    shadowColor: "#0f172a",
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.14,
                    shadowRadius: 16,
                    elevation: 6,
                  }}
                >
                  <Image
                    source={slide.img}
                    style={{
                      position: "absolute",
                      right: -14,
                      bottom: -35,
                      width: 208,
                      height: 206,
                      opacity: 0.96,
                    }}
                    resizeMode="contain"
                  />
                  <View style={{ maxWidth: "78%" }}>
                    <Text style={{ color: "#fde047", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 0.9 }}>
                      {slide.tag}
                    </Text>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25, lineHeight: 30, marginTop: 4 }}>
                      {slide.title}
                    </Text>
                    <Text style={{ color: "rgba(255,255,255,0.9)", fontFamily: "Brandon-Medium", fontSize: 15, marginTop: 5 }}>
                      {slide.sub}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginRight: 6 }}>
                      Open
                    </Text>
                    <ArrowRight size={18} color="#ffffff" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* TODAY'S SERVICE VISITS (Clean Flat List) */}
            <View
              style={{
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 22,
                }}
              >
                Today&apos;s {serviceConfig.vocab.visits}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/map")}
                style={{ marginTop: 4 }}
              >
                <Text
                  style={{
                    color: serviceConfig.themeColor,
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                    textTransform: "uppercase",
                  }}
                >
                  {t("openLiveMap", "Open Live Map")}
                </Text>
              </TouchableOpacity>
            </View>

          <View style={{ marginBottom: 24 }}>
            {serverVisits.length > 0 ? (
              serverVisits.slice(0, 5).map((visit, vIdx) => (
                <TouchableOpacity
                  key={visit.id ?? vIdx}
                  activeOpacity={0.75}
                  onPress={() => router.push(`/(employee)/visit/${visit.id}` as any)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: "#e2e8f0",
                  }}
                >
                  <Image
                    source={DEFAULT_SITE_IMAGE}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      marginRight: 12,
                    }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text
                      style={{
                        color: "#0f172a",
                        fontFamily: "Brandon-Bold",
                        fontSize: 16,
                        lineHeight: 20,
                        marginBottom: 3,
                      }}
                      numberOfLines={1}
                    >
                      {visit.site?.name ?? visit.client_name ?? "Site Visit"}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={{
                        color: "#64748b",
                        fontFamily: "Brandon-Medium",
                        fontSize: 13,
                      }}
                    >
                      {visit.visit_date ?? "Today"} • {visit.purpose ?? serviceConfig.vocab.visitSingular}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View
                      style={{
                        backgroundColor:
                          visit.status === "completed"
                            ? "rgba(13, 148, 136, 0.14)"
                            : visit.status === "in_progress"
                            ? "rgba(217, 119, 6, 0.14)"
                            : "rgba(100, 116, 139, 0.12)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            visit.status === "completed"
                              ? "#0f766e"
                              : visit.status === "in_progress"
                                ? "#b45309"
                                : "#475569",
                          fontFamily: "Brandon-Bold",
                          fontSize: 11,
                        }}
                      >
                        {visit.status === "completed" ? "Completed" : visit.status === "in_progress" ? "In Progress" : "Scheduled"}
                      </Text>
                    </View>
                    <ArrowRight size={16} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View
                style={{
                  paddingVertical: 20,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderColor: "#e2e8f0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Clock size={22} color="#94a3b8" />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                    {t("noVisitsQueued", "No Visits Queued Today")}
                  </Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                    {t("noVisitsDesc", "All scheduled route visits have been completed or none assigned.")}
                  </Text>
                </View>
              </View>
            )}
          </View>

            {/* COMPACT SOS SAFETY BAR (Liquid Glass) */}
            <LiquidGlassCard
              variant="light"
              dropletColor="#EF4444"
              borderRadius={24}
              onPress={() => router.push("/(employee)/sos")}
              contentStyle={{
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
                <LiquidGlassIconBadge
                  size={52}
                  borderRadius={26}
                  variant="light"
                  tintColor="#DC2626"
                >
                  <AlertOctagon size={26} color="#dc2626" />
                </LiquidGlassIconBadge>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#991b1b", fontFamily: "Brandon-Bold", fontSize: 19 }}>
                    {t("emergencySos", "Field Emergency SOS")}
                  </Text>
                  <Text style={{ color: "#b91c1c", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 2 }}>
                    {t("emergencySosSub", "Alert admin with live GPS coordinates")}
                  </Text>
                </View>
              </View>
              <ArrowRight size={20} color="#dc2626" />
            </LiquidGlassCard>
          </View>
        </ScrollView>
        <FirstTimeTutorialModal />
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
