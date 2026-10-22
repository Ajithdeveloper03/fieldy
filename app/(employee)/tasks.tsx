import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ListTodo,
  TrendingUp,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeTasksScreen() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("Pending");

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* DRONE MAP BACKGROUND */}
      <ImageBackground
        source={require("../../assets/images/image1.jpg")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(6, 34, 20, 0.6)", "rgba(6, 34, 20, 0.9)", "#062214"]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={{ flex: 1 }}>
          
          {/* HEADER */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
              <ChevronLeft size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>Task Manager</Text>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>
              <Calendar size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 24 }}>
            
            {/* BIG PROGRESS CARD */}
            <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", flexDirection: "row", alignItems: "center", marginBottom: 24 }}>
              <View style={{ flex: 1, backgroundColor: "#15803d", borderRadius: 20, padding: 20, marginRight: 20, shadowColor: "#15803d", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 }}>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 11, letterSpacing: 1, marginBottom: 4 }}>COMPLETION RATE</Text>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 48, lineHeight: 52 }}>85%</Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  <TrendingUp size={14} color="#a7f3d0" />
                  <Text style={{ color: "#a7f3d0", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 4 }}>+12% vs yesterday</Text>
                </View>
              </View>
              
              <View style={{ width: "30%", gap: 16 }}>
                <View>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>12</Text>
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>Completed</Text>
                </View>
                <View>
                  <Text style={{ color: "#fca5a5", fontFamily: "Brandon-Bold", fontSize: 20 }}>2</Text>
                  <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>Pending</Text>
                </View>
              </View>
            </View>

            {/* TABS */}
            <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, padding: 4, marginBottom: 24 }}>
              {["Pending", "Completed"].map((tab) => (
                <TouchableOpacity 
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={{ flex: 1, backgroundColor: activeTab === tab ? "#15803d" : "transparent", paddingVertical: 12, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ color: activeTab === tab ? "#ffffff" : "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 14 }}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>{activeTab} Tasks</Text>

            {/* TASK LIST */}
            <View style={{ gap: 16 }}>
              {activeTab === "Pending" ? (
                <>
                  {/* Work Order 1 */}
                  <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <View style={{ backgroundColor: "rgba(239,68,68,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ color: "#fca5a5", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1 }}>URGENT SLA</Text>
                        </View>
                        <View style={{ backgroundColor: "rgba(56,189,248,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1 }}>WO-10482</Text>
                        </View>
                      </View>
                      <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Due 2:00 PM</Text>
                    </View>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>AHU-4 Chiller Valve Maintenance</Text>
                    <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 12, marginBottom: 8 }}>Metro City Centre • Floor 3</Text>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
                      Perform scheduled coil chemical wash, verify thermostat calibration, and obtain customer OTP verification upon sign-off.
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => router.push("/(employee)/task/10482" as any)}
                      style={{ backgroundColor: "#15803d", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#15803d", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
                    >
                      <ListTodo size={16} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>Open Work Order</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Work Order 2 */}
                  <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <View style={{ backgroundColor: "rgba(59,130,246,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ color: "#93c5fd", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1 }}>FACILITY PM</Text>
                        </View>
                        <View style={{ backgroundColor: "rgba(56,189,248,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                          <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1 }}>WO-10483</Text>
                        </View>
                      </View>
                      <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 12 }}>Due 5:00 PM</Text>
                    </View>
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 4 }}>Fire Sprinkler & Alarm Panel Audit</Text>
                    <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 12, marginBottom: 8 }}>Apex Logistics Hub • Warehouse B</Text>
                    <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
                      Inspect main riser valves, test pressure sensors, log battery backup status, and capture safety photo evidence.
                    </Text>
                    
                    <TouchableOpacity 
                      onPress={() => router.push("/(employee)/task/10483" as any)}
                      style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" }}
                    >
                      <FileText size={16} color="#ffffff" style={{ marginRight: 8 }} />
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>Open Work Order</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 18, textDecorationLine: "line-through" }}>Elevator Safety Audit & Grease Service</Text>
                    <CheckCircle2 size={20} color="#10b981" />
                  </View>
                  <Text style={{ color: "rgba(255,255,255,0.4)", fontFamily: "Brandon-Medium", fontSize: 13, marginBottom: 16 }}>Completed at 09:15 AM • OTP Verified (Code: 4821)</Text>
                  <TouchableOpacity 
                    onPress={() => router.push("/(employee)/task/10480" as any)}
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>View Service Report</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
