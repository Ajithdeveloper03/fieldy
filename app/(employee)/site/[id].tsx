import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Phone,
  Navigation,
  MapPinned,
  CheckCircle2,
  Clock,
  ClipboardList,
} from "lucide-react-native";
import { api } from "../../../services/api";
import { useService } from "../../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function EmployeeSiteContactProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { serviceConfig } = useService();
  const [site, setSite] = useState<any | null>(null);
  const [siteVisits, setSiteVisits] = useState<any[]>([]);
  const [siteTasks, setSiteTasks] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSiteProfile = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const [sitesRes, visitsRes, tasksRes] = await Promise.all([
        api.get("/employee/sites"),
        api.get("/employee/visits"),
        api.get("/employee/tasks"),
      ]);

      const foundSite = (Array.isArray(sitesRes?.sites) ? sitesRes.sites : []).find(
        (entry: any) => String(entry.site_contact_id || entry.id) === String(id)
      );
      setSite(foundSite || null);

      const allVisits = Array.isArray(visitsRes?.visits) ? visitsRes.visits : [];
      setSiteVisits(allVisits.filter((v: any) => String(v.farmerId) === String(id)));

      const allTasks = Array.isArray(tasksRes?.tasks) ? tasksRes.tasks : [];
      setSiteTasks(allTasks.filter((t: any) => String(t.farmerId) === String(id)));
    } catch {
      setSite(null);
    } finally {
      setLoaded(true);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadSiteProfile(false);
    }, [loadSiteProfile])
  );

  const themeColor = serviceConfig.themeColor || "#059669";
  const locationText = site?.site_address || site?.address || [site?.area, site?.city, site?.state].filter(Boolean).join(", ");

  const buildNavParams = () => ({
    siteId: String(site.site_contact_id || site.id),
    farmerId: String(site.site_contact_id || site.id),
    siteName: site.name || "",
    siteAddress: locationText || "",
    lat: site.latitude != null ? String(site.latitude) : "",
    lng: site.longitude != null ? String(site.longitude) : "",
  });

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
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/my-sites"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            {serviceConfig.vocab.entitySingular} Profile
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {!loaded ? (
          <ActivityIndicator color={themeColor} style={{ marginTop: 48 }} />
        ) : !site ? (
          <View style={{ padding: 22 }}>
            <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 26, alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                Site Details Unavailable
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center", marginTop: 6 }}>
                This site may no longer be assigned to your account.
              </Text>
            </LiquidGlassCard>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadSiteProfile(true)}
                tintColor={themeColor}
              />
            }
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
          >
            {/* HERO SITE CARD */}
            <LiquidGlassCard
              variant="dark"
              borderRadius={28}
              dropletColor={themeColor}
              style={{ marginBottom: 18 }}
              contentStyle={{ padding: 22 }}
            >
              <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 0.6 }}>
                {site.site_code} • {site.type || serviceConfig.vocab.entitySingular}
              </Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25, marginTop: 6 }}>
                {site.name}
              </Text>

              <View style={{ marginTop: 14, gap: 8 }}>
                {locationText ? (
                  <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                    <MapPin size={16} color="#4ade80" style={{ marginTop: 2 }} />
                    <Text style={{ color: "rgba(255,255,255,0.82)", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 8, flex: 1 }}>
                      {locationText}
                    </Text>
                  </View>
                ) : null}

                {site.latitude != null && site.longitude != null ? (
                  <Text style={{ color: "rgba(255,255,255,0.64)", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 24 }}>
                    GPS Anchor: {Number(site.latitude).toFixed(5)}° N, {Number(site.longitude).toFixed(5)}° E
                  </Text>
                ) : null}

                {site.size ? (
                  <Text style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 24 }}>
                    Capacity / Area: {site.size} {serviceConfig.vocab.sizeUnit}
                  </Text>
                ) : null}
              </View>

              <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
                <LiquidGlassButton
                  variant="tinted"
                  tintColor="rgba(16, 185, 129, 0.85)"
                  dropletColor="#34d399"
                  onPress={() =>
                    router.push({ pathname: "/(employee)/visit/tracking", params: buildNavParams() } as any)
                  }
                  style={{ flex: 1 }}
                  contentStyle={{ paddingVertical: 13 }}
                >
                  <Navigation size={16} color="#ffffff" style={{ marginRight: 7 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                    Start GPS Visit
                  </Text>
                </LiquidGlassButton>

                <LiquidGlassButton
                  variant="dark"
                  onPress={() =>
                    router.push({ pathname: "/(employee)/visit/check-in", params: buildNavParams() } as any)
                  }
                  style={{ flex: 1 }}
                  contentStyle={{ paddingVertical: 13 }}
                >
                  <MapPinned size={16} color="#38bdf8" style={{ marginRight: 7 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                    Check In Here
                  </Text>
                </LiquidGlassButton>
              </View>

              {site.phone ? (
                <LiquidGlassButton
                  variant="dark"
                  onPress={() => Linking.openURL(`tel:${site.phone}`)}
                  style={{ marginTop: 10 }}
                  contentStyle={{ paddingVertical: 11 }}
                >
                  <Phone size={15} color="#4ade80" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                    Call Site Contact ({site.phone})
                  </Text>
                </LiquidGlassButton>
              ) : null}
            </LiquidGlassCard>

            {/* ASSIGNED TASKS FOR THIS SITE */}
            {siteTasks.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 10 }}>
                  Site Work Orders ({siteTasks.length})
                </Text>
                <View style={{ gap: 10 }}>
                  {siteTasks.map((t) => (
                    <LiquidGlassCard
                      key={t.id}
                      variant="light"
                      borderRadius={20}
                      onPress={() => router.push(`/(employee)/task/${t.id}` as any)}
                      contentStyle={{ padding: 15, flexDirection: "row", alignItems: "center" }}
                    >
                      <ClipboardList size={20} color={themeColor} style={{ marginRight: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                          {t.title}
                        </Text>
                        <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 2 }}>
                          {t.workOrderCode} • {t.status} • +{t.points} Pts
                        </Text>
                      </View>
                    </LiquidGlassCard>
                  ))}
                </View>
              </View>
            )}

            {/* REAL VISIT HISTORY FOR THIS SITE */}
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 10 }}>
              Site Visit History ({siteVisits.length})
            </Text>

            {siteVisits.length > 0 ? (
              <View style={{ gap: 12 }}>
                {siteVisits.map((v) => {
                  const isDone = v.status === "completed";
                  return (
                    <LiquidGlassCard
                      key={v.id}
                      variant="light"
                      borderRadius={20}
                      onPress={() =>
                        router.push(
                          (isDone ? `/(employee)/report/${v.id}` : `/(employee)/visit/${v.id}`) as any
                        )
                      }
                      contentStyle={{ padding: 16 }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          {isDone ? (
                            <CheckCircle2 size={18} color="#10b981" style={{ marginRight: 8 }} />
                          ) : (
                            <Clock size={18} color="#f59e0b" style={{ marginRight: 8 }} />
                          )}
                          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                            {v.visitCode || `Visit #${v.id}`}
                          </Text>
                        </View>
                        <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                          {v.date} • {v.time}
                        </Text>
                      </View>
                      {v.remarks ? (
                        <Text numberOfLines={2} style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 8 }}>
                          {v.remarks}
                        </Text>
                      ) : null}
                    </LiquidGlassCard>
                  );
                })}
              </View>
            ) : (
              <LiquidGlassCard
                variant="light"
                borderRadius={22}
                contentStyle={{ padding: 24, alignItems: "center" }}
              >
                <Clock size={28} color="#94a3b8" style={{ marginBottom: 8 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                  No Visits Recorded for This Site Yet
                </Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                  Tap Start GPS Visit or Check In Here when you arrive at this location.
                </Text>
              </LiquidGlassCard>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
