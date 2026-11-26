import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Database,
  Award,
  Shield,
  LogOut,
  MapPin,
  ClipboardList,
  CalendarDays,
  Fingerprint,
  Navigation,
} from "lucide-react-native";
import { clearAuthSession } from "../../services/api";
import { useTracking } from "../../context/TrackingContext";
import { useService } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function MenuScreen() {
  const { serviceConfig } = useService();
  const { stopSession } = useTracking();

  const menuGroups = [
    {
      title: `${serviceConfig.shortName} Field Operations`,
      items: [
        { icon: ClipboardList, label: serviceConfig.vocab.tasks, route: "/(employee)/tasks", color: "#f97316" },
        { icon: Navigation, label: "Live GPS Map", route: "/(employee)/map", color: "#0ea5e9" },
        { icon: Fingerprint, label: "Attendance & Clock-In", route: "/(employee)/attendance-hub", color: "#10b981" },
        { icon: CalendarDays, label: "Work Calendar", route: "/(employee)/calendar", color: "#0284c7" },
        { icon: MapPin, label: `My ${serviceConfig.vocab.entities}`, route: "/(employee)/my-sites", color: "#3b82f6" },
        { icon: Database, label: `${serviceConfig.vocab.report}s & Media`, route: "/(employee)/reports", color: "#8b5cf6" },
      ],
    },
    {
      title: "Performance & Safety",
      items: [
        { icon: Award, label: "My Performance", route: "/(employee)/performance", color: "#059669" },
        { icon: Bell, label: "Notifications & Feed", route: "/(employee)/notifications", color: "#f59e0b" },
        { icon: Shield, label: "Emergency SOS", route: "/(employee)/sos", color: "#ef4444" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: User, label: "Staff Profile Details", route: "/(employee)/edit-profile", color: "#6366f1" },
      ],
    },
  ];

  const handleLogout = async () => {
    await stopSession().catch(() => { });
    await clearAuthSession();
    router.replace("/intro");
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 18 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            size={44}
            variant="light"
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 23 }}>
            Field Menu
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <PageHeroBanner
          badge={serviceConfig.shortName}
          title="Quick Menu"
          subtitle="Tasks, Attendance, Reports & Safety"
          colors={["#0f766e", "#0284c7"]}
          personIndex={1}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}>
          {menuGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={{ marginBottom: 26 }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1, marginBottom: 12, marginLeft: 6 }}>
                {group.title.toUpperCase()}
              </Text>

              <LiquidGlassCard variant="light" borderRadius={26}>
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={itemIndex}
                      onPress={() => item.route && router.push(item.route as any)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 17,
                        borderBottomWidth: itemIndex === group.items.length - 1 ? 0 : 1,
                        borderBottomColor: "rgba(148, 163, 184, 0.18)",
                      }}
                    >
                      <LiquidGlassIconBadge
                        size={46}
                        borderRadius={16}
                        variant="light"
                        tintColor={item.color}
                        style={{ marginRight: 14 }}
                      >
                        <Icon size={22} color={item.color} />
                      </LiquidGlassIconBadge>
                      <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                        {item.label}
                      </Text>
                      <ChevronRight size={20} color="#64748b" />
                    </TouchableOpacity>
                  );
                })}
              </LiquidGlassCard>
            </View>
          ))}

          <LiquidGlassButton
            onPress={handleLogout}
            variant="tinted"
            tintColor="rgba(239, 68, 68, 0.84)"
            dropletColor="#FB7185"
            contentStyle={{ paddingVertical: 17 }}
          >
            <LogOut size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 17 }}>
              Log Out
            </Text>
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
