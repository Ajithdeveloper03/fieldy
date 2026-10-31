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
import { SafeAreaView } from "react-native-safe-area-context";
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

export default function EmployeeDashboardScreen() {
  const { t, language } = useLanguage();
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

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      {/* AMBIENT HEADER BACKGROUND (View + Absolute Image) */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 390,
          overflow: "hidden",
          borderBottomLeftRadius: 44,
          borderBottomRightRadius: 44,
          backgroundColor: "#062214",
        }}
      >
        <Image
          source={require("../../assets/images/image3.jpg")}
          style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            "rgba(6, 34, 20, 0.88)",
            "rgba(15, 23, 42, 0.82)",
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

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 8,
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
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
                Welcome back! • 29 Oct, 2026
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

          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
                marginLeft: 8,
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 22,
            paddingBottom: 130,
            paddingTop: 14,
          }}
        >
          {/* HERO GAUGE & DUTY STATUS BOARD (Inspired by Reference Screens 4 & 5) */}
          <View
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: 36,
              padding: 22,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.14)",
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
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: isClockedIn ? "#4ade80" : "#f87171",
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                    letterSpacing: 1,
                  }}
                >
                  {isClockedIn ? "ON DUTY • GPS ACTIVE" : "OFF DUTY • STANDBY"}
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
                  480 PTS • SLA
                </Text>
              </TouchableOpacity>
            </View>

            {/* Semi-Circular Arc Gauge Dial (Reference Image 4 & 5) */}
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
                    borderTopColor: "#4ade80",
                    borderLeftColor: "#4ade80",
                    borderRightColor: "#10b981",
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
                      fontSize: 44,
                      lineHeight: 48,
                    }}
                  >
                    86%
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.65)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Daily Efficiency & Route Quota
                  </Text>
                </View>
              </View>

              {/* Black/Emerald Pill Action Button inside Dial (Reference Image 4 "Start Learning >") */}
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
                  backgroundColor: isClockedIn ? "#ef4444" : "#10b981",
                  paddingHorizontal: 24,
                  paddingVertical: 11,
                  borderRadius: 999,
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  marginBottom: 16,
                  shadowColor: isClockedIn ? "#ef4444" : "#10b981",
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
                  {isClockedIn ? "End Shift • Clock Out" : "Start Shift • Clock In"}
                </Text>
                <ArrowRight size={15} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>

            {/* 3 Metric Stats Strip */}
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
                onPress={() => router.push("/(employee)/my-farmers")}
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
                  12
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  Assigned
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
                  4
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  Visited
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
                  8
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                  }}
                >
                  Pending
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DUAL BENTO SUMMARY CARDS (Reference Screen 4: "128 Notes" + "12 Folders") */}
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
                borderColor: "#dcfce7",
              }}
            >
              <Text
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Medium",
                  fontSize: 12,
                }}
              >
                Active SLA Queue
              </Text>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 24,
                  marginTop: 2,
                  marginBottom: 12,
                }}
              >
                14 Orders
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
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=80",
                  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&auto=format&fit=crop&q=80",
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
                    backgroundColor: "#dcfce7",
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 999,
                    marginLeft: 6,
                  }}
                >
                  <Text
                    style={{
                      color: "#15803d",
                      fontFamily: "Brandon-Bold",
                      fontSize: 10,
                    }}
                  >
                    +11 Sites
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
                2 Urgent HVAC & Fire Audits due today
              </Text>
            </TouchableOpacity>

            {/* Right Bento Card: Assigned Facilities & Reports */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/my-farmers")}
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
                  12 Facilities
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
                    📋 112 Audits
                  </Text>
                  <Text
                    style={{
                      color: "#16a34a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                    }}
                  >
                    ✓ 98% SLA
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* AI SMART DIAGNOSTIC BANNER (Reference Screen 4: "Transform educational videos...") */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(employee)/report/select-method")}
            style={{
              marginBottom: 24,
              borderRadius: 26,
              overflow: "hidden",
              shadowColor: "#10b981",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <LinearGradient
              colors={["#ecfdf5", "#e0f2fe", "#fefce8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 20,
                borderRadius: 26,
                borderWidth: 1,
                borderColor: "#d1fae5",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Sparkles size={15} color="#059669" style={{ marginRight: 6 }} />
                  <Text
                    style={{
                      color: "#059669",
                      fontFamily: "Brandon-Bold",
                      fontSize: 12,
                      letterSpacing: 0.5,
                    }}
                  >
                    Fieldy AI Field Assistant
                  </Text>
                </View>
                <ArrowRight size={16} color="#0f172a" />
              </View>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Medium",
                  fontSize: 15,
                  lineHeight: 22,
                }}
              >
                Transform site photos & drone scans into{" "}
                <Text style={{ fontFamily: "Brandon-Bold" }}>
                  verified SLA audit reports
                </Text>{" "}
                instantly.
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* QUICK ACTIONS ROW */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(employee)/tasks")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 3,
                marginRight: 6,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#ede9fe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <ClipboardCheck size={22} color="#7c3aed" />
              </View>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Work{"\n"}Orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(employee)/register-farmer/step1")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 3,
                marginHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#e0f2fe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <UserPlus size={22} color="#0284c7" />
              </View>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Onboard{"\n"}Client
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(employee)/my-farmers")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 3,
                marginHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#dcfce7",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <Users size={22} color="#16a34a" />
              </View>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                My Sites{"\n"}& Clients
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(employee)/report/select-method")}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 24,
                padding: 16,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
                elevation: 3,
                marginLeft: 6,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#fef08a",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                <FileText size={22} color="#ca8a04" />
              </View>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Service{"\n"}Report
              </Text>
            </TouchableOpacity>
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

          {/* ASSIGNED FACILITIES (Horizontal List) */}
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
                Assigned Facilities
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/my-farmers")}
              >
                <Text
                  style={{
                    color: "#15803d",
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
              {[
                {
                  id: "1",
                  name: "Metro Tower",
                  img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "2",
                  name: "Apex Logistics",
                  img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "3",
                  name: "Grand Mall",
                  img: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=150&auto=format&fit=crop&q=80",
                },
                {
                  id: "4",
                  name: "Horizon Hub",
                  img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80",
                },
              ].map((facility) => (
                <TouchableOpacity
                  key={facility.id}
                  onPress={() =>
                    router.push(`/(employee)/farmer/${facility.id}` as any)
                  }
                  style={{ alignItems: "center", marginRight: 16 }}
                >
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 24,
                      borderWidth: 2,
                      borderColor: "#10b981",
                      overflow: "hidden",
                      marginBottom: 8,
                    }}
                  >
                    <Image
                      source={{ uri: facility.img }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    {facility.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TODAY'S FACILITY VISITS & AUDITS (Inspired by Reference Screen 4 Community/Challenge Cards) */}
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
              Today&apos;s Service Visits
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/map")}>
              <Text
                style={{
                  color: "#0284c7",
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
            {/* Visit Item 1 (Pending) */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit/1")}
              activeOpacity={0.9}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 28,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.05,
                shadowRadius: 14,
                elevation: 4,
                borderWidth: 1,
                borderColor: "#f1f5f9",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: "#0f172a",
                        fontFamily: "Brandon-Bold",
                        fontSize: 18,
                      }}
                    >
                      Apex Cyber Tower
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#fee2e2",
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 8,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ef4444",
                          fontFamily: "Brandon-Bold",
                          fontSize: 10,
                        }}
                      >
                        HIGH PRIORITY
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={14} color="#64748b" />
                    <Text
                      style={{
                        color: "#64748b",
                        fontFamily: "Brandon-Medium",
                        fontSize: 13,
                        marginLeft: 4,
                      }}
                    >
                      Tidel Park Road, Block B (4.2km)
                    </Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      color: "#0284c7",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    11:30 AM
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 11,
                    }}
                  >
                    Scheduled
                  </Text>
                </View>
              </View>

              {/* Embedded Spec File Row (Reference Screen 4 PDF Attachment Card) */}
              <View
                style={{
                  backgroundColor: "#f8fafc",
                  borderRadius: 16,
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: "#fee2e2",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <FileText size={18} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    HVAC_Chiller_Audit_Checklist.pdf
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 11,
                    }}
                  >
                    4 Action Items • OTP Required
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/visit/tracking")}
                  style={{
                    flex: 1,
                    backgroundColor: "#0f172a",
                    borderRadius: 999,
                    paddingVertical: 13,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Navigation
                    size={15}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    Navigate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/visit/check-in")}
                  style={{
                    flex: 1,
                    backgroundColor: "#10b981",
                    borderRadius: 999,
                    paddingVertical: 13,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera
                    size={15}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    Check-in
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Visit Item 2 (Completed) */}
            <View
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 28,
                padding: 20,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Bold",
                      fontSize: 18,
                      textDecorationLine: "line-through",
                    }}
                  >
                    Metro Logistics Hub
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <CheckCircle2 size={14} color="#10b981" />
                    <Text
                      style={{
                        color: "#10b981",
                        fontFamily: "Brandon-Medium",
                        fontSize: 13,
                        marginLeft: 4,
                      }}
                    >
                      Audit Complete at 09:45 AM
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(employee)/visit/report")}
                style={{
                  backgroundColor: "#f1f5f9",
                  borderRadius: 999,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText
                  size={16}
                  color="#0f172a"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  View Submitted Report
                </Text>
              </TouchableOpacity>
            </View>
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
                My Performance & KPIs
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "Brandon-Medium",
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                86% Efficiency • 480 Pts Earned
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
            Management Tools
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
                route: "/(employee)/my-farmers",
              },
              {
                title: "Onboard Site",
                icon: UserPlus,
                color: "#f59e0b",
                route: "/(employee)/register-farmer/step1",
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
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
