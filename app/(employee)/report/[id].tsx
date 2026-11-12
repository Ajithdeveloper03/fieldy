import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import {
  ChevronLeft,
  FileText,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  Beaker,
  ThermometerSun,
  Share2
} from "lucide-react-native";

export default function EmployeeReportDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/reports")} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Report #{id || "8842"}</Text>
          <TouchableOpacity style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <Share2 size={20} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          {/* Metadata Card */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, marginBottom: 24, marginTop: 8 }}>
            
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e2e8f0", overflow: "hidden", marginRight: 16 }}>
                <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80" }} style={{ width: "100%", height: "100%" }} />
              </View>
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Ramesh Kumar</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>SiteContact ID: SITE-201</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11 }}>APPROVED</Text>
                </View>
              </View>
            </View>

            <View style={{ backgroundColor: "#f8fafc", borderRadius: 16, padding: 16, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Calendar size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>Submitted: 12 Jan 2026, 11:45 AM</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>Location: Annur North, Farm A</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ShieldCheck size={16} color="#64748b" style={{ width: 24 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>Auditor: Field Officer (FO-902)</Text>
              </View>
            </View>

          </View>

          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Advisory Details</Text>

          {/* Issue Section */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#fee2e2" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 8 }}>Observed Issues</Text>
            </View>
            <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24 }}>
              Found an unguarded floor opening in the southern sector. Install a compliant barrier immediately and record a follow-up safety inspection.
            </Text>
          </View>

          {/* Recommendation Section */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#dcfce7" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Beaker size={20} color="#10b981" />
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 8 }}>Agronomy Recommendations</Text>
            </View>
            <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24, marginBottom: 16 }}>
              1. Barricade the opening and notify the site supervisor immediately.{"\n"}
              2. Apply a 1% Bordeaux mixture spray to the affected leaves immediately.{"\n"}
              3. Proceed with the scheduled Nitrogen top-dressing using organic neem-cake mix next week.
            </Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden" }}>
                <Image source={require("../../../assets/images/image2.jpg")} style={{ width: "100%", height: "100%" }} />
              </View>
              <View style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden" }}>
                <Image source={require("../../../assets/images/image5.jpg")} style={{ width: "100%", height: "100%" }} />
              </View>
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
