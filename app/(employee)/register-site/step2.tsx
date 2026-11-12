import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Lock } from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";

export default function RegisterStep2Screen() {
  const { mobile = "9687846895" } = useLocalSearchParams<{ mobile?: string }>();
  const [otp, setOtp] = useState(["2", "3", "3", "4", "5", "6"]);
  const [countdown, setCountdown] = useState(26);
  const inputsRef = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const updated = [...otp];
    updated[index] = text;
    setOtp(updated);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const entered = otp.join("");
    if (entered.length < 6) {
      showToast({
        title: "Incomplete Code",
        message: "Please enter the 6-digit verification code.",
        type: "error",
      });
      return;
    }

    router.push({
      pathname: "/(employee)/register-site/step3",
      params: { mobile },
    } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header matching Image 2 Screen 2 */}
      <View className="px-5 pt-3 pb-2 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-white items-center justify-center border border-slate-200 shadow-sm mr-3"
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-brandon-bold text-slate-900">
          Verify Your Number
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150, paddingTop: 12 }}
      >
        {/* Instruction Subtitle */}
        <View className="items-center my-4 px-4">
          <Text className="text-slate-500 font-brandon text-xs text-center">
            Enter the 6-digit code sent to
          </Text>
          <Text className="text-slate-900 font-brandon-bold text-sm mt-0.5">
            +91 {mobile}
          </Text>
        </View>

        {/* 6 OTP Box Inputs matching Design */}
        <View className="flex-row justify-between mb-4 px-2">
          {otp.map((digit, idx) => (
            <View
              key={idx}
              className={`w-12 h-14 rounded-2xl bg-white border items-center justify-center shadow-sm ${
                digit ? "border-[#2f6f36] bg-emerald-50/20" : "border-slate-200"
              }`}
            >
              <TextInput
                ref={(ref) => {
                  inputsRef.current[idx] = ref;
                }}
                className="text-xl font-brandon-bold text-slate-900 text-center w-full h-full p-0"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(t) => handleOtpChange(t, idx)}
                onKeyPress={(e) => handleKeyPress(e, idx)}
              />
            </View>
          ))}
        </View>

        {/* Resend Timer */}
        <View className="items-center mb-8">
          <Text className="text-slate-500 font-brandon text-xs">
            Resend OTP in{" "}
            <Text className="text-emerald-700 font-brandon-bold">
              00:{countdown < 10 ? `0${countdown}` : countdown}
            </Text>
          </Text>
        </View>

        {/* Hero Visual: Phone with Padlock & Leaves */}
        <View className="items-center justify-center my-6">
          <View className="w-36 h-36 rounded-full bg-emerald-50/80 items-center justify-center border border-emerald-100 shadow-sm relative">
            <View className="w-20 h-28 bg-white rounded-2xl border-2 border-emerald-600 items-center justify-center shadow-md p-2">
              <View className="w-12 h-12 rounded-xl bg-emerald-600 items-center justify-center shadow-sm">
                <Lock size={24} color="#ffffff" />
              </View>
            </View>
          </View>
        </View>

        {/* Primary Action Button: Verify & Continue (Green) */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleVerify}
          className="w-full bg-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-900/20 flex-row mt-4"
        >
          <Text className="text-white font-brandon-bold text-base tracking-wide">
            Verify & Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
