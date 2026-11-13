import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useService, ServiceSelectorPill } from "../../../context/ServiceContext";
import {
  ChevronLeft,
  MapPin,
  Phone,
  MessageSquare,
  Calendar,
  Activity,
  FileText,
  MoreVertical,
  ShieldCheck,
  Navigation,
  Camera,
} from "lucide-react-native";

export default function EmployeeSiteContactProfileScreen() {
  const { id } = useLocalSearchParams();
  const { serviceConfig } = useService();
  const [selectedService, setSelectedService] = useState<"audit" | "full">(
    "audit"
  );

  const matchedEntity =
    serviceConfig.sampleEntities.find((e) => e.id === String(id) || e.code === String(id)) ||
    serviceConfig.sampleEntities[0];

  return (
    <View style={{ flex: 1, backgroundColor: "#e2e8f0" }}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* TOP FULL-BLEED ROUNDED PHOTO CARD WITH OVERLAID PILL & VERIFIED TITLE (Reference Image 2 Left Panel) */}
        <View style={{ paddingHorizontal: 14, paddingTop: 12 }}>
          <View
            style={{
              height: 360,
              borderRadius: 36,
              overflow: "hidden",
              backgroundColor: "#062214",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Image
              source={require("../../../assets/images/image5.jpg")}
              style={[
                StyleSheet.absoluteFillObject,
                { width: "100%", height: "100%" },
              ]}
              resizeMode="cover"
            />
            <LinearGradient
              colors={[
                "rgba(6, 34, 20, 0.35)",
                "rgba(6, 34, 20, 0.15)",
                "rgba(6, 34, 20, 0.92)",
              ]}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFillObject}
            />

            {/* Floating Top Header Buttons */}
            <SafeAreaView>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 18,
                  paddingTop: 10,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    router.canGoBack()
                      ? router.back()
                      : router.replace("/(employee)/my-sites")
                  }
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft size={22} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/reports")}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoreVertical size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Bottom Overlaid Tag Pill + Verified Facility Title */}
            <View
              style={{
                position: "absolute",
                bottom: 24,
                left: 22,
                right: 22,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.22)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.4)",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 999,
                  alignSelf: "flex-start",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 12,
                  }}
                >
                  {matchedEntity.type} • {serviceConfig.badge}
                </Text>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 28,
                  }}
                >
                  {matchedEntity.name}
                </Text>
                <View
                  style={{
                    backgroundColor: serviceConfig.themeColor,
                    borderRadius: 12,
                    padding: 4,
                    marginLeft: 10,
                  }}
                >
                  <ShieldCheck size={15} color="#ffffff" />
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <MapPin size={14} color="rgba(255,255,255,0.75)" />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginLeft: 6,
                  }}
                >
                  {matchedEntity.address} • {matchedEntity.size} {matchedEntity.sizeUnit}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* RADIO SELECTION CARDS + PRIMARY BLACK PILL CTA */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <Text
            style={{
              color: "#475569",
              fontFamily: "Brandon-Bold",
              fontSize: 13,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Select {serviceConfig.name} Inspection Protocol
          </Text>

          {/* Option 1 with Floating Top-Left Badge */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedService("audit")}
            style={{
              backgroundColor:
                selectedService === "audit" ? "#ffffff" : "#f1f5f9",
              borderRadius: 22,
              paddingHorizontal: 18,
              paddingVertical: 18,
              borderWidth: selectedService === "audit" ? 1.8 : 1,
              borderColor: selectedService === "audit" ? serviceConfig.themeColor : "#cbd5e1",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            {/* Floating Top-Left Pill Badge */}
            <View
              style={{
                position: "absolute",
                top: -10,
                left: 18,
                backgroundColor: "#0f172a",
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 10,
                }}
              >
                +40 PTS
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor:
                    selectedService === "audit" ? serviceConfig.themeColor : "#94a3b8",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {selectedService === "audit" && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: serviceConfig.themeColor,
                    }}
                  />
                )}
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Routine {serviceConfig.vocab.visit}
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Geofence Check-In & OTP Sign-off
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 16,
                }}
              >
                45 mins
              </Text>
              <Text
                style={{
                  color: "#94a3b8",
                  fontFamily: "Brandon-Medium",
                  fontSize: 12,
                  textDecorationLine: "line-through",
                }}
              >
                90 mins
              </Text>
            </View>
          </TouchableOpacity>

          {/* Option 2 */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setSelectedService("full")}
            style={{
              backgroundColor:
                selectedService === "full" ? "#ffffff" : "#f1f5f9",
              borderRadius: 22,
              paddingHorizontal: 18,
              paddingVertical: 18,
              borderWidth: selectedService === "full" ? 1.8 : 1,
              borderColor: selectedService === "full" ? serviceConfig.themeColor : "#cbd5e1",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor:
                    selectedService === "full" ? serviceConfig.themeColor : "#94a3b8",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                {selectedService === "full" && (
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: serviceConfig.themeColor,
                    }}
                  />
                )}
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Full {serviceConfig.vocab.entitySingular} Overhaul
                </Text>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Complete SLA Quality & Sensor Audit
                </Text>
              </View>
            </View>

            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
              }}
            >
              2.5 hrs
            </Text>
          </TouchableOpacity>

          {/* Primary CTA Button */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/(employee)/visit/${id || "1"}` as any)}
            style={{
              backgroundColor: "#0f172a",
              borderRadius: 999,
              paddingVertical: 18,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 8,
              marginBottom: 14,
            }}
          >
            <Calendar size={18} color="#4ade80" style={{ marginRight: 10 }} />
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 16,
              }}
            >
              {selectedService === "audit"
                ? `Start Routine ${serviceConfig.vocab.visit} • Check-In`
                : `Start Full ${serviceConfig.vocab.entitySingular} Overhaul`}
            </Text>
          </TouchableOpacity>

          {/* Quick Contact Row */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 28 }}>
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${matchedEntity.contactPhone || '+919876543210'}`)}
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 999,
                paddingVertical: 13,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#cbd5e1",
              }}
            >
              <Phone size={16} color="#0f172a" style={{ marginRight: 8 }} />
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Call {serviceConfig.vocab.customerRole}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  `${serviceConfig.vocab.entitySingular} Chat`,
                  `Connecting to ${matchedEntity.contactName} (${serviceConfig.vocab.customerRole})...`
                )
              }
              style={{
                flex: 1,
                backgroundColor: "#ffffff",
                borderRadius: 999,
                paddingVertical: 13,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#cbd5e1",
              }}
            >
              <MessageSquare
                size={16}
                color="#0f172a"
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 14,
                }}
              >
                Direct Chat
              </Text>
            </TouchableOpacity>
          </View>

          {/* RECENT VISIT REPORTS TIMELINE */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 20,
              }}
            >
              Visit History
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/reports")}>
              <Text
                style={{
                  color: "#15803d",
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                }}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 28,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#10b981",
                    marginBottom: 4,
                  }}
                />
                <View
                  style={{ width: 2, flex: 1, backgroundColor: "#e2e8f0" }}
                />
              </View>
              <View style={{ flex: 1, paddingBottom: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    Routine Inspection
                  </Text>
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                    }}
                  >
                    12 Jan
                  </Text>
                </View>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  Structural inspection is clear. Maintain the approved safety controls
                  top-dressing.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/report/1")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 12,
                    alignSelf: "flex-start",
                    backgroundColor: "#f0fdf4",
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 999,
                  }}
                >
                  <FileText size={14} color="#15803d" />
                  <Text
                    style={{
                      color: "#15803d",
                      fontFamily: "Brandon-Bold",
                      fontSize: 12,
                      marginLeft: 6,
                    }}
                  >
                    Open Report
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ flexDirection: "row" }}>
              <View style={{ alignItems: "center", marginRight: 16 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: "#cbd5e1",
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                    }}
                  >
                    Initial Assessment
                  </Text>
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                    }}
                  >
                    28 Dec
                  </Text>
                </View>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  First registration visit. Mapped farm boundaries.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
