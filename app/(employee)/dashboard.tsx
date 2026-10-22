import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Bell,
  MapPin,
  UserPlus,
  CalendarDays,
  FileText,
  ClipboardCheck,
  Users,
  CheckCircle2,
  Navigation,
  LogOut,
  Camera,
  History,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Boxes,
  AlertOctagon,
} from "lucide-react-native";
import { useLanguage, LanguageTogglePill } from "../../context/LanguageContext";

export default function EmployeeDashboardScreen() {
  const { t, language } = useLanguage();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [userName, setUserName] = useState("Field Officer");

  useEffect(() => {
    (async () => {
      const status = await AsyncStorage.getItem("isClockedIn");
      const name = await AsyncStorage.getItem("userName");
      if (status === "true") setIsClockedIn(true);
      if (name) setUserName(name);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="light-content" />

      {/* AMBIENT HEADER BACKGROUND */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 340, overflow: "hidden", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }}>
        <ImageBackground
          source={require("../../assets/images/image3.jpg")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(15, 23, 42, 0.8)", "rgba(15, 23, 42, 0.65)", "#0f172a"]}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, paddingTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity onPress={() => router.push("/(employee)/profile")} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: "#38bdf8", overflow: "hidden", marginRight: 12 }}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }} style={{ width: "100%", height: "100%" }} />
            </TouchableOpacity>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>{userName}</Text>
                <ShieldCheck size={16} color="#38bdf8" style={{ marginLeft: 6 }} />
              </View>
              <View style={{ backgroundColor: "rgba(56,189,248,0.2)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, alignSelf: "flex-start", marginTop: 4 }}>
                <Text style={{ color: "#38bdf8", fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 1 }}>OFFICER ID: FO-902</Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LanguageTogglePill />
            <TouchableOpacity onPress={() => router.push("/(employee)/notifications")} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginLeft: 8 }}>
              <Bell size={20} color="#ffffff" />
              <View style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120, paddingTop: 24 }}>
          
          {/* DUTY STATUS BOARD */}
          <View style={{ backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 32, padding: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", marginBottom: 32 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <View>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 12, letterSpacing: 1 }}>CURRENT DUTY STATUS</Text>
                <Text style={{ color: isClockedIn ? "#4ade80" : "#f87171", fontFamily: "Brandon-Bold", fontSize: 24 }}>{isClockedIn ? "ON DUTY" : "OFF DUTY"}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push(isClockedIn ? "/(employee)/attendance/clock-out" : "/(employee)/attendance/clock-in")}
                style={{ backgroundColor: isClockedIn ? "rgba(239,68,68,0.2)" : "rgba(74,222,128,0.2)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, flexDirection: "row", alignItems: "center" }}
              >
                {isClockedIn ? <LogOut size={16} color="#fca5a5" /> : <CheckCircle2 size={16} color="#4ade80" />}
                <Text style={{ color: isClockedIn ? "#fca5a5" : "#4ade80", fontFamily: "Brandon-Bold", fontSize: 14, marginLeft: 6 }}>
                  {isClockedIn ? "Clock Out" : "Clock In"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 20, padding: 16 }}>
              <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <Users size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>12</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 11 }}>Assigned</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center", borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.1)" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <CheckCircle2 size={14} color="#4ade80" style={{ marginRight: 4 }} />
                  <Text style={{ color: "#4ade80", fontFamily: "Brandon-Bold", fontSize: 20 }}>4</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 11 }}>Visited</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                  <MapPin size={14} color="#fca5a5" style={{ marginRight: 4 }} />
                  <Text style={{ color: "#fca5a5", fontFamily: "Brandon-Bold", fontSize: 20 }}>8</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Brandon-Medium", fontSize: 11 }}>Pending</Text>
              </View>
            </View>
          </View>

          {/* QUICK ACTIONS ROW */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32 }}>
            <TouchableOpacity onPress={() => router.push("/(employee)/tasks")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, marginRight: 6 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#ede9fe", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <ClipboardCheck size={24} color="#7c3aed" />
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}>Work{'\n'}Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(employee)/register-farmer/step1")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, marginHorizontal: 4 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <UserPlus size={24} color="#0284c7" />
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}>Onboard{'\n'}Client</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(employee)/my-farmers")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, marginHorizontal: 4 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Users size={24} color="#16a34a" />
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}>My Sites{'\n'}& Clients</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(employee)/report/select-method")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, marginLeft: 6 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#fef08a", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <FileText size={24} color="#ca8a04" />
              </View>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}>Service{'\n'}Report</Text>
            </TouchableOpacity>
          </View>

          {/* SECONDARY FIELD TOOLKIT (Expenses, Inventory, Safety SOS) */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32, gap: 10 }}>
            <TouchableOpacity onPress={() => router.push("/(employee)/expenses")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Receipt size={18} color="#16a34a" />
              </View>
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }}>Claim Bills</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>Fuel & Meals</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(employee)/inventory")} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 20, padding: 14, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: "#e0f2fe", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                <Boxes size={18} color="#0284c7" />
              </View>
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }}>Boot Stock</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>Kit & Tools</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(employee)/sos")} style={{ width: 52, height: 66, backgroundColor: "#fee2e2", borderRadius: 20, alignItems: "center", justifyContent: "center", shadowColor: "#ef4444", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 }}>
              <AlertOctagon size={24} color="#ef4444" />
              <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 10, marginTop: 4 }}>SOS</Text>
            </TouchableOpacity>
          </View>

          {/* ASSIGNED FACILITIES (Horizontal List) */}
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Assigned Facilities</Text>
              <TouchableOpacity onPress={() => router.push("/(employee)/my-farmers")}>
                <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 13, textTransform: "uppercase" }}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }}>
              {[
                { id: "1", name: "Metro Tower", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80" },
                { id: "2", name: "Apex Logistics", img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80" },
                { id: "3", name: "Grand Mall", img: "https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=150&auto=format&fit=crop&q=80" },
                { id: "4", name: "Horizon Hub", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80" },
              ].map((facility) => (
                <TouchableOpacity key={facility.id} onPress={() => router.push(`/(employee)/farmer/${facility.id}` as any)} style={{ alignItems: "center", marginRight: 16 }}>
                  <View style={{ width: 64, height: 64, borderRadius: 20, borderWidth: 2, borderColor: "#0284c7", overflow: "hidden", marginBottom: 8 }}>
                    <Image source={{ uri: facility.img }} style={{ width: "100%", height: "100%" }} />
                  </View>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 13 }}>{facility.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* TODAY'S FACILITY VISITS & AUDITS */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>Today's Service Visits</Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/map")}>
              <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 13, textTransform: "uppercase" }}>View Map</Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16, marginBottom: 32 }}>
            {/* Visit Item 1 (Pending) */}
            <TouchableOpacity onPress={() => router.push("/(employee)/visit/1")} activeOpacity={0.9} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Apex Cyber Tower</Text>
                    <View style={{ backgroundColor: "#fee2e2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8 }}>
                      <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 10 }}>HIGH PRIORITY</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>Tidel Park Road, Block B (4.2km)</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 14 }}>11:30 AM</Text>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 11 }}>Scheduled</Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => router.push("/(employee)/visit/tracking")} style={{ flex: 1, backgroundColor: "#f1f5f9", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Navigation size={16} color="#0f172a" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14 }}>Navigate</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/(employee)/visit/check-in")} style={{ flex: 1, backgroundColor: "#10b981", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Camera size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>Check-in</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Visit Item 2 (Completed) */}
            <View style={{ backgroundColor: "#f8fafc", borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#e2e8f0" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 18, textDecorationLine: "line-through" }}>Metro Logistics Hub</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <Text style={{ color: "#10b981", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>Audit Complete at 09:45 AM</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity onPress={() => router.push("/(employee)/visit/report")} style={{ backgroundColor: "#e2e8f0", borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                <FileText size={16} color="#475569" style={{ marginRight: 6 }} />
                <Text style={{ color: "#475569", fontFamily: "Brandon-Bold", fontSize: 14 }}>View Report</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PERFORMANCE BANNER (New Link) */}
          <TouchableOpacity onPress={() => router.push("/(employee)/performance")} style={{ backgroundColor: "#0284c7", borderRadius: 24, padding: 20, marginBottom: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between", overflow: "hidden" }}>
            <View style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>My Performance</Text>
              <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>You&apos;re at 86% Efficiency Level • 480 Pts</Text>
            </View>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" }}>
              <ArrowRight size={20} color="#0284c7" />
            </View>
          </TouchableOpacity>

          {/* MORE TOOLS GRID */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Management Tools</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
            {[
              { title: "Work Orders", icon: ClipboardCheck, color: "#8b5cf6", route: "/(employee)/tasks" },
              { title: "Shift Calendar", icon: CalendarDays, color: "#ec4899", route: "/(employee)/calendar" },
              { title: "Daily Attendance", icon: CheckCircle2, color: "#10b981", route: "/(employee)/attendance-hub" },
              { title: "Sites & Clients", icon: Users, color: "#3b82f6", route: "/(employee)/my-farmers" },
              { title: "Onboard Site", icon: UserPlus, color: "#f59e0b", route: "/(employee)/register-farmer/step1" },
              { title: "Service Route", icon: MapPin, color: "#0ea5e9", route: "/(employee)/visits" },
              { title: "Past History", icon: History, color: "#64748b", route: "/(employee)/visit-history" },
              { title: "View Reports", icon: FileText, color: "#14b8a6", route: "/(employee)/reports" },
            ].map((tool, index) => (
              <TouchableOpacity onPress={() => router.push(tool.route as any)} key={index} style={{ width: "48%", backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${tool.color}15`, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <tool.icon size={20} color={tool.color} />
                </View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 14, flex: 1 }}>{tool.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
