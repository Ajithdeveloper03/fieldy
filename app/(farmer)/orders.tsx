import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  ChevronRight
} from "lucide-react-native";

export default function FarmerOrdersScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Cinematic Drone Map Background */}
      <View style={StyleSheet.absoluteFill}>
        <Image
          source={require("../../assets/images/image2.jpg")}
          style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(6, 34, 20, 0.8)", "rgba(6, 34, 20, 0.95)", "#062214"]}
          locations={[0, 0.3, 1]}
          style={StyleSheet.absoluteFill}
        />
        
        {/* Glow behind the active order */}
        <View style={{ position: "absolute", top: "20%", left: "50%", marginLeft: -150, width: 300, height: 300, borderRadius: 150, backgroundColor: "rgba(16, 185, 129, 0.15)" }} />

        <SafeAreaView style={{ flex: 1 }}>
          
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16, paddingBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(farmer)/dashboard")} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>Order History</Text>
            <TouchableOpacity style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
              <Package size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}>
            
            {/* ACTIVE TRACKING CARD */}
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>In Transit</Text>
            <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, marginBottom: 32 }}>
              
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Order #902-BX</Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginTop: 4 }}>Arriving Today</Text>
                </View>
                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(16, 185, 129, 0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#10b981" }}>
                  <Truck size={24} color="#10b981" />
                </View>
              </View>

              {/* Order Items */}
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 24, backgroundColor: "rgba(0,0,0,0.2)", padding: 12, borderRadius: 16 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, overflow: "hidden", marginRight: 12 }}>
                  <Image source={require("../../assets/images/image10.jpg")} style={{ width: "100%", height: "100%" }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Organic Bio-Fertilizer</Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13 }}>Qty: 2 • ₹1,200</Text>
                </View>
              </View>

              {/* Delivery Timeline */}
              <View style={{ marginLeft: 8 }}>
                {/* Step 1 */}
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                  <View style={{ alignItems: "center", marginRight: 16 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={12} color="#062214" />
                    </View>
                    <View style={{ width: 2, height: 30, backgroundColor: "#10b981", marginTop: 4 }} />
                  </View>
                  <View style={{ flex: 1, marginTop: -2 }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>Order Processed</Text>
                    <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Oct 8, 09:30 AM</Text>
                  </View>
                </View>
                {/* Step 2 */}
                <View style={{ flexDirection: "row", marginBottom: 20 }}>
                  <View style={{ alignItems: "center", marginRight: 16 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" }}>
                      <CheckCircle2 size={12} color="#062214" />
                    </View>
                    <View style={{ width: 2, height: 30, backgroundColor: "rgba(255,255,255,0.1)", marginTop: 4 }} />
                  </View>
                  <View style={{ flex: 1, marginTop: -2 }}>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>Out for Delivery</Text>
                    <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>Oct 9, 07:15 AM</Text>
                  </View>
                </View>
                {/* Step 3 */}
                <View style={{ flexDirection: "row" }}>
                  <View style={{ alignItems: "center", marginRight: 16 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)" }} />
                  </View>
                  <View style={{ flex: 1, marginTop: -2 }}>
                    <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Bold", fontSize: 15 }}>Delivery at Farm Location</Text>
                    <Text style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Pending Receipt</Text>
                  </View>
                </View>
              </View>

            </View>

            {/* PAST ORDERS */}
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Previous Orders</Text>
            
            <View style={{ gap: 16 }}>
              {[
                { id: "884-AX", date: "Sep 22, 2026", items: "Neem Oil x4, Vetiver Seeds x10", total: "₹3,450", status: "Delivered", color: "#10b981", icon: CheckCircle2 },
                { id: "882-CX", date: "Aug 15, 2026", items: "Lime Saplings x20", total: "₹5,200", status: "Delivered", color: "#10b981", icon: CheckCircle2 },
                { id: "875-BX", date: "Jul 30, 2026", items: "Organic Growth Promoter x2", total: "₹950", status: "Cancelled", color: "#ef4444", icon: Clock },
              ].map((order, idx) => (
                <TouchableOpacity key={idx} style={{ backgroundColor: "rgba(255,255,255,0.03)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <View>
                      <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>Order #{order.id}</Text>
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 4 }}>{order.total}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: `${order.color}20`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <order.icon size={12} color={order.color} style={{ marginRight: 6 }} />
                      <Text style={{ color: order.color, fontFamily: "Brandon-Bold", fontSize: 11, textTransform: "uppercase" }}>{order.status}</Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flex: 1, marginRight: 16 }}>
                      <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 20 }} numberOfLines={1}>{order.items}</Text>
                    </View>
                    <Text style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Brandon-Bold", fontSize: 12 }}>{order.date}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </SafeAreaView>
      </View>
    </View>
  );
}
