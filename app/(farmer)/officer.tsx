import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Phone,
  MessageSquare,
  MapPin,
  CalendarDays,
  CheckCircle2,
  Star,
  Clock
} from "lucide-react-native";

export default function OfficerScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* CLEAN PROFILE HEADER */}
      <View style={{ width: "100%", backgroundColor: "#ffffff", paddingBottom: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 5 }}>
        <SafeAreaView edges={["top"]} style={{ paddingTop: 10 }}>
          
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(farmer)/dashboard")} style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 16 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center", paddingHorizontal: 24 }}>
            <View style={{ width: 110, height: 110, borderRadius: 55, backgroundColor: "#f1f5f9", padding: 4, marginBottom: 16 }}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }} 
                style={{ width: "100%", height: "100%", borderRadius: 55 }} 
              />
              <View style={{ position: "absolute", bottom: 4, right: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: "#10b981", borderWidth: 3, borderColor: "#ffffff" }} />
            </View>
            
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 26, marginBottom: 4 }}>Robert Walker</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 15, marginBottom: 16 }}>Senior Agronomy Officer (ID: FO-902)</Text>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => Linking.openURL("tel:+919876543210")} style={{ flex: 1, backgroundColor: "#10b981", paddingVertical: 14, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#10b981", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }}>
                <Phone size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>Call Officer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/(farmer)/support")} style={{ flex: 1, backgroundColor: "#f1f5f9", paddingVertical: 14, borderRadius: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={18} color="#0f172a" style={{ marginRight: 8 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>

        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 32 }}>
        
        {/* STATS ROW */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32 }}>
          <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 20, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, marginRight: 8, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
              <Star size={16} color="#f59e0b" fill="#f59e0b" style={{ marginRight: 4 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>4.9</Text>
            </View>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Rating</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 20, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, marginHorizontal: 4, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 4 }}>24</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Your Visits</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 20, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2, marginLeft: 8, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 4 }}>8 Yrs</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Experience</Text>
          </View>
        </View>

        {/* UPCOMING VISIT */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Next Scheduled Visit</Text>
        <View style={{ backgroundColor: "#0f172a", borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <View>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>Bio-Fertilizer Audit</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={14} color="#94a3b8" />
                <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 6 }}>Sector 1 (Vetiver)</Text>
              </View>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.1)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 12 }}>UPCOMING</Text>
            </View>
          </View>
          
          <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 16 }}>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <CalendarDays size={18} color="#10b981" style={{ marginRight: 10 }} />
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11, marginBottom: 2 }}>DATE</Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>Tomorrow, Oct 10</Text>
              </View>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 16 }} />
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
              <Clock size={18} color="#f59e0b" style={{ marginRight: 10 }} />
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11, marginBottom: 2 }}>TIME</Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>11:30 AM</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PAST VISITS */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Past Visits</Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/(farmer)/rate")}>
              <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 14 }}>Rate Last</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(farmer)/history")}>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 14 }}>View All</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
          
          {/* Visit 1 */}
          <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 20 }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <CheckCircle2 size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 2 }}>Routine Inspection</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Oct 2, 2026 • Sector 2</Text>
            </View>
          </View>

          <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9", marginBottom: 20 }} />

          {/* Visit 2 */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <CheckCircle2 size={20} color="#10b981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 2 }}>Soil Quality Test</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Sep 15, 2026 • Sector 1</Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
