import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronDown,
  CalendarDays,
  FileText,
  Download,
  MoreHorizontal,
  Plus,
  Filter,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function EmployeeReportsScreen() {
  const [selectedYear, setSelectedYear] = useState("2026");

  // Editorial Monthly Report Cards (Reference Image 1: "March / 23 reports", "April / 18 reports", "May / 29 reports")
  const monthlyArchives = [
    {
      month: "October",
      count: "23 reports",
      subtitle: "Active SLA Cycle • HVAC & Agronomy",
      image: require("../../assets/images/image10.jpg"),
      reportId: "1",
    },
    {
      month: "September",
      count: "18 reports",
      subtitle: "Completed • 100% Approved",
      image: require("../../assets/images/image4.jpg"),
      reportId: "3",
    },
    {
      month: "August",
      count: "29 reports",
      subtitle: "Quarterly Audit Archive",
      image: require("../../assets/images/image14.jpg"),
      reportId: "4",
    },
  ];

  const documents = [
    {
      id: "1",
      title: "Soil Analysis - Farm A",
      date: "Oct 8, 2026",
      size: "2.4 MB",
      type: "PDF",
      status: "Approved",
    },
    {
      id: "2",
      title: "Monthly Yield Forecast",
      date: "Oct 5, 2026",
      size: "1.1 MB",
      type: "DOCX",
      status: "Pending",
    },
    {
      id: "3",
      title: "Pesticide Usage Log",
      date: "Sep 28, 2026",
      size: "4.8 MB",
      type: "XLSX",
      status: "Approved",
    },
    {
      id: "4",
      title: "Muthuvel Farm Inspection",
      date: "Sep 15, 2026",
      size: "3.2 MB",
      sizeLabel: "3.2 MB",
      type: "PDF",
      status: "Rejected",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Subtle Ambient Top Glow */}
      <View
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          marginLeft: -150,
          width: 300,
          height: 220,
          borderRadius: 150,
          backgroundColor: "rgba(16, 185, 129, 0.14)",
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* TOP HEADER (Reference Image 1: "2026 v" on left, Calendar & New Report on right) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 22,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              setSelectedYear(selectedYear === "2026" ? "2025" : "2026")
            }
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 28,
                letterSpacing: 0.5,
              }}
            >
              {selectedYear}
            </Text>
            <ChevronDown
              size={22}
              color="rgba(255,255,255,0.75)"
              style={{ marginLeft: 6, marginTop: 2 }}
            />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/report/select-method")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(74, 222, 128, 0.18)",
                borderWidth: 1,
                borderColor: "rgba(74, 222, 128, 0.4)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <Plus size={16} color="#4ade80" />
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 13,
                  marginLeft: 4,
                }}
              >
                New Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/calendar")}
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "rgba(255,255,255,0.1)",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CalendarDays size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
          }}
        >
          {/* STACKED SCENIC MONTHLY CARDS (Reference Image 1) */}
          <View style={{ gap: 18, marginBottom: 32 }}>
            {monthlyArchives.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.92}
                onPress={() =>
                  router.push(`/(employee)/report/${item.reportId}` as any)
                }
                style={{
                  height: 215,
                  borderRadius: 32,
                  overflow: "hidden",
                  backgroundColor: "#0f172a",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.14)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 10,
                }}
              >
                <Image
                  source={item.image}
                  style={[
                    StyleSheet.absoluteFillObject,
                    { width: "100%", height: "100%" },
                  ]}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={[
                    "rgba(6, 34, 20, 0.25)",
                    "rgba(6, 34, 20, 0.45)",
                    "rgba(6, 34, 20, 0.9)",
                  ]}
                  locations={[0, 0.5, 1]}
                  style={StyleSheet.absoluteFillObject}
                />

                {/* Top Floating Pill Badge ("23 reports") + "..." Circle Button */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 18,
                    paddingTop: 18,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      paddingHorizontal: 16,
                      paddingVertical: 7,
                      borderRadius: 999,
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 13,
                        letterSpacing: 0.3,
                      }}
                    >
                      {item.count}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/(employee)/report/${item.reportId}` as any)
                    }
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: "rgba(255, 255, 255, 0.22)",
                      borderWidth: 1,
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MoreHorizontal size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                {/* Oversized Editorial Month Display Typography at Bottom */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 0,
                    right: 0,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.88)",
                      fontFamily: "Brandon-Bold",
                      fontSize: 64,
                      letterSpacing: -1.5,
                      lineHeight: 72,
                    }}
                    numberOfLines={1}
                  >
                    {item.month}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* RECENT FIELD DOCUMENTS DOSSIER LIST */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 11,
                  letterSpacing: 1.2,
                }}
              >
                RECORDS & LOGS
              </Text>
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 22,
                }}
              >
                Recent Field Documents
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit-history")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.1)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
              }}
            >
              <Filter
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                }}
              >
                All Logs
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14 }}>
            {documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.9}
                onPress={() => router.push(`/(employee)/report/${doc.id}` as any)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  padding: 16,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.12)",
                }}
              >
                {/* ICON */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor:
                      doc.type === "PDF"
                        ? "rgba(239, 68, 68, 0.18)"
                        : doc.type === "DOCX"
                        ? "rgba(14, 165, 233, 0.18)"
                        : "rgba(34, 197, 94, 0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <FileText
                    size={24}
                    color={
                      doc.type === "PDF"
                        ? "#f87171"
                        : doc.type === "DOCX"
                        ? "#38bdf8"
                        : "#4ade80"
                    }
                  />
                </View>

                {/* DETAILS */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                    numberOfLines={1}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 12,
                    }}
                  >
                    {doc.date} • {doc.size}
                  </Text>
                </View>

                {/* ACTION/STATUS */}
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor:
                        doc.status === "Approved"
                          ? "rgba(74, 222, 128, 0.18)"
                          : doc.status === "Pending"
                          ? "rgba(251, 191, 36, 0.18)"
                          : "rgba(239, 68, 68, 0.18)",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          doc.status === "Approved"
                            ? "#4ade80"
                            : doc.status === "Pending"
                            ? "#fbbf24"
                            : "#f87171",
                        fontFamily: "Brandon-Bold",
                        fontSize: 10,
                      }}
                    >
                      {doc.status}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "Download",
                        `Downloading ${doc.title} (${doc.size})...`
                      )
                    }
                  >
                    <Download size={18} color="rgba(255,255,255,0.7)" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
