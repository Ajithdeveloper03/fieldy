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
  Sprout,
  Droplet,
  Sun,
  Truck
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function SiteContactNotificationsScreen() {
  const { t } = useLanguage();
  
  const notifications = [
    {
      id: "1",
      type: "alert",
      user: "Weather Alert",
      avatar: null,
      message: "A structural inspection is scheduled for tomorrow. Ensure site access is available.",
      time: "2h",
      action: "Details",
      icon: <Sun size={18} color="#ffffff" />,
      bgColor: "#f59e0b",
      isUnread: true,
    },
    {
      id: "2",
      type: "user",
      user: "Field Officer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
      message: "has scheduled a visit to your farm tomorrow at 10:30 AM.",
      time: "4h",
      action: "Confirm",
      isUnread: true,
    },
    {
      id: "3",
      type: "system",
      user: "Agronomy Bot",
      avatar: null,
      message: "Your latest site safety inspection is complete. Review the recorded findings.",
      time: "1d",
      action: null,
      icon: <Droplet size={18} color="#ffffff" />,
      bgColor: "#0ea5e9",
      isUnread: false,
    },
    {
      id: "4",
      type: "delivery",
      user: "Order Update",
      avatar: null,
      message: "Your construction permit documents are ready for review.",
      time: "2d",
      action: "Track",
      icon: <Truck size={18} color="#ffffff" />,
      bgColor: "#10b981",
      isUnread: false,
    },
    {
      id: "5",
      type: "advisory",
      user: "Weekly Advisory",
      avatar: null,
      message: "A new project site update is available.",
      time: "3d",
      action: "View",
      icon: <Sprout size={18} color="#ffffff" />,
      bgColor: "#15803d",
      isUnread: false,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER - Instagram Style Top Bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e5e5e5" }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 4 }}>
            <ChevronLeft size={28} color="#000000" />
          </TouchableOpacity>
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 20, letterSpacing: 0.5 }}>{t("notifications", "Notifications")}</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
          
          <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 12 }}>{t("new", "New")}</Text>

          {/* NOTIFICATION LIST */}
          <View>
            {notifications.map((notif, index) => {
              if (index === 2) {
                return (
                  <View key="divider">
                    <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 16, marginHorizontal: 16, marginTop: 24, marginBottom: 12 }}>{t("earlier", "Earlier")}</Text>
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
          paddingVertical: 12, 
          paddingHorizontal: 16,
          backgroundColor: notif.isUnread ? "#f0fdf4" : "#ffffff",
        }}
      >
        {/* Avatar / Icon */}
        <View style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12, overflow: "hidden", backgroundColor: notif.bgColor || "#e2e8f0", alignItems: "center", justifyContent: "center" }}>
          {notif.avatar ? (
            <Image source={{ uri: notif.avatar }} style={{ width: "100%", height: "100%" }} />
          ) : (
            notif.icon
          )}
        </View>

        {/* Text Content */}
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ fontFamily: "Brandon-Medium", fontSize: 14, color: "#262626", lineHeight: 20 }}>
            <Text style={{ fontFamily: "Brandon-Bold", color: "#000000" }}>{notif.user} </Text>
            {notif.message}
            <Text style={{ color: "#a3a3a3", fontSize: 13 }}>  {notif.time}</Text>
          </Text>
        </View>

        {/* Action Button */}
        {notif.action && (
          <TouchableOpacity style={{ backgroundColor: notif.action === "Confirm" ? "#15803d" : "#0f172a", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 }}>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>{notif.action}</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }
}
