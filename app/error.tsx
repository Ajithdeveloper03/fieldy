import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { XCircle, RefreshCw } from "lucide-react-native";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "../components/ui/Button";

export default function ErrorScreen() {
  const { message = "Something went wrong. Please try again.", redirect } =
    useLocalSearchParams<{ message?: string; redirect?: string }>();

  const [shake] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={{ transform: [{ translateX: shake }], opacity }}
          className="items-center"
        >
          <View className="w-32 h-32 bg-red-50 rounded-full items-center justify-center mb-8">
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center shadow-xl">
              <XCircle size={64} color="#ef4444" />
            </View>
          </View>
          <Text className="text-gray-900 font-brandon-bold text-3xl text-center mb-4 leading-10">
            Oops!
          </Text>
          <Text className="text-gray-500 font-brandon text-lg text-center mb-12 px-4 leading-6">
            {message}
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity, width: "100%" }}>
          <TouchableOpacity
            onPress={handleRetry}
            activeOpacity={0.8}
            className="w-full bg-[#ef4444] py-4 rounded-xl shadow-md flex-row justify-center items-center"
          >
            <RefreshCw size={20} color="#fff" className="mr-2" />
            <Text className="text-gray-900 font-brandon-bold text-lg tracking-wide">
              Try Again
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

