import React from "react";
import { Tabs, router } from "expo-router";
import { Home, Package, Building2, PhoneCall, User } from "lucide-react-native";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { BlurView } from "expo-blur";
import { useLanguage } from "../../context/LanguageContext";
import { LanguageProvider } from "../../context/LanguageContext";
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { t } = useLanguage();
  const visibleRoutes = state.routes.filter(
    (route: any) =>
      ["dashboard", "orders", "crop-health", "officer", "profile"].includes(route.name)
  );
  const routeTitleMap: Record<string, string> = {
    dashboard: "Home",
    orders: "Orders",
    "crop-health": "Facility",
    officer: "Support",
    profile: "Profile",
  };
  return (
    <View style={styles.container}>
      <BlurView
        intensity={90}
        tint="light"
        style={styles.blurView}
      >
        {visibleRoutes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = routeTitleMap[route.name] || route.name;
          const isFocused = state.index === state.routes.findIndex((r: any) => r.key === route.key);
          
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
          const getIcon = () => {
            const activeColor = "#0f172a"; // Slate dark
            const inactiveColor = "#94a3b8"; // Slate gray
            const color = isFocused ? activeColor : inactiveColor;  
            switch (route.name) {
              case "dashboard":
                return <Home size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
              case "orders":
                return <Package size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
              case "crop-health":
                return <Building2 size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
              case "officer":
                return <PhoneCall size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
              case "profile":
                return <User size={24} color={color} strokeWidth={isFocused ? 2.5 : 2} />;
              default:
                return null;
            }
          };
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              onPress={onPress}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 4 }}
            >
              {getIcon()}
              <Text style={{ fontSize: 10, marginTop: 4, fontFamily: isFocused ? "Brandon-Bold" : "Brandon-Medium", color: isFocused ? "#065f46" : "#64748b" }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

export default function FarmerLayout() {
  return (
    <LanguageProvider>
      <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
        <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="dashboard" />
          <Tabs.Screen name="orders" />
          <Tabs.Screen name="crop-health" />
          <Tabs.Screen name="officer" />
          <Tabs.Screen name="profile" />
          <Tabs.Screen name="farm" options={{ href: null }} />
          <Tabs.Screen name="documents" options={{ href: null }} />
          <Tabs.Screen name="history" options={{ href: null }} />
          <Tabs.Screen name="menu" options={{ href: null }} />
          <Tabs.Screen name="notifications" options={{ href: null }} />
          <Tabs.Screen name="recommendations" options={{ href: null }} />
          <Tabs.Screen name="referral" options={{ href: null }} />
          <Tabs.Screen name="support" options={{ href: null }} />
          <Tabs.Screen name="product/[id]" options={{ href: null }} />
          <Tabs.Screen name="report" options={{ href: null }} />
          <Tabs.Screen name="visit" options={{ href: null }} />
        </Tabs>
      </View>
    </LanguageProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 72,
    borderRadius: 36,
    overflow: "hidden",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.8)",
  },
  blurView: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
});