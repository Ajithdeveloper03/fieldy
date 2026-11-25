import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { router } from "expo-router";
import {
  CheckCircle,
  ChevronLeft,
  Activity,
  Bell,
  Map,
  Clock,
} from "lucide-react-native";
import { apiClient } from "../../api/client";
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

export default function AdminDashboardScreen() {
  const [pendingSiteContacts, setPendingSiteContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiClient.get("/admin/farmers/pending");
        if (active) {
          setPendingSiteContacts(Array.isArray(res?.farmers) ? res.farmers : Array.isArray(res?.data) ? res.data : []);
        }
      } catch {
        if (active) {
          setPendingSiteContacts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
          Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [fadeAnim]);

  const handleApprove = (id: number) => {
    Alert.alert(
      "Confirm Approval",
      "Accept this project site and activate its site contact?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          style: "default",
          onPress: async () => {
            try {
              const response = await apiClient.post(`/admin/farmers/${id}/approve`, {});
              setPendingSiteContacts((prev) => prev.filter((site) => site.id !== id));
              Alert.alert(
                "Accepted",
                response?.farmer_code
                  ? `Project site approved. Code: ${response.farmer_code}`
                  : "Project site approved."
              );
            } catch (e) {
              Alert.alert("Approval failed", e instanceof Error ? e.message : "Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar style="light" />

      <LinearGradient
        colors={["#064e3b", "#047857"]}
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
          </LiquidGlassIconButton>
        </View>

        <View>
          <Text className="text-emerald-100 text-sm font-semibold tracking-widest uppercase mb-1">Summary</Text>
          <Text className="text-white text-3xl font-black tracking-tight">Admin dashboard</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }} className="mb-10">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <Text className="text-slate-800 text-xl font-black">Pending Site Approvals</Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text className="text-emerald-600 font-bold text-sm">{pendingSiteContacts.length} pending</Text>
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
            pendingSiteContacts.map((siteContact) => (
              <LiquidGlassCard
                key={siteContact.id}
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
                    <Text className="text-orange-600 font-black text-lg">
                      {(siteContact.name || "S").charAt(0)}
                    </Text>
                  </LiquidGlassIconBadge>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-black text-lg">{siteContact.name}</Text>
                    <Text className="text-slate-400 text-sm font-semibold">{siteContact.phone}</Text>
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
                    <Map size={14} color="#64748b" />
                    <Text className="text-slate-600 text-xs font-semibold ml-2" numberOfLines={1}>
                      {siteContact.locality || siteContact.village || siteContact.district || "Assigned Zone"}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Clock size={14} color="#64748b" />
                    <Text className="text-slate-600 text-xs font-semibold ml-1">Pending</Text>
                  </View>
                </View>

                <LiquidGlassButton
                  variant="tinted"
                  tintColor="rgba(5, 150, 105, 0.86)"
                  dropletColor="#34d399"
                  onPress={() => handleApprove(siteContact.id)}
                  contentStyle={{ paddingVertical: 14 }}
                >
                  <CheckCircle size={18} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold">Approve Site</Text>
                </LiquidGlassButton>
              </LiquidGlassCard>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </LiquidGlassBackdrop>
  );
}
