import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ChevronLeft,
  Settings,
  ShieldCheck,
  Map,
  Users,
  Award,
  Target,
  ArrowRight,
  Sparkles,
  Bell,
  Fingerprint,
} from "lucide-react-native";
import { useService, ALL_SERVICE_KEYS } from "../../context/ServiceContext";
import { api, getAuthUser } from "../../services/api";

const SERVICE_CARD_IMAGES: Record<string, any> = {
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

export default function EmployeeProfileScreen() {
  const { serviceConfig, setService } = useService();
  const [userName, setUserName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [completionRate, setCompletionRate] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [siteCount, setSiteCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);

  useEffect(() => {
    (async () => {
      const authUser = await getAuthUser();
      const storedName = await AsyncStorage.getItem("userName");
      const status = await AsyncStorage.getItem("isClockedIn");
      if (status === "true") setIsClockedIn(true);
      if (authUser?.name) setUserName(authUser.name);
      else if (storedName) setUserName(storedName);
      if (authUser?.employee_code) setEmployeeCode(authUser.employee_code);
      if (authUser?.phone) setPhone(authUser.phone);
      if (authUser?.email) setEmail(authUser.email);
      if (authUser?.company_name) setCompanyName(authUser.company_name);

      try {
        const dash = await api.get("/employee/dashboard");
        const emp = dash?.data?.employee;
        const att = dash?.data?.attendance;
        const stats = dash?.data?.stats;
        if (emp?.name) setUserName(emp.name);
        if (emp?.employee_code) setEmployeeCode(emp.employee_code);
        if (emp?.company?.name || emp?.company_name) {
          setCompanyName(emp.company?.name || emp.company_name);
        }
        if (emp?.industry && ALL_SERVICE_KEYS.includes(emp.industry)) {
          await setService(emp.industry);
        }
        if (att && typeof att.checked_in === "boolean") {
          setIsClockedIn(att.checked_in && !att.checked_out);
        }
        if (emp?.phone) setPhone(emp.phone);
        if (emp?.email) setEmail(emp.email);
        setTaskCount(Number(stats?.tasks_count ?? 0));
        setVisitCount(Number(stats?.visits_count ?? 0));
        setSiteCount(Number(stats?.sites_count ?? 0));
      } catch {
        // Keep only profile details already returned at sign in.
      }

      try {
        const performance = await api.get("/employee/performance");
        setCompletionRate(Number(performance?.metrics?.task_completion_rate ?? 0));
        setPointsEarned(Number(performance?.metrics?.points_earned ?? 0));
      } catch {
        setCompletionRate(0);
        setPointsEarned(0);
      }

      try {
        const sitesRes = await api.get("/employee/sites");
        const list = sitesRes?.data?.sites;
        if (Array.isArray(list)) setSiteCount(list.length);
      } catch {
        setSiteCount(0);
      }
    })();
  }, [serviceConfig.key]);
  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Cinematic Gradient Background */}
      <LinearGradient
        colors={[
          "#042616",
          "#0a331c",
          "#062214",
        ]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Glow */}
      <View
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          marginLeft: -150,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(16, 185, 129, 0.16)",
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 24,
            }}
          >
            {serviceConfig.vocab.staffRole}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/notifications")}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Bell size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/menu")}
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                padding: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Settings size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            paddingTop: 8,
          }}
        >
          {/* HERO PROFILE CARD WITH REAL EMPLOYEE & SERVICE TELEMETRY */}
          <View
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              borderRadius: 36,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.14)",
              marginBottom: 18,
              alignItems: "center",
            }}
          >
            {/* Avatar Flanked by Real Left & Right Metrics */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 8,
                marginBottom: 18,
              }}
            >
              {/* Left Metric */}
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {siteCount}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  {serviceConfig.vocab.entities}
                </Text>
              </View>

              {/* Center Circular Framed Avatar */}
              <View
                style={{
                  width: 136,
                  height: 136,
                  borderRadius: 68,
                  borderWidth: 3.5,
                  borderColor: "rgba(74, 222, 128, 0.75)",
                  padding: 4,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <View style={{ flex: 1, borderRadius: 64, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 54 }}>{userName.trim().charAt(0).toUpperCase() || "?"}</Text></View>
              </View>

              {/* Right Metric */}
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {completionRate}%
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginTop: 2,
                    textAlign: "center",
                  }}
                >
                  Task completion
                </Text>
              </View>
            </View>

            {/* Name + Verified Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 30,
                }}
              >
                {userName}
              </Text>
              <View
                style={{
                  backgroundColor: "#10b981",
                  borderRadius: 14,
                  padding: 4,
                  marginLeft: 8,
                }}
              >
                <ShieldCheck size={16} color="#ffffff" />
              </View>
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {[serviceConfig.vocab.staffRole, employeeCode].filter(Boolean).join(" • ") || "Employee"}
            </Text>
            <Text
              style={{
                color: "#4ade80",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                marginTop: 4,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              {companyName || "Company not linked"} • {isClockedIn ? "On Duty" : "Off Duty"}
            </Text>
            {phone || email ? <Text style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: -16, marginBottom: 20 }}>{[phone, email].filter(Boolean).join(" • ")}</Text> : null}

            {/* Dual Outlined Pill Buttons */}
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/attendance-hub")}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingVertical: 14,
                  borderWidth: 1.2,
                  borderColor: "rgba(255, 255, 255, 0.45)",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Fingerprint size={17} color="#ffffff" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  Attendance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(employee)/edit-profile")}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingVertical: 14,
                  borderWidth: 1.2,
                  borderColor: "#4ade80",
                  backgroundColor: "rgba(74, 222, 128, 0.14)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Award size={17} color="#4ade80" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  My Credentials
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SPLIT BENTO FEATURE CARDS */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 18,
              height: 238,
            }}
          >
            {/* Left Light Bento Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#e2e8f0",
                borderRadius: 32,
                padding: 18,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flex: 1, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }}><Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 20 }}>{userName.trim().charAt(0).toUpperCase() || "?"}</Text></View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    {userName}
                  </Text>
                  <ShieldCheck
                    size={14}
                    color="#0f172a"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text
                  style={{
                    color: "#475569",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    textAlign: "center",
                    lineHeight: 17,
                    marginTop: 6,
                  }}
                >
                    {taskCount} Active {serviceConfig.vocab.tasks} • {pointsEarned} points earned
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(employee)/tasks")}
                style={{
                  backgroundColor: "#0f172a",
                  width: "100%",
                  paddingVertical: 12,
                  borderRadius: 999,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  Work Orders
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Scenic Image Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/my-sites")}
              style={{
                flex: 1,
                borderRadius: 32,
                overflow: "hidden",
                backgroundColor: "#0f172a",
              }}
            >
              <Image
                source={SERVICE_CARD_IMAGES[serviceConfig.key] || require("../../assets/images/image3.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(6, 34, 20, 0.88)"]}
                style={StyleSheet.absoluteFill}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 18,
                  left: 16,
                  right: 16,
                }}
              >
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 12,
                    letterSpacing: 1,
                  }}
                >
                  {serviceConfig.badge} SECTOR
                </Text>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 20,
                    marginTop: 2,
                  }}
                >
                  My {serviceConfig.vocab.entities}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* WIDE HORIZONTAL FEATURE CARD */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(employee)/calendar")}
            style={{
              backgroundColor: "#e2e8f0",
              borderRadius: 32,
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
              height: 164,
            }}
          >
            <View
              style={{
                flex: 1.2,
                paddingHorizontal: 18,
                paddingVertical: 14,
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Sparkles size={15} color="#475569" style={{ marginRight: 5 }} />
                <Text
                  style={{
                    color: "#475569",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  {serviceConfig.shortName} • {completionRate}% task completion
                </Text>
              </View>

              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 20,
                  lineHeight: 24,
                }}
              >
                View Work Calendar & Shift Log
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  Open Calendar
                </Text>
                <ArrowRight
                  size={16}
                  color="#0f172a"
                  style={{ marginLeft: 5 }}
                />
              </View>
            </View>

            <View
              style={{
                flex: 0.9,
                height: "100%",
                borderRadius: 26,
                overflow: "hidden",
              }}
            >
              <Image
                source={require("../../assets/images/image10.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          {/* OPERATIONAL IMPACT METRICS GRID */}
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 24,
              marginBottom: 16,
            }}
          >
            {serviceConfig.shortName} Overview
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
                icon: Users,
                label: serviceConfig.vocab.entities,
                value: String(siteCount),
                color: "#38bdf8",
                route: "/(employee)/my-sites",
              },
              {
                icon: Map,
                label: "Active tasks",
                value: String(taskCount),
                color: "#4ade80",
                route: "/(employee)/map",
              },
              {
                icon: Target,
                label: serviceConfig.vocab.visits,
                value: String(visitCount),
                color: "#fbbf24",
                route: "/(employee)/visits",
              },
              {
                icon: Award,
                label: "SLA Resolution",
                value: `${completionRate}%`,
                color: "#f472b6",
                route: "/(employee)/performance",
              },
            ].map((metric, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(metric.route as any)}
                style={{
                  width: "48%",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  borderRadius: 26,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: `${metric.color}22`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <metric.icon size={24} color={metric.color} />
                </View>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                    marginBottom: 4,
                  }}
                >
                  {metric.value}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 15,
                  }}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
