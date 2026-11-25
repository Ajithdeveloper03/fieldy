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
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

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
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 24 }}>
          <LiquidGlassIconButton
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
            size={46}
            variant="light"
          >
            <ChevronLeft size={26} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 25 }}>Menu</Text>
          <View style={{ width: 46 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 8, paddingBottom: 110 }}>
          
          {menuGroups.map((group, groupIndex) => (
            <View key={groupIndex} style={{ marginBottom: 32 }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 15, letterSpacing: 1, marginBottom: 16, marginLeft: 8 }}>
                {group.title.toUpperCase()}
              </Text>
              
              <LiquidGlassCard variant="light" borderRadius={28}>
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity 
                      key={itemIndex}
                      onPress={() => item.route && router.push(item.route as any)}
                      style={{ 
                        flexDirection: "row", alignItems: "center", padding: 20,
                        borderBottomWidth: itemIndex === group.items.length - 1 ? 0 : 1,
                        borderBottomColor: "rgba(148, 163, 184, 0.2)"
                      }}
                    >
                      <LiquidGlassIconBadge
                        size={52}
                        borderRadius={18}
                        variant="light"
                        tintColor={item.color}
                        style={{ marginRight: 16 }}
                      >
                        <Icon size={26} color={item.color} />
                      </LiquidGlassIconBadge>
                      <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 19 }}>{item.label}</Text>
                      <ChevronRight size={22} color="#64748b" />
                    </TouchableOpacity>
                  );
                })}
              </LiquidGlassCard>
            </View>
          ))}

          {/* LOGOUT BUTTON */}
          <LiquidGlassButton
            onPress={() => router.replace("/intro")}
            variant="tinted"
            tintColor="rgba(239, 68, 68, 0.80)"
            dropletColor="#FB7185"
            style={{ marginTop: 16 }}
            contentStyle={{ paddingVertical: 18 }}
          >
            <LogOut size={22} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Log Out</Text>
          </LiquidGlassButton>

          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 24 }}>
            Fieldy v2.0.1
          </Text>

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
