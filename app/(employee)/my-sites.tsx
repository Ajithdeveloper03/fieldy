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
import { router } from "expo-router";
import { apiClient } from "../../api/client";
import { getAuthUser } from "../../services/api";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Activity,
  ArrowRight,
  CalendarDays,
} from "lucide-react-native";

// Single consistent default image used ONLY when no site photo was uploaded in Web Admin
const DEFAULT_SITE_IMAGE = require("../../assets/images/default-site.jpg");

export default function EmployeeMySiteContactsScreen() {
  const { serviceConfig } = useService();
  const [sites, setSites] = useState<any[]>([]);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isTenant, setIsTenant] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSites = useCallback(async () => {
    const authUser = await getAuthUser();
    setIsTenant(Boolean(authUser?.company_id));
    const response = await apiClient.get("/employee/sites").catch(() => null);
    setSites(Array.isArray(response?.sites) ? response.sites : []);
    setFailedImages({});
  }, []);

  useLiveRefresh(loadSites, 10000);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSites();
    setRefreshing(false);
  }, [loadSites]);

  const displayList = sites.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.site_code?.toLowerCase().includes(q) ||
      item.address?.toLowerCase().includes(q) ||
      item.site_address?.toLowerCase().includes(q) ||
      item.area?.toLowerCase().includes(q) ||
      item.city?.toLowerCase().includes(q) ||
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

        <PageHeroBanner
          badge={serviceConfig.shortName}
          title={`My ${serviceConfig.vocab.entities}`}
          subtitle={`${sites.length} Active Sites • Live Synced`}
          colors={["#0284c7", "#1e40af"]}
          personIndex={1}
        />

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
            const siteId = String(site.site_contact_id || site.id);
            const locationParts = [site.village || site.area, site.district || site.city, site.state]
              .map((v) => (typeof v === "string" ? v.trim() : ""))
              .filter(Boolean);
            const siteAddress =
              (typeof site.site_address === "string" && site.site_address.trim()) ||
              (typeof site.address === "string" && site.address.trim()) ||
              (locationParts.length > 0 ? locationParts.join(", ") : "Address not specified");
            const siteCode = site.site_code || site.code || `SITE-${siteId}`;
            const siteAreaText = site.size
              ? `${site.size} ${site.sizeUnit || serviceConfig.vocab.sizeUnit}`
              : null;
            const remotePhoto = site.image || site.photo_url;
            const hasRemotePhoto =
              typeof remotePhoto === "string" &&
              remotePhoto.trim().length > 0 &&
              !failedImages[siteId];
            const siteImageSource = hasRemotePhoto ? { uri: remotePhoto } : DEFAULT_SITE_IMAGE;
            const phoneValue = site.contactPhone || site.phone;

            return (
              <LiquidGlassCard
                key={`${siteId}-${idx}`}
                variant="light"
                borderRadius={28}
                onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
              >
                {/* Top Banner Image (Web Admin photo or single default site image) */}
                <View style={{ height: 186, backgroundColor: "#e2e8f0" }}>
                  <Image
                    source={siteImageSource}
                    onError={() => setFailedImages((prev) => ({ ...prev, [siteId]: true }))}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />

                  {/* Site Code Pill */}
                  <View
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      backgroundColor: "rgba(15, 23, 42, 0.78)",
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 999,
                    }}
                  >
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {siteCode}
                    </Text>
                  </View>

                  {/* Category / Status Badge Over Image */}
                  <LiquidGlassCard
                    variant="tinted"
                    tintColor={`${serviceConfig.themeColor}CC`}
                    borderRadius={999}
                    style={{ position: "absolute", bottom: 14, right: 14 }}
                    contentStyle={{ paddingHorizontal: 14, paddingVertical: 7, flexDirection: "row", alignItems: "center" }}
                  >
                    <Activity size={15} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                      {site.type || serviceConfig.vocab.entitySingular}
                    </Text>
                  </LiquidGlassCard>
                </View>

                <View style={{ padding: 20 }}>
                  {/* Real Web Admin Site Title & Location */}
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22, lineHeight: 28, marginBottom: 6 }}>
                    {site.name}
                  </Text>

                  <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 14 }}>
                    <MapPin size={16} color="#64748b" style={{ marginTop: 2 }} />
                    <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6, flex: 1, lineHeight: 20 }}>
                      {siteAddress}
                    </Text>
                  </View>

                  {/* Accurate Metadata Chips */}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                    {siteAreaText ? (
                      <LiquidGlassCard
                        variant="light"
                        borderRadius={12}
                        contentStyle={{ paddingHorizontal: 12, paddingVertical: 7 }}
                      >
                        <Text style={{ color: serviceConfig.themeColor, fontFamily: "Brandon-Bold", fontSize: 13 }}>
                          {siteAreaText}
                        </Text>
                      </LiquidGlassCard>
                    ) : null}

                    <LiquidGlassCard
                      variant="light"
                      borderRadius={12}
                      contentStyle={{ paddingHorizontal: 12, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 5 }}
                    >
                      <CalendarDays size={13} color="#475569" />
                      <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                        {Number(site.visits_count || 0)} {Number(site.visits_count || 0) === 1 ? "Visit" : "Visits"}
                        {site.last_visit_at ? ` • Last ${site.last_visit_at}` : ""}
                      </Text>
                    </LiquidGlassCard>
                  </View>

                  {/* Bottom Action Icons */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "rgba(15, 23, 42, 0.08)", paddingTop: 16 }}>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <LiquidGlassIconButton
                        variant="light"
                        size={44}
                        onPress={() => phoneValue ? Linking.openURL(`tel:${phoneValue}`) : Alert.alert("Contact unavailable", "No phone number is registered for this site.")}
                      >
                        <Phone size={18} color="#0f172a" />
                      </LiquidGlassIconButton>
                      <LiquidGlassIconButton
                        variant="light"
                        size={44}
                        onPress={() => phoneValue ? Linking.openURL(`sms:${phoneValue}`) : Alert.alert("Contact unavailable", "No phone number is registered for this site.")}
                      >
                        <MessageSquare size={18} color="#0f172a" />
                      </LiquidGlassIconButton>
                    </View>
                    <LiquidGlassButton
                      variant="tinted"
                      tintColor="rgba(15, 23, 42, 0.86)"
                      onPress={() => router.push(`/(employee)/site/${siteId}` as any)}
                      contentStyle={{ paddingHorizontal: 18, paddingVertical: 11 }}
                    >
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, marginRight: 8 }}>
                        View {serviceConfig.vocab.entitySingular}
                      </Text>
                      <ArrowRight size={17} color="#ffffff" />
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
