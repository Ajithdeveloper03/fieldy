import React, { useState } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { ChevronLeft, Check } from "lucide-react-native";
import { router } from "expo-router";
import {
  LiquidGlassBackdrop,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

const languages = [
  { id: 'en', name: 'English' },
  { id: 'te', name: 'Telugu - తెలుగు' },
  { id: 'hi', name: 'Hindi - हिन्दी' },
  { id: 'ta', name: 'Tamil - தமிழ்' },
];

export default function LanguageScreen() {
  const [selectedLang, setSelectedLang] = useState('en');

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        {/* Header - Transparent */}
        <View style={{ backgroundColor: "transparent" }} className="px-5 pt-2 pb-3 flex-row items-center justify-between z-10">
          <LiquidGlassIconButton
            onPress={() => router.push("/(employee)/dashboard")}
            variant="light"
            size={42}
          >
            <ChevronLeft size={22} color="#111827" />
          </LiquidGlassIconButton>
          <Text className="text-lg font-brandon-bold text-gray-900">
            Select Language
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
        >
          <LiquidGlassCard variant="light" borderRadius={24}>
            {languages.map((lang, index) => (
              <TouchableOpacity
                key={lang.id}
                onPress={() => setSelectedLang(lang.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: 16,
                  borderBottomWidth: index !== languages.length - 1 ? 1 : 0,
                  borderBottomColor: "rgba(148, 163, 184, 0.2)",
                }}
                accessibilityRole="button"
              >
                <Text className={`text-base font-brandon ${selectedLang === lang.id ? 'text-blue-600 font-brandon-bold' : 'text-gray-900'}`}>
                  {lang.name}
                </Text>
                {selectedLang === lang.id && (
                  <LiquidGlassIconBadge size={30} borderRadius={15} variant="light" tintColor="#3b82f6">
                    <Check size={16} color="#3b82f6" />
                  </LiquidGlassIconBadge>
                )}
              </TouchableOpacity>
            ))}
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
