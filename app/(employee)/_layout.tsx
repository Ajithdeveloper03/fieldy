import React, { useEffect, useState } from "react";
import { Stack, router, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CalendarDays, FileText, Home, Fingerprint, User } from "lucide-react-native";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
} from "react-native";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { SafeBlurView } from "../../components/LiquidGlass";
import { useLanguage } from "../../context/LanguageContext";
import { TrackingProvider } from "../../context/TrackingContext";

const TAB_ROUTES = [
  { name: "dashboard", path: "/(employee)/dashboard", key: "home", defaultLabel: "Home", Icon: Home, color: "#38BDF8" },
  { name: "visits", path: "/(employee)/visits", key: "visits", defaultLabel: "Visits", Icon: CalendarDays, color: "#34D399" },
  { name: "reports", path: "/(employee)/reports", key: "reports", defaultLabel: "Reports", Icon: FileText, color: "#A78BFA" },
  { name: "profile", path: "/(employee)/profile", key: "profile", defaultLabel: "Profile", Icon: User, color: "#FB923C" },
];

const MAIN_TAB_SCREENS = ["/dashboard", "/visits", "/reports", "/profile"];

function hapticTap() {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
  }
}

function LiquidTabItem({
  tab,
  isFocused,
  label,
  onPress,
}: {
  tab: (typeof TAB_ROUTES)[number];
  isFocused: boolean;
  label: string;
  onPress: () => void;
}) {
  const [scale] = useState(() => new Animated.Value(1));
  const IconComponent = tab.Icon;

  const pressIn = () => {
    hapticTap();
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, speed: 42, bounciness: 6 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 11 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={[
          styles.tabButton,
          isFocused && [
            styles.tabButtonActive,
            {
              borderColor: `${tab.color}99`,
              backgroundColor: `${tab.color}28`,
            },
          ],
        ]}
      >
        <IconComponent
          size={20}
          color={isFocused ? tab.color : "rgba(255,255,255,0.74)"}
          strokeWidth={isFocused ? 2.5 : 2}
        />
        {isFocused && (
          <Text style={styles.activeLabel} numberOfLines={1}>
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function FloatingEmployeeTabBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [fabScale] = useState(() => new Animated.Value(1));

  const shouldShowTabBar = MAIN_TAB_SCREENS.some(
    (screen) => pathname === screen || pathname.endsWith(screen)
  );

  if (!shouldShowTabBar) {
    return null;
  }

  return (
    <View style={styles.outerWrap}>
      {/* Apple iOS 26 Floating Liquid Glass Capsule Menubar */}
      <View style={styles.capsuleShadow}>
        <View style={styles.capsuleContainer}>
          <SafeBlurView
            intensity={86}
            tint="dark"
            style={styles.blurView}
          >
            {/* Smooth native curved top liquid meniscus reflection */}
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
              locations={[0, 0.45, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50%",
              }}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.14)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "35%",
              }}
            />
            <View pointerEvents="none" style={styles.topSpecular} />
            {TAB_ROUTES.map((tab) => {
              const isFocused =
                pathname === `/${tab.name}` || pathname.endsWith(`/${tab.name}`);
              const label = t(tab.key, tab.defaultLabel);
              return (
                <LiquidTabItem
                  key={tab.name}
                  tab={tab}
                  isFocused={isFocused}
                  label={label}
                  onPress={() => {
                    if (!isFocused) {
                      router.navigate(tab.path as any);
                    }
                  }}
                />
              );
            })}
          </SafeBlurView>
        </View>
      </View>

      {/* Detached Apple Fluid Liquid Glass Attendance Orb */}
      <Animated.View style={[styles.fabShadow, { transform: [{ scale: fabScale }] }]}>
        <Pressable
          onPress={() => router.push("/(employee)/attendance-hub" as any)}
          onPressIn={() => {
            hapticTap();
            Animated.spring(fabScale, { toValue: 0.89, useNativeDriver: true, speed: 42, bounciness: 6 }).start();
          }}
          onPressOut={() => {
            Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 11 }).start();
          }}
          style={styles.fabOrb}
        >
          <SafeBlurView
            intensity={78}
            tint="dark"
            style={styles.fabBlur}
          >
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(13,148,136,0)", "rgba(45,212,191,0.44)"]}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 0.9 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              pointerEvents="none"
              colors={["rgba(255,255,255,0.42)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
              locations={[0, 0.5, 1]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "48%",
              }}
            />
            <View pointerEvents="none" style={styles.fabSpecular} />
            <Fingerprint size={26} color="#ffffff" strokeWidth={2.4} />
          </SafeBlurView>
        </Pressable>
      </Animated.View>
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
  capsuleShadow: {
    flex: 1,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.42,
    shadowRadius: 28,
    elevation: 18,
  },
  capsuleContainer: {
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(12, 18, 24, 0.28)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.42)",
  },
  blurView: {
    flex: 1,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    backgroundColor:
      Platform.OS === "android"
        ? "rgba(12, 18, 24, 0.78)"
        : "rgba(12, 18, 24, 0.36)",
  },
  topSpecular: {
    position: "absolute",
    top: 0,
    left: 26,
    right: 26,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.72)",
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
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1.25,
    borderColor: "rgba(255, 255, 255, 0.56)",
    paddingHorizontal: 16,
  },
  activeLabel: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 13,
    marginLeft: 8,
  },
  fabShadow: {
    borderRadius: 30,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.48,
    shadowRadius: 20,
    elevation: 16,
  },
  fabOrb: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(13, 148, 136, 0.52)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.64)",
  },
  fabBlur: {
    flex: 1,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(13, 148, 136, 0.56)",
  },
  fabSpecular: {
    position: "absolute",
    top: 0,
    left: 14,
    right: 14,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
});

export default function EmployeeLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      pathname &&
      pathname.startsWith("/") &&
      pathname !== "/" &&
      pathname !== "/intro" &&
      pathname !== "/login" &&
      !pathname.includes("/visit/success")
    ) {
      AsyncStorage.setItem("@fieldy_last_route", pathname).catch(() => {});
    }
  }, [pathname]);

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
