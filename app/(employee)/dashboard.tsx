import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
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
  FileText,
} from "lucide-react-native";
import { useLanguage, LanguageTogglePill } from "../../context/LanguageContext";
import { useService, ServiceSelectorPill, ALL_SERVICE_KEYS } from "../../context/ServiceContext";
import { api, getAuthUser } from "../../services/api";

const SITE_CARD_IMAGES = [
  require("../../assets/images/image2.jpg"),
  require("../../assets/images/image5.jpg"),
  require("../../assets/images/image3.jpg"),
  require("../../assets/images/image11.jpg"),
  require("../../assets/images/image12.jpg"),
  require("../../assets/images/image15.jpg"),
];

const HERO_LOCAL_IMAGES: Record<string, any> = {
  real_estate: require("../../assets/images/image1.jpg"),
  facility_fmcg: require("../../assets/images/image2.jpg"),
  construction: require("../../assets/images/image3.jpg"),
  security: require("../../assets/images/image4.jpg"),
  cleaning: require("../../assets/images/image5.jpg"),
  maintenance: require("../../assets/images/image6.jpg"),
  solar: require("../../assets/images/image7.jpg"),
  pest_control: require("../../assets/images/image8.jpg"),
  logistics: require("../../assets/images/image10.jpg"),
};

