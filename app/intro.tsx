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
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LanguageTogglePill } from "../context/LanguageContext";
import { useService, ServiceSelectorPill } from "../context/ServiceContext";
import { SERVICES_CONFIG } from "../constants/servicesConfig";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
} from "../components/LiquidGlass";

export default function IntroScreen() {
  const insets = useSafeAreaInsets();
  const { serviceConfig } = useService();

  const config = serviceConfig || SERVICES_CONFIG.facility_fmcg;
  const themeColor = config.themeColor || "#059669";
  const accentColor = config.accentColor || "#34d399";
  const vocab = config.vocab || SERVICES_CONFIG.facility_fmcg.vocab;

  return (
    <LiquidGlassBackdrop variant="dark">
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
              <LiquidGlassIconBadge
                size={38}
                borderRadius={13}
                variant="dark"
                tintColor="#4ADE80"
                style={{ marginRight: 9 }}
              >
                <ShieldCheck size={18} color="#4ade80" />
              </LiquidGlassIconBadge>
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

          {/* CENTER FLOATING LIQUID GLASS LOGO PEDESTAL */}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 18,
              zIndex: 10,
            }}
          >
            <LiquidGlassCard
              variant="light"
              borderRadius={28}
              dropletColor={accentColor}
              style={{ width: 224, height: 112 }}
              contentStyle={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 18,
                paddingVertical: 14,
                backgroundColor: "#FFFFFF",
              }}
            >
              <Image
                source={require("../assets/images/logo.png")}
                style={{ width: 184, height: 76 }}
                resizeMode="contain"
              />
            </LiquidGlassCard>
          </View>

          {/* FLOATING APPLE LIQUID GLASS WORKFLOW CARD */}
          <View style={{ paddingHorizontal: 16, zIndex: 20 }}>
            <LiquidGlassCard
              variant="dark"
              borderRadius={34}
              intensity={76}
              dropletColor={themeColor}
              contentStyle={{
                paddingHorizontal: 22,
                paddingTop: 26,
                paddingBottom: 24,
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
                  color: "rgba(255, 255, 255, 0.74)",
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

              {/* LIQUID GLASS ROLE SUB-CARD */}
              <View style={{ gap: 12, marginBottom: 22 }}>
                <LiquidGlassCard
                  variant="tinted"
                  borderRadius={22}
                  tintColor="rgba(16, 185, 129, 0.14)"
                  dropletColor={accentColor}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 14,
                  }}
                >
                  <LiquidGlassIconBadge
                    size={44}
                    borderRadius={14}
                    variant="dark"
                    tintColor={accentColor}
                  >
                    <Briefcase size={20} color={accentColor} />
                  </LiquidGlassIconBadge>

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ffffff",
                          fontFamily: "Brandon-Bold",
                          fontSize: 15,
                          flexShrink: 1,
                        }}
                        numberOfLines={1}
                      >
                        {vocab.staffRole || "Field Staff"}
                      </Text>
                      <View
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.16)",
                          borderWidth: 1,
                          borderColor: "rgba(255, 255, 255, 0.34)",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 999,
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
                        color: "rgba(255, 255, 255, 0.68)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {vocab.visits || "Visits"} & {vocab.tasks || "Tasks"}
                    </Text>
                  </View>
                </LiquidGlassCard>
              </View>

              {/* APPLE LIQUID GLASS PILL CTA BUTTON */}
              <LiquidGlassButton
                onPress={() => router.replace("/(auth)/login")}
                variant="tinted"
                tintColor="rgba(13, 148, 136, 0.72)"
                dropletColor={accentColor}
                style={{ width: "100%" }}
                contentStyle={{
                  paddingVertical: 8,
                  paddingLeft: 24,
                  paddingRight: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
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
                    Staff Login
                  </Text>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: "rgba(255, 255, 255, 0.94)",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.22,
                      shadowRadius: 8,
                    }}
                  >
                    <ArrowRight size={20} color="#062214" />
                  </View>
                </View>
              </LiquidGlassButton>
            </LiquidGlassCard>
          </View>
        </ScrollView>
      </View>
    </LiquidGlassBackdrop>
  );
}
