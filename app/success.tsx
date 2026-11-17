import React, { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2 } from "lucide-react-native";
import { Button } from "../components/ui/Button";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#15803d" }}>
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ scale }], opacity }}
          className="items-center"
        >
          <View className="w-32 h-32 bg-white/20 rounded-full items-center justify-center mb-8">
            <View className="w-24 h-24 bg-white rounded-full items-center justify-center shadow-2xl">
              <CheckCircle2 size={64} color="#15803d" />
            </View>
          </View>
          <Text className="text-white font-brandon-bold text-3xl text-center mb-4 leading-10">
            Success!
          </Text>
          <Text className="text-green-50 font-brandon text-lg text-center mb-12 px-4 leading-6">
            {message}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity, width: "100%" }}>
          <Button
            title="Continue"
            onPress={handleContinue}
            className="bg-white"
            textClassName="text-[#15803d]"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

