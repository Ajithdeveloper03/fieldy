import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  CalendarDays,
  MapPin,
  CheckCircle2,
  Navigation,
  Clock
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
export default function EmployeeVisitsScreen() {
  const { t, language } = useLanguage();
  const visits = [
    { id: 1, type: "INITIAL VISIT", farmer: "Rajesh Kumar", time: "09:00 AM", status: "Completed", image: require("../../assets/images/image1.jpg") },
    { id: 2, type: "FIELD INSPECTION", farmer: "Muthuvel", time: "11:30 AM", status: "In Progress", image: require("../../assets/images/image2.jpg") },
    { id: 3, type: "CROP HEALTH", farmer: "Senthil", time: "02:00 PM", status: "Pending", image: require("../../assets/images/image5.jpg") },
    { id: 4, type: "SOIL TESTING", farmer: "Kuppusamy", time: "04:30 PM", status: "Pending", image: require("../../assets/images/image6.jpg") },
  ];
  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/image2.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(6, 34, 20, 0.7)", "rgba(6, 34, 20, 0.95)", "#062214"]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Daily Itinerary</Text>
              <Text style={{ color: "#4ade80", fontFamily: "Brandon-Medium", fontSize: 12 }}>Route Optimized</Text>
            </View>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
              <CalendarDays size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 32, alignItems: "center", paddingBottom: 160 }}>
            
            <View style={{ width: "100%", alignItems: "center" }}>
              <View style={{ position: "absolute", top: 40, bottom: 40, width: 2, backgroundColor: "rgba(255,255,255,0.1)", left: "50%", marginLeft: -1, zIndex: 0 }} />
              {visits.map((visit) => (
                <TouchableOpacity 
                  key={visit.id} 
                  activeOpacity={0.9}
                  onPress={() => router.push(`/(employee)/visit/${visit.id}` as any)}
                  style={{ width: "100%", flexDirection: "row", alignItems: "center", marginVertical: 32, zIndex: 10 }}
                >
                  <View style={{ flex: 1, alignItems: "flex-end", paddingRight: 56 }}>
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>{visit.type}</Text>
                    <Text style={{ color: visit.status === "Completed" ? "#4ade80" : visit.status === "In Progress" ? "#fbbf24" : "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                      {visit.status}
                    </Text>
                  </View>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#062214", alignItems: "center", justifyContent: "center", position: "absolute", left: "50%", marginLeft: -40, zIndex: 10, borderWidth: visit.status === "Completed" ? 2 : 1, borderColor: visit.status === "Completed" ? "#4ade80" : "rgba(255,255,255,0.2)" }}>
                    <Image source={visit.image} style={{ width: 72, height: 72, borderRadius: 36 }} />
                  </View>
                  <View style={{ flex: 1, alignItems: "flex-start", paddingLeft: 56 }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>{visit.time}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                      <MapPin size={12} color="rgba(255,255,255,0.5)" />
                      <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>{visit.farmer}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={{ position: "absolute", bottom: 24, left: 24, right: 24, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Navigation size={20} color="#4ade80" />
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16, marginLeft: 8 }}>Auto-Routing Active</Text>
              </View>
              <View style={{ backgroundColor: "rgba(74,222,128,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 }}>
                <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>GPS SYNCED</Text>
              </View>
            </View>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 18 }}>
              Your itinerary has been automatically sorted for the most efficient travel time across all sectors today.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}