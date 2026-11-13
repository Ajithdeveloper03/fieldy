import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

export default function SiteContactLoginScreen() {
  useEffect(() => {
    router.replace("/(auth)/login");
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#062214" }} />;
}
