import "../utils/fontSetup";
// Fonts are strictly managed by DM Sans and Spectral now
import { Spectral_700Bold, useFonts } from "@expo-google-fonts/spectral";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
} from "react-native";
import { Asset } from "expo-asset";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastMessage } from "../components/ui/ToastMessage";
import "../global.css";
import { TrackingProvider } from "../context/TrackingContext";
import { LanguageProvider } from "../context/LanguageContext";
import { ServiceProvider } from "../context/ServiceContext";
import { LiquidGlassBackdrop, LiquidGlassCard } from "../components/LiquidGlass";

SplashScreen.preventAutoHideAsync().catch(() => {});

const REMOTE_ASSETS_TO_PREFETCH = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=project&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=project&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=project&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=project&q=80",
];

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Spectral_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Subtle breathing pulse for app loading screen
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    async function loadAssets() {
      try {
        const localImages = [
          require("../assets/images/logo.png"),
          require("../assets/images/intro_bg.png"),
          require("../assets/images/icon.png"),
          require("../assets/images/splash-icon.png"),
          require("../assets/images/image1.jpg"),
          require("../assets/images/image2.jpg"),
          require("../assets/images/image3.jpg"),
          require("../assets/images/image4.jpg"),
          require("../assets/images/image5.jpg"),
          require("../assets/images/image6.jpg"),
          require("../assets/images/image7.jpg"),
          require("../assets/images/image8.jpg"),
        ];

        // Preload local assets with a hard failsafe timeout so splash never stalls
        const localPromises = localImages.map((img) =>
          Asset.fromModule(img).downloadAsync().catch(() => null)
        );

        // Prefetch remote avatars in background (never block app startup)
        REMOTE_ASSETS_TO_PREFETCH.forEach((url) => {
          Image.prefetch(url).catch(() => null);
        });

        await Promise.race([
          Promise.all(localPromises),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      } catch (e) {
        console.warn("Asset preloading notice:", e);
      } finally {
        setAssetsLoaded(true);
      }
    }

    loadAssets();
  }, []);

  useEffect(() => {
    if ((loaded || error) && assetsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error, assetsLoaded]);

  // Branded App Starting Loading Screen (Apple Liquid Glass)
  if ((!loaded && !error) || !assetsLoaded) {
    return (
      <LiquidGlassBackdrop
        variant="dark"
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <StatusBar style="light" />
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 22,
          }}
        >
          <LiquidGlassCard
            variant="light"
            borderRadius={26}
            style={{ width: 176, height: 88 }}
            contentStyle={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 14,
              paddingVertical: 10,
              backgroundColor: "#FFFFFF",
            }}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: 144, height: 60 }}
              resizeMode="contain"
            />
          </LiquidGlassCard>
        </Animated.View>

        <Text
          style={{
            color: "#ffffff",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: 3,
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          FIELDY
        </Text>
        <Text
          style={{
            color: "#34d399",
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 1.5,
            marginBottom: 28,
            textTransform: "uppercase",
          }}
        >
          Field Operations & Management
        </Text>

        <ActivityIndicator size="small" color="#34d399" />
      </LiquidGlassBackdrop>
    );
  }

  return (
    <SafeAreaProvider>
      <ServiceProvider>
        <LanguageProvider>
          <TrackingProvider>
            <Stack screenOptions={{ headerShown: false }} />
            <ToastMessage />
            <StatusBar style="auto" />
          </TrackingProvider>
        </LanguageProvider>
      </ServiceProvider>
    </SafeAreaProvider>
  );
}
