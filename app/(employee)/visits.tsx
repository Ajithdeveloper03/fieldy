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
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  FileText,
  History,
  X,
  Paperclip,
} from "lucide-react-native";
import { useService } from "../../context/ServiceContext";
import { api } from "../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function EmployeeVisitsScreen() {
  const { serviceConfig } = useService();
  const [visits, setVisits] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "in_progress" | "completed">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVisits = useCallback(async (isPull = false) => {
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
      void loadVisits(false);
    }, [loadVisits])
  );

  const filteredVisits = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visits.filter((v) => {
      if (filter === "completed" && v.status !== "completed") return false;
      if (filter === "in_progress" && v.status === "completed") return false;
      if (!q) return true;
      return (
        String(v.farmerName || "").toLowerCase().includes(q) ||
        String(v.visitCode || "").toLowerCase().includes(q) ||
        String(v.address || "").toLowerCase().includes(q) ||
        String(v.remarks || "").toLowerCase().includes(q)
      );
    });
  }, [visits, filter, search]);

  const completedCount = visits.filter((v) => v.status === "completed").length;
  const activeCount = visits.filter((v) => v.status !== "completed").length;
  const totalDistanceKm = visits.reduce((sum, v) => sum + Number(v.distanceKm || 0), 0);
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
          <View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 25 }}>
              Field {serviceConfig.vocab.visits}
            </Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>
              {visits.length} recorded • {totalDistanceKm.toFixed(1)} km covered
            </Text>
          </View>

          <LiquidGlassPill
            variant="light"
            onPress={() => router.push("/(employee)/visit-history")}
            contentStyle={{ paddingHorizontal: 13, paddingVertical: 8 }}
          >
            <History size={15} color={themeColor} style={{ marginRight: 5 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12 }}>
              Archive
            </Text>
          </LiquidGlassPill>
        </View>

        {/* PROGRESS SUMMARY BAR */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <LiquidGlassCard
            variant="dark"
            borderRadius={24}
            dropletColor={themeColor}
            contentStyle={{ padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 0.8 }}>
                VISIT PROGRESS
              </Text>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22, marginTop: 4 }}>
                {completedCount} Completed • {activeCount} Active
              </Text>
            </View>
            <LiquidGlassButton
              variant="tinted"
              tintColor="rgba(16, 185, 129, 0.85)"
              dropletColor="#34d399"
              onPress={() => router.push("/(employee)/my-sites")}
              contentStyle={{ paddingHorizontal: 14, paddingVertical: 10 }}
            >
              <Navigation size={15} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                New Visit
              </Text>
            </LiquidGlassButton>
          </LiquidGlassCard>
        </View>

        {/* SEARCH + FILTER PILLS */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <LiquidGlassCard
            variant="light"
            borderRadius={16}
            style={{ marginBottom: 10 }}
            contentStyle={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, height: 46 }}
          >
            <Search size={17} color="#64748b" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search site, visit code, or notes..."
              placeholderTextColor="#94a3b8"
              style={{ flex: 1, marginLeft: 8, color: "#0f172a", fontFamily: "Brandon-Medium", fontSize: 14 }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <X size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </LiquidGlassCard>

          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "all", label: `All (${visits.length})` },
              { key: "in_progress", label: `In Progress (${activeCount})` },
              { key: "completed", label: `Completed (${completedCount})` },
            ].map((tab) => {
              const active = filter === tab.key;
              return (
                <LiquidGlassPill
                  key={tab.key}
                  variant="light"
                  active={active}
                  tintColor={`${themeColor}E6`}
                  onPress={() => setFilter(tab.key as any)}
                  style={{ flex: 1 }}
                  contentStyle={{ paddingVertical: 9 }}
                >
                  <Text style={{ color: active ? "#ffffff" : "#334155", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                    {tab.label}
                  </Text>
                </LiquidGlassPill>
              );
            })}
          </View>
        </View>

        {/* REAL VISITS LIST */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadVisits(true)}
              tintColor={themeColor}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 132, gap: 12 }}
        >
          {loading ? (
            <ActivityIndicator color={themeColor} style={{ marginTop: 36 }} />
          ) : filteredVisits.length > 0 ? (
            filteredVisits.map((v) => {
              const isDone = v.status === "completed";
              return (
                <LiquidGlassCard
                  key={v.id}
                  variant="light"
                  borderRadius={24}
                  onPress={() => router.push(`/(employee)/visit/${v.id}` as any)}
                  contentStyle={{ padding: 18 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
                      <LiquidGlassIconBadge
                        size={44}
                        borderRadius={15}
                        variant="light"
                        tintColor={isDone ? "#10b981" : "#f59e0b"}
                        style={{ marginRight: 12 }}
                      >
                        {isDone ? (
                          <CheckCircle2 size={22} color="#10b981" />
                        ) : (
                          <Clock size={22} color="#f59e0b" />
                        )}
                      </LiquidGlassIconBadge>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                          {v.visitCode} • {v.date}
                        </Text>
                        <Text numberOfLines={1} style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginTop: 1 }}>
                          {v.farmerName}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: isDone ? "rgba(16,185,129,0.14)" : "rgba(245,158,11,0.16)",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 999,
                      }}
                    >
                      <Text style={{ color: isDone ? "#059669" : "#b45309", fontFamily: "Brandon-Bold", fontSize: 11 }}>
                        {isDone ? "Completed" : "In Progress"}
                      </Text>
                    </View>
                  </View>

                  {v.address ? (
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                      <MapPin size={14} color="#64748b" />
                      <Text numberOfLines={1} style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 6, flex: 1 }}>
                        {v.address}
                      </Text>
                    </View>
                  ) : null}

                  {v.remarks ? (
                    <Text numberOfLines={2} style={{ color: "#334155", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 8, lineHeight: 19 }}>
                      {v.remarks}
                    </Text>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: 12,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: "rgba(148,163,184,0.18)",
                    }}
                  >
                    <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12 }}>
                      {v.checkInTime}
                      {v.checkOutTime ? ` – ${v.checkOutTime}` : " • Active on site"}
                      {v.distanceKm > 0 ? ` • ${Number(v.distanceKm).toFixed(1)} km` : ""}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      {v.media_count > 0 && (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <Paperclip size={13} color={themeColor} />
                          <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 12, marginLeft: 3 }}>
                            {v.media_count}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            (isDone
                              ? `/(employee)/report/${v.id}`
                              : {
                                  pathname: "/(employee)/visit/report",
                                  params: {
                                    visitId: String(v.id),
                                    farmerId: v.farmerId || "",
                                    siteName: v.farmerName || "",
                                  },
                                }) as any
                          )
                        }
                      >
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                          <FileText size={14} color={themeColor} />
                          <Text style={{ color: themeColor, fontFamily: "Brandon-Bold", fontSize: 13, marginLeft: 4 }}>
                            {isDone ? "View Report" : "Complete Checkout"}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </LiquidGlassCard>
              );
            })
          ) : (
            <LiquidGlassCard
              variant="light"
              borderRadius={26}
              contentStyle={{ padding: 28, alignItems: "center" }}
            >
              <MapPin size={34} color="#94a3b8" style={{ marginBottom: 10 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                No {serviceConfig.vocab.visits} Found
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, textAlign: "center", marginTop: 4 }}>
                {search || filter !== "all"
                  ? "No visits match the active filter."
                  : "Check in at an assigned site to log your first real-time field visit."}
              </Text>
            </LiquidGlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
