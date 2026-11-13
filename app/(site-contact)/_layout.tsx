import React, { useEffect } from "react";
import { Stack, router } from "expo-router";
import { View } from "react-native";

export default function SiteContactLayout() {
  useEffect(() => {
    router.replace("/(employee)/dashboard");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
