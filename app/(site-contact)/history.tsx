import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  MapPin,
  Sprout,
  FileCheck2,
  PackageCheck,
  TrendingUp,
  Award
} from "lucide-react-native";

export default function SiteContactHistoryScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* STUNNING ORGANIC TEXTURE HEADER */}
      <View style={{ width: "100%", height: 280, backgroundColor: "#ecfdf5", borderBottomRightRadius: 80, overflow: "hidden" }}>
        <Image
          source={require("../../assets/images/image10.jpg")}
          style={{ width: "100%", height: "100%", opacity: 0.3 }}
          resizeMode="cover"
        />
        <SafeAreaView style={{ position: "absolute", top: 0, width: "100%", height: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 10 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 24, marginTop: 40 }}>
            <View style={{ backgroundColor: "#10b981", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginBottom: 16 }}>
              <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>FARMING JOURNEY</Text>
            </View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 36, lineHeight: 42 }}>
              Your Legacy &{"\n"}Milestones
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 32 }}>
        
        {/* TIMELINE CONTAINER */}
        <View style={{ marginLeft: 16 }}>
          
          {/* Milestone 1: Latest */}
          <View style={{ flexDirection: "row", marginBottom: 32 }}>
            <View style={{ alignItems: "center", marginRight: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#10b981", zIndex: 10 }}>
                <TrendingUp size={24} color="#10b981" />
              </View>
              {/* Vertical Line */}
              <View style={{ width: 2, height: "100%", backgroundColor: "#d1fae5", position: "absolute", top: 48, bottom: -32 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginTop: 4 }}>
              <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>TODAY</Text>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 8 }}>Safety inspection completed</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>The site inspection was completed and required safety controls were recorded.</Text>
            </View>
          </View>

          {/* Milestone 2 */}
          <View style={{ flexDirection: "row", marginBottom: 32 }}>
            <View style={{ alignItems: "center", marginRight: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f59e0b", zIndex: 10 }}>
                <PackageCheck size={24} color="#f59e0b" />
              </View>
              {/* Vertical Line */}
              <View style={{ width: 2, height: "100%", backgroundColor: "#fef3c7", position: "absolute", top: 48, bottom: -32 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginTop: 4 }}>
              <Text style={{ color: "#f59e0b", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>AUG 2026</Text>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 8 }}>Project permit verified</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>The submitted construction permit was reviewed and verified by the project administrator.</Text>
            </View>
          </View>

          {/* Milestone 3 */}
          <View style={{ flexDirection: "row", marginBottom: 32 }}>
            <View style={{ alignItems: "center", marginRight: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#3b82f6", zIndex: 10 }}>
                <FileCheck2 size={24} color="#3b82f6" />
              </View>
              {/* Vertical Line */}
              <View style={{ width: 2, height: "100%", backgroundColor: "#dbeafe", position: "absolute", top: 48, bottom: -32 }} />
            </View>
            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginTop: 4 }}>
              <Text style={{ color: "#3b82f6", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>FEB 2026</Text>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 8 }}>NPOP Organic Certification</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>Officer Robert Walker completed the final audit. Farm officially certified 100% organic by government standard.</Text>
            </View>
          </View>

          {/* Milestone 4: Start */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ alignItems: "center", marginRight: 24 }}>
              <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#94a3b8", zIndex: 10 }}>
                <Sprout size={24} color="#64748b" />
              </View>
            </View>
            <View style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginTop: 4 }}>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 4 }}>JAN 2025</Text>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 8 }}>The Journey Begins</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, lineHeight: 20 }}>Joined the Infinity Organics family. Initial soil testing completed and 3.7 site_area registered.</Text>
            </View>
          </View>

        </View>

      </ScrollView>
    </View>
  );
}
