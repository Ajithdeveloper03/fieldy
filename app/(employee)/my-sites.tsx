import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiClient } from "../../api/client";
import {
  ChevronLeft,
  Search,
  MapPin,
  Sprout,
  Phone,
  MessageSquare,
  MoreVertical,
  Activity,
  ArrowRight,
  Filter
} from "lucide-react-native";

export default function EmployeeMySiteContactsScreen() {
  const [sites, setSites] = useState<any[]>([]);
  useEffect(() => { apiClient.get("/employee/sites").then((response) => setSites(response.sites ?? [])).catch(() => Alert.alert("Unable to load sites", "Please check your connection and try again.")); }, []);


  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>My Project Sites</Text>
          <TouchableOpacity style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <Filter size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}>
            <Search size={20} color="#94a3b8" />
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 16, marginLeft: 12, flex: 1 }}>Search by project name or location...</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 20 }}>
          
          {sites.map((site) => (
            <TouchableOpacity 
              key={site.id}
              activeOpacity={0.9}
              onPress={() => router.push(`/(employee)/site/${site.site_contact_id}` as any)}
              style={{ backgroundColor: "#ffffff", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 8 }}
            >
              {/* Top Banner Image */}
              <View style={{ height: 120 }}>
                <Image source={require("../../assets/images/image5.jpg")} style={{ width: "100%", height: "100%" }} />
                <View style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 999, padding: 6 }}>
                  <MoreVertical size={20} color="#ffffff" />
                </View>
                
                {/* Status Badge Over Image */}
                <View style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: site.permit_status === "verified" ? "#10b981" : "#f59e0b", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, flexDirection: "row", alignItems: "center" }}>
                  <Activity size={14} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>{site.permit_status || "Permit pending"}</Text>
                </View>
              </View>

              <View style={{ padding: 20 }}>
                {/* Profile Floating Avatar */}
                <View style={{ marginTop: -44, marginBottom: 12, width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "#ffffff", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
                  <Image source={{ uri: require("../../assets/images/image5.jpg") }} style={{ width: "100%", height: "100%" }} />
                </View>

                {/* Info Text */}
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, marginBottom: 4 }}>{site.name}</Text>
                
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6 }}>{site.site_address || "Address pending"} • <Text style={{ color: "#0284c7" }}>{site.site_code || "Pending approval"}</Text></Text>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: "flex-start", marginBottom: 20 }}>
                  <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 13 }}>{site.site_area ? `${site.site_area} sq ft` : "Construction project"}</Text>
                </View>

                {/* Bottom Action Icons */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 }}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => site.phone ? Linking.openURL(`tel:${site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                    >
                      <Phone size={18} color="#0f172a" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => site.phone ? Linking.openURL(`tel:${site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                    >
                      <MessageSquare size={18} color="#0f172a" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push(`/(employee)/site/${site.site_contact_id}` as any)}
                    style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#0f172a", borderRadius: 12 }}
                  >
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginRight: 8 }}>View Project Site</Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
