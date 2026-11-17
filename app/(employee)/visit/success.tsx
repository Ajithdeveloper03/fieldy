import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Check, FileText, Home } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";

export default function SuccessScreen() {
  const { serviceConfig } = useService();
  const [summary, setSummary] = useState({
    siteName: serviceConfig.sampleEntities[0]?.name || serviceConfig.vocab.entitySingular,
    serviceName: serviceConfig.label,
    notes: "",
    timestamp: new Date().toLocaleString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@last_submitted_report");
        if (raw) {
          const parsed = JSON.parse(raw);
          setSummary((prev) => ({
            siteName: parsed.siteName || prev.siteName,
            serviceName: parsed.service || serviceConfig.label,
            notes: parsed.notes || "",
            timestamp: new Date(parsed.createdAt || Date.now()).toLocaleString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
        }
      } catch {
        // Keep current defaults
      }
    })();

    const timer = setTimeout(() => {
      showToast({
        title: `${serviceConfig.shortName} Sync Complete`,
        message: "Field report & follow-up synced to Admin Dashboard.",
        type: "success",
        duration: 4000,
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [serviceConfig.label, serviceConfig.shortName]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace("/(employee)/dashboard")}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceConfig.vocab.report}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.checkCircle, { backgroundColor: serviceConfig.themeColor || "#15803d" }]}>
          <Check size={46} color="#ffffff" strokeWidth={3} />
        </View>

        <Text style={styles.title}>
          Report Submitted{"\n"}Successfully!
        </Text>
        <Text style={styles.subtitle}>
          Your field visit checkout and {serviceConfig.shortName.toLowerCase()} report have been recorded.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.badgePill}>
            <Text style={[styles.badgeText, { color: serviceConfig.themeColor || "#15803d" }]}>
              {summary.serviceName}
            </Text>
          </View>
          <Text style={styles.siteName}>{summary.siteName}</Text>
          {summary.notes ? (
            <Text style={styles.notesPreview} numberOfLines={2}>
              “{summary.notes}”
            </Text>
          ) : null}
          <Text style={styles.timestamp}>{summary.timestamp}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push("/(employee)/reports")}
            style={[styles.primaryBtn, { backgroundColor: serviceConfig.themeColor || "#15803d" }]}
          >
            <FileText size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>View Submitted Reports</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace("/(employee)/dashboard")}
            style={styles.secondaryBtn}
          >
            <Home size={18} color="#0f172a" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 17,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  checkCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#15803d",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 26,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  summaryCard: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 22,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 28,
  },
  badgePill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: "Brandon-Bold",
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  siteName: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
  },
  notesPreview: {
    color: "#475569",
    fontFamily: "Brandon-Medium",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
  timestamp: {
    color: "#94a3b8",
    fontFamily: "Brandon-Medium",
    fontSize: 12,
  },
  actions: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 999,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 15,
  },
  secondaryBtn: {
    width: "100%",
    borderRadius: 999,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 15,
  },
});
