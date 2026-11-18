import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  MapPin,
  Ambulance,
  Radio,
  Flame,
  CheckCircle2,
  Users,
} from "lucide-react-native";

export default function SOSScreen() {
  const [sosTriggered, setSosTriggered] = useState(false);

  const emergencyContacts = [
    { role: "Central HQ Security & Dispatch", phone: "+91 800-456-7890", available: "24/7 Monitored" },
    { role: "Regional Supervisor (RM Delta)", phone: "+91 8428060946", available: "On Duty" },
    { role: "Local Emergency Services (Police/Medical)", phone: "112", available: "Immediate Govt" },
  ];

  const handleTriggerSOS = () => {
    Alert.alert(
      "CONFIRM CRITICAL EMERGENCY SOS",
      "This will immediately transmit your high-precision live GPS coordinates, battery level, and audible alert to HQ and your field supervisor.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SEND ALARM",
          style: "destructive",
          onPress: () => {
            setSosTriggered(true);
            Alert.alert("SOS DISPATCHED", "Your location (11.0168° N, 76.9558° E) has been sent to HQ Live Monitor with highest critical priority.");
          },
        },
      ]
    );
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0b0f19" }}>
      <StatusBar barStyle="light-content" />

      {/* Red ambient halo if SOS active */}
      <View
        style={{
          position: "absolute",
          top: -50,
          left: 0,
          right: 0,
          height: 300,
          backgroundColor: sosTriggered ? "rgba(239, 68, 68, 0.25)" : "rgba(220, 38, 38, 0.1)",
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }}>
          <TouchableOpacity
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard"))}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={26} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 24 }}>Worker Safety & SOS</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, paddingBottom: 110 }}>
          {/* BIG SOS PANIC BUTTON */}
          <View style={{ alignItems: "center", marginVertical: 24 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTriggerSOS}
              style={{
                width: 204,
                height: 204,
                borderRadius: 102,
                backgroundColor: sosTriggered ? "#dc2626" : "rgba(239, 68, 68, 0.22)",
                borderWidth: 4,
                borderColor: "#ef4444",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#ef4444",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 30,
                elevation: 15,
              }}
            >
              <AlertOctagon size={76} color="#ffffff" style={{ marginBottom: 8 }} />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 25, letterSpacing: 1 }}>
                {sosTriggered ? "ALARM ACTIVE" : "PRESS SOS"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Brandon-Medium", fontSize: 13, marginTop: 4 }}>
                Instant Dispatch
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 22, backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999 }}>
              <Radio size={16} color={sosTriggered ? "#ef4444" : "#10b981"} />
              <Text style={{ color: "#e2e8f0", fontFamily: "Brandon-Bold", fontSize: 14 }}>
                {sosTriggered ? "High-Priority GPS Streaming" : "GPS Satellite Lock • Ready"}
              </Text>
            </View>
          </View>

          {/* QUICK INCIDENT REPORT */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 14, letterSpacing: 1, marginBottom: 14, marginLeft: 4 }}>
            HAZARD & INCIDENT TYPE
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 26 }}>
            <TouchableOpacity
              onPress={() => Alert.alert("Medical Alert", "Connecting with nearest emergency paramedic...")}
              style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.85)", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", gap: 8 }}
            >
              <Ambulance size={30} color="#38bdf8" />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Medical Injury</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Field Hazard", "Hazard report flagged on route map.")}
              style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.85)", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", gap: 8 }}
            >
              <Flame size={30} color="#f97316" />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Fire / Hazard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Vehicle Breakdown", "Roadside assistance ticket raised.")}
              style={{ flex: 1, backgroundColor: "rgba(30, 41, 59, 0.85)", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", alignItems: "center", gap: 8 }}
            >
              <ShieldAlert size={30} color="#a855f7" />
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 14, textAlign: "center" }}>Breakdown</Text>
            </TouchableOpacity>
          </View>

          {/* EMERGENCY CONTACTS LIST */}
          <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Bold", fontSize: 14, letterSpacing: 1, marginBottom: 14, marginLeft: 4 }}>
            DIRECT ESCALATION HOTLINES
          </Text>
          <View style={{ gap: 12 }}>
            {emergencyContacts.map((contact, idx) => (
              <View
                key={idx}
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(30, 41, 59, 0.78)", padding: 18, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18 }}>{contact.role}</Text>
                  <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 14, marginTop: 4 }}>{contact.available} • {contact.phone}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(contact.phone)}
                  style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" }}
                >
                  <PhoneCall size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
