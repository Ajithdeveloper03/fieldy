import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Calendar,
  CheckCircle2,
  FileText,
  ListTodo,
  TrendingUp,
  Filter,
  Sparkles,
  ArrowRight,
  Clock,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";

export default function EmployeeTasksScreen() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDateIdx, setSelectedDateIdx] = useState(3);

  const dateStrip = [
    { day: "26 Oct", label: "26 Oct" },
    { day: "27 Oct", label: "27 Oct" },
    { day: "28 Oct", label: "28 Oct" },
    { day: "Today", label: "Today" },
    { day: "30 Oct", label: "30 Oct" },
    { day: "31 Oct", label: "31 Oct" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER (Reference Screen 4 Right Panel: "Community" + Filter Circle Button) */}
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
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(employee)/dashboard")
              }
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "#ffffff",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <ChevronLeft size={22} color="#0f172a" />
            </TouchableOpacity>
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 26,
              }}
            >
              Work Orders
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(employee)/calendar")}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: "#ffffff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "#e2e8f0",
            }}
          >
            <Calendar size={19} color="#0f172a" />
          </TouchableOpacity>
        </View>

        {/* HORIZONTAL DATE PILL STRIP (Reference Screen 4: "12 Jul | 12 Jul | Today (black pill) | 12 Jul") */}
        <View style={{ marginBottom: 18 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 22, gap: 10 }}
          >
            {dateStrip.map((d, idx) => {
              const isSelected = selectedDateIdx === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedDateIdx(idx)}
                  style={{
                    backgroundColor: isSelected ? "#062214" : "#ffffff",
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: isSelected ? "#062214" : "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#ffffff" : "#475569",
                      fontFamily: "Brandon-Bold",
                      fontSize: 13,
                    }}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 120,
          }}
        >
          {/* COMPLETION BENTO BANNER */}
          <View
            style={{
              backgroundColor: "#062214",
              borderRadius: 32,
              padding: 22,
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 22,
              shadowColor: "#062214",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "#15803d",
                borderRadius: 24,
                padding: 18,
                marginRight: 18,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "Brandon-Bold",
                  fontSize: 10,
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                SLA COMPLETION
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 44,
                  lineHeight: 48,
                }}
              >
                85%
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                }}
              >
                <TrendingUp size={14} color="#a7f3d0" />
                <Text
                  style={{
                    color: "#a7f3d0",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                    marginLeft: 4,
                  }}
                >
                  +12% vs yesterday
                </Text>
              </View>
            </View>

            <View style={{ width: "32%", gap: 14 }}>
              <View>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 22,
                  }}
                >
                  12
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Completed
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    color: "#4ade80",
                    fontFamily: "Brandon-Bold",
                    fontSize: 22,
                  }}
                >
                  2
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 12,
                  }}
                >
                  Pending
                </Text>
              </View>
            </View>
          </View>

          {/* TABS */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#e2e8f0",
              borderRadius: 999,
              padding: 4,
              marginBottom: 22,
            }}
          >
            {["Pending", "Completed"].map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  backgroundColor: activeTab === tab ? "#062214" : "transparent",
                  paddingVertical: 11,
                  borderRadius: 999,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab ? "#ffffff" : "#475569",
                    fontFamily: "Brandon-Bold",
                    fontSize: 14,
                  }}
                >
                  {tab} Orders
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* WORK ORDER CARDS (Reference Screen 4 Right Panel: Featured Card with PDF Attachment & Black Pill CTA) */}
          <View style={{ gap: 18 }}>
            {activeTab === "Pending" ? (
              <>
                {/* Work Order 1: Featured Card with PDF Spec Attachment */}
                <View
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 32,
                    padding: 22,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.05,
                    shadowRadius: 16,
                    elevation: 4,
                  }}
                >
                  {/* Top Author / Facility Row */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Image
                        source={{
                          uri: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=project&q=80",
                        }}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 21,
                          marginRight: 12,
                        }}
                      />
                      <View>
                        <Text
                          style={{
                            color: "#64748b",
                            fontFamily: "Brandon-Medium",
                            fontSize: 11,
                          }}
                        >
                          WO-10482 • Metro City Centre
                        </Text>
                        <Text
                          style={{
                            color: "#0f172a",
                            fontFamily: "Brandon-Bold",
                            fontSize: 15,
                          }}
                        >
                          HVAC — Chiller Valve Service
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        backgroundColor: "#fee2e2",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={{
                          color: "#ef4444",
                          fontFamily: "Brandon-Bold",
                          fontSize: 10,
                        }}
                      >
                        DUE 2:00 PM
                      </Text>
                    </View>
                  </View>

                  {/* Editorial Description Text */}
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Medium",
                      fontSize: 16,
                      lineHeight: 24,
                      marginBottom: 16,
                    }}
                  >
                    Perform scheduled coil chemical wash, verify thermostat
                    calibration on Floor 3, and obtain customer OTP sign-off.
                  </Text>

                  {/* Embedded PDF Attachment Box (Reference Screen 4: "Cell_Biology_Revision_Notes.pdf") */}
                  <View
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: 18,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 18,
                      borderWidth: 1,
                      borderColor: "#f1f5f9",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: "#fee2e2",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <FileText size={20} color="#ef4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#0f172a",
                          fontFamily: "Brandon-Bold",
                          fontSize: 13,
                        }}
                      >
                        AHU4_Maintenance_Protocol.pdf
                      </Text>
                      <Text
                        style={{
                          color: "#94a3b8",
                          fontFamily: "Brandon-Medium",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        File Size: 3.2 MB • +40 SLA Points
                      </Text>
                    </View>
                  </View>

                  {/* Full-Width Black/Forest Pill Button ("Play Now" style) */}
                  <TouchableOpacity
                    onPress={() => router.push("/(employee)/task/10482" as any)}
                    style={{
                      backgroundColor: "#062214",
                      borderRadius: 999,
                      paddingVertical: 15,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ListTodo
                      size={16}
                      color="#4ade80"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 14,
                      }}
                    >
                      Execute Work Order
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Work Order 2: Gradient Tinted Challenge Card (Reference Screen 4 Bottom Card) */}
                <LinearGradient
                  colors={["#ffffff", "#f0fdf4", "#e0f2fe"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 32,
                    padding: 22,
                    borderWidth: 1,
                    borderColor: "#cbd5e1",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <Image
                      source={{
                        uri: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=project&q=80",
                      }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        marginRight: 12,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#64748b",
                          fontFamily: "Brandon-Medium",
                          fontSize: 11,
                        }}
                      >
                        WO-10483 • Due 5:00 PM
                      </Text>
                      <Text
                        style={{
                          color: "#0f172a",
                          fontFamily: "Brandon-Bold",
                          fontSize: 17,
                        }}
                      >
                        Fire Sprinkler & Alarm Audit
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={{
                      color: "#475569",
                      fontFamily: "Brandon-Medium",
                      fontSize: 13,
                      lineHeight: 20,
                      marginBottom: 16,
                    }}
                  >
                    Apex Logistics Hub • Inspect main riser valves, test
                    pressure sensors, and capture safety photo evidence.
                  </Text>

                  <TouchableOpacity
                    onPress={() => router.push("/(employee)/task/10483" as any)}
                    style={{
                      backgroundColor: "#0f172a",
                      borderRadius: 999,
                      paddingVertical: 14,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 14,
                      }}
                    >
                      Open Work Order
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>
              </>
            ) : (
              <View
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 28,
                  padding: 22,
                  borderWidth: 1,
                  borderColor: "#e2e8f0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#64748b",
                      fontFamily: "Brandon-Bold",
                      fontSize: 17,
                      textDecorationLine: "line-through",
                    }}
                  >
                    Elevator Safety Audit & Grease Service
                  </Text>
                  <CheckCircle2 size={22} color="#10b981" />
                </View>
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  Completed at 09:15 AM • OTP Verified (Code: 4821)
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(employee)/task/10480" as any)}
                  style={{
                    backgroundColor: "#f1f5f9",
                    borderRadius: 999,
                    paddingVertical: 14,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#0f172a",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    View Service Report
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
