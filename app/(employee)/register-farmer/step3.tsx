import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";

export default function RegisterStep3Screen() {
  const params = useLocalSearchParams<{ mobile?: string }>();
  const [form, setForm] = useState({
    fullName: "Ramesh Kumar",
    email: "rameshkumar@gmail.com",
    mobile: params.mobile || "9687846895",
    village: "Thottipalayam",
    taluk: "Coimbatore",
    district: "Coimbatore",
    state: "Tamilnadu",
    pincode: "641045",
  });

  const handleNext = () => {
    if (!form.fullName.trim() || !form.mobile.trim()) {
      showToast({
        title: "Missing Details",
        message: "Please enter the farmer's full name and mobile number.",
        type: "error",
      });
      return;
    }

    router.push({
      pathname: "/(employee)/register-farmer/step4",
      params: { ...form },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header matching Image 2 Screen 3 */}
      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-brandon-bold text-slate-900">
            Facility Onboarding
          </Text>
          <Text className="text-slate-500 font-brandon text-xs">
            Step 2 of 4 • Client & Site Contact Details
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 10 }}
        >
          {/* 4-Step Stepper */}
          <View className="flex-row items-center justify-center my-4 px-4">
            <View className="w-7 h-7 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
              <Text className="text-white font-brandon-bold text-xs">✓</Text>
            </View>
            <View className="flex-1 h-0.5 bg-[#0284c7] mx-2" />
            <View className="w-8 h-8 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
              <Text className="text-white font-brandon-bold text-xs">2</Text>
            </View>
            <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <View className="w-7 h-7 rounded-full bg-white border border-slate-300 items-center justify-center">
              <Text className="text-slate-400 font-brandon-bold text-xs">3</Text>
            </View>
            <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
            <View className="w-7 h-7 rounded-full bg-white border border-slate-300 items-center justify-center">
              <Text className="text-slate-400 font-brandon-bold text-xs">4</Text>
            </View>
          </View>

          {/* Section Heading */}
          <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-4">
            Facility Manager & Location Details
          </Text>

          {/* Form Fields matching Design */}
          <View className="space-y-4">
            {/* Full Name */}
            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Full Name
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
                placeholder="Full Name"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Email */}
            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Email
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="Email Address"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Mobile Number */}
            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Mobile Number
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                value={form.mobile}
                onChangeText={(t) => setForm({ ...form, mobile: t })}
                placeholder="+91 Mobile Number"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>

            {/* Village & Taluk in 2 columns */}
            <View className="flex-row space-x-3 mb-3">
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mr-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  Village
                </Text>
                <TextInput
                  className="text-sm font-brandon-bold text-slate-900 p-0 m-0"
                  value={form.village}
                  onChangeText={(t) => setForm({ ...form, village: t })}
                />
              </View>

              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm ml-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  Taluk
                </Text>
                <TextInput
                  className="text-sm font-brandon-bold text-slate-900 p-0 m-0"
                  value={form.taluk}
                  onChangeText={(t) => setForm({ ...form, taluk: t })}
                />
              </View>
            </View>

            {/* District & State in 2 columns */}
            <View className="flex-row space-x-3 mb-3">
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mr-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  District
                </Text>
                <TextInput
                  className="text-sm font-brandon-bold text-slate-900 p-0 m-0"
                  value={form.district}
                  onChangeText={(t) => setForm({ ...form, district: t })}
                />
              </View>

              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm ml-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  State
                </Text>
                <TextInput
                  className="text-sm font-brandon-bold text-slate-900 p-0 m-0"
                  value={form.state}
                  onChangeText={(t) => setForm({ ...form, state: t })}
                />
              </View>
            </View>

            {/* Pincode */}
            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-6">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Pincode
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                value={form.pincode}
                onChangeText={(t) => setForm({ ...form, pincode: t })}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          </View>

          {/* Primary Action Button: Next (Green) */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            className="w-full bg-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-900/20 flex-row"
          >
            <Text className="text-white font-brandon-bold text-base tracking-wide">
              Next
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
