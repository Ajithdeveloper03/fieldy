import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Activity,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  ShieldCheck,
  Zap,
  Gauge
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";

const { width } = Dimensions.get("window");

export default function ProjectHealthScreen() {
  const { serviceConfig } = useService();
  const [activeTab, setActiveTab] = useState(0);

  const entities = serviceConfig.sampleEntities;
  const currentEntity = entities[activeTab] || entities[0];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* CLEAN GEOMETRIC HEADER */}
      <View style={{ width: "100%", backgroundColor: "#ffffff", borderBottomLeftRadius: 32, borderBottomRightRadius: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 5 }}>
        <SafeAreaView edges={["top"]} style={{ paddingTop: 10 }}>
          
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 16 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
              {serviceConfig.label} Intelligence
            </Text>
            <View style={{ width: 44 }} />
          </View>

          {/* CUSTOM TAB SELECTOR */}
          <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingBottom: 24, gap: 12 }}>
            {entities.slice(0, 2).map((entity, idx) => (
              <TouchableOpacity 
                key={entity.id}
                onPress={() => setActiveTab(idx)} 
                style={{ 
                  flex: 1, 
                  backgroundColor: activeTab === idx ? serviceConfig.color : "#f1f5f9", 
                  borderRadius: 16, 
                  paddingVertical: 12, 
                  alignItems: "center", 
                  shadowColor: activeTab === idx ? serviceConfig.color : "transparent", 
                  shadowOffset: { width: 0, height: 4 }, 
                  shadowOpacity: 0.3, 
                  shadowRadius: 10 
                }}
              >
                <Text style={{ color: activeTab === idx ? "#ffffff" : "#64748b", fontFamily: "Brandon-Bold", fontSize: 13 }} numberOfLines={1}>
                  {entity.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 24 }}>
        
        {/* VITAL SIGNS OVAL DASHBOARD */}
        <View style={{ backgroundColor: "#064e3b", borderRadius: 32, padding: 24, marginBottom: 32, shadowColor: "#064e3b", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <View>
              <Text style={{ color: "#34d399", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>
                {serviceConfig.label.toUpperCase()} HEALTH INDEX
              </Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 26 }}>
                98.4% Optimal
              </Text>
            </View>
            <View style={{ backgroundColor: "#ffffff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: "#064e3b", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                {currentEntity?.size || "Active Unit"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 24, padding: 16 }}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Zap size={22} color="#60a5fa" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 11 }} numberOfLines={1}>Telemetry</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Live</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Gauge size={22} color="#fbbf24" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 11 }} numberOfLines={1}>Readings</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Verified</Text>
            </View>
            <View style={{ width: 1, height: "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View style={{ alignItems: "center", flex: 1 }}>
              <Activity size={22} color="#a78bfa" style={{ marginBottom: 8 }} />
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Medium", fontSize: 11 }} numberOfLines={1}>SLA Score</Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>100%</Text>
            </View>
          </View>
        </View>

        {/* PRIORITY ALERTS */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>
          {serviceConfig.vocab.entitySingular} Status
        </Text>
        
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: `${serviceConfig.color}15`, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <ShieldCheck size={24} color={serviceConfig.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>
                System operating within target thresholds
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>
                {serviceConfig.telemetryCard.primaryTitle}: {serviceConfig.telemetryCard.primaryMetric}. Telemetry sync confirmed with field ops center.
              </Text>
            </View>
          </View>
        </View>

        {/* RECENT INSPECTIONS - DYNAMIC CARDS */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            {serviceConfig.vocab.staffRole} {serviceConfig.vocab.visits}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(site-contact)/history")}>
            <Text style={{ color: serviceConfig.color, fontFamily: "Brandon-Bold", fontSize: 14 }}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(site-contact)/support")} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", flexDirection: "row", alignItems: "center" }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
            <ClipboardList size={24} color="#3b82f6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Latest Audit: Today 11:30 AM</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
              Verified by certified {serviceConfig.vocab.staffRole.toLowerCase()}
            </Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
