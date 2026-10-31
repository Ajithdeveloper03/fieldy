import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Gift,
  Copy,
  Share2,
  Users,
  Award,
  ChevronRight,
  Sprout
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function FarmerReferralScreen() {
  const { t, language } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: "#022c22" }}>
      <StatusBar barStyle="light-content" />

      {/* Cinematic Golden/Emerald Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("../../assets/images/image4.jpg")}
          style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(2, 44, 34, 0.8)", "rgba(2, 44, 34, 0.95)", "#022c22"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glow behind the massive reward card */}
        <View style={{ position: "absolute", top: "15%", left: "50%", marginLeft: -150, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(252, 211, 77, 0.15)" }} />

        <SafeAreaView style={{ flex: 1 }}>
          
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(farmer)/dashboard")} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Referral Bonus</Text>
            <TouchableOpacity style={{ padding: 8, backgroundColor: "rgba(252, 211, 77, 0.2)", borderRadius: 999 }}>
              <Gift size={20} color="#fcd34d" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}>
            
            {/* HERO REWARD CARD */}
            <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "rgba(252, 211, 77, 0.3)", shadowColor: "#fcd34d", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, marginBottom: 32, marginTop: 16 }}>
              
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(252, 211, 77, 0.15)", alignItems: "center", justifyContent: "center", marginBottom: 16, borderWidth: 2, borderColor: "#fcd34d" }}>
                <Award size={40} color="#fcd34d" />
              </View>

              <Text style={{ color: "#fcd34d", fontFamily: "Brandon-Bold", fontSize: 14, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
                Available Bonus Credits
              </Text>
              
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 56, lineHeight: 60, marginBottom: 8 }}>
                ₹2,450
              </Text>
              
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 32 }}>
                Invite fellow farmers to the organic network and earn ₹500 directly in fertilizer credits for every successful registration!
              </Text>

              {/* REFERRAL CODE SECTION */}
              <View style={{ width: "100%", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 20, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>Your Invite Code</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28, letterSpacing: 4 }}>INF-884Q</Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(252, 211, 77, 0.2)", alignItems: "center", justifyContent: "center" }}>
                      <Copy size={20} color="#fcd34d" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#fcd34d", alignItems: "center", justifyContent: "center" }}>
                      <Share2 size={20} color="#022c22" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </View>

            {/* YOUR REFERRALS LIST */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Your Network</Text>
              <View style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: "#34d399", fontFamily: "Brandon-Bold", fontSize: 13 }}>5 Successful</Text>
              </View>
            </View>

            <View style={{ gap: 16 }}>
              {[
                { name: "Suresh Rajan", location: "Annur North", status: "Verified & Active", bonus: "+₹500", date: "Oct 12, 2026", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80" },
                { name: "Muthuvel", location: "Coimbatore South", status: "Pending Audit", bonus: "Pending", date: "Oct 15, 2026", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80" },
                { name: "Kuppusamy", location: "Erode East", status: "Verified & Active", bonus: "+₹500", date: "Sep 28, 2026", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80" },
              ].map((ref, idx) => (
                <View key={idx} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
                  
                  <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#1e293b", overflow: "hidden", marginRight: 16 }}>
                    <Image source={{ uri: ref.img }} style={{ width: "100%", height: "100%" }} />
                  </View>
                  
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>{ref.name}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Sprout size={14} color={ref.status.includes("Verified") ? "#34d399" : "#fbbf24"} />
                      <Text style={{ color: ref.status.includes("Verified") ? "#34d399" : "#fbbf24", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 6 }}>{ref.status}</Text>
                    </View>
                  </View>
                  
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: ref.bonus === "Pending" ? "#94a3b8" : "#fcd34d", fontFamily: "Brandon-Bold", fontSize: 16 }}>{ref.bonus}</Text>
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Brandon-Medium", fontSize: 11, marginTop: 4 }}>{ref.date}</Text>
                  </View>
                
                </View>
              ))}
            </View>

            <TouchableOpacity style={{ marginTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 16 }}>
              <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 15, marginRight: 8 }}>View Full History</Text>
              <ChevronRight size={16} color="#38bdf8" />
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}
