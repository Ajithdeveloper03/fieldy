import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Settings,
  Calendar,
  CheckCircle2,
  BarChart3,
  User,
  TrendingUp,
  Award,
  Clock,
  ArrowUpRight,
  Zap,
  ShieldCheck,
} from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeePerformanceScreen() {
  const [autoRouting, setAutoRouting] = useState(true);

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER (Reference Image 5 Minimalist Header) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          <LiquidGlassIconButton
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            variant="light"
            size={44}
          >
            <ChevronLeft size={22} color="#0f172a" />
          </LiquidGlassIconButton>

          <Text
            style={{
              color: "#0f172a",
              fontFamily: "Brandon-Bold",
              fontSize: 24,
            }}
          >
            Performance & KPIs
          </Text>

          <LiquidGlassIconButton
            onPress={() => router.push("/(employee)/menu")}
            variant="light"
            size={44}
          >
            <Settings size={20} color="#0f172a" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
            paddingTop: 6,
          }}
        >
          {/* TOP HERO DIAL CARD (Reference Image 5 Center Screen: "Air Condition" + 3 Sub-Columns + Semi-Circle Gauge) */}
          <LiquidGlassCard
            variant="light"
            borderRadius={36}
            style={{ marginBottom: 20 }}
            contentStyle={{ padding: 24 }}
          >
            {/* Card Title + Toggle Switch */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 20,
                }}
              >
                SLA Efficiency Quota
              </Text>
              <Switch
                value={autoRouting}
                onValueChange={setAutoRouting}
                trackColor={{ false: "#e2e8f0", true: "#10b981" }}
                thumbColor="#ffffff"
              />
            </View>

            {/* 3 Minimal Sub-Columns (Reference Image 5: "Fan Speed | Timer | Auto Mode") */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 24,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Target Quota
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  45 Audits / Mo
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Avg Turnaround
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  Hours &lt; 2.4h
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                  }}
                >
                  Auto-Dispatch
                </Text>
                <Text
                  style={{
                    color: "#10b981",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {autoRouting ? "Active [On]" : "Manual [Off]"}
                </Text>
              </View>
            </View>

            {/* Glowing Semi-Circular Arc Gauge ("22°C" -> "86%") */}
            <View style={{ alignItems: "center", paddingTop: 6 }}>
              <View
                style={{
                  width: 240,
                  height: 125,
                  overflow: "hidden",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: 120,
                    borderWidth: 16,
                    borderColor: "rgba(148, 163, 184, 0.25)",
                    borderTopColor: "#10b981",
                    borderLeftColor: "#34d399",
                    borderRightColor: "#059669",
                    transform: [{ rotate: "-15deg" }],
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#94a3b8",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    100%
                  </Text>
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 56,
                      lineHeight: 60,
                    }}
                  >
                    86%
                  </Text>
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Medium",
                      fontSize: 14,
                    }}
                  >
                    Reached 480 pts in 18 days
                  </Text>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: 240,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                  }}
                >
                  0%
                </Text>
                <Text
                  style={{
                    color: "#10b981",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                  }}
                >
                  Optimal SLA
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* ANALYTICS & POINTS BREAKDOWN CARD (Reference Image 5 Right Screen: "361.9 kWh" + Area Chart + Cost Rows) */}
          <LiquidGlassCard
            variant="light"
            borderRadius={32}
            style={{ marginBottom: 20 }}
            contentStyle={{ padding: 22 }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 32,
                  }}
                >
                  480.0 Pts
                </Text>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Total Incentive Score • October 2026
                </Text>
              </View>
              {/* Dot-Matrix Badge Icon */}
              <LiquidGlassIconBadge
                size={58}
                borderRadius={16}
                variant="light"
                tintColor="#10b981"
              >
                <Zap size={20} color="#10b981" />
                <Text
                  style={{
                    color: "#15803d",
                    fontFamily: "Brandon-Bold",
                    fontSize: 10,
                    marginTop: 2,
                  }}
                >
                  TIER 1
                </Text>
              </LiquidGlassIconBadge>
            </View>

            {/* Simulated Area Trend Bars */}
            <View style={{ marginBottom: 18 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  Weekly Output Optimization
                </Text>
                <View
                  style={{
                    backgroundColor: "rgba(220, 252, 231, 0.85)",
                    borderWidth: 1,
                    borderColor: "rgba(21, 128, 61, 0.18)",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      color: "#15803d",
                      fontFamily: "Brandon-Bold",
                      fontSize: 11,
                    }}
                  >
                    +14.2%
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  height: 90,
                  paddingTop: 10,
                  paddingHorizontal: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.45)",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.85)",
                  borderRadius: 20,
                  paddingBottom: 10,
                }}
              >
                {[
                  { day: "Mon", h: 42, active: false },
                  { day: "Tue", h: 56, active: false },
                  { day: "Wed", h: 48, active: false },
                  { day: "Thu", h: 72, active: true },
                  { day: "Fri", h: 64, active: false },
                  { day: "Sat", h: 68, active: false },
                  { day: "Sun", h: 52, active: false },
                ].map((bar, i) => (
                  <View key={i} style={{ alignItems: "center", flex: 1 }}>
                    <View
                      style={{
                        width: 18,
                        height: bar.h,
                        borderRadius: 9,
                        backgroundColor: bar.active ? "#10b981" : "#cbd5e1",
                        marginBottom: 6,
                      }}
                    />
                    <Text
                      style={{
                        color: bar.active ? "#0f172a" : "#94a3b8",
                        fontFamily: bar.active
                          ? "Brandon-Bold"
                          : "Brandon-Medium",
                        fontSize: 10,
                      }}
                    >
                      {bar.day}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Incentive Payout Breakdown (Reference Image 5 "Energy Cost" Rows) */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: "rgba(148, 163, 184, 0.22)",
                paddingTop: 16,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 15,
                  }}
                >
                  Incentive & Bonus Ledger
                </Text>
                <ArrowUpRight size={16} color="#64748b" />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  Weekly Verified Bonus
                </Text>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  ₹2,400
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  Full-month estimated payout
                </Text>
                <Text
                  style={{
                    color: "#10b981",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  ₹9,600
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  Last month&apos;s bonus
                </Text>
                <Text
                  style={{
                    color: "#0f172a",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  ₹8,250
                </Text>
              </View>
            </View>
          </LiquidGlassCard>

          {/* 2x2 SMART CATEGORY BENTO TILES (Reference Image 5: "Audio System | Smart Light") */}
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
                fontSize: 18,
              }}
            >
              Service Specializations
            </Text>
            <TouchableOpacity onPress={() => router.push("/(employee)/tasks")}>
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
              flexDirection: "row",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <LiquidGlassCard
              variant="light"
              borderRadius={28}
              onPress={() => router.push("/(employee)/task/10482" as any)}
              style={{ flex: 1 }}
              contentStyle={{ padding: 18 }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 15,
                }}
              >
                AHU & Chillers
              </Text>
              <Text
                style={{
                  color: "#94a3b8",
                  fontFamily: "Brandon-Medium",
                  fontSize: 11,
                  marginBottom: 14,
                }}
              >
                Metro Tower • +40 pts
              </Text>
              <LiquidGlassIconBadge
                size={64}
                borderRadius={32}
                variant="light"
                tintColor="#10b981"
                style={{ alignSelf: "center" }}
              >
                <CheckCircle2 size={28} color="#10b981" />
              </LiquidGlassIconBadge>
            </LiquidGlassCard>

            <LiquidGlassCard
              variant="light"
              borderRadius={28}
              onPress={() => router.push("/(employee)/task/10483" as any)}
              style={{ flex: 1 }}
              contentStyle={{ padding: 18 }}
            >
              <Text
                style={{
                  color: "#0f172a",
                  fontFamily: "Brandon-Bold",
                  fontSize: 15,
                }}
              >
                Fire Safety Audit
              </Text>
              <Text
                style={{
                  color: "#94a3b8",
                  fontFamily: "Brandon-Medium",
                  fontSize: 11,
                  marginBottom: 14,
                }}
              >
                Apex Hub • +35 pts
              </Text>
              <LiquidGlassIconBadge
                size={64}
                borderRadius={32}
                variant="light"
                tintColor="#0284c7"
                style={{ alignSelf: "center" }}
              >
                <ShieldCheck size={28} color="#0284c7" />
              </LiquidGlassIconBadge>
            </LiquidGlassCard>
          </View>
        </ScrollView>

        {/* FLOATING BOTTOM DOCK (Reference Image 5 Pill Dock) */}
        <LiquidGlassCard
          variant="dark"
          borderRadius={32}
          dropletColor="#10b981"
          style={{
            position: "absolute",
            bottom: 24,
            left: 24,
            right: 24,
          }}
          contentStyle={{
            paddingVertical: 14,
            paddingHorizontal: 24,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.push("/(employee)/attendance-hub")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#4ade80",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={22} color="#062214" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(employee)/calendar")}
            style={{ alignItems: "center", padding: 8 }}
          >
            <Calendar size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity style={{ alignItems: "center", padding: 8 }}>
            <BarChart3 size={22} color="#4ade80" />
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#4ade80",
                marginTop: 4,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(employee)/profile")}
            style={{ alignItems: "center", padding: 8 }}
          >
            <User size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </LiquidGlassCard>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
