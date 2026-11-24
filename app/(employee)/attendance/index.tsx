import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Clock,
  CheckCircle2,
  MapPin,
  LogIn,
  LogOut,
} from "lucide-react-native";
import { api } from "../../../services/api";
import { useLanguage } from "../../../context/LanguageContext";

export default function AttendanceScreen() {
  const { t, language } = useLanguage();
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);

  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceLoaded, setAttendanceLoaded] = useState(false);
  useFocusEffect(useCallback(() => {
    let active = true;
    api.get("/employee/performance").then((data) => {
      if (!active) return;
      const rows = Array.isArray(data?.attendance) ? data.attendance : [];
      setAttendance(rows);
      const currentDate = new Date();
      const today = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
      const record = rows.find((row: any) => row.date === today);
      setClockInTime(record?.check_in || null);
      setIsClockedIn(Boolean(record?.check_in && !record?.check_out));
      setAttendanceLoaded(true);
    }).catch(() => { if (active) setAttendanceLoaded(false); });
    return () => { active = false; };
  }, []));

  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <StatusBar barStyle="light-content" />

      {/* GRADIENT BACKGROUND */}
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#0f172a"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 18,
            }}
          >
            Duty & Attendance
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        >
          <View
            style={{
              marginTop: 40,
              marginBottom: 32,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Brandon-Medium",
                fontSize: 14,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              CURRENT STATUS
            </Text>
            <Text
              style={{
                color: isClockedIn ? "#4ade80" : "#f87171",
                fontFamily: "Brandon-Bold",
                fontSize: 48,
                lineHeight: 54,
              }}
            >
              {attendanceLoaded ? (isClockedIn ? "ON DUTY" : "OFF DUTY") : "ATTENDANCE UNAVAILABLE"}
            </Text>
            {attendanceLoaded && isClockedIn && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Clock size={16} color="#94a3b8" />
                <Text
                  style={{
                    color: "#94a3b8",
                    fontFamily: "Brandon-Medium",
                    fontSize: 14,
                    marginLeft: 6,
                  }}
                >
                  Started at {clockInTime}
                </Text>
              </View>
            )}
          </View>

          {/* ACTION CARD */}
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: 32,
              padding: 24,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.1)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2,
              shadowRadius: 24,
              marginBottom: 32,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "rgba(59,130,246,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <MapPin size={24} color="#60a5fa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Location Verification
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  Delta Zone A • GPS Active
                </Text>
              </View>
              <CheckCircle2 size={24} color="#4ade80" />
            </View>

            {!isClockedIn ? (
              <TouchableOpacity
            onPress={() => router.push("/(employee)/attendance/clock-in")}
                style={{
                  backgroundColor: "#16a34a",
                  borderRadius: 999,
                  paddingVertical: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#16a34a",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LogIn size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  Start work Now
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => router.push("/(employee)/attendance/clock-out")}
                style={{
                  backgroundColor: "#ef4444",
                  borderRadius: 999,
                  paddingVertical: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#ef4444",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LogOut size={20} color="#ffffff" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                  }}
                >
                  End work Securely
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* WEEKLY LOG */}
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 18,
              marginBottom: 16,
            }}
          >
            This Month&apos;s Attendance
          </Text>

          <View style={{ gap: 12 }}>
            {attendanceLoaded && attendance.length === 0 ? <Text style={{ color: "#cbd5e1", fontFamily: "Brandon-Medium", textAlign: "center", padding: 18 }}>No attendance records have been recorded this month.</Text> : null}
            {attendance.slice(0, 7).map((log, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <View
                  style={{
                    width: 56,
                    alignItems: "center",
                    marginRight: 16,
                    borderRightWidth: 1,
                    borderRightColor: "rgba(255,255,255,0.1)",
                    paddingRight: 16,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 14,
                    }}
                  >
                    {log.date ? new Date(`${log.date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }) : "—"}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 11,
                    }}
                  >
                    {log.date || "Date unavailable"}
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 11,
                        marginBottom: 2,
                      }}
                    >
                      Start work
                    </Text>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 14,
                      }}
                    >
                      {log.check_in || "—"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "Brandon-Medium",
                        fontSize: 11,
                        marginBottom: 2,
                      }}
                    >
                      End work
                    </Text>
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 14,
                      }}
                    >
                      {log.check_out || "—"}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
