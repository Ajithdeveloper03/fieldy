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
import { useService } from "../../../context/ServiceContext";

export default function RegisterStep3Screen() {
  const { serviceConfig } = useService();
  const params = useLocalSearchParams<{ mobile?: string; category?: string; projects?: string }>();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: params.mobile || "",
    village: "",
    taluk: "",
    district: "",
    state: "Tamil Nadu",
    pincode: "",
  });

  const handleNext = () => {
    if (!form.fullName.trim() || !form.mobile.trim()) {
      showToast({
        title: "Missing Details",
        message: `Please enter the ${serviceConfig.vocab.customerRole.toLowerCase()}'s full name and mobile number.`,
        type: "error",
      });
      return;
    }

    router.push({
      pathname: "/(employee)/register-site/step4",
      params: { ...form, category: params.category, projects: params.projects },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header */}
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
            {serviceConfig.label} Onboarding
          </Text>
          <Text className="text-slate-500 font-brandon text-xs">
            Step 2 of 4 • {serviceConfig.vocab.customerRole} & Location
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
            <View style={{ backgroundColor: serviceConfig.color }} className="w-7 h-7 rounded-full items-center justify-center shadow-sm">
              <Text className="text-white font-brandon-bold text-xs">✓</Text>
            </View>
            <View style={{ backgroundColor: serviceConfig.color }} className="flex-1 h-0.5 mx-2" />
            <View style={{ backgroundColor: serviceConfig.color }} className="w-8 h-8 rounded-full items-center justify-center shadow-sm">
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
            {serviceConfig.vocab.customerRole} & Location Details
          </Text>

          {/* Form Fields matching Design */}
          <View className="space-y-4">
            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                {serviceConfig.vocab.customerRole} Full Name *
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                placeholder="Ramesh Kumar"
                placeholderTextColor="#94a3b8"
                value={form.fullName}
                onChangeText={(t) => setForm({ ...form, fullName: t })}
              />
            </View>

            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Email Address
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                placeholder="ramesh@company.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
              />
            </View>

            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Mobile Number *
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                placeholder="9876543210"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
                value={form.mobile}
                onChangeText={(t) => setForm({ ...form, mobile: t })}
                maxLength={10}
              />
            </View>

            <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Locality / Area
              </Text>
              <TextInput
                className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                placeholder="Sector 4 / Industrial Area"
                placeholderTextColor="#94a3b8"
                value={form.village}
                onChangeText={(t) => setForm({ ...form, village: t })}
              />
            </View>

            <View className="flex-row space-x-3 mb-3">
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mr-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  Zone / Ward
                </Text>
                <TextInput
                  className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                  placeholder="Zone 2"
                  placeholderTextColor="#94a3b8"
                  value={form.taluk}
                  onChangeText={(t) => setForm({ ...form, taluk: t })}
                />
              </View>
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  City / District
                </Text>
                <TextInput
                  className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                  placeholder="Coimbatore"
                  placeholderTextColor="#94a3b8"
                  value={form.district}
                  onChangeText={(t) => setForm({ ...form, district: t })}
                />
              </View>
            </View>

            <View className="flex-row space-x-3 mb-6">
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mr-2">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  State
                </Text>
                <TextInput
                  className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                  value={form.state}
                  onChangeText={(t) => setForm({ ...form, state: t })}
                />
              </View>
              <View className="flex-1 bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm">
                <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                  Pincode
                </Text>
                <TextInput
                  className="text-base font-brandon-bold text-slate-900 p-0 m-0"
                  placeholder="641045"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={form.pincode}
                  onChangeText={(t) => setForm({ ...form, pincode: t })}
                  maxLength={6}
                />
              </View>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={{ backgroundColor: serviceConfig.color }}
            className="w-full py-4 rounded-2xl items-center justify-center shadow-md mt-2"
          >
            <Text className="text-white font-brandon-bold text-base tracking-wide">
              Proceed to Documents
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}