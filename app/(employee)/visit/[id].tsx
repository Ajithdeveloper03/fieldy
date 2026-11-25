import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  MapPin,
  CalendarDays,
  Target,
  ClipboardList,
  Navigation,
  Camera,
  ShieldCheck
} from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import { api } from "../../../services/api";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function EmployeeVisitPurposeScreen() {
  const { id } = useLocalSearchParams();
  const { serviceConfig } = useService();

  const [liveVisit, setLiveVisit] = React.useState<any | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const res = await api.get("/employee/visits").catch(() => null);
      const found = (res?.visits || []).find((v: any) => String(v.id) === String(id));
      if (active && found) setLiveVisit(found);
    })();
    return () => {
      active = false;
    };
  }, [id]);

  const matchedVisit = liveVisit
    ? {
        site: liveVisit.farmerName || liveVisit.site,
        time: [liveVisit.date, liveVisit.time].filter(Boolean).join(", "),
        type: liveVisit.type,
      }
    : null;
  const matchedEntity = liveVisit ? { name: liveVisit.farmerName, address: liveVisit.address } : null;

  const actionItems = [
    { text: `Verify Geofence On-Site Check-in at ${serviceConfig.vocab.entitySingular}`, icon: MapPin, color: "#10b981" },
    { text: `Capture standard photo evidence of ${serviceConfig.vocab.entitySingular.toLowerCase()}`, icon: Camera, color: serviceConfig.color },
    { text: `Log ${serviceConfig.shortName} telemetry and diagnostic readings`, icon: ClipboardList, color: "#f59e0b" },
    { text: `Run ${serviceConfig.vocab.customerRole} validation and sign-off`, icon: ShieldCheck, color: "#6366f1" },
  ];

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="light-content" />

      {/* Hero Header Gradient */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 250 }}>
        <LinearGradient
          colors={["#0f172a", "#1e293b", "rgba(243, 241, 236, 0)"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}>
          <LiquidGlassIconButton
            variant="dark"
            size={42}
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 20 }}>{serviceConfig.vocab.visitSingular} Details</Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          
          {/* Target Profile Card */}
          <LiquidGlassCard
            variant="light"
            borderRadius={32}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 24 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#e2e8f0", overflow: "hidden", marginRight: 16 }}>
                <Image source={require("../../../assets/images/image3.jpg")} style={{ width: "100%", height: "100%" }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 22 }}>
                  {matchedVisit?.site || matchedEntity?.name || "Client Location"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <MapPin size={14} color="#64748b" />
                  <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginLeft: 4 }}>
                    {matchedEntity?.address || "Assigned Field Location"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.56)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.90)", padding: 16, borderRadius: 16, alignItems: "center" }}>
              <CalendarDays size={20} color={serviceConfig.color} style={{ marginRight: 12 }} />
              <View>
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>{matchedVisit?.time || "Scheduled"}</Text>
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Scheduled {serviceConfig.label} {serviceConfig.vocab.visitSingular}</Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* VISIT PURPOSE */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>{serviceConfig.label} Protocol</Text>
          <LiquidGlassCard
            variant="light"
            borderRadius={24}
            style={{ marginBottom: 24 }}
            contentStyle={{ padding: 24 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <Target size={24} color={serviceConfig.color} />
              <Text style={{ color: serviceConfig.color, fontFamily: "Brandon-Bold", fontSize: 18, marginLeft: 12 }}>
                {matchedVisit?.type || `${serviceConfig.label} Operation Audit`}
              </Text>
            </View>
            <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 15, lineHeight: 24 }}>
              Execute standard {serviceConfig.vocab.taskSingular.toLowerCase()} protocol on this {serviceConfig.vocab.entitySingular.toLowerCase()}. Ensure all compliance checklist items, sensor readings, and {serviceConfig.vocab.customerRole.toLowerCase()} sign-offs are submitted to cloud telemetry.
            </Text>
          </LiquidGlassCard>

          {/* REQUIRED TASKS CHECKLIST */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Required Action Items</Text>
          <View style={{ gap: 12, marginBottom: 32 }}>
            {actionItems.map((task, idx) => (
              <LiquidGlassCard
                key={idx}
                variant="light"
                borderRadius={16}
                contentStyle={{ flexDirection: "row", alignItems: "center", padding: 16 }}
              >
                <LiquidGlassIconBadge
                  variant="light"
                  size={36}
                  borderRadius={18}
                  tintColor={task.color}
                  style={{ marginRight: 16 }}
                >
                  <task.icon size={18} color={task.color} />
                </LiquidGlassIconBadge>
                <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 15, flex: 1 }}>{task.text}</Text>
              </LiquidGlassCard>
            ))}
          </View>

          {/* START VISIT ACTIONS */}
          <View style={{ flexDirection: "row", gap: 16 }}>
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/tracking")}
              variant="dark"
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
            >
              <Navigation size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Start GPS</Text>
            </LiquidGlassButton>
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/check-in")}
              variant="tinted"
              tintColor={`${serviceConfig.color}CC`}
              dropletColor={serviceConfig.color}
              style={{ flex: 1 }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 16 }}
            >
              <Camera size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Check-In</Text>
            </LiquidGlassButton>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
