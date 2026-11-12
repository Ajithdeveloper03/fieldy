import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Animated, Dimensions, Platform } from "react-native";
import { router } from "expo-router";
import { Users, CheckCircle, ChevronLeft, TrendingUp, Activity, Bell, Target, Leaf, Map, DollarSign, Clock } from "lucide-react-native";
import { apiClient } from "../../api/client";
import { useLanguage } from "../../context/LanguageContext";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";

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
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
    fetchPendingSiteContacts();
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
        transform: [{ translateY: slideAnim }] 
      }} 
      className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 mb-4"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View style={{ backgroundColor: `${color}15` }} className="p-3 rounded-2xl">
          <Icon size={22} color={color} />
        </View>
        <View className="flex-row items-center bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} color="#059669" />
          <Text className="text-emerald-700 text-xs font-bold ml-1">{trend}</Text>
        </View>
      </View>
      <Text className="text-slate-400 text-sm font-semibold mb-1">{title}</Text>
      <Text className="text-slate-800 text-2xl font-black tracking-tight">{value}</Text>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <StatusBar style="light" />
      
      {/* Premium Header */}
      <LinearGradient
        colors={['#064e3b', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-16 pb-6 px-6 rounded-b-[40px] shadow-lg"
      >
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity 
            onPress={() => router.replace("/")} 
            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">
            <Activity size={16} color="#34d399" className="mr-2" />
            <Text className="text-white text-sm font-bold tracking-wider uppercase">Live CRM</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-white/20 items-center justify-center relative backdrop-blur-md">
            <Bell size={20} color="#ffffff" />
            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-[#047857]" />
          </TouchableOpacity>
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
            <View className="bg-white rounded-3xl p-8 items-center border border-slate-100">
              <CheckCircle size={48} color="#10b981" />
              <Text className="text-slate-800 font-bold text-lg mt-4">Inbox Zero</Text>
              <Text className="text-slate-400 text-center mt-2">All project site registrations have been reviewed.</Text>
            </View>
          ) : (
            pendingSiteContacts.map((site_contact, index) => (
              <View key={site_contact.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center mr-4 border-2 border-white shadow-sm">
                    <Text className="text-orange-600 font-black text-lg">{site_contact.name.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-black text-lg">{site_contact.name}</Text>
                    <Text className="text-slate-400 text-sm font-semibold">{site_contact.phone}</Text>
                  </View>
                  <View className="bg-orange-50 px-3 py-1 rounded-full">
                    <Text className="text-orange-600 text-xs font-bold">Pending</Text>
                  </View>
                </View>
                
                <View className="flex-row bg-slate-50 p-3 rounded-2xl mb-4 space-x-4">
                  <View className="flex-1 flex-row items-center">
                    <Map size={14} color="#64748b" className="mr-2" />
                    <Text className="text-slate-600 text-xs font-semibold" numberOfLines={1}>{site_contact.locality || site_contact.project_name}, {site_contact.district}</Text>
                  </View>
                  <View className="flex-1 flex-row items-center">
                    <Clock size={14} color="#64748b" className="mr-2" />
                    <Text className="text-slate-600 text-xs font-semibold">Today</Text>
                  </View>
                </View>

                <View className="flex-row space-x-3">
                  <TouchableOpacity 
                    className="flex-1 bg-slate-100 py-3.5 rounded-2xl items-center"
                    onPress={() => Alert.alert("Review", "Opening detailed CRM profile...")}
                  >
                    <Text className="text-slate-700 font-bold">Review Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 bg-[#059669] py-3.5 rounded-2xl items-center flex-row justify-center"
                    onPress={() => handleApprove(site_contact.id)}
                  >
                    <CheckCircle size={18} color="#ffffff" className="mr-2" />
                    <Text className="text-white font-bold">Approve</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

