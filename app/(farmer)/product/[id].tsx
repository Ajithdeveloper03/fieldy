import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  ShieldCheck,
  Droplet,
  Info,
  ChevronDown,
  ChevronUp,
  Leaf
} from "lucide-react-native";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState("usage");

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER IMAGE (Massive full-bleed) */}
      <View style={{ width: "100%", height: 420, backgroundColor: "#ecfdf5" }}>
        <Image 
          source={require("../../../assets/images/image10.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Top Fade Gradient */}
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0)"]}
          style={{ position: "absolute", top: 0, width: "100%", height: 120 }}
        />
        {/* Bottom Fade Gradient */}
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
          style={{ position: "absolute", bottom: 0, width: "100%", height: 100 }}
        />
        
        {/* Navigation Actions */}
        <SafeAreaView style={{ position: "absolute", top: 0, width: "100%", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 10 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }}>
            <ShoppingCart size={20} color="#0f172a" />
            <View style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#10b981" }} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 0 }}>
        
        {/* TITLE & PRICE */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
            <View style={{ backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginRight: 12 }}>
              <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>100% ORGANIC</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Star size={14} color="#f59e0b" fill="#f59e0b" />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 4 }}>4.8</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>(124 reviews)</Text>
            </View>
          </View>
          
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 32, lineHeight: 38, marginBottom: 8 }}>
            Premium Vetiver{"\n"}Bio-Fertilizer
          </Text>
          
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 28 }}>₹1,200</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginBottom: 6, marginLeft: 4 }}>/ 5 kg bag</Text>
          </View>
        </View>

        {/* METRICS ROW */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32 }}>
          <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 20, padding: 16, alignItems: "center", marginRight: 8, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <ShieldCheck size={24} color="#3b82f6" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>ISO Certified</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 20, padding: 16, alignItems: "center", marginHorizontal: 4, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <Droplet size={24} color="#0ea5e9" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>Water Soluble</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 20, padding: 16, alignItems: "center", marginLeft: 8, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <Leaf size={24} color="#10b981" style={{ marginBottom: 8 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>Soil Safe</Text>
          </View>
        </View>

        <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 16, lineHeight: 24, marginBottom: 32 }}>
          Formulated exclusively for deep-root plants like Vetiver. Enhances root growth by 40% and ensures optimal nutrient absorption during the crucial vegetative state.
        </Text>

        {/* ACCORDION SECTIONS */}
        <View style={{ gap: 16 }}>
          {/* Usage */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, borderColor: expandedSection === "usage" ? "#10b981" : "#f1f5f9", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}>
            <TouchableOpacity onPress={() => setExpandedSection(expandedSection === "usage" ? "" : "usage")} style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
              <Info size={20} color={expandedSection === "usage" ? "#10b981" : "#94a3b8"} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Application & Usage</Text>
              {expandedSection === "usage" ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </TouchableOpacity>
            {expandedSection === "usage" && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                  Mix 2kg per acre with topsoil or dilute in water for drip irrigation. Apply every 45 days for maximum yield. Do not apply directly to leaves during high sun.
                </Text>
              </View>
            )}
          </View>

          {/* Ingredients */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, borderWidth: 1, borderColor: expandedSection === "ingredients" ? "#10b981" : "#f1f5f9", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2 }}>
            <TouchableOpacity onPress={() => setExpandedSection(expandedSection === "ingredients" ? "" : "ingredients")} style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
              <Leaf size={20} color={expandedSection === "ingredients" ? "#10b981" : "#94a3b8"} style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Ingredients</Text>
              {expandedSection === "ingredients" ? <ChevronUp size={20} color="#94a3b8" /> : <ChevronDown size={20} color="#94a3b8" />}
            </TouchableOpacity>
            {expandedSection === "ingredients" && (
              <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22 }}>
                  • 40% Organic Carbon{"\n"}• 2.5% Nitrogen (N){"\n"}• 1.5% Phosphorus (P){"\n"}• Seaweed Extract (Auxins)
                </Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* FLOATING ADD TO CART BOTTOM BAR */}
      <View style={{ position: "absolute", bottom: 0, width: "100%", backgroundColor: "#ffffff", paddingHorizontal: 24, paddingVertical: 20, paddingBottom: Math.max(insets.bottom, 20), borderTopWidth: 1, borderTopColor: "#f1f5f9", flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 15 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", marginRight: 16 }}>
          <TouchableOpacity style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24, lineHeight: 26 }}>-</Text>
          </TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, width: 24, textAlign: "center" }}>1</Text>
          <TouchableOpacity style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24, lineHeight: 26 }}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={{ flex: 1, backgroundColor: "#0f172a", borderRadius: 16, height: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#0f172a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}>
          <ShoppingCart size={20} color="#ffffff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Add to Cart - ₹1,200</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
