import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { X, Camera, Image as ImageIcon, FileText, History } from "lucide-react-native";

export default function SelectReportMethodScreen() {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />

      {/* Smooth Emerald/Blue-ish Gradient Background like Image 1 */}
      <LinearGradient
        colors={["#0ea5e9", "#10b981", "#047857"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          
          <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 28, marginBottom: 8 }}>
            Select a Method
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 16, marginBottom: 60, textAlign: "center" }}>
            Add your field report in the most convenient way
          </Text>

          <View style={{ gap: 20, width: "100%", alignItems: "center" }}>
            
            {/* Dotted Outline Button 1 */}
            <TouchableOpacity 
              onPress={() => router.push("/(employee)/visit/report")}
              style={styles.dottedButton}
            >
              <Camera size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Add Report via Photo</Text>
            </TouchableOpacity>

            {/* Dotted Outline Button 2 */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit/report")}
              style={styles.dottedButton}
            >
              <ImageIcon size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Import Drone Image</Text>
            </TouchableOpacity>

            {/* Dotted Outline Button 3 */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit/report")}
              style={styles.dottedButton}
            >
              <FileText size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>Manual Text Only</Text>
            </TouchableOpacity>

            {/* Dotted Outline Button 4 */}
            <TouchableOpacity
              onPress={() => router.push("/(employee)/visit-history")}
              style={styles.dottedButton}
            >
              <History size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text style={styles.buttonText}>From Past Reports</Text>
            </TouchableOpacity>

          </View>

          {/* Separator Line */}
          <View style={{ width: 100, height: 2, backgroundColor: "rgba(255,255,255,0.2)", marginTop: 60, borderRadius: 1 }} />

        </View>

        {/* Floating Cancel Button at Bottom */}
        <View style={{ paddingBottom: 40, alignItems: "center" }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 }}
          >
            <X size={24} color="#0f172a" style={{ marginBottom: -4 }} />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 10 }}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
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