export default function EmployeeDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const { serviceConfig, setService } = useService();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [userName, setUserName] = useState("Field Executive");
  const [employeeCode, setEmployeeCode] = useState("FO-902");
  const [apiSites, setApiSites] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const status = await AsyncStorage.getItem("isClockedIn");
      const name = await AsyncStorage.getItem("userName");
      const authUser = await getAuthUser();
      if (status === "true") setIsClockedIn(true);
      if (authUser?.name) setUserName(authUser.name);
      else if (name) setUserName(name);
      if (authUser?.employee_code) setEmployeeCode(authUser.employee_code);

      try {
        const dash = await api.get("/employee/dashboard");
        const emp = dash?.data?.employee;
        const att = dash?.data?.attendance;
        if (emp?.name) setUserName(emp.name);
        if (emp?.employee_code) setEmployeeCode(emp.employee_code);
        if (emp?.industry && ALL_SERVICE_KEYS.includes(emp.industry)) {
          await setService(emp.industry);
        }
        if (att && typeof att.checked_in === "boolean") {
          setIsClockedIn(att.checked_in && !att.checked_out);
          await AsyncStorage.setItem("isClockedIn", att.checked_in && !att.checked_out ? "true" : "false");
        }
      } catch {
        // Offline mode uses stored session state
      }
    })();
  }, []);

  useEffect(() => {
    api
      .get("/employee/sites")
      .then((res) => {
        const list = res?.data?.sites;
        if (Array.isArray(list)) {
          setApiSites(list);
        }
      })
      .catch(() => {
        // Fallback smoothly to serviceConfig.sampleEntities
      });
  }, [serviceConfig.key]);

  const projectSiteProfiles = React.useMemo(() => {
    const normalizedApi = apiSites.map((s: any, idx: number) => ({
      id: String(s.site_contact_id || s.id),
      code: s.site_code || s.code || `SITE-${String(idx + 1).padStart(3, "0")}`,
      name: s.name || "Project Site",
      type: s.type || serviceConfig.vocab.entitySingular,
      size: s.size || "2500",
      sizeUnit: s.sizeUnit || serviceConfig.vocab.sizeUnit,
      area: s.area || s.city || "Assigned Zone",
      city: s.city || "Chennai",
      contactName: s.contactName || s.phone || "Site Coordinator",
      status: s.status || "verified",
      image: s.image || SITE_CARD_IMAGES[idx % SITE_CARD_IMAGES.length],
    }));

    const seen = new Set(
      normalizedApi.map((item: any) => `${item.code}`.toLowerCase())
    );
    const catalogExtras = serviceConfig.sampleEntities.filter(
      (e) =>
        !seen.has(`${e.code}`.toLowerCase()) &&
        !normalizedApi.some(
          (a: any) => a.name.toLowerCase() === e.name.toLowerCase()
        )
    );

    return [...normalizedApi, ...catalogExtras];
  }, [apiSites, serviceConfig.sampleEntities, serviceConfig.vocab]);
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
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          {/* HERO BACKGROUND IMAGE WRAPPING HEADER + TRANSPARENT OFF-DUTY SECTION (AUTO HEIGHT, NO OVERLAP BELOW) */}
          <ImageBackground
            source={HERO_LOCAL_IMAGES[serviceConfig.key] || require("../../assets/images/image2.jpg")}
            resizeMode="cover"
            style={{
              width: "100%",
              overflow: "hidden",
              borderBottomLeftRadius: 44,
              borderBottomRightRadius: 44,
              backgroundColor: "#062214",
            }}
          >
            <LinearGradient
              colors={[
                "rgba(4, 24, 14, 0.50)",
                "rgba(6, 34, 20, 0.68)",
                "rgba(4, 18, 10, 0.96)",
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
                    }}
                  >
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.88)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 14,
                      }}
                    >
                      Today
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
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/notifications")}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: "rgba(0,0,0,0.36)",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.24)",
                  }}
                >
                  <Bell size={22} color="#ffffff" />
                  <View
                    style={{
                      position: "absolute",
                      top: 11,
                      right: 11,
                      width: 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: "#ef4444",
                    }}
                  />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 12 }}>
                <ServiceSelectorPill dark compact />
                <LanguageTogglePill />
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
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/performance")}
                  style={{
                    backgroundColor: "rgba(56, 189, 248, 0.24)",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: "#7dd3fc",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    {serviceConfig.kpis.points}
                  </Text>
                </TouchableOpacity>
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
                      {serviceConfig.kpis.efficiencyRate}
                    </Text>
                    <Text
                      style={{
                        color: "rgba(255, 255, 255, 0.88)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 14,
                        marginTop: 2,
                      }}
                    >
                      Efficiency
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push(
                      isClockedIn
                        ? "/(employee)/attendance/clock-out"
                        : "/(employee)/attendance/clock-in"
                    )
                  }
                  style={{
                    backgroundColor: isClockedIn ? "#ef4444" : serviceConfig.themeColor,
                    paddingHorizontal: 30,
                    paddingVertical: 14,
                    borderRadius: 999,
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    marginBottom: 18,
                    shadowColor: isClockedIn ? "#ef4444" : serviceConfig.themeColor,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 6,
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
                    {isClockedIn ? "Clock Out" : "Clock In"}
                  </Text>
                  <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
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
                    {serviceConfig.kpis.primaryNumber}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {serviceConfig.kpis.primaryLabel}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/visit-history")}
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
                    {serviceConfig.kpis.secondaryNumber}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {serviceConfig.kpis.secondaryLabel}
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
                    {serviceConfig.sampleVisits.length}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                    }}
                  >
                    {serviceConfig.vocab.visits}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>

          <View style={{ paddingHorizontal: 22, paddingTop: 22 }}>
          {/* DUAL BENTO SUMMARY CARDS */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 26,
            }}
          >
            {/* Left Bento Card: Active Work Orders with Avatar Stack */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/tasks")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 30,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 14,
                elevation: 4,
                borderWidth: 1,
                borderColor: serviceConfig.borderTint,
              }}
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
                {serviceConfig.sampleTasks.length} Orders
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
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=project&q=80",
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=project&q=80",
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=project&q=80",
                ].map((uri, i) => (
                  <Image
                    key={i}
                    source={{ uri }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      marginLeft: i === 0 ? 0 : -10,
                    }}
                  />
                ))}
                <View
                  style={{
                    backgroundColor: serviceConfig.lightBg,
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
                {serviceConfig.sampleTasks[0]?.title || "SLA compliance on schedule"}
              </Text>
            </TouchableOpacity>

            {/* Right Bento Card: Assigned Facilities & Reports */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/my-sites")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 30,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.06,
                shadowRadius: 14,
                elevation: 4,
                borderWidth: 1,
                borderColor: "#e0f2fe",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: "#e0f2fe",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={28} color="#0284c7" />
                </View>
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
                  {serviceConfig.kpis.primaryNumber} {serviceConfig.vocab.entities}
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
                      color: "#475569",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    📋 {serviceConfig.kpis.secondaryNumber}
                  </Text>
                  <Text
                    style={{
                      color: serviceConfig.themeColor,
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    ✓ {serviceConfig.kpis.efficiencyRate} SLA
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

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
                source={require("../../assets/images/image11.jpg")}
                style={{
                  position: "absolute",
                  right: -22,
                  bottom: -22,
                  width: 148,
                  height: 148,
                  borderRadius: 74,
                  opacity: 0.36,
                }}
                resizeMode="cover"
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
                  {serviceConfig.sampleTasks.length} assigned orders
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
                    right: -14,
                    bottom: -14,
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    opacity: 0.38,
                  }}
                  resizeMode="cover"
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
                  source={require("../../assets/images/image12.jpg")}
                  style={{
                    position: "absolute",
                    right: -14,
                    bottom: -14,
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    opacity: 0.38,
                  }}
                  resizeMode="cover"
                />
                <Text style={{ color: "#a5b4fc", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.8 }}>
                  FIELD PROOF
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 21, lineHeight: 25, marginTop: 2 }}>
                  {serviceConfig.vocab.report}s
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* QUICK SERVICE ACTIONS */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 30,
            }}
          >
            {serviceConfig.quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(action.route as any)}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff",
                  borderRadius: 26,
                  paddingVertical: 16,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.05,
                  shadowRadius: 12,
                  elevation: 4,
                  marginHorizontal: 4,
                }}
              >
                <View
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 27,
                    backgroundColor: action.bg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  {renderActionIcon(action.icon, action.color)}
                </View>
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
              </TouchableOpacity>
            ))}
          </View>

          {/* MY PROJECT SITES (ROUNDED IMAGE + SIMPLE OVERVIEW, VERTICAL PADDING) */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 6,
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
                paddingVertical: 18,
              }}
              style={{ marginHorizontal: -22 }}
            >
              {projectSiteProfiles.map((entity: any, idx: number) => {
                const imgSource =
                  typeof entity.image === "string"
                    ? { uri: entity.image }
                    : entity.image || SITE_CARD_IMAGES[idx % SITE_CARD_IMAGES.length];

                return (
                  <TouchableOpacity
                    key={`${entity.id}-${idx}`}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push(`/(employee)/site/${entity.id}` as any)
                    }
                    style={{
                      width: 196,
                      backgroundColor: "#ffffff",
                      borderRadius: 34,
                      paddingVertical: 20,
                      paddingHorizontal: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: "#e2e8f0",
                      shadowColor: "#0f172a",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.09,
                      shadowRadius: 16,
                      elevation: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 144,
                        height: 144,
                        borderRadius: 44,
                        borderWidth: 3.5,
                        borderColor: serviceConfig.themeColor,
                        overflow: "hidden",
                        marginBottom: 14,
                        backgroundColor: "#f1f5f9",
                      }}
                    >
                      <Image
                        source={imgSource}
                        style={{ width: "100%", height: "100%" }}
                        resizeMode="cover"
                      />
                    </View>
                    <Text
                      numberOfLines={2}
                      style={{
                        color: "#0f172a",
                        fontFamily: "Brandon-Bold",
                        fontSize: 19,
                        lineHeight: 23,
                        textAlign: "center",
                      }}
                    >
                      {entity.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 6,
                      }}
                    >
                      <MapPin size={14} color={serviceConfig.themeColor} style={{ marginRight: 4 }} />
                      <Text
                        numberOfLines={1}
                        style={{
                          color: "#64748b",
                          fontFamily: "Brandon-Bold",
                          fontSize: 14,
                          textAlign: "center",
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
                img: require("../../assets/images/image14.jpg"),
                route: "/(employee)/attendance-hub",
              },
              {
                tag: serviceConfig.shortName.toUpperCase(),
                title: `My ${serviceConfig.vocab.entities}`,
                sub: `Open all ${projectSiteProfiles.length} site profiles`,
                bg: "#ea580c",
                img: require("../../assets/images/image15.jpg"),
                route: "/(employee)/my-sites",
              },
              {
                tag: "CHECKED OUT",
                title: "Visit Logs & Proof",
                sub: `All ${serviceConfig.vocab.visits.toLowerCase()} & notes`,
                bg: "#7c3aed",
                img: require("../../assets/images/image16.jpg"),
                route: "/(employee)/visit-history",
              },
              {
                tag: "PERFORMANCE",
                title: "My Score & SLA",
                sub: `${serviceConfig.kpis.efficiencyRate} • ${serviceConfig.kpis.points}`,
                bg: "#0369a1",
                img: require("../../assets/images/image17.jpg"),
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
                    right: -18,
                    bottom: -18,
                    width: 146,
                    height: 146,
                    borderRadius: 73,
                    opacity: 0.38,
                  }}
                  resizeMode="cover"
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

          {/* TODAY'S SERVICE VISITS */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 25,
              }}
            >
              Today&apos;s {serviceConfig.vocab.visits}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/map")}>
              <Text
                style={{
                  color: serviceConfig.themeColor,
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                  textTransform: "uppercase",
                }}
              >
                Open Live Map
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16, marginBottom: 28 }}>
            {serviceConfig.sampleVisits.slice(0, 2).map((visit, vIdx) => (
              <TouchableOpacity
                key={visit.id}
                onPress={() => router.push(`/(employee)/visit/${visit.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 26,
                  padding: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 3,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                }}
              >
                <Image
                  source={visit.image || SITE_CARD_IMAGES[vIdx % SITE_CARD_IMAGES.length]}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 20,
                    marginRight: 14,
                  }}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 19,
                      lineHeight: 23,
                      marginBottom: 4,
                    }}
                    numberOfLines={2}
                  >
                    {visit.site}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 14,
                    }}
                  >
                    {visit.time} • {visit.type}
                  </Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      backgroundColor:
                        visit.status === "Completed"
                          ? "#dcfce7"
                          : visit.status === "In Progress"
                          ? "#fef3c7"
                          : "#f1f5f9",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          visit.status === "Completed"
                            ? "#15803d"
                            : visit.status === "In Progress"
                            ? "#b45309"
                            : "#475569",
                        fontFamily: "Brandon-Bold",
                        fontSize: 12,
                      }}
                    >
                      {visit.status}
                    </Text>
                  </View>
                  <ArrowRight size={18} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* COMPACT SOS SAFETY BAR */}
          <TouchableOpacity
            onPress={() => router.push("/(employee)/sos")}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#fef2f2",
              borderRadius: 24,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: "#fee2e2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertOctagon size={26} color="#dc2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#991b1b", fontFamily: "Brandon-Bold", fontSize: 19 }}>
                  Field Emergency SOS
                </Text>
                <Text style={{ color: "#b91c1c", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 2 }}>
                  Alert admin with live GPS coordinates
                </Text>
              </View>
            </View>
            <ArrowRight size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
