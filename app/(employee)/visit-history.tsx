import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  Download,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api } from "../../services/api";
import { downloadVisitDossierToDevice } from "../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function VisitHistoryScreen() {
  const { serviceConfig } = useService();
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    try {
      const res = await api.get("/employee/visits");
      setVisits(Array.isArray(res?.visits) ? res.visits : []);
    } catch {
      setVisits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadHistory(false);
    }, [loadHistory])
  );

  const monthOptions = useMemo(() => {
    const seen = new Map<string, string>();
    visits.forEach((v) => {
      if (v.monthKey && v.monthLabel && !seen.has(v.monthKey)) {
        seen.set(v.monthKey, v.monthLabel);
      }
    });
    return [
      { key: "all", label: "All Months" },
      ...Array.from(seen.entries()).map(([key, label]) => ({ key, label })),
    ];
  }, [visits]);

  const filtered = useMemo(() => {
    if (selectedMonth === "all") return visits;
    return visits.filter((v) => v.monthKey === selectedMonth);
  }, [visits, selectedMonth]);

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
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/visits"))}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>

          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
              Visit History
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>
              Showing {filtered.length} recorded {filtered.length === 1 ? "visit" : "visits"}
            </Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        {/* MONTH FILTER PILLS */}
        {monthOptions.length > 1 && (
          <View style={{ marginBottom: 12 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
            >
              {monthOptions.map((m) => {
                const active = selectedMonth === m.key;
                return (
                  <LiquidGlassPill
                    key={m.key}
                    variant="light"
                    active={active}
                    tintColor={`${themeColor}E6`}
                    onPress={() => setSelectedMonth(m.key)}
                    contentStyle={{ paddingHorizontal: 14, paddingVertical: 8 }}
                  >
                    <Text style={{ color: active ? "#ffffff" : "#334155", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {m.label}
                    </Text>
                  </LiquidGlassPill>
                );
              })}
            </ScrollView>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, gap: 12 }}
        >
          {loading ? (
            <ActivityIndicator color={themeColor} style={{ marginTop: 36 }} />
          ) : filtered.length > 0 ? (
            filtered.map((v) => {
              const isDone = v.status === "completed";
              return (
                <LiquidGlassCard
                  key={v.id}
                  variant="light"
                  borderRadius={22}
                  onPress={() =>
                    router.push((isDone ? `/(employee)/report/${v.id}` : `/(employee)/visit/${v.id}`) as any)
                  }
                  contentStyle={{ padding: 18 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                      {isDone ? (
                        <CheckCircle2 size={19} color="#10b981" style={{ marginRight: 8 }} />
                      ) : (
                        <Clock size={19} color="#f59e0b" style={{ marginRight: 8 }} />
                      )}
                      <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17, flex: 1 }}>
                        {v.farmerName}
                      </Text>
                    </View>
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {v.visitCode}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    <MapPin size={13} color="#64748b" />
                    <Text numberOfLines={1} style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 5, flex: 1 }}>
                      {v.date} • {v.checkInTime}
                      {v.checkOutTime ? ` – ${v.checkOutTime}` : " (Active)"}
                      {v.durationMinutes ? ` • ${v.durationMinutes} min` : ""}
                    </Text>
                  </View>

                  {v.remarks ? (
                    <Text numberOfLines={2} style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 8 }}>
                      {v.remarks}
                    </Text>
                  ) : null}

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      <FileText size={12} color={themeColor} /> {isDone ? "Open Report" : "Continue Visit"}
                    </Text>
                    {isDone && (
                      <LiquidGlassIconButton
                        variant="light"
                        size={34}
                        onPress={() => downloadVisitDossierToDevice(String(v.id))}
                      >
                        <Download size={15} color="#0f172a" />
                      </LiquidGlassIconButton>
                    )}
                  </View>
                </LiquidGlassCard>
              );
            })
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={24}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <Clock size={34} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                No Past Visits Yet
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                Completed field visits and downloadable dossiers will appear here automatically.
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
