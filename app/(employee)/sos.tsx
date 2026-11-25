import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
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
import { showToast } from "../../components/ui/ToastMessage";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
  LiquidGlassPill,
} from "../../components/LiquidGlass";

export default function SOSScreen() {
  const [sosTriggered, setSosTriggered] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [contacts, setContacts] = useState<Array<{ role: string; phone: string; available: string }>>([
    {
      role: "National Emergency Response (Police / Ambulance / Fire)",
      phone: "112",
      available: "24/7 Emergency Services",
    },
  ]);

  useFocusEffect(
    useCallback(() => {
      api
        .get("/employee/sos-contacts")
        .then((res) => {
          if (Array.isArray(res?.contacts) && res.contacts.length > 0) {
            setContacts(res.contacts);
          }
          if (res?.has_active_sos) {
            setSosTriggered(true);
          }
        })
        .catch(() => {});
    }, [])
  );

  const dispatchEmergency = async (incidentType: string) => {
    setDispatching(true);
    let lat: number | undefined;
    let lng: number | undefined;
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status === "granted") {
        const fix = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        lat = fix.coords.latitude;
        lng = fix.coords.longitude;
      }
    } catch {
      // Proceed even if indoor GPS is unavailable
    }

    try {
      await api.post("/employee/sos", {
        latitude: lat,
        longitude: lng,
        incident_type: incidentType,
      });
      setSosTriggered(true);
      Alert.alert(
        "SOS DISPATCHED TO ADMIN",
        lat != null && lng != null
          ? `Your live coordinates (${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E) have been sent to Web Admin Alerts & Live Monitor.`
          : "Your emergency SOS alert has been sent to Web Admin Alerts."
      );
    } catch (err: any) {
      showToast({
        title: "Dispatch Failed",
        message: err?.message || "Use the hotline buttons below to call directly.",
        type: "error",
      });
    } finally {
      setDispatching(false);
    }
  };

  const confirmSOS = (incidentType = "sos_manual") => {
    Alert.alert(
      "CONFIRM CRITICAL EMERGENCY SOS",
      "This immediately transmits a critical SOS alert with your live GPS coordinates to your Company Admin dashboard.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND SOS",
          style: "destructive",
          onPress: () => void dispatchEmergency(incidentType),
        },
      ]
    );
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            variant="dark"
            size={44}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 22 }}>
            Worker Safety & SOS
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110 }}>
          {/* PANIC BUTTON */}
          <View style={{ alignItems: "center", marginVertical: 22 }}>
            <LiquidGlassCard
              variant="tinted"
              tintColor={sosTriggered ? "rgba(220, 38, 38, 0.82)" : "rgba(239, 68, 68, 0.36)"}
              dropletColor="#ef4444"
              borderRadius={100}
              onPress={() => !dispatching && confirmSOS("sos_manual")}
              style={{
                width: 200,
                height: 200,
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.7,
                shadowRadius: 28,
                elevation: 14,
              }}
              contentStyle={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              {dispatching ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <>
                  <AlertOctagon size={72} color="#ffffff" style={{ marginBottom: 8 }} />
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24, letterSpacing: 1 }}>
                    {sosTriggered ? "ALARM ACTIVE" : "PRESS SOS"}
                  </Text>
                  <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>
                    Live GPS Dispatch
                  </Text>
                </>
              )}
            </LiquidGlassCard>

            <LiquidGlassPill
              variant="dark"
              style={{ marginTop: 20 }}
              contentStyle={{ paddingHorizontal: 18, paddingVertical: 9 }}
            >
              <Radio size={15} color={sosTriggered ? "#ef4444" : "#10b981"} style={{ marginRight: 8 }} />
              <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                {sosTriggered ? "Active Alert Visible in Web Admin" : "Connected to Company Safety Monitor"}
              </Text>
            </LiquidGlassPill>
          </View>

          {/* INCIDENT TYPE DISPATCH */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
            QUICK INCIDENT ESCALATION
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Medical", type: "medical_injury", Icon: Ambulance, color: "#38bdf8" },
              { label: "Fire / Hazard", type: "fire_hazard", Icon: Flame, color: "#f97316" },
              { label: "Breakdown", type: "vehicle_breakdown", Icon: ShieldAlert, color: "#a855f7" },
            ].map((inc) => (
              <LiquidGlassCard
                key={inc.type}
                variant="dark"
                borderRadius={20}
                dropletColor={inc.color}
                onPress={() => confirmSOS(inc.type)}
                style={{ flex: 1 }}
                contentStyle={{ padding: 15, alignItems: "center", gap: 8 }}
              >
                <LiquidGlassIconBadge size={44} borderRadius={14} variant="dark" tintColor={inc.color}>
                  <inc.Icon size={22} color={inc.color} />
                </LiquidGlassIconBadge>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13, textAlign: "center" }}>
                  {inc.label}
                </Text>
              </LiquidGlassCard>
            ))}
          </View>

          {/* REAL ESCALATION HOTLINES */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 13, letterSpacing: 1, marginBottom: 12, marginLeft: 4 }}>
            DIRECT ESCALATION HOTLINES
          </Text>
          <View style={{ gap: 12 }}>
            {contacts.map((contact, idx) => (
              <LiquidGlassCard
                key={idx}
                variant="dark"
                borderRadius={22}
                contentStyle={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18 }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
                    {contact.role}
                  </Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                    {contact.available} • {contact.phone}
                  </Text>
                </View>
                <LiquidGlassIconButton
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                  variant="tinted"
                  tintColor="rgba(16, 185, 129, 0.78)"
                  dropletColor="#34d399"
                  size={48}
                >
                  <PhoneCall size={22} color="#ffffff" />
                </LiquidGlassIconButton>
              </LiquidGlassCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
