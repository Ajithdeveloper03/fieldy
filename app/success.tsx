import React, { useEffect, useState } from "react";
import { View, Text, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
} from "../components/LiquidGlass";

export default function SuccessScreen() {
  const {
    message = "Action Completed Successfully!",
    redirect = "/(employee)/dashboard",
  } = useLocalSearchParams<{ message?: string; redirect?: string }>();

  const [scale] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const handleContinue = () => {
    router.replace(redirect as any);
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <LiquidGlassCard
            variant="dark"
            borderRadius={32}
            dropletColor="#10B981"
            style={{ width: "100%" }}
            contentStyle={{ padding: 28, alignItems: "center" }}
          >
            <Animated.View
              style={{ transform: [{ scale }], opacity, alignItems: "center" }}
            >
              <LiquidGlassIconBadge
                size={104}
                borderRadius={52}
                variant="dark"
                tintColor="#10B981"
                style={{ marginBottom: 24 }}
              >
                <CheckCircle2 size={56} color="#34D399" />
              </LiquidGlassIconBadge>
              <Text className="text-white font-brandon-bold text-3xl text-center mb-3 leading-10">
                Success!
              </Text>
              <Text className="text-emerald-100/90 font-brandon text-base text-center mb-8 px-2 leading-6">
                {message}
              </Text>
            </Animated.View>

            <Animated.View style={{ opacity, width: "100%" }}>
              <LiquidGlassButton
                onPress={handleContinue}
                variant="tinted"
                tintColor="rgba(16, 185, 129, 0.72)"
                dropletColor="#34D399"
                style={{ width: "100%" }}
                contentStyle={{ paddingVertical: 16 }}
              >
                <Text style={{ color: "#FFFFFF", fontFamily: "Brandon-Bold", fontSize: 17 }}>
                  Continue
                </Text>
              </LiquidGlassButton>
            </Animated.View>
          </LiquidGlassCard>
        </View>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
