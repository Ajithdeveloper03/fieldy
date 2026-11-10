import React from "react";
import { Stack, router, usePathname } from "expo-router";
import { Home, ClipboardCheck, FileCheck2, User } from "lucide-react-native";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { LanguageProvider } from "../../context/LanguageContext";

const SITE_CONTACT_TAB_ROUTES = [
  { name: "dashboard", path: "/(site-contact)/dashboard", label: "Home", Icon: Home },
  { name: "documents", path: "/(site-contact)/documents", label: "Permits", Icon: FileCheck2 },
  { name: "site-inspections", path: "/(site-contact)/site-inspections", label: "Inspections", Icon: ClipboardCheck },
  
  { name: "profile", path: "/(site-contact)/profile", label: "Profile", Icon: User },
];

const SITE_CONTACT_MAIN_SCREENS = [
  "/dashboard",
  "/documents",
  "/site-inspections",

  "/profile",
];

function FloatingSiteContactTabBar() {
  const pathname = usePathname();

  const shouldShowTabBar = SITE_CONTACT_MAIN_SCREENS.some(
    (screen) => pathname === screen || pathname.endsWith(screen)
  );

  if (!shouldShowTabBar) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={85} tint="dark" style={styles.blurView}>
        {SITE_CONTACT_TAB_ROUTES.map((tab) => {
          const isFocused =
            pathname === `/${tab.name}` || pathname.endsWith(`/${tab.name}`);
          const IconComponent = tab.Icon;

          return (
            <TouchableOpacity
              key={tab.name}
              accessibilityRole="button"
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
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function SiteContactLayout() {
  return (
    <LanguageProvider>
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <Stack screenOptions={{ headerShown: false }} />
        <FloatingSiteContactTabBar />
      </View>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(6, 34, 20, 0.92)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
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
});
