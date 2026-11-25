import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  AlertTriangle,
  CalendarDays,
  Bell,
  CheckCircle2,
} from "lucide-react-native";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeeNotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const res = await api.get("/employee/notifications");
          if (!active) return;
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];
          setNotifications(list);
        } catch {
          if (active) setNotifications([]);
        } finally {
          if (active) setLoading(false);
        }
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER - Instagram Style Top Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 18,
            paddingVertical: 14,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: "rgba(255, 255, 255, 0.72)",
            backgroundColor: "rgba(255, 255, 255, 0.34)",
          }}
        >
          <LiquidGlassIconButton
            variant="light"
            size={42}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
          >
            <ChevronLeft size={24} color="#000000" />
          </LiquidGlassIconButton>
          <Text
            style={{
              color: "#000000",
              fontFamily: "Brandon-Bold",
              fontSize: 24,
              letterSpacing: 0.4,
            }}
          >
            Notifications
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <Text
            style={{
              color: "#000000",
              fontFamily: "Brandon-Bold",
              fontSize: 21,
              marginHorizontal: 18,
              marginTop: 18,
              marginBottom: 14,
            }}
          >
            Recent Updates
          </Text>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#0284c7" />
            </View>
          ) : notifications.length === 0 ? (
            <LiquidGlassCard
              variant="light"
              borderRadius={22}
              style={{ marginHorizontal: 16, marginTop: 10 }}
              contentStyle={{ padding: 32, alignItems: "center" }}
            >
              <LiquidGlassIconBadge
                size={56}
                borderRadius={28}
                variant="light"
                tintColor="#10b981"
                style={{ marginBottom: 12 }}
              >
                <CheckCircle2 size={26} color="#10b981" />
              </LiquidGlassIconBadge>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 17,
                }}
              >
                You&apos;re All Caught Up
              </Text>
              <Text
                style={{
                  color: "#64748b",
                  fontFamily: "Brandon-Medium",
                  fontSize: 13,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                No unread alerts or broadcast notifications.
              </Text>
            </LiquidGlassCard>
          ) : (
            <View>
              {notifications.map((notif: any, index: number) => {
                const isAlert =
                  notif.type === "alert" || notif.priority === "urgent";
                const badgeColor = isAlert ? "#ef4444" : "#0284c7";
                return (
                  <LiquidGlassCard
                    key={notif.id ?? index}
                    variant="light"
                    borderRadius={22}
                    dropletColor={notif.read ? undefined : badgeColor}
                    onPress={() => {}}
                    style={{
                      marginHorizontal: 16,
                      marginBottom: 10,
                    }}
                    contentStyle={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                    }}
                  >
                    <LiquidGlassIconBadge
                      size={48}
                      borderRadius={24}
                      variant="light"
                      tintColor={badgeColor}
                      style={{ marginRight: 14 }}
                    >
                      {isAlert ? (
                        <AlertTriangle size={22} color={badgeColor} />
                      ) : notif.type === "calendar" ? (
                        <CalendarDays size={22} color={badgeColor} />
                      ) : (
                        <Bell size={22} color={badgeColor} />
                      )}
                    </LiquidGlassIconBadge>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#0f172a",
                          fontFamily: "Brandon-Bold",
                          fontSize: 15,
                        }}
                      >
                        {notif.title ?? notif.user ?? "HQ Notice"}
                      </Text>
                      <Text
                        style={{
                          color: "#475569",
                          fontFamily: "Brandon-Medium",
                          fontSize: 13,
                          marginTop: 2,
                        }}
                        numberOfLines={2}
                      >
                        {notif.message ?? notif.body ?? "No notification details."}
                      </Text>
                    </View>
                  </LiquidGlassCard>
                );
              })}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
