import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Phone, Tag, ArrowRight } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";

export default function Step1Mobile() {
  const [mobile, setMobile] = useState("9842155678");
  const [category, setCategory] = useState<"Hard FM" | "Soft FM" | "Security & MEP">("Hard FM");
  const [crops, setCrops] = useState("Chillers & Elevators");

  const handleNext = () => {
    if (!mobile || mobile.trim().length < 10) {
      showToast({
        title: "Invalid Mobile Number",
        message: "Please enter a valid 10-digit mobile number.",
        type: "error",
      });
      return;
    }

    // Direct progression without OTP requirement
    router.push({
      pathname: "/(employee)/register-farmer/step3",
      params: { mobile: mobile.trim(), category, crops },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header */}
      <View
        style={{ backgroundColor: "transparent" }}
        className="px-5 pt-2 pb-3 flex-row items-center justify-between z-10"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0f172a" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-brandon-bold text-slate-900">
            Onboard Client & Site
          </Text>
          <Text className="text-slate-500 font-brandon text-xs">
            Step 1 of 4 • Facility Identity & Scope
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
      >
        {/* 4-Step Stepper */}
        <View className="flex-row items-center justify-center my-4 px-6">
          <View className="w-8 h-8 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">1</Text>
          </View>
          <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
          <View className="w-8 h-8 rounded-full bg-white border border-slate-300 items-center justify-center">
            <Text className="text-slate-400 font-brandon-bold text-xs">2</Text>
          </View>
          <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
          <View className="w-8 h-8 rounded-full bg-white border border-slate-300 items-center justify-center">
            <Text className="text-slate-400 font-brandon-bold text-xs">3</Text>
          </View>
          <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
          <View className="w-8 h-8 rounded-full bg-white border border-slate-300 items-center justify-center">
            <Text className="text-slate-400 font-brandon-bold text-xs">4</Text>
          </View>
        </View>

        {/* Hero Visual: Phone with Shield & Facilities */}
        <View className="items-center justify-center my-3">
          <View className="w-24 h-24 rounded-full bg-sky-50/80 items-center justify-center border border-sky-200/80 shadow-sm relative">
            <Image
              source={require("../../../assets/images/shield_phone.png")}
              style={{ width: 68, height: 68 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-xl font-brandon-bold text-slate-900 mt-3 text-center">
            Facility & Client Identity
          </Text>
          <Text className="text-slate-500 font-brandon text-xs text-center mt-1 px-4">
            Enter the authorized facility manager&apos;s mobile number & service scope
          </Text>
        </View>

        {/* Mobile Input Card */}
        <View className="bg-sky-50/70 rounded-2xl p-4 border border-sky-200/90 shadow-sm mb-4">
          <Text className="text-sky-900 text-xs font-brandon-bold uppercase tracking-wider mb-2">
            Facility Manager / Contact Mobile
          </Text>
          <View className="flex-row items-center bg-white rounded-xl px-3.5 py-3 border border-slate-200">
            <Phone size={18} color="#0284c7" />
            <Text className="text-slate-900 font-brandon-bold text-base ml-2.5 mr-1.5">
              +91
            </Text>
            <TextInput
              className="flex-1 text-base font-brandon-bold text-slate-900 p-0 m-0"
              placeholder="98765 43210"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={setMobile}
              maxLength={10}
            />
          </View>
        </View>

        {/* Facility Service Scope Selection Card */}
        <View className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/90 shadow-sm mb-4">
          <Text className="text-slate-950 text-xs font-brandon-bold uppercase tracking-wider mb-2.5">
            Service Industry Scope
          </Text>
          <View className="flex-row justify-between">
            {(["Hard FM", "Soft FM", "Security & MEP"] as const).map((cat) => {
              const selected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat as any)}
                  activeOpacity={0.8}
                  className={`flex-1 py-3 px-2 rounded-xl mx-1 border items-center shadow-sm ${selected
                      ? "bg-[#0284c7] border-[#0284c7]"
                      : "bg-white border-slate-200"
                    }`}
                >
                  <Text
                    className={`font-brandon-bold text-xs ${selected ? "text-white" : "text-slate-700"
                      }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Facility Asset / Key Systems Focus */}
        <View className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/90 shadow-sm mb-6">
          <Text className="text-slate-950 text-xs font-brandon-bold uppercase tracking-wider mb-2">
            Primary Assets / Systems
          </Text>
          <View className="flex-row items-center bg-white rounded-xl px-3.5 py-3 border border-slate-200">
            <Tag size={18} color="#0284c7" />
            <TextInput
              className="flex-1 ml-2.5 text-base font-brandon-bold text-slate-900 p-0 m-0"
              placeholder="e.g. Chillers, Elevators, Solar, Access Control"
              placeholderTextColor="#94a3b8"
              value={crops}
              onChangeText={setCrops}
            />
          </View>
        </View>

        {/* Action Button: Directly proceeds to Facility Details */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleNext}
          className="w-full bg-[#0284c7] py-4 rounded-2xl items-center justify-center shadow-md shadow-sky-900/20 flex-row mt-2"
        >
          <Text className="text-white font-brandon-bold text-base tracking-wide mr-2">
            Continue to Facility Details
          </Text>
          <ArrowRight size={18} color="#ffffff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
