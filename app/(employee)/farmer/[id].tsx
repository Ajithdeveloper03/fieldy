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
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  Phone,
  MessageSquare,
  Sprout,
  Calendar,
  Activity,
  FileText,
  Clock,
  MoreVertical
} from "lucide-react-native";

export default function EmployeeFarmerProfileScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      {/* Hero Header with Farm Image */}
      <View style={{ height: 300 }}>
        <Image source={require("../../../assets/images/image5.jpg")} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "rgba(0,0,0,0.2)", "#f8fafc"]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" }}>
              <MoreVertical size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, marginTop: -60 }}>
        
        {/* Profile Card */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 32, padding: 24, marginHorizontal: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 10, alignItems: "center" }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: "#ffffff", overflow: "hidden", backgroundColor: "#e2e8f0", marginTop: -60, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }} style={{ width: "100%", height: "100%" }} />
          </View>
          
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 28, marginBottom: 4 }}>Apex Cyber Tower</Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <MapPin size={14} color="#64748b" />
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6 }}>Tidel Park Road, Block B • 4.2km</Text>
          </View>

          <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
            <TouchableOpacity style={{ flex: 1, backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <Phone size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>Call Facility Head</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: 16, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <MessageSquare size={18} color="#0f172a" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>Site Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Facility & SLA Info */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginHorizontal: 24, marginTop: 32, marginBottom: 16 }}>Facility Specification</Text>
        <View style={{ flexDirection: "row", marginHorizontal: 20, gap: 16 }}>
          <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 }}>
            <Activity size={24} color="#0f172a" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13 }}>Core Service Focus</Text>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 4 }}>HVAC & MEP</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 }}>
            <Activity size={24} color="#10b981" style={{ marginBottom: 12 }} />
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13 }}>SLA Status</Text>
            <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 4 }}>Active (100%)</Text>
          </View>
        </View>

        {/* Recent Reports Timeline */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginHorizontal: 24, marginTop: 32, marginBottom: 16 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Visit History</Text>
          <TouchableOpacity onPress={() => router.push("/(employee)/reports")}>
            <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 13 }}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 20, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 }}>
          
          <View style={{ flexDirection: "row", marginBottom: 20 }}>
            <View style={{ alignItems: "center", marginRight: 16 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#10b981", marginBottom: 4 }} />
              <View style={{ width: 2, flex: 1, backgroundColor: "#e2e8f0" }} />
            </View>
            <View style={{ flex: 1, paddingBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Routine Inspection</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>12 Jan</Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                Soil moisture is excellent. Recommended mild nitrogen top-dressing.
              </Text>
              <TouchableOpacity onPress={() => router.push("/(employee)/report/1")} style={{ flexDirection: "row", alignItems: "center", marginTop: 12, alignSelf: "flex-start", backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
                <FileText size={14} color="#0284c7" />
                <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 6 }}>Open Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", marginRight: 16 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#cbd5e1" }} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Initial Assessment</Text>
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>28 Dec</Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                First registration visit. Mapped farm boundaries.
              </Text>
            </View>
          </View>

        </View>

        {/* Schedule Next Visit Button */}
        <TouchableOpacity style={{ marginHorizontal: 20, marginTop: 24, backgroundColor: "#0f172a", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <Calendar size={20} color="#ffffff" style={{ marginRight: 12 }} />
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Schedule Next Visit</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
