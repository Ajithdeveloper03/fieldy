import React from "react";
import { Stack, router, usePathname } from "expo-router";
import { CalendarDays, FileText, Home, Plus, User } from "lucide-react-native";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { useLanguage } from "../../context/LanguageContext";
import { TrackingProvider } from "../../context/TrackingContext";

const TAB_ROUTES = [
  { name: "dashboard", path: "/(employee)/dashboard", key: "home", defaultLabel: "Home", Icon: Home },
  { name: "visits", path: "/(employee)/visits", key: "visits", defaultLabel: "Visits", Icon: CalendarDays },
  { name: "reports", path: "/(employee)/reports", key: "reports", defaultLabel: "Reports", Icon: FileText },
  { name: "profile", path: "/(employee)/profile", key: "profile", defaultLabel: "Profile", Icon: User },
];

// Show the floating bottom tab bar on main hub screens
const MAIN_TAB_SCREENS = ["/dashboard", "/visits", "/reports", "/profile"];

function FloatingEmployeeTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const shouldShowTabBar = MAIN_TAB_SCREENS.some(
    (screen) => pathname === screen || pathname.endsWith(screen)
  );

  if (!shouldShowTabBar) {
    return null;
  }

  return (
    <View style={styles.outerWrap}>
      {/* Main Frosted Capsule Dock (Inspired by Reference Screens 1 & 4) */}
      <View style={styles.capsuleContainer}>
        <BlurView intensity={85} tint="dark" style={styles.blurView}>
          {TAB_ROUTES.map((tab) => {
            const isFocused =
              pathname === `/${tab.name}` || pathname.endsWith(`/${tab.name}`);
            const label = t(tab.key, tab.defaultLabel);
            const IconComponent = tab.Icon;

            return (
              <TouchableOpacity
                key={tab.name}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                activeOpacity={0.85}
                onPress={() => {
                  if (!isFocused) {
                    router.navigate(tab.path as any);
                  }
                }}
                style={[
                  styles.tabButton,
                  isFocused && styles.tabButtonActive,
                ]}
              >
                <IconComponent
                  size={20}
                  color={isFocused ? "#4ade80" : "rgba(255,255,255,0.55)"}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
                {isFocused && (
                  <Text style={styles.activeLabel} numberOfLines={1}>
                    {label}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </View>

      {/* Detached Glowing Action Orb (Register / Quick Action) */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push("/(employee)/register-site/step1" as any)}
        style={styles.fabOrb}
      >
        <Plus size={26} color="#062214" strokeWidth={2.8} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  capsuleContainer: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(6, 34, 20, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 18,
  },
  blurView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor: "rgba(6, 34, 20, 0.75)",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  tabButtonActive: {
    backgroundColor: "rgba(74, 222, 128, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.35)",
    paddingHorizontal: 16,
  },
  activeLabel: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
    marginLeft: 8,
  },
  fabOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 16,
  },
});

export default function EmployeeLayout() {
  return (
    <TrackingProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        <FloatingEmployeeTabBar />
      </View>
    </TrackingProvider>
  );
}
