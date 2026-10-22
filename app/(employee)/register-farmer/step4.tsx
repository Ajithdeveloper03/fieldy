import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  FileCheck2,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";

export default function RegisterStep4Screen() {
  const params = useLocalSearchParams();
  const [aadharUploaded, setAadharUploaded] = useState(true);
  const [photoUploaded, setPhotoUploaded] = useState(true);

  const handleUploadAadhar = () => {
    setAadharUploaded(true);
    showToast({
      title: "Aadhar Document Attached",
      message: "Farmer Aadhar copy verified successfully.",
      type: "success",
    });
  };

  const handleUploadPhoto = () => {
    setPhotoUploaded(true);
    showToast({
      title: "Photograph Attached",
      message: "Farmer portrait attached successfully.",
      type: "success",
    });
  };

  const handleNext = () => {
    router.push({
      pathname: "/(employee)/register-farmer/step5",
      params: { ...params },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header matching Image 2 Screen 4 */}
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
            Step 3 of 4 • Compliance & Site Agreement
          </Text>
        </View>
      </View>

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
          <View className="w-7 h-7 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">✓</Text>
          </View>
          <View className="flex-1 h-0.5 bg-[#0284c7] mx-2" />
          <View className="w-8 h-8 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">3</Text>
          </View>
          <View className="flex-1 h-0.5 bg-slate-200 mx-2" />
          <View className="w-7 h-7 rounded-full bg-white border border-slate-300 items-center justify-center">
            <Text className="text-slate-400 font-brandon-bold text-xs">4</Text>
          </View>
        </View>

        {/* Section Heading */}
        <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-4">
          Compliance & Site Verification Documents
        </Text>

        {/* 1. Status Approval Card matching Design */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
              <FileCheck2 size={20} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-brandon-bold text-xs">
                Status Approval by
              </Text>
              <Text className="text-slate-500 font-brandon text-xs">
                Fieldy Facility Services
              </Text>
            </View>
          </View>

          <View className="bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex-row items-center">
            <Clock size={12} color="#d97706" />
            <Text className="text-amber-700 font-brandon-bold text-[11px] ml-1">
              Pending
            </Text>
          </View>
        </View>

        {/* 2. Aadhar Image Upload Card matching Design */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
              <FileCheck2 size={20} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-brandon-bold text-xs">
                Aadhar Image
              </Text>
              <Text className="text-slate-400 font-brandon text-[11px]">
                JPG, PNG (Max 2MB)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUploadAadhar}
            className={`px-4 py-1.5 rounded-xl border flex-row items-center ${
              aadharUploaded
                ? "bg-emerald-50 border-emerald-300"
                : "bg-white border-slate-300"
            }`}
          >
            {aadharUploaded ? (
              <>
                <CheckCircle2 size={13} color="#059669" />
                <Text className="text-emerald-700 font-brandon-bold text-xs ml-1">
                  Uploaded
                </Text>
              </>
            ) : (
              <>
                <Upload size={13} color="#64748b" />
                <Text className="text-slate-700 font-brandon-bold text-xs ml-1">
                  Upload
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 3. Farmer Photograph Upload Card matching Design */}
        <View className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center justify-between mb-6">
          <View className="flex-row items-center flex-1 pr-2">
            <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 border border-slate-200">
              <FileCheck2 size={20} color="#64748b" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-brandon-bold text-xs">
                Farmer Photograph
              </Text>
              <Text className="text-slate-400 font-brandon text-[11px]">
                JPG, PNG (Max 2MB)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleUploadPhoto}
            className={`px-4 py-1.5 rounded-xl border flex-row items-center ${
              photoUploaded
                ? "bg-emerald-50 border-emerald-300"
                : "bg-white border-slate-300"
            }`}
          >
            {photoUploaded ? (
              <>
                <CheckCircle2 size={13} color="#059669" />
                <Text className="text-emerald-700 font-brandon-bold text-xs ml-1">
                  Uploaded
                </Text>
              </>
            ) : (
              <>
                <Upload size={13} color="#64748b" />
                <Text className="text-slate-700 font-brandon-bold text-xs ml-1">
                  Upload
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Hero Illustration matching Design */}
        <View className="items-center justify-center my-6">
          <View className="w-36 h-36 rounded-full bg-emerald-50/80 items-center justify-center border border-emerald-100 shadow-sm relative">
            <Image
              source={require("../../../assets/images/shield_phone.png")}
              style={{ width: 95, height: 95 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Dual Action Buttons matching Design: [Back] and [Next] */}
        <View className="flex-row space-x-3 mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="flex-1 bg-white border border-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-sm mr-2"
          >
            <Text className="text-[#2f6f36] font-brandon-bold text-base tracking-wide">
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            className="flex-1 bg-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-900/20 ml-2"
          >
            <Text className="text-white font-brandon-bold text-base tracking-wide">
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
