import React, { useCallback, useState } from "react";
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
import { router, useFocusEffect } from "expo-router";
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
  const [sitesLoaded, setSitesLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      setSitesLoaded(false);
      apiClient
        .get("/employee/sites")
        .then((response) => {
          setSites(Array.isArray(response?.sites) ? response.sites : []);
          setSitesLoaded(true);
        })
        .catch(() => {
          setSites([]);
          setSitesLoaded(true);
        });
    }, [serviceConfig.key])
  );

  const SITE_FALLBACK_IMAGES = [
    require("../../assets/images/image2.jpg"),
    require("../../assets/images/image5.jpg"),
    require("../../assets/images/image3.jpg"),
    require("../../assets/images/image11.jpg"),
    require("../../assets/images/image12.jpg"),
    require("../../assets/images/image15.jpg"),
  ];

  const mergedList = React.useMemo(() => {
    const apiMapped = sites.map((s: any, idx: number) => ({
      ...s,
      image: s.image || SITE_FALLBACK_IMAGES[idx % SITE_FALLBACK_IMAGES.length],
    }));
    return apiMapped;
  }, [sites]);

  const displayList = mergedList.filter((item: any) => {
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
            <ChevronLeft size={26} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24 }}>My {serviceConfig.vocab.entities}</Text>
            <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.8 }}>{serviceConfig.badge}</Text>
          </View>
          <ServiceSelectorPill compact />
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}>
            <Search size={22} color="#94a3b8" />
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 16, marginLeft: 12, flex: 1 }}>Search {serviceConfig.vocab.entities.toLowerCase()} or locations...</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 120, gap: 22 }}>
          {sitesLoaded && displayList.length === 0 && (
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center", paddingVertical: 36 }}>
              No project sites are currently assigned to you.
            </Text>
          )}
          
          {displayList.map((site: any, idx: number) => {
            const siteId = site.site_contact_id || site.id;
            const siteAddress = site.site_address || site.address || `${site.area || ''}, ${site.city || ''}`;
            const siteCode = site.site_code || site.code || "";
            const siteAreaText = site.size ? `${site.size} ${site.sizeUnit || serviceConfig.vocab.sizeUnit}` : (site.site_area ? `${site.site_area} ${serviceConfig.vocab.sizeUnit}` : "Size not provided");
            const siteImage = site.image || SITE_FALLBACK_IMAGES[idx % SITE_FALLBACK_IMAGES.length];

            return (
              <TouchableOpacity 
                key={`${site.id}-${idx}`}
                activeOpacity={0.9}
                onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                style={{ backgroundColor: "#ffffff", borderRadius: 30, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 }}
              >
                {/* Top Banner Image */}
                <View style={{ height: 196 }}>
                  <Image source={typeof siteImage === "number" ? siteImage : { uri: siteImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  <View style={{ position: "absolute", top: 14, right: 14, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 999, padding: 8 }}>
                    <MoreVertical size={20} color="#ffffff" />
                  </View>
                  
                  {/* Status Badge Over Image */}
                  <View style={{ position: "absolute", bottom: 14, right: 14, backgroundColor: serviceConfig.themeColor, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, flexDirection: "row", alignItems: "center" }}>
                    <Activity size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>{site.type || site.permit_status || "Active SLA"}</Text>
                  </View>
                </View>

                <View style={{ padding: 22 }}>
                  {/* Profile Floating Rounded Avatar */}
                  <View style={{ marginTop: -56, marginBottom: 14, width: 88, height: 88, borderRadius: 30, borderWidth: 3.5, borderColor: "#ffffff", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
                    <Image source={typeof siteImage === "number" ? siteImage : { uri: siteImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  </View>

                  {/* Info Text */}
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 26, lineHeight: 30, marginBottom: 6 }}>{site.name}</Text>
                  
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                    <MapPin size={16} color="#64748b" />
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 16, marginLeft: 6, flex: 1 }}>
                      {siteAddress} • <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold" }}>{siteCode}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: serviceConfig.lightBg, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, alignSelf: "flex-start", marginBottom: 20 }}>
                    <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 15 }}>{siteAreaText}</Text>
                  </View>

                  {/* Bottom Action Icons */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 18 }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <TouchableOpacity
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                      >
                        <Phone size={20} color="#0f172a" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                        style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" }}
                      >
                        <MessageSquare size={20} color="#0f172a" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                      style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 12, backgroundColor: "#0f172a", borderRadius: 14 }}
                    >
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginRight: 8 }}>View {serviceConfig.vocab.entitySingular}</Text>
                      <ArrowRight size={18} color="#ffffff" />
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
