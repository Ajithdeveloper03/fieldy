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
import { X, Camera, ClipboardCheck, FileText, History } from "lucide-react-native";
import { useService } from "../../../context/ServiceContext";

export default function SelectReportMethodScreen() {
  const insets = useSafeAreaInsets();
  const { serviceConfig } = useService();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={["#062214", serviceConfig.themeColor || "#10b981", "#04140b"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

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
            <TouchableOpacity 
              onPress={() => router.push("/(employee)/visit/report?method=photo")}
              style={styles.dottedButton}
            >
              <Camera size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>{serviceConfig.shortName} Photo</Text>
            </TouchableOpacity>

            {/* Button 2: Service Checklist */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit/report?method=checklist")}
              style={styles.dottedButton}
            >
              <ClipboardCheck size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>{serviceConfig.vocab.taskSingular} Check</Text>
            </TouchableOpacity>

            {/* Button 3: Quick Notes */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit/report?method=notes")}
              style={styles.dottedButton}
            >
              <FileText size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Quick Notes</Text>
            </TouchableOpacity>

            {/* Button 4: Past Reports */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit-history")}
              style={styles.dottedButton}
            >
              <History size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Past {serviceConfig.vocab.report}s</Text>
            </TouchableOpacity>

          </View>

          {/* Separator Line */}
          <View style={{ width: 100, height: 2, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 60, borderRadius: 1 }} />

        </View>

        {/* Floating Cancel Button at Bottom */}
        <View style={{ paddingBottom: 40, alignItems: "center" }}>
          <TouchableOpacity 
            onPress={() => router.canGoBack() ? router.back() : router.replace("/(employee)/dashboard")}
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}
          >
            <X size={24} color="#0f172a" style={{ marginBottom: -4 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dottedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    borderStyle: "dashed",
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "80%",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  buttonText: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 16,
  }
});
