import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  FileText,
  Download,
  Navigation,
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import { downloadVisitDossierToDevice } from "../../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { serviceConfig } = useService();
  const [visit, setVisit] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const loadVisit = useCallback(async () => {
    try {
      const res = await api.get("/employee/visits");
      const found = (Array.isArray(res?.visits) ? res.visits : []).find(
        (v: any) => String(v.id) === String(id)
      );
      setVisit(found || null);
    } catch {
      setVisit(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadVisit();
    }, [loadVisit])
  );

  const themeColor = serviceConfig.themeColor || "#059669";
  const isDone = visit?.status === "completed";

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
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
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/visits"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20 }}>
            {serviceConfig.vocab.visitSingular} Details
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {loading ? (
          <ActivityIndicator color={themeColor} style={{ marginTop: 48 }} />
        ) : !visit ? (
          <View style={{ padding: 22 }}>
            <LiquidGlassCard variant="light" borderRadius={24} contentStyle={{ padding: 26, alignItems: "center" }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>
                Visit Record Not Found
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center", marginTop: 6 }}>
                This visit could not be found in your live history.
              </Text>
            </LiquidGlassCard>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
            <LiquidGlassCard
              variant="dark"
              borderRadius={28}
              dropletColor={themeColor}
              style={{ marginBottom: 18 }}
              contentStyle={{ padding: 22 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#86efac", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                  {visit.visitCode} • {visit.date}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isDone ? "rgba(16,185,129,0.22)" : "rgba(245,158,11,0.22)",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                  }}
                >
                  {isDone ? (
                    <CheckCircle2 size={13} color="#4ade80" style={{ marginRight: 5 }} />
                  ) : (
                    <Clock size={13} color="#fbbf24" style={{ marginRight: 5 }} />
                  )}
                  <Text style={{ color: isDone ? "#86efac" : "#fde68a", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                    {isDone ? "Completed" : "In Progress"}
                  </Text>
                </View>
              </View>

              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, marginTop: 8 }}>
                {visit.farmerName}
              </Text>

              {visit.address ? (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                  <MapPin size={15} color="#4ade80" />
                  <Text style={{ color: "rgba(255,255,255,0.82)", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 7, flex: 1 }}>
                    {visit.address}
                  </Text>
                </View>
              ) : null}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 11 }}>
                    CHECK-IN
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>
                    {visit.checkInTime || "—"}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 11 }}>
                    CHECK-OUT
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>
                    {visit.checkOutTime || "Active"}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 11 }}>
                    DISTANCE
                  </Text>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15, marginTop: 2 }}>
                    {Number(visit.distanceKm || 0).toFixed(1)} km
                  </Text>
                </View>
              </View>

              {visit.farmerPhone ? (
                <LiquidGlassButton
                  variant="dark"
                  onPress={() => Linking.openURL(`tel:${visit.farmerPhone}`)}
                  style={{ marginTop: 14 }}
                  contentStyle={{ paddingVertical: 11 }}
                >
                  <Phone size={15} color="#4ade80" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                    Call Site Contact ({visit.farmerPhone})
                  </Text>
                </LiquidGlassButton>
              ) : null}
            </LiquidGlassCard>

            {/* NOTES & RECOMMENDATIONS */}
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              style={{ marginBottom: 20 }}
              contentStyle={{ padding: 20, gap: 14 }}
            >
              <View>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                  FIELD OBSERVATION NOTES
                </Text>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22, marginTop: 4 }}>
                  {visit.remarks || "No field notes entered yet."}
                </Text>
              </View>

              {visit.recommendations ? (
                <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                    FOLLOW-UP / RECOMMENDATIONS
                  </Text>
                  <Text style={{ color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 22, marginTop: 4 }}>
                    {visit.recommendations}
                  </Text>
                </View>
              ) : null}
            </LiquidGlassCard>

            {/* ACTIONS */}
            <View style={{ gap: 12 }}>
              {isDone ? (
                <>
                  <LiquidGlassButton
                    variant="tinted"
                    tintColor={`${themeColor}E6`}
                    dropletColor={themeColor}
                    onPress={() => router.push(`/(employee)/report/${visit.id}` as any)}
                    contentStyle={{ paddingVertical: 16 }}
                  >
                    <FileText size={18} color="#ffffff" style={{ marginRight: 8 }} />
                    <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                      Open Full Report & Media ({visit.media_count || 0})
                    </Text>
                  </LiquidGlassButton>

                  <LiquidGlassButton
                    variant="light"
                    disabled={downloading}
                    onPress={async () => {
                      setDownloading(true);
                      try {
                        await downloadVisitDossierToDevice(String(visit.id));
                      } finally {
                        setDownloading(false);
                      }
                    }}
                    contentStyle={{ paddingVertical: 15 }}
                  >
                    <Download size={18} color="#0f172a" style={{ marginRight: 8 }} />
                    <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>
                      {downloading ? "Downloading..." : "Download Visit Dossier"}
                    </Text>
                  </LiquidGlassButton>
                </>
              ) : (
                <LiquidGlassButton
                  variant="tinted"
                  tintColor="rgba(6, 34, 20, 0.90)"
                  dropletColor="#4ade80"
                  onPress={() =>
                    router.push({
                      pathname: "/(employee)/visit/report",
                      params: {
                        visitId: String(visit.id),
                        farmerId: visit.farmerId || "",
                        siteName: visit.farmerName || "",
                        lat: visit.latitude != null ? String(visit.latitude) : "",
                        lng: visit.longitude != null ? String(visit.longitude) : "",
                      },
                    } as any)
                  }
                  contentStyle={{ paddingVertical: 16 }}
                >
                  <Navigation size={18} color="#4ade80" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                    Submit Report & Complete Visit
                  </Text>
                </LiquidGlassButton>
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
