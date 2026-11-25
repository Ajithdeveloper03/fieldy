import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  MapPin,
  Fingerprint,
  BellOff,
} from "lucide-react-native";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function EmployeeNotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/notifications");
      setNotifications(Array.isArray(res?.notifications) ? res.notifications : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadNotifications(false);
    }, [loadNotifications])
  );

  const resolveVisual = (category: string) => {
    switch (category) {
      case "alert":
      case "urgent":
        return { Icon: AlertTriangle, color: "#ef4444" };
      case "completed":
        return { Icon: CheckCircle2, color: "#10b981" };
      case "visit":
        return { Icon: MapPin, color: "#0284c7" };
      case "attendance":
        return { Icon: Fingerprint, color: "#8b5cf6" };
      default:
        return { Icon: ClipboardList, color: "#ea580c" };
    }
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            variant="light"
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
            Notifications & Feed
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications(true)}
              tintColor="#059669"
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 12 }}
        >
          {loading ? (
            <ActivityIndicator color="#059669" style={{ marginTop: 48 }} />
          ) : notifications.length > 0 ? (
            notifications.map((notif) => {
              const { Icon, color } = resolveVisual(notif.category);
              return (
                <LiquidGlassCard
                  key={notif.id}
                  variant="light"
                  borderRadius={22}
                  dropletColor={notif.isUnread ? color : undefined}
                  onPress={() => notif.route && router.push(notif.route as any)}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 15,
                    paddingHorizontal: 16,
                  }}
                >
                  <LiquidGlassIconBadge
                    size={48}
                    borderRadius={16}
                    variant="light"
                    tintColor={color}
                    style={{ marginRight: 14 }}
                  >
                    <Icon size={22} color={color} />
                  </LiquidGlassIconBadge>

                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                      {notif.title}
                    </Text>
                    <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 19, marginTop: 2 }}>
                      {notif.message}
                    </Text>
                    <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 4 }}>
                      {notif.time}
                    </Text>
                  </View>

                  {notif.actionLabel ? (
                    <LiquidGlassPill
                      active
                      variant="light"
                      tintColor={`${color}E6`}
                      contentStyle={{ paddingHorizontal: 12, paddingVertical: 7 }}
                    >
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                        {notif.actionLabel}
                      </Text>
                    </LiquidGlassPill>
                  ) : null}
                </LiquidGlassCard>
              );
            })
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              style={{ marginTop: 20 }}
              contentStyle={{ padding: 30, alignItems: "center" }}
            >
              <BellOff size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                No Activity Notifications Yet
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Assigned work orders, visit updates, attendance confirmations, and alerts appear here live.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
