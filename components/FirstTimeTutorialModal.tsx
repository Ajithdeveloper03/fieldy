import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  X,
  Sparkles,
  ClipboardCheck,
  MapPin,
  Fingerprint,
  Bell,
  CornerLeftUp,
} from "lucide-react-native";

const TUTORIAL_STORAGE_KEY = "@fieldy_first_time_tutorial_done";

const STEPS = [
  {
    icon: ClipboardCheck,
    spotlightLabel: "Work Orders & Project Sites",
    headline: "Everything synced live\nfrom your Web Admin",
    ctaLabel: "NEXT TIP (1/4)",
    accent: "#059669",
  },
  {
    icon: Fingerprint,
    spotlightLabel: "Attendance Menu",
    headline: "Clock In & Clock Out\nwith GPS & selfie",
    ctaLabel: "NEXT TIP (2/4)",
    accent: "#0284c7",
  },
  {
    icon: MapPin,
    spotlightLabel: "Live GPS Tracking",
    headline: "Real-time field route\nvisible to your admin",
    ctaLabel: "NEXT TIP (3/4)",
    accent: "#ea580c",
  },
  {
    icon: Bell,
    spotlightLabel: "Alerts & தமிழ் Mode",
    headline: "Instant notifications &\none-tap Tamil switch",
    ctaLabel: "GET STARTED",
    accent: "#7c3aed",
  },
];

interface FirstTimeTutorialModalProps {
  visibleOverride?: boolean;
  onCloseOverride?: () => void;
}

export function FirstTimeTutorialModal({
  visibleOverride,
  onCloseOverride,
}: FirstTimeTutorialModalProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const done = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);
        if (active && !done) {
          setInternalVisible(true);
        }
      } catch {
        // Ignore storage read error
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const isVisible = visibleOverride !== undefined ? visibleOverride : internalVisible;

  const handleClose = async () => {
    setInternalVisible(false);
    setStepIndex(0);
    await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, "true").catch(() => null);
    onCloseOverride?.();
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      void handleClose();
    }
  };

  if (!isVisible) return null;

  const step = STEPS[stepIndex];
  const Icon = step.icon;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={() => void handleClose()}
    >
      <View style={styles.backdrop}>
        <LinearGradient
          colors={[
            "rgba(244, 114, 182, 0.78)",
            "rgba(255, 255, 255, 0.90)",
            "rgba(167, 139, 250, 0.86)",
          ]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top-Right Close Button */}
        <TouchableOpacity
          onPress={() => void handleClose()}
          style={styles.closeBtn}
          activeOpacity={0.8}
        >
          <X size={20} color="#0f172a" />
        </TouchableOpacity>

        {/* Highlighted Spotlight Element Pill (matches Reference Image 4) */}
        <View style={styles.spotlightWrap}>
          <View style={styles.spotlightPill}>
            <Icon size={20} color={step.accent} style={{ marginRight: 10 }} />
            <Text style={styles.spotlightText}>{step.spotlightLabel}</Text>
          </View>

          {/* Curved Pointer + Headline + Gradient Pill CTA */}
          <View style={styles.pointerRow}>
            <CornerLeftUp size={32} color={step.accent} style={{ marginRight: 8, marginTop: -8 }} />
            <Text style={styles.headline}>{step.headline}</Text>
          </View>

          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={["#4f46e5", "#db2777"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Sparkles size={16} color="#ffffff" style={{ marginRight: 8 }} />
              <Text style={styles.ctaText}>{step.ctaLabel}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 150,
  },
  closeBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  spotlightWrap: {
    width: "100%",
    alignItems: "center",
  },
  spotlightPill: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  spotlightText: {
    color: "#334155",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  },
  pointerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  headline: {
    color: "#312e81",
    fontFamily: "Brandon-Bold",
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  ctaWrap: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 8,
  },
  ctaBtn: {
    paddingHorizontal: 26,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 14,
    letterSpacing: 0.8,
  },
});
