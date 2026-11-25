import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Menu,
  MapPin,
  Navigation,
  ClipboardCheck,
  Fingerprint,
  FileText,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  AlertOctagon,
  Award,
  Layers,
} from "lucide-react-native";
import { api, getAuthUser } from "../../services/api";
import {
  useService,
  ServiceSelectorPill,
  ALL_SERVICE_KEYS,
} from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

const SITE_CARD_IMAGES = [
  require("../../assets/images/image5.jpg"),
  require("../../assets/images/image2.jpg"),
  require("../../assets/images/image3.jpg"),
  require("../../assets/images/image6.jpg"),
  require("../../assets/images/image11.jpg"),
  require("../../assets/images/image12.jpg"),
];

export default function EmployeeDashboardScreen() {
  const { serviceConfig, setService } = useService();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [employee, setEmployee] = useState<{
    name: string;
    employeeCode: string;
    designation: string;
    companyName: string;
    isTenant: boolean;
  }>({
    name: "",
    employeeCode: "",
    designation: "",
    companyName: "",
    isTenant: false,
  });

  const [attendance, setAttendance] = useState<{
    checkedIn: boolean;
    checkedOut: boolean;
    checkInAt: string | null;
    checkOutAt: string | null;
    totalHours: number;
    isWithinGeofence: boolean;
  }>({
    checkedIn: false,
    checkedOut: false,
    checkInAt: null,
    checkOutAt: null,
    totalHours: 0,
    isWithinGeofence: true,
  });

  const [stats, setStats] = useState<{
    sitesCount: number;
    tasksCount: number;
    completedTasksCount: number;
    visitsCount: number;
    visitsToday: number;
    pointsEarned: number;
    score: number;
    taskCompletionRate: number;
    hoursWorked: number;
    distanceTodayKm: number;
    unreadNotifications: number;
  }>({
    sitesCount: 0,
    tasksCount: 0,
    completedTasksCount: 0,
    visitsCount: 0,
    visitsToday: 0,
    pointsEarned: 0,
    score: 0,
    taskCompletionRate: 0,
    hoursWorked: 0,
    distanceTodayKm: 0,
    unreadNotifications: 0,
  });

  const [activeTasks, setActiveTasks] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);

  const loadDashboard = useCallback(async (isPull = false) => {
    if (isPull) {
      setRefreshing(true);
    }
    try {
      const cachedUser = await getAuthUser();
      if (cachedUser) {
        setEmployee((prev) => ({
          name: cachedUser.name || prev.name,
          employeeCode: cachedUser.employee_code || prev.employeeCode,
          designation: cachedUser.designation || prev.designation,
          companyName: cachedUser.company_name || prev.companyName,
          isTenant: Boolean(cachedUser.company_id),
        }));
      }

      const [dashRes, sitesRes] = await Promise.all([
        api.get("/employee/dashboard"),
        api.get("/employee/sites"),
      ]);

      const data = dashRes?.data || {};
      const emp = data?.employee || {};
      const att = data?.attendance || {};
      const st = data?.stats || {};

      if (emp?.industry && ALL_SERVICE_KEYS.includes(emp.industry)) {
        await setService(emp.industry);
      }

      setEmployee({
        name: emp.name || cachedUser?.name || "Field Staff",
        employeeCode: emp.employee_code || cachedUser?.employee_code || "",
        designation: emp.designation || serviceConfig.vocab.staffRole,
        companyName: emp.company_name || cachedUser?.company_name || "",
        isTenant: Boolean(emp.company_id ?? cachedUser?.company_id),
      });

      const isOnDuty = Boolean(att.checked_in && !att.checked_out);
      setAttendance({
        checkedIn: Boolean(att.checked_in),
        checkedOut: Boolean(att.checked_out),
        checkInAt: att.check_in_at || null,
        checkOutAt: att.check_out_at || null,
        totalHours: Number(att.total_hours || 0),
        isWithinGeofence: att.is_within_geofence !== false,
      });
      await AsyncStorage.setItem("isClockedIn", isOnDuty ? "true" : "false");

      setStats({
        sitesCount: Number(st.sites_count ?? 0),
        tasksCount: Number(st.tasks_count ?? 0),
        completedTasksCount: Number(st.completed_tasks_count ?? 0),
        visitsCount: Number(st.visits_count ?? 0),
        visitsToday: Number(st.visits_today ?? 0),
        pointsEarned: Number(st.points_earned ?? 0),
        score: Number(st.score ?? 0),
        taskCompletionRate: Number(st.task_completion_rate ?? 0),
        hoursWorked: Number(st.hours_worked ?? 0),
        distanceTodayKm: Number(st.distance_today_km ?? 0),
        unreadNotifications: Number(st.unread_notifications ?? 0),
      });

      setActiveTasks(Array.isArray(data?.active_tasks) ? data.active_tasks : []);
      setRecentVisits(Array.isArray(data?.recent_visits) ? data.recent_visits : []);
      setSites(Array.isArray(sitesRes?.sites) ? sitesRes.sites : []);
    } catch {
      // Retain current state smoothly if offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceConfig.vocab.staffRole, setService]);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard(false);
    }, [loadDashboard])
  );

  const isOnDuty = attendance.checkedIn && !attendance.checkedOut;
  const primaryTask = activeTasks[0] || null;
  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* TOP NAVIGATION BAR */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
            <LiquidGlassIconButton
              variant="light"
              size={44}
              onPress={() => router.push("/(employee)/menu")}
            >
              <Menu size={22} color="#0f172a" />
            </LiquidGlassIconButton>

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {employee.companyName || serviceConfig.shortName}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 20,
                }}
              >
                {employee.name || "Loading..."}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <ServiceSelectorPill compact locked={employee.isTenant} />
            <View>
              <LiquidGlassIconButton
                variant="light"
                size={44}
                onPress={() => router.push("/(employee)/notifications")}
              >
                <Bell size={20} color="#0f172a" />
              </LiquidGlassIconButton>
              {stats.unreadNotifications > 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    paddingHorizontal: 4,
                    backgroundColor: "#ef4444",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: "#ffffff",
                  }}
                >
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 9 }}>
                    {stats.unreadNotifications > 9 ? "9+" : stats.unreadNotifications}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadDashboard(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 132 }}
        >
          {/* HERO LIVE OPERATIONS & ATTENDANCE BANNER */}
          <LiquidGlassCard
            variant="dark"
            borderRadius={30}
            dropletColor={themeColor}
            style={{ marginBottom: 18 }}
            contentStyle={{ padding: 22 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isOnDuty ? "rgba(16,185,129,0.22)" : "rgba(148,163,184,0.22)",
                      borderWidth: 1,
                      borderColor: isOnDuty ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.2)",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 4,
                        backgroundColor: isOnDuty ? "#34d399" : "#94a3b8",
                        marginRight: 6,
                      }}
                    />
                    <Text style={{ color: isOnDuty ? "#6ee7b7" : "#cbd5e1", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                      {isOnDuty ? `ON DUTY • ${attendance.checkInAt || "LIVE"}` : attendance.checkedOut ? "SHIFT COMPLETED" : "OFF DUTY"}
                    </Text>
                  </View>
                  {employee.employeeCode ? (
                    <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      ID: {employee.employeeCode}
                    </Text>
                  ) : null}
                </View>

                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, lineHeight: 29 }}>
                  {serviceConfig.name}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.72)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                  {attendance.checkedOut
                    ? `Logged ${attendance.totalHours.toFixed(1)} hrs today • Synced with Admin`
                    : isOnDuty
                    ? `${stats.distanceTodayKm.toFixed(1)} km tracked today • GPS ready`
                    : "Clock in with GPS to start your daily shift"}
                </Text>
              </View>

              <LiquidGlassCard
                variant="tinted"
                tintColor="rgba(255,255,255,0.12)"
                borderRadius={20}
                onPress={() => router.push("/(employee)/performance")}
                contentStyle={{ paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" }}
              >
                <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                  {stats.score}%
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontFamily: "Brandon-Bold", fontSize: 10 }}>
                  SCORE
                </Text>
              </LiquidGlassCard>
            </View>

            {/* Quick Shift & Live GPS Buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <LiquidGlassButton
                variant="tinted"
                tintColor={isOnDuty ? "rgba(239, 68, 68, 0.78)" : "rgba(16, 185, 129, 0.82)"}
                dropletColor={isOnDuty ? "#f87171" : "#34d399"}
                onPress={() =>
                  router.push(
                    isOnDuty
                      ? "/(employee)/attendance/clock-out"
                      : attendance.checkedOut
                      ? "/(employee)/attendance-hub"
                      : "/(employee)/attendance/clock-in"
                  )
                }
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 13 }}
              >
                <Fingerprint size={17} color="#ffffff" style={{ marginRight: 7 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  {isOnDuty ? "Clock Out" : attendance.checkedOut ? "Shift Summary" : "Clock In"}
                </Text>
              </LiquidGlassButton>

              <LiquidGlassButton
                variant="dark"
                dropletColor="#38bdf8"
                onPress={() => router.push("/(employee)/map")}
                style={{ flex: 1 }}
                contentStyle={{ paddingVertical: 13 }}
              >
                <Navigation size={17} color="#38bdf8" style={{ marginRight: 7 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                  Live GPS Map
                </Text>
              </LiquidGlassButton>
            </View>
          </LiquidGlassCard>

          {/* REAL-TIME KPI BENTO GRID */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 10 }}>
            {[
              {
                label: `Active ${serviceConfig.vocab.tasks}`,
                value: String(stats.tasksCount),
                sub: `${stats.completedTasksCount} completed`,
                icon: ClipboardCheck,
                color: "#ea580c",
                route: "/(employee)/tasks",
              },
              {
                label: `My ${serviceConfig.vocab.entities}`,
                value: String(stats.sitesCount),
                sub: "Assigned by Admin",
                icon: Building2,
                color: "#0284c7",
                route: "/(employee)/my-sites",
              },
              {
                label: serviceConfig.vocab.visits,
                value: String(stats.visitsToday),
                sub: `${stats.visitsCount} total logged`,
                icon: MapPin,
                color: "#059669",
                route: "/(employee)/visits",
              },
              {
                label: "SLA Points",
                value: `${stats.pointsEarned}`,
                sub: `${stats.hoursWorked.toFixed(1)}h this month`,
                icon: Award,
                color: "#7c3aed",
                route: "/(employee)/performance",
              },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <LiquidGlassCard
                  key={idx}
                  variant="light"
                  borderRadius={24}
                  onPress={() => router.push(item.route as any)}
                  style={{ width: "48.2%", marginBottom: 12 }}
                  contentStyle={{ padding: 16 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <LiquidGlassIconBadge size={40} borderRadius={14} variant="light" tintColor={item.color}>
                      <IconComp size={20} color={item.color} />
                    </LiquidGlassIconBadge>
                    <ArrowRight size={16} color="#94a3b8" />
                  </View>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 26, marginTop: 10 }}>
                    {item.value}
                  </Text>
                  <Text numberOfLines={1} style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                    {item.label}
                  </Text>
                  <Text numberOfLines={1} style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 2 }}>
                    {item.sub}
                  </Text>
                </LiquidGlassCard>
              );
            })}
          </View>

          {/* QUICK ACTION TOOLS */}
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 22 }}>
            {[
              { label: "Calendar", icon: Clock, color: "#0284c7", route: "/(employee)/calendar" },
              { label: "Reports", icon: FileText, color: "#8b5cf6", route: "/(employee)/reports" },
              { label: "History", icon: TrendingUp, color: "#059669", route: "/(employee)/visit-history" },
              { label: "SOS", icon: AlertOctagon, color: "#ef4444", route: "/(employee)/sos" },
            ].map((tool, idx) => {
              const IconComp = tool.icon;
              return (
                <LiquidGlassCard
                  key={idx}
                  variant="light"
                  borderRadius={20}
                  onPress={() => router.push(tool.route as any)}
                  style={{ flex: 1 }}
                  contentStyle={{ paddingVertical: 14, alignItems: "center", gap: 6 }}
                >
                  <IconComp size={20} color={tool.color} />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                    {tool.label}
                  </Text>
                </LiquidGlassCard>
              );
            })}
          </View>

          {/* PRIORITY WORK ORDER SECTION */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
              Priority {serviceConfig.vocab.taskSingular}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/tasks")}>
              <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 14 }}>
                View All ({stats.tasksCount})
              </Text>
            </TouchableOpacity>
          </View>

          {loading && !primaryTask ? (
            <ActivityIndicator color={themeColor} style={{ marginVertical: 18 }} />
          ) : primaryTask ? (
            <LiquidGlassCard
              variant="light"
              borderRadius={26}
              style={{ marginBottom: 24 }}
              contentStyle={{ padding: 20 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                  {primaryTask.workOrderCode} • +{primaryTask.points} PTS
                </Text>
                <View
                  style={{
                    backgroundColor:
                      primaryTask.priority === "Urgent" ? "rgba(239,68,68,0.14)" : "rgba(245,158,11,0.16)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: primaryTask.priority === "Urgent" ? "#dc2626" : "#b45309",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                    }}
                  >
                    {primaryTask.priority} • {primaryTask.due}
                  </Text>
                </View>
              </View>

              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 19, marginBottom: 6 }}>
                {primaryTask.title}
              </Text>
              {primaryTask.targetEntity ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
                  <MapPin size={15} color={themeColor} />
                  <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6, flex: 1 }}>
                    {primaryTask.targetEntity}
                    {primaryTask.address ? ` • ${primaryTask.address}` : ""}
                  </Text>
                </View>
              ) : null}

              <LiquidGlassButton
                variant="tinted"
                tintColor="rgba(6, 34, 20, 0.88)"
                dropletColor="#4ade80"
                onPress={() => router.push(`/(employee)/task/${primaryTask.id}` as any)}
                contentStyle={{ paddingVertical: 14 }}
              >
                <Navigation size={17} color="#4ade80" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  Open & Start {serviceConfig.vocab.taskSingular}
                </Text>
              </LiquidGlassButton>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              style={{ marginBottom: 24 }}
              contentStyle={{ padding: 22, alignItems: "center" }}
            >
              <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                No Pending {serviceConfig.vocab.tasks}
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                New work orders assigned by your Web Admin will appear here immediately.
              </Text>
            </LiquidGlassCard>
          )}

          {/* ASSIGNED SITES CAROUSEL */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
              Assigned {serviceConfig.vocab.entities}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/my-sites")}>
              <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 14 }}>
                See All ({sites.length})
              </Text>
            </TouchableOpacity>
          </View>

          {sites.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 14, paddingBottom: 8, marginBottom: 20 }}
            >
              {sites.slice(0, 6).map((site, index) => (
                <TouchableOpacity
                  key={site.id}
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(employee)/site/${site.id}` as any)}
                  style={{
                    width: 236,
                    height: 168,
                    borderRadius: 24,
                    overflow: "hidden",
                    backgroundColor: "#0f172a",
                  }}
                >
                  <Image
                    source={SITE_CARD_IMAGES[index % SITE_CARD_IMAGES.length]}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={["rgba(15,23,42,0.15)", "rgba(15,23,42,0.88)"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={{ flex: 1, justifyContent: "space-between", padding: 16 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View
                        style={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          paddingHorizontal: 9,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 10 }}>
                          {site.site_code || "SITE"}
                        </Text>
                      </View>
                      {site.latitude !== null && site.longitude !== null && (
                        <View
                          style={{
                            backgroundColor: "rgba(16,185,129,0.28)",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                          }}
                        >
                          <Text style={{ color: "#6ee7b7", fontFamily: "Brandon-Bold", fontSize: 10 }}>
                            GPS PINNED
                          </Text>
                        </View>
                      )}
                    </View>

                    <View>
                      <Text numberOfLines={1} style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                        {site.name}
                      </Text>
                      <Text numberOfLines={1} style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                        {site.address || site.city || site.area || "Assigned location"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              style={{ marginBottom: 24 }}
              contentStyle={{ padding: 22, alignItems: "center" }}
            >
              <Layers size={30} color="#64748b" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                No {serviceConfig.vocab.entities} Assigned Yet
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Sites onboarded and assigned to you in Web Admin appear here automatically.
              </Text>
            </LiquidGlassCard>
          )}

          {/* RECENT FIELD VISITS */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
              Recent {serviceConfig.vocab.visits}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/visits")}>
              <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 14 }}>
                History
              </Text>
            </TouchableOpacity>
          </View>

          {recentVisits.length > 0 ? (
            <View style={{ gap: 12 }}>
              {recentVisits.map((visit) => {
                const isDone = visit.status === "completed";
                return (
                  <LiquidGlassCard
                    key={visit.id}
                    variant="light"
                    borderRadius={22}
                    onPress={() =>
                      router.push(
                        (isDone ? `/(employee)/report/${visit.id}` : `/(employee)/visit/${visit.id}`) as any
                      )
                    }
                    contentStyle={{ padding: 16, flexDirection: "row", alignItems: "center" }}
                  >
                    <LiquidGlassIconBadge
                      size={44}
                      borderRadius={15}
                      variant="light"
                      tintColor={isDone ? "#10b981" : "#f59e0b"}
                      style={{ marginRight: 14 }}
                    >
                      {isDone ? (
                        <CheckCircle2 size={22} color="#10b981" />
                      ) : (
                        <Clock size={22} color="#f59e0b" />
                      )}
                    </LiquidGlassIconBadge>

                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                        {visit.farmerName}
                      </Text>
                      <Text numberOfLines={1} style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                        {visit.date || "Today"} • {visit.time || ""}
                        {visit.checkOutTime ? ` – ${visit.checkOutTime}` : " (In Progress)"}
                      </Text>
                    </View>

                    <LiquidGlassPill
                      variant="light"
                      active={isDone}
                      tintColor={isDone ? "rgba(16,185,129,0.85)" : "rgba(245,158,11,0.85)"}
                      contentStyle={{ paddingHorizontal: 10, paddingVertical: 5 }}
                    >
                      <Text style={{ color: isDone ? "#ffffff" : "#92400e", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                        {isDone ? "Done" : "Active"}
                      </Text>
                    </LiquidGlassPill>
                  </LiquidGlassCard>
                );
              })}
            </View>
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={22}
              contentStyle={{ padding: 22, alignItems: "center" }}
            >
              <MapPin size={28} color="#94a3b8" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                No Field Visits Logged Yet
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Start a visit from an assigned site or work order to track GPS and submit reports.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
