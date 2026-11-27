import { useEffect, useState } from "react";
import { Animated, Image, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LiquidGlassBackdrop, LiquidGlassCard } from "../components/LiquidGlass";
import { checkAndRecoverPendingClockIn } from "../utils/pendingClockIn";

export default function IndexScreen() {
  const [scaleAnim] = useState(() => new Animated.Value(0.3));
  const [opacityAnim] = useState(() => new Animated.Value(0));
  const [textOpacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const introAnim = Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    (async () => {
      // 1. If Android killed the activity while the user was taking an attendance selfie,
      // skip splash/intro and resume Clock-In immediately with the captured selfie.
      try {
        const recovery = await checkAndRecoverPendingClockIn();
        if (!cancelled && recovery.shouldRedirectToClockIn) {
          router.replace("/(employee)/attendance/clock-in");
          return;
        }
      } catch {
        // Proceed to session check
      }

      // 2. If user is already signed in, resume directly where they were instead of restarting at /intro.
      try {
        const entries = await AsyncStorage.multiGet([
          "token",
          "@auth_user",
          "isLoggedIn",
          "@fieldy_last_route",
        ]);
        const map = Object.fromEntries(entries);
        const hasSession = Boolean(
          map["token"] || map["@auth_user"] || map["isLoggedIn"] === "true"
        );
        if (!cancelled && hasSession) {
          const lastRoute = map["@fieldy_last_route"];
          const isValidSavedRoute =
            typeof lastRoute === "string" &&
            lastRoute.startsWith("/") &&
            lastRoute !== "/" &&
            lastRoute !== "/intro" &&
            lastRoute !== "/login";
          router.replace((isValidSavedRoute ? lastRoute : "/(employee)/dashboard") as any);
          return;
        }
      } catch {
        // Fall through to intro
      }

      if (cancelled) return;
      introAnim.start();
      timer = setTimeout(() => {
        if (!cancelled) {
          router.replace("/intro");
        }
      }, 2400);
    })();

    return () => {
      cancelled = true;
      introAnim.stop();
      if (timer) clearTimeout(timer);
    };
  }, [opacityAnim, scaleAnim, textOpacityAnim]);

  return (
    <LiquidGlassBackdrop variant="dark" style={styles.container}>
      <StatusBar style="light" />

      {/* FLOATING LIQUID GLASS LOGO CAPSULE */}
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <LiquidGlassCard
          variant="light"
          borderRadius={28}
          dropletColor="#10B981"
          style={styles.logoCard}
          contentStyle={styles.logoCardContent}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </LiquidGlassCard>
      </Animated.View>

      {/* TEXT */}
      <Animated.View style={[styles.textContainer, { opacity: textOpacityAnim }]}>
        <Text style={styles.title}>FIELDY</Text>
        <Text style={styles.subtitle}>Field Operations & Management Platform</Text>
      </Animated.View>
    </LiquidGlassBackdrop>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoCard: {
    width: 224,
    height: 112,
  },
  logoCardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 184,
    height: 76,
  },
  textContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 26,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: "#4ade80",
    fontFamily: "Brandon-Medium",
    fontSize: 14,
    letterSpacing: 2,
  },
});
