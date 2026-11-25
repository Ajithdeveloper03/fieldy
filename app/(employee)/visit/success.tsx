import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, StatusBar } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Check, FileText, Home, Download } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";
import { downloadVisitDossierToDevice } from "../../../services/media";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function SuccessScreen() {
  const { serviceConfig } = useService();
  const [downloading, setDownloading] = useState(false);
  const [summary, setSummary] = useState({
    visitId: "",
    siteName: serviceConfig.vocab.entitySingular,
    serviceName: serviceConfig.label,
    notes: "",
    pointsAwarded: 0,
    mediaCount: 0,
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
            visitId: parsed.visitId ? String(parsed.visitId) : "",
            siteName: parsed.siteName || prev.siteName,
            serviceName: parsed.service || serviceConfig.label,
            notes: parsed.notes || "",
            pointsAwarded: Number(parsed.pointsAwarded || 0),
            mediaCount: Number(parsed.mediaCount || 0),
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
        // Keep defaults
      }
    })();

    const timer = setTimeout(() => {
      showToast({
        title: `${serviceConfig.shortName} Sync Complete`,
        message: "Visit checkout & report synced live to Web Admin.",
        type: "success",
        duration: 3500,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [serviceConfig.label, serviceConfig.shortName]);

  const handleDownloadDossier = async () => {
    if (!summary.visitId || downloading) return;
    setDownloading(true);
    try {
      await downloadVisitDossierToDevice(summary.visitId);
    } catch {
      showToast({
        title: "Download Notice",
        message: "Could not download visit dossier right now.",
        type: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

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

          <Text style={styles.title}>Report Synced{"\n"}Successfully!</Text>
          <Text style={styles.subtitle}>
            Your visit checkout, media attachments, and performance metrics are now live in Web Admin.
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
                {summary.pointsAwarded > 0 ? ` • +${summary.pointsAwarded} PTS` : ""}
              </Text>
            </View>
            <Text style={styles.siteName}>{summary.siteName}</Text>
            {summary.notes ? (
              <Text style={styles.notesPreview} numberOfLines={2}>
                “{summary.notes}”
              </Text>
            ) : null}
            <Text style={styles.timestamp}>
              {summary.timestamp}
              {summary.mediaCount > 0 ? ` • ${summary.mediaCount} file(s) attached` : ""}
            </Text>
          </LiquidGlassCard>

          <View style={styles.actions}>
            {summary.visitId ? (
              <LiquidGlassButton
                onPress={handleDownloadDossier}
                disabled={downloading}
                variant="light"
                style={{ width: "100%" }}
                contentStyle={{ paddingVertical: 14 }}
              >
                <Download size={18} color="#0f172a" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>
                  {downloading ? "Preparing Dossier..." : "Download Visit Dossier"}
                </Text>
              </LiquidGlassButton>
            ) : null}

            <LiquidGlassButton
              onPress={() => router.replace("/(employee)/reports")}
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
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 18,
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
    marginBottom: 22,
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
    lineHeight: 33,
    marginBottom: 8,
  },
  subtitle: {
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  summaryCardOuter: {
    width: "100%",
    marginBottom: 24,
  },
  summaryCardInner: {
    padding: 20,
    alignItems: "center",
  },
  badgePill: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
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
    fontSize: 19,
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
    color: "#64748b",
    fontFamily: "Brandon-Medium",
    fontSize: 12,
  },
  actions: {
    width: "100%",
    gap: 10,
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
