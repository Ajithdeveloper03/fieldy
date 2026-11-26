import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
  Linking,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { apiClient } from "../../api/client";
import { getAuthUser } from "../../services/api";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  MoreVertical,
  Activity,
  ArrowRight,
} from "lucide-react-native";

const SITE_FALLBACK_IMAGES = [
  require("../../assets/images/image2.jpg"),
  require("../../assets/images/image5.jpg"),
  require("../../assets/images/image3.jpg"),
  require("../../assets/images/image11.jpg"),
  require("../../assets/images/image12.jpg"),
  require("../../assets/images/image15.jpg"),
];

export default function EmployeeMySiteContactsScreen() {
  const { serviceConfig } = useService();
  const [sites, setSites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTenant, setIsTenant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSites = useCallback(async () => {
    const authUser = await getAuthUser();
    setIsTenant(Boolean(authUser?.company_id));
    const response = await apiClient.get("/employee/sites").catch(() => null);
    setSites(Array.isArray(response?.sites) ? response.sites : []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (!active) return;
        await loadSites();
      })();
      return () => {
        active = false;
      };
    }, [loadSites])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSites();
    setRefreshing(false);
  }, [loadSites]);

  const mergedList = React.useMemo(() => {
    return sites.map((s: any, idx: number) => ({
      ...s,
      image: s.image || SITE_FALLBACK_IMAGES[idx % SITE_FALLBACK_IMAGES.length],
    }));
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
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18 }}>
          <LiquidGlassIconButton
            variant="light"
            size={44}
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={26} color="#0f172a" />
          </LiquidGlassIconButton>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24 }}>My {serviceConfig.vocab.entities}</Text>
            <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.8 }}>{serviceConfig.badge}</Text>
          </View>
          <ServiceSelectorPill compact locked={isTenant} />
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <LiquidGlassCard
            variant="light"
            borderRadius={18}
            contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 14 }}
          >
            <Search size={22} color="#94a3b8" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${serviceConfig.vocab.entities.toLowerCase()} or locations...`}
              placeholderTextColor="#94a3b8"
              style={{ color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 16, marginLeft: 12, flex: 1, paddingVertical: 0 }}
            />
          </LiquidGlassCard>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 120, gap: 22 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={serviceConfig.themeColor}
            />
          }
        >
          {displayList.length === 0 ? (
            <LiquidGlassCard
              variant="light"
              borderRadius={30}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, textAlign: "center" }}>
                No {serviceConfig.vocab.entities} Found
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center", marginTop: 6 }}>
                {searchQuery
                  ? "No assigned sites match your search query."
                  : `Assigned ${serviceConfig.vocab.entities.toLowerCase()} from Web Admin appear here automatically.`}
              </Text>
            </LiquidGlassCard>
          ) : null}
          
          {displayList.map((site: any, idx: number) => {
            const siteId = site.site_contact_id || site.id;
            const siteAddress = site.site_address || site.address || `${site.area || ''}, ${site.city || ''}`;
            const siteCode = site.site_code || site.code || "REG-VERIFIED";
            const siteAreaText = site.size ? `${site.size} ${site.sizeUnit || serviceConfig.vocab.sizeUnit}` : (site.site_area ? `${site.site_area} ${serviceConfig.vocab.sizeUnit}` : serviceConfig.vocab.entitySingular);
            const siteImage = site.image || SITE_FALLBACK_IMAGES[idx % SITE_FALLBACK_IMAGES.length];

            return (
              <LiquidGlassCard
                key={`${site.id}-${idx}`}
                variant="light"
                borderRadius={30}
                onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
              >
                {/* Top Banner Image */}
                <View style={{ height: 196 }}>
                  <Image source={typeof siteImage === "number" ? siteImage : { uri: siteImage }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                  <LiquidGlassIconBadge
                    size={36}
                    borderRadius={18}
                    variant="dark"
                    tintColor="#0f172a"
                    style={{ position: "absolute", top: 14, right: 14 }}
                  >
                    <MoreVertical size={20} color="#ffffff" />
                  </LiquidGlassIconBadge>
                  
                  {/* Status Badge Over Image */}
                  <LiquidGlassCard
                    variant="tinted"
                    tintColor={`${serviceConfig.themeColor}CC`}
                    borderRadius={999}
                    style={{ position: "absolute", bottom: 14, right: 14 }}
                    contentStyle={{ paddingHorizontal: 14, paddingVertical: 7, flexDirection: "row", alignItems: "center" }}
                  >
                    <Activity size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>{site.type || site.permit_status || "Active Site"}</Text>
                  </LiquidGlassCard>
                </View>

                <View style={{ padding: 22 }}>
                  {/* Profile Floating Rounded Avatar */}
                  <View style={{ marginTop: -56, marginBottom: 14, width: 88, height: 88, borderRadius: 30, borderWidth: 3.5, borderColor: "rgba(255, 255, 255, 0.94)", overflow: "hidden", backgroundColor: "#e2e8f0" }}>
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

                  <LiquidGlassCard
                    variant="light"
                    borderRadius={14}
                    style={{ alignSelf: "flex-start", marginBottom: 20 }}
                    contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9 }}
                  >
                    <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 15 }}>{siteAreaText}</Text>
                  </LiquidGlassCard>

                  {/* Bottom Action Icons */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(15, 23, 42, 0.08)", paddingTop: 18 }}>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <LiquidGlassIconButton
                        variant="light"
                        size={48}
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                      >
                        <Phone size={20} color="#0f172a" />
                      </LiquidGlassIconButton>
                      <LiquidGlassIconButton
                        variant="light"
                        size={48}
                        onPress={() => site.contactPhone || site.phone ? Linking.openURL(`tel:${site.contactPhone || site.phone}`) : Alert.alert("Contact unavailable", "No phone number is available.")}
                      >
                        <MessageSquare size={20} color="#0f172a" />
                      </LiquidGlassIconButton>
                    </View>
                    <LiquidGlassButton
                      variant="tinted"
                      tintColor="rgba(15, 23, 42, 0.86)"
                      onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                      contentStyle={{ paddingHorizontal: 18, paddingVertical: 12 }}
                    >
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginRight: 8 }}>View {serviceConfig.vocab.entitySingular}</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </LiquidGlassButton>
                  </View>
                </View>
              </LiquidGlassCard>
            );
          })}

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
