import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  AlertTriangle,
  FileText,
  CheckCircle2,
  CalendarDays
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function EmployeeNotificationsScreen() {
  const notifications = [
    {
      id: "1",
      type: "alert",
      user: "System Alert",
      avatar: null,
      message: "Sensor data indicates critically low moisture in South Block of Farm A.",
      time: "10m",
      action: "Review",
      icon: <AlertTriangle size={20} color="#ef4444" />,
      bgColor: "#ef4444",
      isUnread: true,
    },
    {
      id: "2",
      type: "user",
      user: "Rajesh Kumar",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
      message: "uploaded the latest NPK test results for his farm.",
      time: "1h",
      action: "View",
      isUnread: true,
    },
    {
      id: "3",
      type: "admin",
      user: "Admin Team",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=project&q=80",
      message: "approved your field inspection report for Farm C.",
      time: "3h",
      action: null,
      isUnread: false,
    },
    {
      id: "4",
      type: "reminder",
      user: "Schedule",
      avatar: null,
      message: "Upcoming visit with Muthuvel at 4:00 PM.",
      time: "5h",
      action: "Route",
      icon: <CalendarDays size={20} color="#10b981" />,
      bgColor: "#10b981",
      isUnread: false,
    },
    {
      id: "5",
      type: "user",
      user: "Senthil",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=project&q=80",
      message: "requested assistance with pest control.",
      time: "1d",
      action: "Reply",
      isUnread: false,
    },
  ];

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER - Instagram Style Top Bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(255, 255, 255, 0.72)", backgroundColor: "rgba(255, 255, 255, 0.34)" }}>
          <LiquidGlassIconButton
            variant="light"
            size={42}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={24} color="#000000" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 24, letterSpacing: 0.4 }}>Notifications</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 21, marginHorizontal: 18, marginTop: 18, marginBottom: 14 }}>New</Text>

          {/* NOTIFICATION LIST */}
          <View>
            {notifications.map((notif, index) => {
              if (index === 2) {
                return (
                  <View key="divider">
                    <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 21, marginHorizontal: 18, marginTop: 26, marginBottom: 14 }}>Earlier</Text>
                    {renderNotificationItem(notif)}
                  </View>
                );
              }
              return renderNotificationItem(notif);
            })}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );

  function renderNotificationItem(notif: any) {
    return (
      <LiquidGlassCard
        key={notif.id}
        variant="light"
        borderRadius={22}
        dropletColor={notif.isUnread ? "#0ea5e9" : undefined}
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
        {/* Avatar / Icon */}
        {notif.avatar ? (
          <View style={{ width: 58, height: 58, borderRadius: 29, marginRight: 14, overflow: "hidden", backgroundColor: "#e2e8f0", borderWidth: 1.5, borderColor: "rgba(255, 255, 255, 0.94)", alignItems: "center", justifyContent: "center" }}>
            <Image source={{ uri: notif.avatar }} style={{ width: "100%", height: "100%" }} />
          </View>
        ) : (
          <LiquidGlassIconBadge
            size={58}
            borderRadius={29}
            variant="light"
            tintColor={notif.bgColor || "#0ea5e9"}
            style={{ marginRight: 14 }}
          >
            {notif.icon}
          </LiquidGlassIconBadge>
        )}

        {/* Text Content */}
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: "Brandon-Medium", fontSize: 17, color: "#1e293b", lineHeight: 23 }}>
            <Text style={{ fontFamily: "Brandon-Bold", color: "#000000" }}>{notif.user} </Text>
            {notif.message}
            <Text style={{ color: "#94a3b8", fontSize: 14 }}>  {notif.time}</Text>
          </Text>
        </View>

        {/* Action Button */}
        {notif.action && (
          <LiquidGlassPill
            active
            variant="light"
            tintColor={notif.action === "Review" ? "rgba(239, 68, 68, 0.86)" : "rgba(14, 165, 233, 0.86)"}
            contentStyle={{ paddingHorizontal: 18, paddingVertical: 9 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>{notif.action}</Text>
          </LiquidGlassPill>
        )}
      </LiquidGlassCard>
    );
  }
}
