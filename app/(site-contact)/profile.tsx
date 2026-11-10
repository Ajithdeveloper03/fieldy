import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Settings,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Package,
  Sprout,
  User,
  HeartHandshake
} from "lucide-react-native";

export default function SiteContactProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* Decorative Top Banner */}
      <View style={{ position: "absolute", top: 0, width: "100%", height: 220, backgroundColor: "#ecfdf5", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150, paddingTop: Math.max(insets.top, 20) + 16 }}>
        
        {/* HEADER ACTIONS */}
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, marginBottom: 20 }}>
          <TouchableOpacity style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <Settings size={22} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* PROFILE CARD */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#ffffff", padding: 4, shadowColor: "#10b981", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8, marginBottom: 16 }}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=project&q=80" }} style={{ width: "100%", height: "100%", borderRadius: 56 }} />
            <View style={{ position: "absolute", bottom: 0, right: 4, backgroundColor: "#10b981", borderRadius: 12, padding: 4, borderWidth: 2, borderColor: "#ffffff" }}>
              <ShieldCheck size={16} color="#ffffff" />
            </View>
          </View>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 26, marginBottom: 4 }}>Muthuvel S.</Text>
          <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 15, marginBottom: 16 }}>+91 98765 43210</Text>
          
          <View style={{ flexDirection: "row", gap: 32 }}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>3.7</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Site Area</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "#e2e8f0" }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>2</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Projects</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "#e2e8f0" }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 20 }}>100%</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Organic</Text>
            </View>
          </View>
        </View>

        {/* MENU LIST */}
        <View style={{ paddingHorizontal: 24, gap: 16, marginBottom: 32 }}>
          
          <TouchableOpacity onPress={() => router.push("/(site-contact)/site-inspections" as any)} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <MapPin size={22} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Farm & Land Details</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>View acreage, location, GPS</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(site-contact)/site-inspections" as any)} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <Package size={22} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Purchase History</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Track your orders</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(site-contact)/support")} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#fef2f2", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <User size={22} color="#ef4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>My Field Officer</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Contact Robert Walker</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(site-contact)/support")} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <HeartHandshake size={22} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Help & Support</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>FAQs, Chat, Contact</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

        </View>

        {/* LOGOUT BUTTON */}
        <View style={{ paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: "#fef2f2", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 16 }}>Log Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
