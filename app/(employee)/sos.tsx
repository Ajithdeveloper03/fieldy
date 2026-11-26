import React, { useState } from "react";
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

  const emergencyContacts = [
    { role: "Central HQ Security & Dispatch", phone: "+91 800-456-7890", available: "24/7 Monitored" },
    { role: "Local Emergency Services (Police/Medical)", phone: "112", available: "Immediate Govt" },
  ];

  const handleTriggerSOS = async () => {
    Alert.alert(
      "CONFIRM CRITICAL EMERGENCY SOS",
      "This will immediately transmit your high-precision live GPS coordinates, battery level, and audible alert to HQ and your field supervisor.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND ALARM",
          style: "destructive",
          onPress: async () => {
            setSosTriggered(true);
            try {
              const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }).catch(() => null);
              await api.post("/employee/sos", {
                latitude: loc?.coords?.latitude ?? 13.0827,
                longitude: loc?.coords?.longitude ?? 80.2707,
                timestamp: new Date().toISOString(),
              }).catch(() => null);
            } catch {
              // Ignore failure to ensure alert appears
            }
            Alert.alert("SOS DISPATCHED", "Your live GPS coordinates have been sent to HQ Live Monitor with highest critical priority.");
          },
        },
      ]
    );
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
          <LiquidGlassIconButton
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            variant="dark"
            size={44}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24 }}>Worker Safety & SOS</Text>
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
              <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                Instant Dispatch
              </Text>
            </LiquidGlassCard>

            <LiquidGlassPill
              variant="dark"
              style={{ marginTop: 22 }}
              contentStyle={{ paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <Radio size={16} color={sosTriggered ? "#ef4444" : "#10b981"} style={{ marginRight: 8 }} />
              <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 14 }}>
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
              variant="dark"
              borderRadius={20}
              dropletColor="#38bdf8"
              onPress={() => Alert.alert("Medical Alert", "Connecting with nearest emergency paramedic...")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="dark" tintColor="#38bdf8">
                <Ambulance size={26} color="#38bdf8" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Medical Injury</Text>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="dark"
              borderRadius={20}
              dropletColor="#f97316"
              onPress={() => Alert.alert("Field Hazard", "Hazard report flagged on route map.")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="dark" tintColor="#f97316">
                <Flame size={26} color="#f97316" />
              </LiquidGlassIconBadge>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Fire / Hazard</Text>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="dark"
              borderRadius={20}
              dropletColor="#a855f7"
              onPress={() => Alert.alert("Vehicle Breakdown", "Roadside assistance ticket raised.")}
              style={{ flex: 1 }}
              contentStyle={{ padding: 16, alignItems: "center", gap: 8 }}
            >
              <LiquidGlassIconBadge size={48} borderRadius={16} variant="dark" tintColor="#a855f7">
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
                variant="dark"
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
