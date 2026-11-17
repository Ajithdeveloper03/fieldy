import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

export default function AppreciationScreen() {
  useEffect(() => {
    router.replace("/(employee)/bonus-wallet" as any);
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#062214" }} />;
}
