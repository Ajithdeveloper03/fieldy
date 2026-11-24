import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, MapPin, CalendarDays, FileText } from "lucide-react-native";
import { api } from "../../../services/api";

export default function EmployeeVisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [visit, setVisit] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    api.get("/employee/visits").then((result) => {
      const entry = (result?.visits || []).find((row: any) => String(row.id) === String(id));
      if (active) setVisit(entry || null);
    }).catch(() => { if (active) setVisit(null); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [id]);

  return <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
    <StatusBar barStyle="dark-content" />
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 18 }}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/visits")} style={{ padding: 10, backgroundColor: "#fff", borderRadius: 999 }}><ChevronLeft size={22} color="#0f172a" /></TouchableOpacity>
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, marginLeft: 12 }}>Visit record</Text>
      </View>
      {!loaded ? <ActivityIndicator color="#059669" style={{ marginTop: 36 }} /> : !visit ? <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", padding: 24 }}>This visit record is unavailable.</Text> : <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={{ backgroundColor: "#062214", borderRadius: 24, padding: 22 }}>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24 }}>{visit.farmerName || "Site name not recorded"}</Text>
          <Text style={{ color: "#bbf7d0", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 8 }}>{visit.status === "completed" ? "Completed" : visit.status === "in_progress" ? "In progress" : "Pending"}</Text>
        </View>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 22, padding: 20, marginTop: 14, gap: 16 }}>
          {(visit.date || visit.time) ? <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><CalendarDays size={18} color="#059669" /><Text style={{ color: "#334155", fontFamily: "Brandon-Medium" }}>{[visit.date, visit.time].filter(Boolean).join(" • ")}</Text></View> : null}
          {visit.address ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}><MapPin size={18} color="#059669" /><Text style={{ flex: 1, color: "#334155", fontFamily: "Brandon-Medium" }}>{visit.address}</Text></View> : null}
          {visit.farmerCode ? <Text style={{ color: "#334155", fontFamily: "Brandon-Medium" }}>Site code: {visit.farmerCode}</Text> : null}
          {(visit.remarks || visit.recommendations) ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}><FileText size={18} color="#059669" /><View style={{ flex: 1 }}>{visit.remarks ? <Text style={{ color: "#334155", fontFamily: "Brandon-Medium" }}>{visit.remarks}</Text> : null}{visit.recommendations ? <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", marginTop: 8 }}>{visit.recommendations}</Text> : null}</View></View> : null}
          {!visit.date && !visit.time && !visit.address && !visit.farmerCode && !visit.remarks && !visit.recommendations ? <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium" }}>No additional details have been recorded.</Text> : null}
        </View>
      </ScrollView>}
    </SafeAreaView>
  </View>;
}
