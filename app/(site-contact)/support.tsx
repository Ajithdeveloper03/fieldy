import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Search,
  MessageCircle,
  Phone,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Mail
} from "lucide-react-native";

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={{ width: "100%", backgroundColor: "#ffffff", paddingBottom: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 5 }}>
        <SafeAreaView edges={["top"]} style={{ paddingTop: 10 }}>
          
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, marginBottom: 24 }}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(site-contact)/dashboard")} style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 16 }}>
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
            <View style={{ padding: 10, backgroundColor: "#ecfdf5", borderRadius: 16 }}>
              <HelpCircle size={24} color="#10b981" />
            </View>
          </View>

          <View style={{ paddingHorizontal: 24 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 32, lineHeight: 38, marginBottom: 8 }}>
              How can we{"\n"}help you today?
            </Text>
            
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", borderRadius: 20, paddingHorizontal: 16, height: 56, marginTop: 16 }}>
              <Search size={20} color="#94a3b8" />
              <TextInput
                placeholder="Search FAQs or articles..."
                placeholderTextColor="#94a3b8"
                style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 16, color: "#0f172a" }}
              />
            </View>
          </View>

        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150, paddingTop: 32 }}>
        
        {/* DIRECT CONTACT */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Direct Contact</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginRight: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <MessageCircle size={24} color="#10b981" />
            </View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Live Chat</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>Usually replies in 5m</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ flex: 1, backgroundColor: "#ffffff", borderRadius: 24, padding: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginLeft: 8 }}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Phone size={24} color="#3b82f6" />
            </View>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Call Us</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginTop: 4 }}>Toll Free (24/7)</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK LINKS */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 16 }}>Quick Links</Text>
        
        <View style={{ gap: 16 }}>
          <TouchableOpacity style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#fef3c7", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <BookOpen size={24} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Knowledge Base</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Guides on organic farming</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(site-contact)/support")} style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, flexDirection: "row", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
              <Mail size={24} color="#a855f7" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 4 }}>Contact Your Officer</Text>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 13 }}>Send a direct message</Text>
            </View>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        {/* FAQS */}
        <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginTop: 32, marginBottom: 16 }}>Popular FAQs</Text>
        <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9" }}>
          
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>How do I claim project insurance?</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9" }} />
          
          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>When will my next payout arrive?</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
          <View style={{ height: 1, width: "100%", backgroundColor: "#f1f5f9" }} />

          <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
            <Text style={{ flex: 1, color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 15 }}>How to book an emergency visit?</Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
}
