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
      icon: <AlertTriangle size={18} color="#ffffff" />,
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
      icon: <CalendarDays size={18} color="#ffffff" />,
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
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER - Instagram Style Top Bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e5e5" }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 6 }}>
            <ChevronLeft size={30} color="#000000" />
          </TouchableOpacity>
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 24, letterSpacing: 0.4 }}>Notifications</Text>
          <View style={{ width: 38 }} />
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
    </View>
  );

  function renderNotificationItem(notif: any) {
    return (
      <TouchableOpacity 
        key={notif.id} 
        activeOpacity={0.9} 
        style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          paddingVertical: 16, 
          paddingHorizontal: 18,
          backgroundColor: notif.isUnread ? "#f0f9ff" : "#ffffff",
        }}
      >
        {/* Avatar / Icon */}
        <View style={{ width: 58, height: 58, borderRadius: 29, marginRight: 14, overflow: "hidden", backgroundColor: notif.bgColor || "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
          {notif.avatar ? (
            <Image source={{ uri: notif.avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            notif.icon
          )}
        </View>

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
          <TouchableOpacity style={{ backgroundColor: notif.action === "Review" ? "#ef4444" : "#0ea5e9", paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>{notif.action}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
}
