import React, { useState, useEffect } from "react";
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
  MapPin,
  UserPlus,
  CalendarDays,
  FileText,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Navigation,
  LogOut,
  Camera,
  History,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Boxes,
  AlertOctagon,
  Sparkles,
  MoreVertical,
} from "lucide-react-native";
import { useLanguage, LanguageTogglePill } from "../../context/LanguageContext";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
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
  const { serviceConfig } = useService();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [userName, setUserName] = useState("Field Officer");
  useEffect(() => {
    (async () => {
      const status = await AsyncStorage.getItem("isClockedIn");
      const name = await AsyncStorage.getItem("userName");
      if (status === "true") setIsClockedIn(true);
      if (name) setUserName(name);
    })();
  }, []);
  const renderActionIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case "ClipboardCheck": return <ClipboardCheck size={22} color={color} />;
      case "UserPlus": return <UserPlus size={22} color={color} />;
      case "Users": return <Users size={22} color={color} />;
      case "FileText": return <FileText size={22} color={color} />;
      case "Calendar": return <CalendarDays size={22} color={color} />;
      case "Boxes": return <Boxes size={22} color={color} />;
      case "History": return <History size={22} color={color} />;
      case "Navigation": return <Navigation size={22} color={color} />;
      case "AlertOctagon": return <AlertOctagon size={22} color={color} />;
      case "Receipt": return <Receipt size={22} color={color} />;
      default: return <ClipboardCheck size={22} color={color} />;
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }} edges={["left", "right"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 470,
              overflow: "hidden",
              borderBottomLeftRadius: 44,
              borderBottomRightRadius: 44,
              backgroundColor: "#062214",
            }}
          >
            <Image
              source={HERO_LOCAL_IMAGES[serviceConfig.key] || require("../../assets/images/image2.jpg")}
              style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(4, 24, 14, 0.85)",
                "rgba(6, 34, 20, 0.92)",
                "#062214",
              ]}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Soft Emerald Ambient Glow */}
            <View
              style={{
                position: "absolute",
                bottom: -60,
                left: "50%",
                marginLeft: -140,
                width: 280,
                height: 180,
                borderRadius: 140,
                backgroundColor: "rgba(16, 185, 129, 0.22)",
              }}
            />
          </View>
          {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 18,
            paddingTop: insets.top + 10,
            paddingBottom: 8,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/profile")}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: "#4ade80",
                overflow: "hidden",
                marginRight: 12,
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>
            <View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: "Brandon-Medium",
                  fontSize: 12,
                }}
              >
                Today
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 19,
                  }}
                >
                  {userName}
                </Text>
                <ShieldCheck
                  size={16}
                  color="#4ade80"
                  style={{ marginLeft: 6 }}
                />
                <View
                  style={{
                    backgroundColor: "rgba(74, 222, 128, 0.18)",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    marginLeft: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#4ade80",
                      fontFamily: "Brandon-Bold",
                      fontSize: 10,
                      letterSpacing: 0.8,
                    }}
                  >
                    FO-902
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ServiceSelectorPill dark compact />
            <LanguageTogglePill />
            <TouchableOpacity
              onPress={() => router.push("/(employee)/notifications")}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.12)",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 4,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Bell size={20} color="#ffffff" />
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#ef4444",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
          <View
            style={{
              backgroundColor: "rgba(6, 34, 20, 0.82)",
              borderRadius: 36,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.22)",
              marginBottom: 24,
            }}
          >
            {/* Top Status Row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.95)",
                }}
              >
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 5,
                    backgroundColor: isClockedIn ? "#16a34a" : "#dc2626",
                    marginRight: 7,
                  }}
                />
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 12,
                    letterSpacing: 0.6,
                  }}
                >
                  {isClockedIn ? "On Duty" : "Off Duty"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/performance")}
                style={{
                  backgroundColor: "rgba(56, 189, 248, 0.16)",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                }}
              >
                <Text
                  style={{
                    color: "#38bdf8",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                  }}
                >
                  {serviceConfig.kpis.points}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ alignItems: "center", marginVertical: 6 }}>
              <View
                style={{
                  width: 240,
                  height: 122,
                  overflow: "hidden",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: 120,
                    borderWidth: 10,
                    borderColor: "rgba(255, 255, 255, 0.12)",
                    borderTopColor: serviceConfig.accentColor,
                    borderLeftColor: serviceConfig.accentColor,
                    borderRightColor: serviceConfig.themeColor,
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 6,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 40,
                      lineHeight: 46,
                    }}
                  >
                    {serviceConfig.kpis.efficiencyRate}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.65)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
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
                  paddingHorizontal: 24,
                  paddingVertical: 11,
                  borderRadius: 999,
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  marginBottom: 16,
                  shadowColor: isClockedIn ? "#ef4444" : serviceConfig.themeColor,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                <Sparkles size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </Text>
                <ArrowRight size={15} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(0, 0, 0, 0.28)",
                borderRadius: 20,
                paddingVertical: 12,
                paddingHorizontal: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/(employee)/my-sites")}
                style={{
                  flex: 1,
                  alignItems: "center",
                  borderRightWidth: 1,
                  borderRightColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 18,
                  }}
                >
                  {serviceConfig.kpis.primaryNumber}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
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
                  borderRightColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 18,
                  }}
                >
                  {serviceConfig.kpis.secondaryNumber}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
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
                    fontSize: 18,
                  }}
                >
                  {serviceConfig.sampleVisits.length}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  {serviceConfig.vocab.visits}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DUAL BENTO SUMMARY CARDS */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {/* Left Bento Card: Active Work Orders with Avatar Stack */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/tasks")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 28,
                padding: 18,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.05,
                shadowRadius: 14,
                elevation: 4,
                borderWidth: 1,
                borderColor: serviceConfig.borderTint,
              }}
            >
              <Text
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Medium",
                  fontSize: 12,
                }}
              >
                Active {serviceConfig.vocab.tasks}
              </Text>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 22,
                  marginTop: 2,
                  marginBottom: 12,
                }}
              >
                {serviceConfig.sampleTasks.length} Orders
              </Text>

              {/* Avatar Stack + Badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
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
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: "#ffffff",
                      marginLeft: i === 0 ? 0 : -8,
                    }}
                  />
                ))}
                <View
                  style={{
                    backgroundColor: serviceConfig.lightBg,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 999,
                    marginLeft: 6,
                  }}
                >
                  <Text
                    style={{
                      color: serviceConfig.themeColor,
                      fontFamily: "Brandon-Bold",
                      fontSize: 10,
                    }}
                  >
                    +{serviceConfig.sampleEntities.length} {serviceConfig.vocab.entities}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Medium",
                  fontSize: 11,
                  lineHeight: 15,
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
                borderRadius: 28,
                padding: 18,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.05,
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
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#e0f2fe",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Users size={22} color="#0284c7" />
                </View>
                <MoreVertical size={18} color="#94a3b8" />
              </View>

              <View style={{ marginTop: 14 }}>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 22,
                  }}
                >
                  {serviceConfig.kpis.primaryNumber} {serviceConfig.vocab.entities}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                    }}
                  >
                    📋 {serviceConfig.kpis.secondaryNumber}
                  </Text>
                  <Text
                    style={{
                      color: serviceConfig.themeColor,
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                    }}
                  >
                    ✓ {serviceConfig.kpis.efficiencyRate} SLA
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* SWIGGY-STYLE COLORED BENTO CARDS WITH TRANSLUCENT IMAGES */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24, height: 176 }}>
            {/* Left Tall Card: AI Reports */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/report/select-method")}
              style={{
                flex: 1,
                backgroundColor: "#065f46",
                borderRadius: 24,
                padding: 16,
                overflow: "hidden",
                justifyContent: "space-between",
                elevation: 4,
              }}
            >
              <Image
                source={require("../../assets/images/image11.jpg")}
                style={{
                  position: "absolute",
                  right: -18,
                  bottom: -18,
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  opacity: 0.28,
                }}
                resizeMode="cover"
              />
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <Sparkles size={14} color="#fde047" style={{ marginRight: 5 }} />
                  <Text style={{ color: "#fde047", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                    AI REPORTS
                  </Text>
                </View>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, lineHeight: 22 }}>
                  New {serviceConfig.vocab.report}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>
                  Quick notes & photos
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12, marginRight: 4 }}>
                  Start
                </Text>
                <ArrowRight size={14} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Right Stacked Cards: Bonus + Live Map */}
            <View style={{ flex: 1, gap: 12 }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/(employee)/bonus-wallet" as any)}
                style={{
                  flex: 1,
                  backgroundColor: "#ea580c",
                  borderRadius: 22,
                  padding: 14,
                  overflow: "hidden",
                  justifyContent: "center",
                  elevation: 4,
                }}
              >
                <Image
                  source={require("../../assets/images/image12.jpg")}
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: -10,
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    opacity: 0.32,
                  }}
                  resizeMode="cover"
                />
                <Text style={{ color: "#fef08a", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                  REWARDS
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  Bonus Wallet
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push("/(employee)/map")}
                style={{
                  flex: 1,
                  backgroundColor: "#3730a3",
                  borderRadius: 22,
                  padding: 14,
                  overflow: "hidden",
                  justifyContent: "center",
                  elevation: 4,
                }}
              >
                <Image
                  source={require("../../assets/images/image13.jpg")}
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: -10,
                    width: 68,
                    height: 68,
                    borderRadius: 34,
                    opacity: 0.32,
                  }}
                  resizeMode="cover"
                />
                <Text style={{ color: "#a5b4fc", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                  GPS TRACKING
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                  Live Route Map
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SWIGGY-STYLE HORIZONTAL SLIDER WITH BIG CARDS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14, paddingRight: 12 }}
            style={{ marginBottom: 24 }}
          >
            {[
              {
                tag: "START OF DAY",
                title: "Attendance & Selfie",
                sub: "Mark GPS check-in now",
                bg: "#0f766e",
                img: require("../../assets/images/image14.jpg"),
                route: "/(employee)/attendance-hub",
              },
              {
                tag: "ASSIGNED WORK",
                title: `Today ${serviceConfig.vocab.tasks}`,
                sub: "View & start field visits",
                bg: "#ea580c",
                img: require("../../assets/images/image15.jpg"),
                route: "/(employee)/tasks",
              },
              {
                tag: "HISTORY",
                title: "Past Visit Logs",
                sub: "All saved reports & proof",
                bg: "#7c3aed",
                img: require("../../assets/images/image16.jpg"),
                route: "/(employee)/visit-history",
              },
              {
                tag: "CLAIMS",
                title: "Travel & Expenses",
                sub: "Submit fuel & meal bills",
                bg: "#0369a1",
                img: require("../../assets/images/image17.jpg"),
                route: "/(employee)/expenses",
              },
            ].map((slide, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.9}
                onPress={() => router.push(slide.route as any)}
                style={{
                  width: 272,
                  height: 128,
                  backgroundColor: slide.bg,
                  borderRadius: 24,
                  padding: 18,
                  overflow: "hidden",
                  justifyContent: "space-between",
                  elevation: 4,
                }}
              >
                <Image
                  source={slide.img}
                  style={{
                    position: "absolute",
                    right: -14,
                    bottom: -14,
                    width: 105,
                    height: 105,
                    borderRadius: 52,
                    opacity: 0.28,
                  }}
                  resizeMode="cover"
                />
                <View style={{ maxWidth: "74%" }}>
                  <Text style={{ color: "#fde047", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 0.8 }}>
                    {slide.tag}
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 2 }}>
                    {slide.title}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                    {slide.sub}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12, marginRight: 4 }}>
                    Open
                  </Text>
                  <ArrowRight size={14} color="#ffffff" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* QUICK ACTIONS ROW */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            {serviceConfig.quickActions.map((action, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(action.route as any)}
                style={{
                  flex: 1,
                  backgroundColor: "#ffffff",
                  borderRadius: 24,
                  padding: 14,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.04,
                  shadowRadius: 10,
                  elevation: 3,
                  marginHorizontal: 3,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: action.bg,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 8,
                  }}
                >
                  {renderActionIcon(action.icon, action.color)}
                </View>
                <Text
                  numberOfLines={2}
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                    textAlign: "center",
                    lineHeight: 14,
                  }}
                >
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SECONDARY FIELD TOOLKIT (Expenses, Inventory, Safety SOS) */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 28,
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(employee)/expenses")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 22,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "#dcfce7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Receipt size={18} color="#16a34a" />
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Claim Bills
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  Fuel & Meals
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(employee)/inventory")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 22,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  backgroundColor: "#e0f2fe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 10,
                }}
              >
                <Boxes size={18} color="#0284c7" />
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Boot Stock
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  Kit & Tools
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(employee)/sos")}
              style={{
                width: 54,
                height: 66,
                backgroundColor: "#fee2e2",
                borderRadius: 22,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <AlertOctagon size={22} color="#ef4444" />
              <Text
                style={{
                  color: "#ef4444",
                  fontFamily: "Brandon-Bold",
                  fontSize: 10,
                  marginTop: 4,
                }}
              >
                SOS
              </Text>
            </TouchableOpacity>
          </View>

          {/* ASSIGNED ENTITIES (Horizontal List) */}
          <View style={{ marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
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
                My {serviceConfig.vocab.entities}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/my-sites")}
              >
                <Text
                  style={{
                    color: serviceConfig.themeColor,
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
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
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {serviceConfig.sampleEntities.map((entity) => (
                <TouchableOpacity
                  key={entity.id}
                  onPress={() =>
                    router.push(`/(employee)/site/${entity.id}` as any)
                  }
                  style={{ alignItems: "center", marginRight: 16 }}
                >
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: serviceConfig.themeColor,
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={entity.image}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                      maxWidth: 80,
                      textAlign: "center",
                    }}
                  >
                    {entity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TODAY'S SERVICE VISITS / BEATS */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
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
              Today&apos;s {serviceConfig.vocab.visits}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/map")}>
              <Text
                style={{
                  color: serviceConfig.themeColor,
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                  textTransform: "uppercase",
                }}
              >
                View Map
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16, marginBottom: 28 }}>
            {serviceConfig.sampleVisits.slice(0, 2).map((visit) => (
              <TouchableOpacity
                key={visit.id}
                onPress={() => router.push(`/(employee)/visit/${visit.id}` as any)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 20,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: "#f1f5f9",
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {visit.site}
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
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
                      paddingHorizontal: 10,
                      paddingVertical: 5,
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
                        fontSize: 11,
                      }}
                    >
                      {visit.status}
                    </Text>
                  </View>
                  <ArrowRight size={16} color="#94a3b8" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* PERFORMANCE BANNER */}
          <TouchableOpacity
            onPress={() => router.push("/(employee)/performance")}
            style={{
              backgroundColor: "#062214",
              borderRadius: 28,
              padding: 22,
              marginBottom: 28,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "rgba(74, 222, 128, 0.3)",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 110,
                height: 110,
                borderRadius: 55,
                backgroundColor: "rgba(74, 222, 128, 0.12)",
              }}
            />
            <View>
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 11,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                AI POWER ANALYTICS
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 20,
                }}
              >
                My Score
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "Brandon-Medium",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {serviceConfig.kpis.efficiencyRate} Efficiency • {serviceConfig.kpis.points} Pts
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#4ade80",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ArrowRight size={20} color="#062214" />
            </View>
          </TouchableOpacity>

          {/* MANAGEMENT TOOLS GRID */}
          <Text
            style={{
              color: "#0f172a",
              fontFamily: "Brandon-Bold",
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Quick Tools
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                title: "Work Orders",
                icon: ClipboardCheck,
                color: "#8b5cf6",
                route: "/(employee)/tasks",
              },
              {
                title: "Shift Calendar",
                icon: CalendarDays,
                color: "#ec4899",
                route: "/(employee)/calendar",
              },
              {
                title: "Daily Attendance",
                icon: CheckCircle2,
                color: "#10b981",
                route: "/(employee)/attendance-hub",
              },
              {
                title: "Sites & Clients",
                icon: Users,
                color: "#3b82f6",
                route: "/(employee)/my-sites",
              },
              {
                title: "Onboard Site",
                icon: UserPlus,
                color: "#f59e0b",
                route: "/(employee)/register-site/step1",
              },
              {
                title: "Service Route",
                icon: MapPin,
                color: "#0ea5e9",
                route: "/(employee)/visits",
              },
              {
                title: "Past History",
                icon: History,
                color: "#64748b",
                route: "/(employee)/visit-history",
              },
              {
                title: "View Reports",
                icon: FileText,
                color: "#14b8a6",
                route: "/(employee)/reports",
              },
            ].map((tool, index) => (
              <TouchableOpacity
                onPress={() => router.push(tool.route as any)}
                key={index}
                style={{
                  width: "48%",
                  backgroundColor: "#ffffff",
                  borderRadius: 22,
                  padding: 16,
                  marginBottom: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${tool.color}15`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <tool.icon size={20} color={tool.color} />
                </View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                    flex: 1,
                  }}
                >
                  {tool.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
