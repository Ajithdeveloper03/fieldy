import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { XCircle, RefreshCw } from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
} from "../components/LiquidGlass";

export default function ErrorScreen() {
  const { message = "Something went wrong. Please try again.", redirect } =
    useLocalSearchParams<{ message?: string; redirect?: string }>();

  const [shake] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(shake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shake, opacity]);

  const handleRetry = () => {
    if (redirect) {
      router.replace(redirect as any);
    } else {
      router.back();
    }
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <LiquidGlassCard
            variant="light"
            borderRadius={32}
            dropletColor="#EF4444"
            style={{ width: "100%" }}
            contentStyle={{ padding: 28, alignItems: "center" }}
          >
            <Animated.View
              style={{ transform: [{ translateX: shake }], opacity, alignItems: "center" }}
            >
              <LiquidGlassIconBadge
                size={104}
                borderRadius={52}
                variant="light"
                tintColor="#EF4444"
                style={{ marginBottom: 24 }}
              >
                <XCircle size={56} color="#EF4444" />
              </LiquidGlassIconBadge>
              <Text className="text-gray-900 font-brandon-bold text-3xl text-center mb-3 leading-10">
                Oops!
              </Text>
              <Text className="text-gray-600 font-brandon text-base text-center mb-8 px-2 leading-6">
                {message}
              </Text>
            </Animated.View>

            <Animated.View style={{ opacity, width: "100%" }}>
              <LiquidGlassButton
                onPress={handleRetry}
                variant="tinted"
                tintColor="rgba(225, 29, 72, 0.78)"
                dropletColor="#FB7185"
                style={{ width: "100%" }}
                contentStyle={{ paddingVertical: 16 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <RefreshCw size={18} color="#FFFFFF" />
                  <Text style={{ color: "#FFFFFF", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                    Try Again
                  </Text>
                </View>
              </LiquidGlassButton>
            </Animated.View>
          </LiquidGlassCard>
        </View>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
