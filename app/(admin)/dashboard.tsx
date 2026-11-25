import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Animated, Dimensions, Platform } from "react-native";
import { router } from "expo-router";
import { Users, CheckCircle, ChevronLeft, TrendingUp, Activity, Bell, Target, Leaf, Map, DollarSign, Clock } from "lucide-react-native";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../context/LanguageContext";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

const { width } = Dimensions.get("window");

// Mock Data for Analytics
const WEEKLY_DATA = [
  { day: "M", value: 30 },
  { day: "T", value: 50 },
  { day: "W", value: 45 },
  { day: "T", value: 85 },
  { day: "F", value: 65 },
  { day: "S", value: 95 },
  { day: "S", value: 70 },
];

export default function AdminDashboardScreen() {
  const [pendingSiteContacts, setPendingSiteContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  // Animations
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(30));

  const fetchPendingSiteContacts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/admin/sites/pending");
      setPendingSiteContacts(res.data ?? []);
    } catch (error) {
      console.warn("Failed to fetch pending site_contacts", error);
      setPendingSiteContacts([]);
      Alert.alert("Could not load project sites", "Please check the connection and refresh.");
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, friction: 6, tension: 40, useNativeDriver: true })
      ]).start();
    }
  };

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      fetchPendingSiteContacts();
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = async (id: number) => {
    Alert.alert(
      "Confirm Approval",
      "Approve this project site and activate its site contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: async () => {
            try {
              const response = await apiClient.post(`/admin/sites/${id}/approve`);
              setPendingSiteContacts((prev) => prev.filter((site) => site.id !== id));
              Alert.alert("Approved", response.site_code ? `Project site approved. Site code: ${response.site_code}` : "Project site approved.");
            } catch (e) {
              Alert.alert("Approval failed", e instanceof Error ? e.message : "Please try again.");
            }
          }
        }
      ]
    );
  };

  const StatCard = ({ icon: Icon, title, value, trend, color, delay }: any) => (
    <Animated.View
      style={{
        width: (width - 48) / 2,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 16,
      }}
    >
      <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 16 }}>
        <View className="flex-row justify-between items-start mb-3">
          <LiquidGlassIconBadge size={46} borderRadius={16} variant="light" tintColor={color}>
            <Icon size={22} color={color} />
          </LiquidGlassIconBadge>
          <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp size={12} color="#059669" />
            <Text className="text-emerald-700 text-xs font-bold ml-1">{trend}</Text>
          </View>
        </View>
        <Text className="text-slate-400 text-sm font-semibold mb-1">{title}</Text>
        <Text className="text-slate-800 text-2xl font-black tracking-tight">{value}</Text>
      </LiquidGlassCard>
    </Animated.View>
  );

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <LinearGradient
        colors={['#064e3b', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-16 pb-6 px-6 rounded-b-[40px] shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-6">
          <LiquidGlassIconButton
            onPress={() => router.replace("/")}
            variant="dark"
            size={42}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <LiquidGlassPill
            variant="dark"
            contentStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
          >
            <Activity size={16} color="#34d399" style={{ marginRight: 8 }} />
            <Text className="text-white text-sm font-bold tracking-wider uppercase">Live CRM</Text>
          </LiquidGlassPill>
          <LiquidGlassIconButton variant="dark" size={42}>
            <Bell size={20} color="#ffffff" />
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 10,
                height: 10,
                backgroundColor: "#f43f5e",
                borderRadius: 5,
                borderWidth: 2,
                borderColor: "#047857",
              }}
            />
          </LiquidGlassIconButton>
        </View>

        <View>
          <Text className="text-emerald-100 text-sm font-semibold tracking-widest uppercase mb-1">Overview</Text>
          <Text className="text-white text-3xl font-black tracking-tight">Admin Intelligence</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        
        {/* Pending Approvals Feed */}
        <Animated.View style={{ opacity: fadeAnim }} className="mb-10">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-slate-800 text-xl font-black">Action Required</Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 font-bold text-sm">View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#10b981" className="mt-8" />
          ) : pendingSiteContacts.length === 0 ? (
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              contentStyle={{ padding: 32, alignItems: "center" }}
            >
              <LiquidGlassIconBadge size={68} borderRadius={34} variant="light" tintColor="#10b981">
                <CheckCircle size={36} color="#10b981" />
              </LiquidGlassIconBadge>
              <Text className="text-slate-800 font-bold text-lg mt-4">Inbox Zero</Text>
              <Text className="text-slate-400 text-center mt-2">All project site registrations have been reviewed.</Text>
            </LiquidGlassCard>
          ) : (
            pendingSiteContacts.map((site_contact, index) => (
              <LiquidGlassCard
                key={site_contact.id}
                variant="light"
                borderRadius={24}
                style={{ marginBottom: 16 }}
                contentStyle={{ padding: 20 }}
              >
                <View className="flex-row items-center mb-4">
                  <LiquidGlassIconBadge
                    size={48}
                    borderRadius={24}
                    variant="light"
                    tintColor="#ea580c"
                    style={{ marginRight: 16 }}
                  >
                    <Text className="text-orange-600 font-black text-lg">{site_contact.name.charAt(0)}</Text>
                  </LiquidGlassIconBadge>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-black text-lg">{site_contact.name}</Text>
                    <Text className="text-slate-400 text-sm font-semibold">{site_contact.phone}</Text>
                  </View>
                  <View className="bg-orange-50 px-3 py-1 rounded-full">
                    <Text className="text-orange-600 text-xs font-bold">Pending</Text>
                  </View>
                </View>
                
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: "rgba(255, 255, 255, 0.48)",
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.85)",
                    padding: 12,
                    borderRadius: 16,
                    marginBottom: 16,
                    gap: 16,
                  }}
                >
                  <View className="flex-1 flex-row items-center">
                    <Map size={14} color="#64748b" className="mr-2" />
                    <Text className="text-slate-600 text-xs font-semibold" numberOfLines={1}>{site_contact.locality || site_contact.project_name}, {site_contact.district}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center">
                    <Clock size={14} color="#64748b" className="mr-2" />
                    <Text className="text-slate-600 text-xs font-semibold">Today</Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <LiquidGlassButton
                    variant="light"
                    onPress={() => Alert.alert("Review", "Opening detailed CRM profile...")}
                    style={{ flex: 1 }}
                    contentStyle={{ paddingVertical: 14, paddingHorizontal: 12 }}
                  >
                    <Text className="text-slate-700 font-bold">Review Profile</Text>
                  </LiquidGlassButton>
                  <LiquidGlassButton
                    variant="tinted"
                    tintColor="rgba(5, 150, 105, 0.82)"
                    dropletColor="#34d399"
                    onPress={() => handleApprove(site_contact.id)}
                    style={{ flex: 1 }}
                    contentStyle={{ paddingVertical: 14, paddingHorizontal: 12 }}
                  >
                    <CheckCircle size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold">Approve</Text>
                  </LiquidGlassButton>
                </View>
              </LiquidGlassCard>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </LiquidGlassBackdrop>
  );
}

