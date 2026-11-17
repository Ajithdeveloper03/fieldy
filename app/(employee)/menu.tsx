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
  PhoneCall,
  Shield,
  LogOut,
  MapPin,
  ClipboardList,
  CalendarDays,
  Fingerprint,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useService } from "../../context/ServiceContext";

export default function MenuScreen() {
  const { t } = useLanguage();
  const { serviceConfig } = useService();

  const menuGroups = [
    {
      title: `${serviceConfig.shortName} Field Work`,
      items: [
        { icon: ClipboardList, label: serviceConfig.vocab.tasks, route: "/(employee)/tasks", color: "#f97316" },
        { icon: Fingerprint, label: "Attendance & Clock-In", route: "/(employee)/attendance-hub", color: "#10b981" },
        { icon: CalendarDays, label: "Work Calendar", route: "/(employee)/calendar", color: "#0284c7" },
        { icon: Bell, label: "Notifications & Alerts", route: "/(employee)/notifications", color: "#f59e0b" },
        { icon: MapPin, label: `My ${serviceConfig.vocab.entities}`, route: "/(employee)/my-sites", color: "#3b82f6" },
        { icon: Database, label: `${serviceConfig.vocab.report}s`, route: "/(employee)/reports", color: "#8b5cf6" },
      ],
    },
    {
      title: "Safety & Performance",
      items: [
        { icon: PhoneCall, label: "My Performance", route: "/(employee)/performance", color: "#0ea5e9" },
        { icon: Shield, label: "Emergency SOS", route: "/(employee)/sos", color: "#ef4444" },
      ],
    },
    {
      title: "Account",
      items: [
        { icon: User, label: "My Profile Details", route: "/(employee)/edit-profile", color: "#f59e0b" },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8faf9" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <ChevronLeft size={26} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 25 }}>Menu</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 8, paddingBottom: 110 }}>
          
          {menuGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={{ marginBottom: 32 }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 15, letterSpacing: 1, marginBottom: 16, marginLeft: 8 }}>
                {group.title.toUpperCase()}
              </Text>
              
              <View style={{ backgroundColor: "#ffffff", borderRadius: 28, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 5 }}>
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity 
                      key={itemIndex}
                      onPress={() => item.route && router.push(item.route as any)}
                      style={{ 
                        flexDirection: "row", alignItems: "center", padding: 20,
                        borderBottomWidth: itemIndex === group.items.length - 1 ? 0 : 1,
                        borderBottomColor: "#f1f5f9"
                      }}
                    >
                      <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: `${item.color}18`, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                        <Icon size={26} color={item.color} />
                      </View>
                      <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 19 }}>{item.label}</Text>
                      <ChevronRight size={22} color="#94a3b8" />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
            onPress={() => router.replace("/intro")}
            style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fee2e2", paddingVertical: 18, borderRadius: 999, marginTop: 16 }}
          >
            <LogOut size={22} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 18 }}>Log Out</Text>
          </TouchableOpacity>

          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Fieldy v2.0.1
          </Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
