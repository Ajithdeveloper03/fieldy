import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
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
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

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
  const [userName, setUserName] = useState("Field Officer");
  const [employeeCode, setEmployeeCode] = useState("EMP");
  const [companyName, setCompanyName] = useState(serviceConfig.name);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [siteCount, setSiteCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const [distanceTodayKm, setDistanceTodayKm] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfile = useCallback(async () => {
    const authUser = await getAuthUser();
    const storedName = await AsyncStorage.getItem("userName");
    const status = await AsyncStorage.getItem("isClockedIn");

    const [dash, sitesRes] = await Promise.all([
      api.get("/employee/dashboard").catch(() => null),
      api.get("/employee/sites").catch(() => null),
    ]);

    const payload = dash?.data || dash;
    const emp = payload?.employee;
    const att = payload?.attendance;
    const stats = payload?.stats;
    const sitesList = Array.isArray(sitesRes?.sites)
      ? sitesRes.sites
      : Array.isArray(sitesRes?.data?.sites)
      ? sitesRes.data.sites
      : [];

    if (emp?.name) setUserName(emp.name);
    else if (authUser?.name) setUserName(authUser.name);
    else if (storedName) setUserName(storedName);

    if (emp?.employee_code) setEmployeeCode(emp.employee_code);
    else if (authUser?.employee_code) setEmployeeCode(authUser.employee_code);

    if (emp?.company?.name || emp?.company_name || authUser?.company_name) {
      setCompanyName(emp?.company?.name || emp?.company_name || authUser?.company_name);
    } else {
      setCompanyName(serviceConfig.name);
    }

    if (emp?.industry && ALL_SERVICE_KEYS.includes(emp.industry)) {
      await setService(emp.industry);
    }

    if (att && typeof att.checked_in === "boolean") {
      setIsClockedIn(Boolean(att.checked_in && !att.checked_out));
    } else {
      setIsClockedIn(status === "true");
    }

    setSiteCount(Number(stats?.sites_count ?? sitesList.length ?? 0));
    setTaskCount(Number(stats?.tasks_count ?? 0));
    setVisitCount(Number(stats?.visits_count ?? 0));
    setPointsEarned(Number(stats?.points_earned ?? 0));
    setEfficiencyScore(Number(stats?.score ?? stats?.task_completion_rate ?? 0));
    setDistanceTodayKm(Number(stats?.distance_today_km ?? 0));
  }, [serviceConfig.name, setService]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!active) return;
        await loadProfile();
      })();
      return () => {
        active = false;
      };
    }, [loadProfile])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  }, [loadProfile]);
  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

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
          <LiquidGlassIconButton
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            size={44}
            variant="dark"
          >
            <ChevronLeft size={22} color="#ffffff" />
          </LiquidGlassIconButton>
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
            <LiquidGlassIconButton
              onPress={() => router.push("/(employee)/notifications")}
              size={42}
              variant="dark"
            >
              <Bell size={20} color="#ffffff" />
            </LiquidGlassIconButton>
            <LiquidGlassIconButton
              onPress={() => router.push("/(employee)/menu")}
              size={42}
              variant="dark"
            >
              <Settings size={20} color="#ffffff" />
            </LiquidGlassIconButton>
          </View>
        </View>

        <PageHeroBanner
          badge={isClockedIn ? "ON DUTY" : "PROFILE"}
          title={userName}
          subtitle={`${pointsEarned} Pts • ${efficiencyScore}% Work Score`}
          colors={["#0f766e", "#1e3a8a"]}
          personIndex={6}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            paddingTop: 8,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4ade80"
            />
          }
        >
          {/* HERO PROFILE CARD WITH APPLE LIQUID GLASS */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={36}
            dropletColor="#10B981"
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 24, alignItems: "center" }}
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
                <Image
                  source={SERVICE_CARD_IMAGES[serviceConfig.key] || require("../../assets/images/image1.jpg")}
                  style={{ width: "100%", height: "100%", borderRadius: 64 }}
                />
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
                  {efficiencyScore}%
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
                  Work Score
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
              {serviceConfig.vocab.staffRole} • {employeeCode}
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
              {companyName} • {isClockedIn ? "On Duty" : "Ready for Shift"}
            </Text>

            {/* Dual Liquid Glass Pill Buttons */}
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <LiquidGlassButton
                onPress={() => router.push("/(employee)/attendance-hub")}
                variant="dark"
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 14, paddingHorizontal: 14 }}
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
              </LiquidGlassButton>

              <LiquidGlassButton
                onPress={() => router.push("/(employee)/edit-profile")}
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.24)"
                dropletColor="#4ADE80"
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 14, paddingHorizontal: 14 }}
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
              </LiquidGlassButton>
            </View>
          </LiquidGlassCard>

          {/* SPLIT BENTO FEATURE CARDS */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 18,
              height: 238,
            }}
          >
            {/* Left Light Crystal Liquid Glass Bento Card */}
            <LiquidGlassCard
              variant="light"
              borderRadius={32}
              style={{ flex: 1 }}
              contentStyle={{
                padding: 18,
                alignItems: "center",
                justifyContent: "space-between",
                flex: 1,
                backgroundColor: "rgba(255, 255, 255, 0.72)",
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
                  <Image
                    source={SERVICE_CARD_IMAGES[serviceConfig.key] || require("../../assets/images/image1.jpg")}
                    style={{ width: "100%", height: "100%" }}
                  />
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
                  {taskCount} Active {serviceConfig.vocab.tasks} • {pointsEarned} PTS
                </Text>
              </View>

              <LiquidGlassButton
                onPress={() => router.push("/(employee)/tasks")}
                variant="dark"
                style={{ width: "100%" }}
                contentStyle={{ paddingVertical: 11, paddingHorizontal: 14 }}
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
              </LiquidGlassButton>
            </LiquidGlassCard>

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
                style={StyleSheet.absoluteFillObject}
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

          {/* WIDE HORIZONTAL LIQUID GLASS FEATURE CARD */}
          <LiquidGlassCard
            variant="light"
            borderRadius={32}
            onPress={() => router.push("/(employee)/calendar")}
            style={{ marginBottom: 24, height: 164 }}
            contentStyle={{
              padding: 8,
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              backgroundColor: "rgba(255, 255, 255, 0.72)",
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
                  {serviceConfig.shortName} • {efficiencyScore}% Score
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
          </LiquidGlassCard>

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
                label: "Distance Today",
                value: `${distanceTodayKm.toFixed(1)} km`,
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
                label: "Work Quality",
                value: `${efficiencyScore}%`,
                color: "#f472b6",
                route: "/(employee)/performance",
              },
            ].map((metric, idx) => (
              <LiquidGlassCard
                key={idx}
                variant="dark"
                borderRadius={26}
                dropletColor={metric.color}
                onPress={() => router.push(metric.route as any)}
                style={{ width: "48%", marginBottom: 16 }}
                contentStyle={{ padding: 20 }}
              >
                <LiquidGlassIconBadge
                  size={48}
                  borderRadius={16}
                  variant="dark"
                  tintColor={metric.color}
                  style={{ marginBottom: 12 }}
                >
                  <metric.icon size={24} color={metric.color} />
                </LiquidGlassIconBadge>
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
                    color: "rgba(255,255,255,0.74)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 15,
                  }}
                >
                  {metric.label}
                </Text>
              </LiquidGlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
