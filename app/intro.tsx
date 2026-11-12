import { router } from "expo-router";
import { Building2, Briefcase, ArrowRight, ShieldCheck } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage, LanguageTogglePill } from "../context/LanguageContext";

export default function IntroScreen() {
  const [role, setRole] = useState<"site_contact" | "employee">("employee");
  const { t, language } = useLanguage();

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Full-Screen Hero Image with Modern View + Absolute Image */}
      <Image
        source={require("../assets/images/image18.jpg")}
        style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          "rgba(6, 34, 20, 0.55)",
          "rgba(6, 34, 20, 0.35)",
          "rgba(6, 34, 20, 0.92)",
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: "space-between" }}>
        {/* TOP BRANDING + LANGUAGE TOGGLE */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: "rgba(74, 222, 128, 0.2)",
                borderWidth: 1,
                borderColor: "rgba(74, 222, 128, 0.4)",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              <ShieldCheck size={18} color="#4ade80" />
            </View>
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 18,
                letterSpacing: 2,
              }}
            >
              FIELDY
            </Text>
          </View>
          <LanguageTogglePill />
        </View>

        {/* CENTER LOGO CARD */}
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: 240,
              height: 128,
              borderRadius: 32,
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              borderWidth: 2,
              borderColor: "rgba(74, 222, 128, 0.45)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.3,
              shadowRadius: 28,
              elevation: 14,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 20,
            }}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 200, height: 92 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* FLOATING NOMADSTAY-STYLE DARK FROSTED CARD (Reference Image 3) */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          <View
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.94)",
              borderRadius: 36,
              paddingHorizontal: 24,
              paddingTop: 28,
              paddingBottom: 28,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.14)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.45,
              shadowRadius: 32,
              elevation: 18,
            }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 28,
                textAlign: "center",
                lineHeight: 34,
                marginBottom: 8,
              }}
            >
              Field Operations Portal
            </Text>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.65)",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
                marginBottom: 22,
              }}
            >
              Field staff & technician workspace for real-time facility
              inspections, attendance, and SLA execution.
            </Text>

            {/* ROLE SELECTION PILLS (Inspired by Reference Image 2 Radio Cards) */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRole("employee")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    role === "employee"
                      ? "rgba(16, 185, 129, 0.16)"
                      : "rgba(255, 255, 255, 0.05)",
                  borderRadius: 22,
                  padding: 16,
                  borderWidth: role === "employee" ? 1.5 : 1,
                  borderColor:
                    role === "employee"
                      ? "#4ade80"
                      : "rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Radio Indicator */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor:
                      role === "employee" ? "#4ade80" : "rgba(255,255,255,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  {role === "employee" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#4ade80",
                      }}
                    />
                  )}
                </View>

                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor:
                      role === "employee"
                        ? "rgba(74, 222, 128, 0.2)"
                        : "rgba(255, 255, 255, 0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Briefcase
                    size={22}
                    color={role === "employee" ? "#4ade80" : "#94a3b8"}
                  />
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 16,
                      }}
                    >
                      Facility Staff / Technician
                    </Text>
                    <View
                      style={{
                        backgroundColor: "#16a34a",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontSize: 9,
                          fontFamily: "Brandon-Bold",
                          letterSpacing: 0.5,
                        }}
                      >
                        PRIMARY
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    GPS Tracking, Attendance, Audits & Work Orders
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setRole("site_contact")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor:
                    role === "site_contact"
                      ? "rgba(16, 185, 129, 0.16)"
                      : "rgba(255, 255, 255, 0.05)",
                  borderRadius: 22,
                  padding: 16,
                  borderWidth: role === "site_contact" ? 1.5 : 1,
                  borderColor:
                    role === "site_contact"
                      ? "#4ade80"
                      : "rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Radio Indicator */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor:
                      role === "site_contact" ? "#4ade80" : "rgba(255,255,255,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  {role === "site_contact" && (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#4ade80",
                      }}
                    />
                  )}
                </View>

                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor:
                      role === "site_contact"
                        ? "rgba(74, 222, 128, 0.2)"
                        : "rgba(255, 255, 255, 0.08)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Building2
                    size={22}
                    color={role === "site_contact" ? "#4ade80" : "#94a3b8"}
                  />
                </View>

                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    Facility / Client Access
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Client reporting & service tickets (Optional)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* GLOWING PILL CTA BUTTON WITH CIRCLE ARROW (Reference Screens 3 & 5) */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                if (role === "employee") {
                  router.replace("/(auth)/login");
                } else {
                  router.replace("/(auth)/site-contact-login");
                }
              }}
              style={{
                width: "100%",
                backgroundColor: "#16a34a",
                borderRadius: 999,
                paddingVertical: 10,
                paddingLeft: 28,
                paddingRight: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#10b981",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 17,
                }}
              >
                {role === "employee"
                  ? "Login to Staff Workspace"
                  : "Access Client Portal"}
              </Text>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowRight size={20} color="#062214" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
