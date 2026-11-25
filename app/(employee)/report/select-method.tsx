import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { X, Camera, Video, ClipboardCheck, FileText, History } from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function SelectReportMethodScreen() {
  const insets = useSafeAreaInsets();
  const { serviceConfig } = useService();
  const themeAccent = serviceConfig.themeColor || "#10b981";

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28, marginBottom: 8 }}>
            New {serviceConfig.vocab.report}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 16, marginBottom: 48, textAlign: "center" }}>
            {serviceConfig.shortName} • Pick how to add
          </Text>

          <View style={{ gap: 18, width: "100%", alignItems: "center" }}>
            
            {/* Button 1: Photo Report */}
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/report?method=photo")}
              variant="dark"
              dropletColor={themeAccent}
              style={{ width: "80%" }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 32 }}
            >
              <Camera size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>{serviceConfig.shortName} Photo</Text>
            </LiquidGlassButton>

            {/* Button 2: Video Report */}
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/report?method=video")}
              variant="dark"
              dropletColor="#0284c7"
              style={{ width: "80%" }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 32 }}
            >
              <Video size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>{serviceConfig.shortName} Video</Text>
            </LiquidGlassButton>

            {/* Button 2: Service Checklist */}
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/report?method=checklist")}
              variant="dark"
              dropletColor={themeAccent}
              style={{ width: "80%" }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 32 }}
            >
              <ClipboardCheck size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>{serviceConfig.vocab.taskSingular} Check</Text>
            </LiquidGlassButton>

            {/* Button 3: Quick Notes */}
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit/report?method=notes")}
              variant="dark"
              dropletColor={themeAccent}
              style={{ width: "80%" }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 32 }}
            >
              <FileText size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Quick Notes</Text>
            </LiquidGlassButton>

            {/* Button 4: Past Reports */}
            <LiquidGlassButton
              onPress={() => router.push("/(employee)/visit-history")}
              variant="dark"
              dropletColor={themeAccent}
              style={{ width: "80%" }}
              contentStyle={{ paddingVertical: 16, paddingHorizontal: 32 }}
            >
              <History size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Past {serviceConfig.vocab.report}s</Text>
            </LiquidGlassButton>

          </View>

          {/* Separator Line */}
          <View style={{ width: 100, height: 2, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 60, borderRadius: 1 }} />

        </View>

        {/* Floating Cancel Button at Bottom */}
        <View style={{ paddingBottom: 40, alignItems: "center" }}>
          <LiquidGlassIconButton
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
            variant="light"
            size={64}
          >
            <X size={24} color="#0f172a" style={{ marginBottom: -4 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 10 }}>Cancel</Text>
          </LiquidGlassIconButton>
        </View>

      </View>
    </LiquidGlassBackdrop>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  }
});
