import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  X,
  BarChart2,
  CheckCircle2,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function SiteContactMenuScreen() {
  const { t, language } = useLanguage();

  const flowSteps = [
    { id: 1, stage: "PREPARATION", label: "Plowing", time: "Week 1", image: require("../../assets/images/image10.jpg") },
    { id: 2, stage: "STRUCTURE", label: "Foundation work", time: "Week 2", stat: "Inspection due", image: require("../../assets/images/image14.jpg") },
    { id: 3, stage: "MAINTENANCE", label: "Fertilizing", time: "Week 4", stat: "Organic", image: require("../../assets/images/image2.jpg") },
    { id: 4, stage: "HANDOVER", label: "Final review", time: "Week 12", image: require("../../assets/images/image1.jpg") },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#fef08a" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
          <TouchableOpacity onPress={() => router.push("/(site-contact)/dashboard")} style={{ padding: 8 }}>
            <X size={24} color="#000000" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 18 }}>Seasonal Flow</Text>
            <Text style={{ color: "#4b5563", fontFamily: "Brandon-Medium", fontSize: 12 }}>Your activity drives the yield</Text>
          </View>
          <TouchableOpacity style={{ padding: 8 }}>
            <BarChart2 size={24} color="#000000" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40, alignItems: "center" }}>
          
          {/* TIMELINE CONTAINER */}
          <View style={{ width: "100%", alignItems: "center" }}>
            
            {/* The vertical line running behind everything */}
            <View style={{ position: "absolute", top: 40, bottom: 40, width: 2, backgroundColor: "#d1d5db", left: "50%", marginLeft: -1, zIndex: 0 }} />

            {flowSteps.map((step, index) => (
              <View key={step.id} style={{ width: "100%", flexDirection: "row", alignItems: "center", marginVertical: 32, zIndex: 10 }}>
                
                {/* Left Side (Stage & Label) */}
                <View style={{ flex: 1, alignItems: "flex-end", paddingRight: 60 }}>
                  <Text style={{ color: "#4b5563", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1, marginBottom: 4 }}>{step.stage}</Text>
                  <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 22 }}>{step.label}</Text>
                </View>

                {/* Center Circle Image */}
                <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", position: "absolute", left: "50%", marginLeft: -50, zIndex: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 8 }}>
                  <Image source={step.image} style={{ width: 92, height: 92, borderRadius: 46 }} />
                </View>

                {/* Right Side (Time & Stat) */}
                <View style={{ flex: 1, alignItems: "flex-start", paddingLeft: 60 }}>
                  <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 20 }}>{step.time}</Text>
                  {step.stat && (
                    <Text style={{ color: "#4b5563", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>{step.stat}</Text>
                  )}
                </View>
                
              </View>
            ))}

          </View>

        </ScrollView>

        {/* BOTTOM ADAPTIVE CARD */}
        <View style={{ marginHorizontal: 32, marginBottom: 120, backgroundColor: "#ffffff", borderRadius: 32, padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <CheckCircle2 size={16} color="#000000" />
            <Text style={{ color: "#000000", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 6 }}>Auto-adaptive</Text>
          </View>
          <Text style={{ color: "#4b5563", fontFamily: "Brandon-Medium", fontSize: 16 }}>Smart scheduling & weather pauses</Text>
        </View>

      </SafeAreaView>
    </View>
  );
}
