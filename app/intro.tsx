import { router } from "expo-router";
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
} from "lucide-react-native";
import React from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { LanguageTogglePill } from "../context/LanguageContext";
import { useService, ServiceSelectorPill } from "../context/ServiceContext";
import { SERVICES_CONFIG } from "../constants/servicesConfig";

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { serviceConfig } = useService();

  // Defensive fallback ensuring no undefined property can cause render errors
  const config = serviceConfig || SERVICES_CONFIG.facility_fmcg;
  const themeColor = config.themeColor || "#059669";
  const accentColor = config.accentColor || "#34d399";
  const vocab = config.vocab || SERVICES_CONFIG.facility_fmcg.vocab;

  return (
    <LinearGradient
      colors={["#062214", "#0a331c", "#04140b"]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
                paddingBottom: 24,
              }}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* TOP BRANDING + VERTICAL SWITCHER + LANGUAGE TOGGLE */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 10,
                  zIndex: 20,
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
                      marginRight: 9,
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

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <ServiceSelectorPill dark compact />
                  <LanguageTogglePill dark />
                </View>
              </View>

              {/* CENTER LOGO CARD */}
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 24,
                  paddingVertical: 18,
                  zIndex: 10,
                }}
              >
                <View
                  style={{
                    width: 220,
                    height: 110,
                    borderRadius: 28,
                    backgroundColor: "rgba(255, 255, 255, 0.96)",
                    borderWidth: 2,
                    borderColor: "rgba(74, 222, 128, 0.45)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.28,
                    shadowRadius: 24,
                    elevation: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 16,
                  }}
                >
                  <Image
                    source={require("../assets/images/logo.png")}
                    style={{ width: 185, height: 82 }}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {/* FLOATING DARK FROSTED CARD (Service Vertical Workflows) */}
              <View style={{ paddingHorizontal: 16, zIndex: 20 }}>
                <View
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.94)",
                    borderRadius: 34,
                    paddingHorizontal: 22,
                    paddingTop: 26,
                    paddingBottom: 24,
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
                      fontSize: 25,
                      textAlign: "center",
                      lineHeight: 30,
                      marginBottom: 6,
                    }}
                  >
                    {config.name || "Field Operations Portal"}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.7)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                      textAlign: "center",
                      lineHeight: 18,
                      marginBottom: 20,
                    }}
                  >
                    {config.tagline ||
                      "Field staff & client workspace for real-time operations"}
                  </Text>

                  {/* ROLE CARD */}
                  <View style={{ gap: 12, marginBottom: 22 }}>
                    {/* Field Staff Card */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(16, 185, 129, 0.16)",
                        borderRadius: 20,
                        padding: 14,
                        borderWidth: 1.5,
                        borderColor: accentColor,
                      }}
                    >
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 13,
                          backgroundColor: `${themeColor}35`,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Briefcase size={20} color={accentColor} />
                      </View>

                      <View style={{ marginLeft: 12, flex: 1 }}>
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
                              fontSize: 15,
                            }}
                          >
                            {vocab.staffRole || "Field Staff"}
                          </Text>
                          <View
                            style={{
                              backgroundColor: themeColor,
                              paddingHorizontal: 7,
                              paddingVertical: 2,
                              borderRadius: 6,
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
                              {config.badge || "PRIMARY"}
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
                          {vocab.visits || "Visits"} & {vocab.tasks || "Tasks"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* GLOWING PILL CTA BUTTON WITH CIRCLE ARROW */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.replace("/(auth)/login")}
                    style={{
                      width: "100%",
                      backgroundColor: themeColor,
                      borderRadius: 999,
                      paddingVertical: 9,
                      paddingLeft: 24,
                      paddingRight: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      shadowColor: themeColor,
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
                        fontSize: 16,
                      }}
                    >
                      Staff Login
                    </Text>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 21,
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
            </ScrollView>
      </View>
    </LinearGradient>
  );
}
