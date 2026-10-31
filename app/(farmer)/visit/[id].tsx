import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft,
  ZoomIn,
  ZoomOut,
  Leaf,
} from "lucide-react-native";
import { useLanguage } from "../../../context/LanguageContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FarmerVisitReportScreen() {
  const { id } = useLocalSearchParams();
  const { t, language } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar barStyle="light-content" />

      {/* DRONE VIEW BACKGROUND (From Image 1 Right Panel) */}
      <View style={{ flex: 1 }}>
        <Image
          source={require("../../../assets/images/image1.jpg")}
          style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
        <SafeAreaView style={{ flex: 1, justifyContent: "space-between", paddingBottom: 24 }}>
          
          {/* FLOATING HEADER CONTROLS */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity 
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 }}>
              <Image source={require("../../../assets/images/image2.jpg")} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }} />
              <View>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>North Field</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 10 }}>Delta Valley</Text>
              </View>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* FLOATING ZOOM CONTROLS (Right Edge) */}
          <View style={{ position: "absolute", right: 24, top: "25%", gap: 12 }}>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
              <ZoomIn size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}>
              <ZoomOut size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* FLOATING BOTTOM CARD */}
          <View style={{ marginHorizontal: 24, backgroundColor: "#ffffff", borderRadius: 32, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.15, shadowRadius: 32, elevation: 12 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={require("../../../assets/images/image10.jpg")} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }} />
                <View>
                  <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 18 }}>Paddy Field A</Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>Harvest On: Feb 10, 2025</Text>
                </View>
              </View>
              
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Leaf size={16} color="#059669" />
                <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 6 }}>8200 Kg/ha</Text>
              </View>
            </View>

            {/* Inner Image inside the card */}
            <View style={{ height: 160, borderRadius: 24, overflow: "hidden" }}>
              <Image source={require("../../../assets/images/image14.jpg")} style={{ width: "100%", height: "100%" }} />
            </View>

            <TouchableOpacity 
              style={{ backgroundColor: "#059669", borderRadius: 999, paddingVertical: 16, alignItems: "center", marginTop: 24 }}
              onPress={() => router.push("/(farmer)/rate/v1" as any)}
            >
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Rate This Visit</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </View>
  );
}
