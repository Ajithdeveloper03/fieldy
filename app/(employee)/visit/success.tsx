import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Check, FileText, Home } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function SuccessScreen() {
  const { serviceConfig } = useService();
  const [summary, setSummary] = useState({
    siteName: serviceConfig.vocab.entitySingular,
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

  const themeAccent = serviceConfig.themeColor || "#15803d";

  return (
    <LiquidGlassBackdrop variant="light">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <LiquidGlassIconButton
            variant="light"
            size={42}
            onPress={() => router.replace("/(employee)/dashboard")}
          >
            <ChevronLeft size={24} color="#0f172a" />
          </LiquidGlassIconButton>
          <Text style={styles.headerTitle}>{serviceConfig.vocab.report}</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.content}>
          <LiquidGlassCard
            variant="tinted"
            borderRadius={46}
            tintColor={`${themeAccent}D9`}
            dropletColor={themeAccent}
            style={[styles.checkCircle, { shadowColor: themeAccent }]}
            contentStyle={{ alignItems: "center", justifyContent: "center" }}
          >
            <Check size={46} color="#ffffff" strokeWidth={3} />
          </LiquidGlassCard>

          <Text style={styles.title}>
            Report Submitted{"\n"}Successfully!
          </Text>
          <Text style={styles.subtitle}>
            Your field visit checkout and {serviceConfig.shortName.toLowerCase()} report have been recorded.
          </Text>

          <LiquidGlassCard
            variant="light"
            borderRadius={22}
            style={styles.summaryCardOuter}
            contentStyle={styles.summaryCardInner}
          >
            <View style={styles.badgePill}>
              <Text style={[styles.badgeText, { color: themeAccent }]}>
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
          </LiquidGlassCard>

          <View style={styles.actions}>
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/reports")}
              variant="tinted"
              tintColor={`${themeAccent}D9`}
              dropletColor={themeAccent}
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 16 }}
            >
              <FileText size={18} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>View Submitted Reports</Text>
            </LiquidGlassButton>

            <LiquidGlassButton
              onPress={() => router.replace("/(employee)/dashboard")}
              variant="light"
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 15 }}
            >
              <Home size={18} color="#0f172a" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryBtnText}>Back to Dashboard</Text>
            </LiquidGlassButton>
          </View>
        </View>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
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
    marginBottom: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 10,
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
  summaryCardOuter: {
    width: "100%",
    marginBottom: 28,
  },
  summaryCardInner: {
    padding: 20,
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.96)",
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
  primaryBtnText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 15,
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 15,
  },
});
