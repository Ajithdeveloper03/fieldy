import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  UserPen,
  ShieldCheck,
  Building2,
  Map,
  Target,
  Award,
  ArrowRight,
  LogOut,
  Phone,
  Mail,
} from "lucide-react-native";
import { api, clearAuthSession, getAuthUser } from "../../services/api";
import { useService } from "../../context/ServiceContext";
import { useTracking } from "../../context/TrackingContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeeProfileScreen() {
  const { serviceConfig } = useService();
  const { stopSession } = useTracking();
  const [refreshing, setRefreshing] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    employeeCode: "",
    designation: "",
    companyName: "",
    phone: "",
    email: "",
  });

  const [metrics, setMetrics] = useState({
    sitesCount: 0,
    tasksCount: 0,
    visitsCount: 0,
    pointsEarned: 0,
    score: 0,
    distanceTodayKm: 0,
  });

  const loadProfile = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const cached = await getAuthUser();
      if (cached) {
        setProfile((prev) => ({
          name: cached.name || prev.name,
          employeeCode: cached.employee_code || prev.employeeCode,
          designation: cached.designation || prev.designation,
          companyName: cached.company_name || prev.companyName,
          phone: cached.phone || prev.phone,
          email: cached.email || prev.email,
        }));
      }

      const [dashRes, sitesRes] = await Promise.all([
        api.get("/employee/dashboard"),
        api.get("/employee/sites"),
      ]);

      const emp = dashRes?.data?.employee || {};
      const st = dashRes?.data?.stats || {};
      const sitesList = Array.isArray(sitesRes?.sites) ? sitesRes.sites : [];

      setProfile({
        name: emp.name || cached?.name || "Field Staff",
        employeeCode: emp.employee_code || cached?.employee_code || "",
        designation: emp.designation || serviceConfig.vocab.staffRole,
        companyName: emp.company_name || cached?.company_name || serviceConfig.name,
        phone: emp.phone || cached?.phone || "",
        email: emp.email || cached?.email || "",
      });

      setMetrics({
        sitesCount: sitesList.length || Number(st.sites_count || 0),
        tasksCount: Number(st.tasks_count || 0),
        visitsCount: Number(st.visits_count || 0),
        pointsEarned: Number(st.points_earned || 0),
        score: Number(st.score || 0),
        distanceTodayKm: Number(st.distance_today_km || 0),
      });
    } catch {
      // Keep cached session details
    } finally {
      setRefreshing(false);
    }
  }, [serviceConfig.name, serviceConfig.vocab.staffRole]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile(false);
    }, [loadProfile])
  );

  const handleLogout = async () => {
    await stopSession().catch(() => {});
    await clearAuthSession();
    router.replace("/intro");
  };

  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 14 }}>
          <View>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>
              My Profile
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.68)", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              {profile.companyName || serviceConfig.shortName}
            </Text>
          </View>

          <LiquidGlassIconButton
            variant="dark"
            size={44}
            onPress={() => router.push("/(employee)/edit-profile")}
          >
            <UserPen size={20} color="#ffffff" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadProfile(true)}
              tintColor="#4ade80"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        >
          {/* PROFILE IDENTITY CARD */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={30}
            dropletColor={themeColor}
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 22 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  borderWidth: 2.5,
                  borderColor: "#4ade80",
                  overflow: "hidden",
                  marginRight: 16,
                }}
              >
                <Image
                  source={require("../../assets/images/image3.jpg")}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text numberOfLines={1} style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                    {profile.name || "Field Staff"}
                  </Text>
                  <ShieldCheck size={17} color="#4ade80" style={{ marginLeft: 6 }} />
                </View>
                <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 13, marginTop: 2 }}>
                  {profile.designation}
                  {profile.employeeCode ? ` • ${profile.employeeCode}` : ""}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                  {profile.companyName}
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.06)",
                gap: 6,
              }}
            >
              {profile.phone ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Phone size={14} color="#4ade80" />
                  <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8 }}>
                    {profile.phone}
                  </Text>
                </View>
              ) : null}
              {profile.email ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Mail size={14} color="#38bdf8" />
                  <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 8 }}>
                    {profile.email}
                  </Text>
                </View>
              ) : null}
            </View>
          </LiquidGlassCard>

          {/* BENTO FEATURE ROW */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 18, height: 196 }}>
            <LiquidGlassCard
              variant="light"
              borderRadius={28}
              style={{ flex: 1 }}
              contentStyle={{
                padding: 18,
                justifyContent: "space-between",
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.86)",
              }}
            >
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                  WORKLOAD
                </Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 28, marginTop: 4 }}>
                  {metrics.tasksCount}
                </Text>
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13 }}>
                  Active {serviceConfig.vocab.tasks} • {metrics.pointsEarned} Pts
                </Text>
              </View>

              <LiquidGlassButton
                onPress={() => router.push("/(employee)/tasks")}
                variant="dark"
                style={{ width: "100%" }}
                contentStyle={{ paddingVertical: 11 }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                  Work Orders
                </Text>
              </LiquidGlassButton>
            </LiquidGlassCard>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/my-sites")}
              style={{
                flex: 1,
                borderRadius: 28,
                overflow: "hidden",
                backgroundColor: "#0f172a",
              }}
            >
              <Image
                source={require("../../assets/images/image10.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["rgba(15,23,42,0.1)", "rgba(6, 34, 20, 0.9)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 0.8 }}>
                  {metrics.sitesCount} ASSIGNED
                </Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 19, marginTop: 2 }}>
                  My {serviceConfig.vocab.entities}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* CALENDAR & SHIFT LOG BANNER */}
          <LiquidGlassCard
            variant="light"
            borderRadius={26}
            onPress={() => router.push("/(employee)/calendar")}
            style={{ marginBottom: 22 }}
            contentStyle={{
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255,255,255,0.88)",
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                {serviceConfig.shortName} • {metrics.score}% SCORE
              </Text>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 3 }}>
                Work Calendar & Shift Log
              </Text>
            </View>
            <ArrowRight size={20} color="#0f172a" />
          </LiquidGlassCard>

          {/* REAL OPERATIONAL METRICS GRID */}
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 14 }}>
            Live Operational Summary
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 }}>
            {[
              {
                icon: Building2,
                label: serviceConfig.vocab.entities,
                value: String(metrics.sitesCount),
                color: "#38bdf8",
                route: "/(employee)/my-sites",
              },
              {
                icon: Map,
                label: "Distance Today",
                value: `${metrics.distanceTodayKm.toFixed(1)} km`,
                color: "#4ade80",
                route: "/(employee)/map",
              },
              {
                icon: Target,
                label: serviceConfig.vocab.visits,
                value: String(metrics.visitsCount),
                color: "#fbbf24",
                route: "/(employee)/visits",
              },
              {
                icon: Award,
                label: "Performance",
                value: `${metrics.score}%`,
                color: "#f472b6",
                route: "/(employee)/performance",
              },
            ].map((metric, idx) => (
              <LiquidGlassCard
                key={idx}
                variant="dark"
                borderRadius={24}
                dropletColor={metric.color}
                onPress={() => router.push(metric.route as any)}
                style={{ width: "48.2%", marginBottom: 12 }}
                contentStyle={{ padding: 18 }}
              >
                <LiquidGlassIconBadge size={42} borderRadius={14} variant="dark" tintColor={metric.color} style={{ marginBottom: 10 }}>
                  <metric.icon size={21} color={metric.color} />
                </LiquidGlassIconBadge>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25 }}>
                  {metric.value}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.72)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 2 }}>
                  {metric.label}
                </Text>
              </LiquidGlassCard>
            ))}
          </View>

          {/* LOGOUT CTA */}
          <LiquidGlassButton
            onPress={handleLogout}
            variant="tinted"
            tintColor="rgba(239, 68, 68, 0.80)"
            dropletColor="#fb7185"
            contentStyle={{ paddingVertical: 16 }}
          >
            <LogOut size={19} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
              Log Out
            </Text>
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
