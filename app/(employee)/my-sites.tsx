import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  Search,
  MapPin,
  Phone,
  ArrowRight,
  Building2,
  X,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function MySitesScreen() {
  const { serviceConfig } = useService();
  const [sites, setSites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSites = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/sites");
      setSites(Array.isArray(res?.sites) ? res.sites : []);
    } catch {
      setSites([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSites(false);
    }, [loadSites])
  );

  const filteredSites = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) =>
        String(s.name || "").toLowerCase().includes(q) ||
        String(s.site_code || "").toLowerCase().includes(q) ||
        String(s.address || "").toLowerCase().includes(q) ||
        String(s.city || "").toLowerCase().includes(q) ||
        String(s.phone || "").toLowerCase().includes(q)
    );
  }, [sites, searchQuery]);

  const themeColor = serviceConfig.themeColor || "#059669";

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            variant="light"
            size={44}
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>

          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
              My {serviceConfig.vocab.entities}
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              {sites.length} {sites.length === 1 ? "location" : "locations"} assigned
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* WORKING SEARCH BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <LiquidGlassCard
            variant="light"
            borderRadius={18}
            contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 50 }}
          >
            <Search size={18} color="#64748b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${serviceConfig.vocab.entities.toLowerCase()}, code, or city...`}
              placeholderTextColor="#94a3b8"
              style={{
                flex: 1,
                marginLeft: 10,
                color: "#0f172a",
                fontFamily: "Brandon-Medium",
                fontSize: 15,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 4 }}>
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </LiquidGlassCard>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadSites(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 14 }}
        >
          {loading ? (
            <ActivityIndicator color={themeColor} style={{ marginTop: 36 }} />
          ) : filteredSites.length > 0 ? (
            filteredSites.map((site) => (
              <LiquidGlassCard
                key={site.id}
                variant="light"
                borderRadius={24}
                onPress={() => router.push(`/(employee)/site/${site.id}` as any)}
                contentStyle={{ padding: 18 }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 10 }}>
                    <LiquidGlassIconBadge
                      size={46}
                      borderRadius={16}
                      variant="light"
                      tintColor={themeColor}
                      style={{ marginRight: 12 }}
                    >
                      <Building2 size={22} color={themeColor} />
                    </LiquidGlassIconBadge>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                        {site.site_code} • {site.type || serviceConfig.vocab.entitySingular}
                      </Text>
                      <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 2 }}>
                        {site.name}
                      </Text>
                    </View>
                  </View>
                  <ArrowRight size={18} color="#94a3b8" />
                </View>

                <View style={{ marginTop: 12, gap: 6 }}>
                  {site.address || site.city ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <MapPin size={14} color="#64748b" />
                      <Text numberOfLines={1} style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 6, flex: 1 }}>
                        {site.address || [site.area, site.city].filter(Boolean).join(", ")}
                      </Text>
                    </View>
                  ) : null}

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      {site.phone ? (
                        <>
                          <Phone size={13} color={themeColor} />
                          <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 5 }}>
                            {site.phone}
                          </Text>
                        </>
                      ) : (
                        <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 12 }}>
                          No phone listed
                        </Text>
                      )}
                    </View>

                    <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {site.visits_count || 0} {site.visits_count === 1 ? "visit" : "visits"}
                      {site.latitude !== null && site.longitude !== null ? " • GPS" : ""}
                    </Text>
                  </View>
                </View>
              </LiquidGlassCard>
            ))
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={26}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <Building2 size={36} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                {searchQuery ? "No Matching Sites" : `No ${serviceConfig.vocab.entities} Assigned`}
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                {searchQuery
                  ? "Try clearing your search filter."
                  : "Sites added and assigned to your account in Web Admin will appear here automatically."}
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
