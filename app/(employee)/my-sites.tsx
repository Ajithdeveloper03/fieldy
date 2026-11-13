import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { apiClient } from "../../api/client";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  MoreVertical,
  Activity,
  ArrowRight,
  Filter,
  Layers,
} from "lucide-react-native";

export default function EmployeeMySiteContactsScreen() {
  const { serviceConfig } = useService();
  const [sites, setSites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    apiClient
      .get("/employee/sites")
      .then((response) => setSites(response.sites ?? []))
      .catch(() => {
        // Fallback gracefully to service sample entities
      });
  }, [serviceConfig.key]);

  const displayList = (sites.length > 0 ? sites : serviceConfig.sampleEntities).filter((item: any) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.address?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q)
    );
  });


  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>My {serviceConfig.vocab.entities}</Text>
            <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 10, letterSpacing: 0.8 }}>{serviceConfig.badge}</Text>
          </View>
          <ServiceSelectorPill compact />
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}>
            <Search size={20} color="#94a3b8" />
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 15, marginLeft: 12, flex: 1 }}>Search {serviceConfig.vocab.entities.toLowerCase()} or locations...</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 20 }}>
          
          {displayList.map((site: any) => {
            const siteId = site.site_contact_id || site.id;
            const siteAddress = site.site_address || site.address || `${site.area || ''}, ${site.city || ''}`;
            const siteCode = site.site_code || site.code || "REG-VERIFIED";
            const siteAreaText = site.size ? `${site.size} ${site.sizeUnit || serviceConfig.vocab.sizeUnit}` : (site.site_area ? `${site.site_area} ${serviceConfig.vocab.sizeUnit}` : serviceConfig.vocab.entitySingular);
            const siteImage = site.image || require("../../assets/images/image5.jpg");

            return (
              <TouchableOpacity 
                key={site.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                style={{ backgroundColor: "#ffffff", borderRadius: 24, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 8 }}
              >
                {/* Top Banner Image */}
                <View style={{ height: 120 }}>
                  <Image source={typeof siteImage === "number" ? siteImage : { uri: siteImage }} style={{ width: "100%", height: "100%" }} />
                  <View style={{ position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 999, padding: 6 }}>
                    <MoreVertical size={20} color="#ffffff" />
                  </View>
                  
                  {/* Status Badge Over Image */}
                  <View style={{ position: "absolute", bottom: 12, right: 12, backgroundColor: serviceConfig.themeColor, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, flexDirection: "row", alignItems: "center" }}>
                    <Activity size={14} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>{site.type || site.permit_status || "Active SLA"}</Text>
                  </View>
                </View>

                <View style={{ padding: 20 }}>
                  {/* Profile Floating Avatar */}
                  <View style={{ marginTop: -44, marginBottom: 12, width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: "#ffffff", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
                    <Image source={typeof siteImage === "number" ? siteImage : { uri: siteImage }} style={{ width: "100%", height: "100%" }} />
                  </View>

                  {/* Info Text */}
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, marginBottom: 4 }}>{site.name}</Text>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <MapPin size={14} color="#64748b" />
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6 }}>
                      {siteAddress} • <Text style={{ color: serviceConfig.themeColor }}>{siteCode}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: serviceConfig.lightBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignSelf: "flex-start", marginBottom: 20 }}>
                    <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 13 }}>{siteAreaText}</Text>
                  </View>

                  {/* Bottom Action Icons */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                      >
                        <Phone size={18} color="#0f172a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                        style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                      >
                        <MessageSquare size={18} color="#0f172a" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, backgroundColor: "#0f172a", borderRadius: 12 }}
                    >
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, marginRight: 8 }}>View {serviceConfig.vocab.entitySingular}</Text>
                      <ArrowRight size={16} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
