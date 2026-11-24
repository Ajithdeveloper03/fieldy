import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Linking, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft, MapPin, Phone, ClipboardCheck } from "lucide-react-native";
import { api } from "../../../services/api";

export default function EmployeeSiteContactProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [site, setSite] = useState<any | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    api.get("/employee/sites").then((result) => {
      const item = (result?.sites || []).find((entry: any) => String(entry.site_contact_id || entry.id) === String(id));
      if (active) setSite(item || null);
    }).catch(() => { if (active) setSite(null); }).finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [id]);

  const location = site?.site_address || site?.address;
  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 18 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/my-sites")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999 }}><ChevronLeft size={22} color="#0f172a" /></TouchableOpacity>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, marginLeft: 12 }}>Project site</Text>
        </View>
        {!loaded ? <ActivityIndicator color="#059669" style={{ marginTop: 40 }} /> : !site ? <View style={{ padding: 24 }}><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Site details are unavailable</Text><Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", marginTop: 6 }}>This site may no longer be assigned to your account.</Text></View> : <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          <View style={{ backgroundColor: "#062214", borderRadius: 28, padding: 24 }}>
            <Text style={{ color: "#bbf7d0", fontFamily: "Brandon-Bold", fontSize: 13 }}>{site.type || "Project site"}</Text>
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28, marginTop: 8 }}>{site.name}</Text>
            {site.site_code ? <Text style={{ color: "#d1fae5", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 5 }}>Site code: {site.site_code}</Text> : null}
          </View>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, marginTop: 16, gap: 18 }}>
            {location ? <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}><MapPin size={19} color="#059669" /><Text style={{ flex: 1, color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15 }}>{location}</Text></View> : null}
            {site.phone ? <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Phone size={19} color="#059669" /><Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15 }}>{site.phone}</Text></View> : null}
            {site.size ? <Text style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 15 }}>Site size: {site.size}</Text> : null}
            {!location && !site.phone && !site.size ? <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14 }}>No additional site details have been recorded.</Text> : null}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 18 }}>
            {site.phone ? <TouchableOpacity onPress={() => Linking.openURL(`tel:${site.phone}`)} style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 16, padding: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}><Phone size={17} color="#0f172a" /><Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold" }}>Call site</Text></TouchableOpacity> : null}
            <TouchableOpacity onPress={() => router.push({ pathname: "/(employee)/visit/tracking", params: { siteId: String(site.site_contact_id || site.id), farmerId: String(site.site_contact_id || site.id), siteName: site.name, siteAddress: location || "", lat: site.latitude ? String(site.latitude) : "", lng: site.longitude ? String(site.longitude) : "" } } as any)} style={{ flex: 1, backgroundColor: "#059669", borderRadius: 16, padding: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}><ClipboardCheck size={17} color="#ffffff" /><Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold" }}>Start visit</Text></TouchableOpacity>
          </View>
        </ScrollView>}
      </SafeAreaView>
    </View>
  );
}
