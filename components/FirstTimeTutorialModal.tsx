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
  ArrowRight,
} from "lucide-react-native";

const TUTORIAL_STORAGE_KEY = "@fieldy_first_time_tutorial_done";

const STEPS = [
  {
    icon: ClipboardCheck,
    badge: "STEP 1 OF 4",
    title: "Work Orders & Project Sites",
    description:
      "Every task and project site assigned in Web Admin appears live on your Home screen and updates automatically without reloading.",
    accent: "#10b981",
  },
  {
    icon: Fingerprint,
    badge: "STEP 2 OF 4",
    title: "Mark Daily Attendance",
    description:
      "Use the Attendance tab in the bottom menu to Clock In and Clock Out with live GPS and selfie verification.",
    accent: "#0ea5e9",
  },
  {
    icon: MapPin,
    badge: "STEP 3 OF 4",
    title: "Live GPS Tracking & Visits",
    description:
      "Your field route and live movement sync to Web Admin automatically. Open any site to check in and submit photo or video reports.",
    accent: "#f97316",
  },
  {
    icon: Bell,
    badge: "STEP 4 OF 4",
    title: "Instant Alerts & Tamil Mode",
    description:
      "Tap the bell icon for real-time updates from your admin, or switch to தமிழ் anytime from the top language pill.",
    accent: "#8b5cf6",
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
            "rgba(15, 23, 42, 0.82)",
            "rgba(6, 78, 59, 0.86)",
            "rgba(15, 23, 42, 0.92)",
          ]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => void handleClose()}
          style={styles.closeBtn}
          activeOpacity={0.8}
        >
          <X size={20} color="#0f172a" />
        </TouchableOpacity>

        {/* Center Spotlight Card */}
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: `${step.accent}20` }]}>
            <Icon size={34} color={step.accent} />
          </View>

          <View style={styles.badgePill}>
            <Sparkles size={12} color={step.accent} style={{ marginRight: 5 }} />
            <Text style={[styles.badgeText, { color: step.accent }]}>
              {step.badge}
            </Text>
          </View>

          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Progress Dots */}
          <View style={styles.dotsRow}>
            {STEPS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === stepIndex && {
                    width: 24,
                    backgroundColor: step.accent,
                  },
                ]}
              />
            ))}
          </View>

          {/* Primary Gradient CTA */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            style={{ width: "100%", borderRadius: 18, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#059669", "#0284c7"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>
                {stepIndex === STEPS.length - 1 ? "Get Started" : "Next Tip"}
              </Text>
              <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void handleClose()}
            style={{ marginTop: 14, paddingVertical: 4 }}
          >
            <Text style={styles.skipText}>Skip Tutorial</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  closeBtn: {
    position: "absolute",
    top: 54,
    right: 22,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 30,
    paddingHorizontal: 26,
    paddingVertical: 30,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    fontFamily: "Brandon-Bold",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  title: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 22,
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    color: "#475569",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 22,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 22,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cbd5e1",
  },
  ctaBtn: {
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  },
  skipText: {
    color: "#64748b",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
  },
});
