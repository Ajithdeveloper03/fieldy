import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Settings,
  ShieldCheck,
  Map,
  Users,
  Edit3,
  Award,
  CalendarDays,
  Target,
  ArrowRight,
  Sparkles,
  FileText,
  ClipboardCheck,
} from "lucide-react-native";

export default function EmployeeProfileScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Cinematic Drone Map Background (View + Absolute Image) */}
      <Image
        source={require("../../assets/images/image2.jpg")}
        style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[
          "rgba(6, 34, 20, 0.82)",
          "rgba(6, 34, 20, 0.96)",
          "#062214",
        ]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow */}
      <View
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          marginLeft: -150,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(16, 185, 129, 0.16)",
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <ChevronLeft size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 19,
            }}
          >
            Officer Profile
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(employee)/menu")}
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <Settings size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            paddingTop: 8,
          }}
        >
          {/* HERO PROFILE CARD WITH FLANKING METRICS & DUAL PILLS (Reference Image 2 Right Panel) */}
          <View
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.75)",
              borderRadius: 36,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255, 255, 255, 0.14)",
              marginBottom: 18,
              alignItems: "center",
            }}
          >
            {/* Avatar Flanked by Left & Right Metrics ("1.2K | Avatar | 4.5K") */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                paddingHorizontal: 8,
                marginBottom: 18,
              }}
            >
              {/* Left Metric */}
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 22,
                  }}
                >
                  124
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Clients
                </Text>
              </View>

              {/* Center Circular Framed Avatar */}
              <View
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 56,
                  borderWidth: 3,
                  borderColor: "rgba(74, 222, 128, 0.7)",
                  padding: 4,
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                <Image
                  source={require("../../assets/images/image1.jpg")}
                  style={{ width: "100%", height: "100%", borderRadius: 52 }}
                />
              </View>

              {/* Right Metric */}
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 22,
                  }}
                >
                  4.2K
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  Acres
                </Text>
              </View>
            </View>

            {/* Name + Verified Badge */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 26,
                }}
              >
                Robert Walker
              </Text>
              <View
                style={{
                  backgroundColor: "#10b981",
                  borderRadius: 12,
                  padding: 3,
                  marginLeft: 8,
                }}
              >
                <ShieldCheck size={14} color="#ffffff" />
              </View>
            </View>

            <Text
              style={{
                color: "rgba(255,255,255,0.65)",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                marginBottom: 22,
              }}
            >
              Senior Field Agronomist • ID: FO-902
            </Text>

            {/* Dual Outlined Pill Buttons (Reference Image 2: "Подписаться" | "Написать") */}
            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
              <TouchableOpacity
                onPress={() => router.push("/(employee)/edit-profile")}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingVertical: 13,
                  borderWidth: 1.2,
                  borderColor: "rgba(255, 255, 255, 0.45)",
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Edit3 size={15} color="#ffffff" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  Edit Credentials
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(employee)/performance")}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  paddingVertical: 13,
                  borderWidth: 1.2,
                  borderColor: "#4ade80",
                  backgroundColor: "rgba(74, 222, 128, 0.14)",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <Award size={15} color="#4ade80" style={{ marginRight: 6 }} />
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  KPI Analytics
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SPLIT BENTO FEATURE CARDS (Reference Image 2 Middle Row: Light Info Card Left + Photo Tile Right) */}
          <View
            style={{
              flexDirection: "row",
              gap: 14,
              marginBottom: 18,
              height: 220,
            }}
          >
            {/* Left Light Bento Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: "#e2e8f0",
                borderRadius: 32,
                padding: 18,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ alignItems: "center" }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: "#ffffff",
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <Image
                    source={require("../../assets/images/image1.jpg")}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    Robert Walker
                  </Text>
                  <ShieldCheck
                    size={13}
                    color="#0f172a"
                    style={{ marginLeft: 4 }}
                  />
                </View>
                <Text
                  style={{
                    color: "#475569",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    textAlign: "center",
                    lineHeight: 16,
                    marginTop: 6,
                  }}
                >
                  892 Verified Field Audits & 98% SLA Resolution Rate
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(employee)/tasks")}
                style={{
                  backgroundColor: "#0f172a",
                  width: "100%",
                  paddingVertical: 11,
                  borderRadius: 999,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Work Orders
                </Text>
              </TouchableOpacity>
            </View>

            {/* Right Scenic Image Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => router.push("/(employee)/my-farmers")}
              style={{
                flex: 1,
                borderRadius: 32,
                overflow: "hidden",
                backgroundColor: "#0f172a",
              }}
            >
              <Image
                source={require("../../assets/images/image5.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(6, 34, 20, 0.85)"]}
                style={StyleSheet.absoluteFillObject}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  right: 16,
                }}
              >
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 10,
                    letterSpacing: 1,
                  }}
                >
                  SECTOR A-4
                </Text>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Active Sites
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* WIDE HORIZONTAL FEATURE CARD (Reference Image 2 Bottom Card: "✦ Урок 3 | Как делать прогноз волн? | Смотреть курс" + Right Image) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(employee)/performance")}
            style={{
              backgroundColor: "#e2e8f0",
              borderRadius: 32,
              padding: 6,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
              height: 150,
            }}
          >
            <View
              style={{
                flex: 1.15,
                paddingHorizontal: 18,
                paddingVertical: 14,
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Sparkles size={13} color="#475569" style={{ marginRight: 5 }} />
                <Text
                  style={{
                    color: "#475569",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Monthly Quota • 86%
                </Text>
              </View>

              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 18,
                  lineHeight: 22,
                }}
              >
                How is your SLA efficiency trending?
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  View Performance Log
                </Text>
                <ArrowRight
                  size={14}
                  color="#0f172a"
                  style={{ marginLeft: 4 }}
                />
              </View>
            </View>

            <View
              style={{
                flex: 0.95,
                height: "100%",
                borderRadius: 26,
                overflow: "hidden",
              }}
            >
              <Image
                source={require("../../assets/images/image10.jpg")}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>

          {/* OPERATIONAL IMPACT METRICS GRID */}
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 19,
              marginBottom: 14,
            }}
          >
            Operational Impact
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {[
              {
                icon: Users,
                label: "Farmers Managed",
                value: "124",
                color: "#38bdf8",
                route: "/(employee)/my-farmers",
              },
              {
                icon: Map,
                label: "Acres Covered",
                value: "4.2k",
                color: "#4ade80",
                route: "/(employee)/map",
              },
              {
                icon: Target,
                label: "Reports Filed",
                value: "892",
                color: "#fbbf24",
                route: "/(employee)/reports",
              },
              {
                icon: Award,
                label: "Resolution Rate",
                value: "98%",
                color: "#f472b6",
                route: "/(employee)/performance",
              },
            ].map((metric, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => router.push(metric.route as any)}
                style={{
                  width: "48%",
                  backgroundColor: "rgba(255,255,255,0.06)",
                  borderRadius: 24,
                  padding: 18,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${metric.color}20`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <metric.icon size={20} color={metric.color} />
                </View>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 24,
                    marginBottom: 2,
                  }}
                >
                  {metric.value}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  {metric.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
