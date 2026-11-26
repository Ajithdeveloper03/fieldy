import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Location from "expo-location";
import {
  ChevronLeft,
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  Ambulance,
  Radio,
  Flame,
} from "lucide-react-native";
import { api } from "../../services/api";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import { emitLiveSync } from "../../utils/liveSyncBus";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function SOSScreen() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<
    { role: string; phone: string; available: string }[]
  >([
    { role: "National Emergency Response (Police / Medical / Fire)", phone: "112", available: "24/7 Emergency Services" },
  ]);

  const loadSosState = useCallback(async () => {
    try {
      const res = await api.get("/employee/sos-contacts");
      const payload = res?.data ?? res;
      if (typeof payload?.has_active_sos === "boolean") {
        setSosTriggered(payload.has_active_sos);
      }
      if (Array.isArray(payload?.contacts) && payload.contacts.length > 0) {
        setEmergencyContacts(payload.contacts);
      }
    } catch {
      // Keep default emergency contact when offline
    }
  }, []);

  useLiveRefresh(loadSosState, 10000);

  const dispatchSos = async (incidentType = "Emergency SOS") => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync().catch(() => ({ granted: false }));
      const loc = perm.granted
        ? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null)
        : null;
      await api.post("/employee/sos", {
        latitude: loc?.coords?.latitude ?? null,
        longitude: loc?.coords?.longitude ?? null,
        incident_type: incidentType,
      });
      setSosTriggered(true);
      emitLiveSync("notifications");
      Alert.alert(
        "SOS DISPATCHED",
        "Your emergency alert & live GPS coordinates have been sent to Web Admin Alerts and Live Monitor."
      );
    } catch (err: any) {
      Alert.alert(
        "SOS Sync Error",
        err?.message || "Could not reach server. Please call your emergency contact directly."
      );
    }
  };

  const handleTriggerSOS = async () => {
    Alert.alert(
      "CONFIRM CRITICAL EMERGENCY SOS",
      "This will immediately transmit your high-precision live GPS coordinates and critical alert to your Web Admin Live Monitor.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND ALARM",
          style: "destructive",
          onPress: () => {
            void dispatchSos("Critical Manual SOS");
          },
        },
      ]
    );
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            variant="light"
            size={44}
          >
            <ChevronLeft size={26} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 24 }}>Worker Safety & SOS</Text>
          <View style={{ width: 44 }} />
        </View>

        <PageHeroBanner
          badge="PRIORITY 1"
          title="Emergency SOS"
          subtitle="Instant live GPS alert to Company Admin"
          colors={["#dc2626", "#991b1b"]}
          personIndex={4}
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 110 }}>
          {/* BIG SOS PANIC BUTTON */}
          <View style={{ alignItems: "center", marginVertical: 24 }}>
            <LiquidGlassCard
              variant="tinted"
              tintColor={sosTriggered ? "rgba(220, 38, 38, 0.78)" : "rgba(239, 68, 68, 0.34)"}
              dropletColor="#ef4444"
              borderRadius={102}
              onPress={handleTriggerSOS}
              style={{
                width: 204,
                height: 204,
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.75,
                shadowRadius: 30,
                elevation: 15,
              }}
              contentStyle={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertOctagon size={76} color="#ffffff" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25, letterSpacing: 1 }}>
                {sosTriggered ? "ALARM ACTIVE" : "PRESS SOS"}
              </Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                Instant Dispatch
              </Text>
            </LiquidGlassCard>

            <LiquidGlassPill
              variant="light"
              style={{ marginTop: 22 }}
              contentStyle={{ paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <Radio size={16} color={sosTriggered ? "#ef4444" : "#10b981"} style={{ marginRight: 8 }} />
              <Text style={{ color: "#334155", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                {sosTriggered ? "High-Priority GPS Streaming" : "GPS Satellite Lock • Ready"}
              </Text>
            </LiquidGlassPill>
          </View>

          {/* QUICK INCIDENT REPORT */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 14, letterSpacing: 1, marginBottom: 14, marginLeft: 4 }}>
            HAZARD & INCIDENT TYPE
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 26 }}>
            <LiquidGlassCard
              variant="light"
              borderRadius={20}
              dropletColor="#38bdf8"
              onPress={() => void dispatchSos("Medical Injury")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="light" tintColor="#38bdf8">
                <Ambulance size={26} color="#38bdf8" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Medical Injury</Text>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="light"
              borderRadius={20}
              dropletColor="#f97316"
              onPress={() => void dispatchSos("Fire / Field Hazard")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="light" tintColor="#f97316">
                <Flame size={26} color="#f97316" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Fire / Hazard</Text>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="light"
              borderRadius={20}
              dropletColor="#a855f7"
              onPress={() => Alert.alert("Vehicle Breakdown", "Roadside assistance ticket raised.")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="light" tintColor="#a855f7">
                <ShieldAlert size={26} color="#a855f7" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Breakdown</Text>
            </LiquidGlassCard>
          </View>

          {/* EMERGENCY CONTACTS LIST */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 14, letterSpacing: 1, marginBottom: 14, marginLeft: 4 }}>
            DIRECT ESCALATION HOTLINES
          </Text>
          <View style={{ gap: 12 }}>
            {emergencyContacts.map((contact, idx) => (
              <LiquidGlassCard
                key={idx}
                variant="light"
                borderRadius={22}
                contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18 }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>{contact.role}</Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>{contact.available} • {contact.phone}</Text>
                </View>
                <LiquidGlassIconButton
                  onPress={() => handleCall(contact.phone)}
                  variant="tinted"
                  tintColor="rgba(16, 185, 129, 0.78)"
                  dropletColor="#34d399"
                  size={52}
                >
                  <PhoneCall size={24} color="#ffffff" />
                </LiquidGlassIconButton>
              </LiquidGlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
