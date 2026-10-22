import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Plus,
  ChevronDown,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sprout,
  Users,
} from "lucide-react-native";
import { apiClient } from "../../../api/client";
import { showToast } from "../../../components/ui/ToastMessage";

export default function RegisterStep5Screen() {
  const params = useLocalSearchParams();
  const [totalLand, setTotalLand] = useState("5 Acres");
  const [landForVetiver, setLandForVetiver] = useState("3 Acres");
  const [surveyNumber, setSurveyNumber] = useState("123/4A");
  const [location, setLocation] = useState("North Street, Coimbatore");

  const [seedsBags, setSeedsBags] = useState("5 Acres");
  const [plannedInvestment, setPlannedInvestment] = useState("3 Acres");
  const [irrigationType, setIrrigationType] = useState("Drip Irrigation");
  const [soilType, setSoilType] = useState("Red Loam");
  const [plantationDate, setPlantationDate] = useState("15 August 2026");

  const [submitting, setSubmitting] = useState(false);
  const [registeredFarmerId, setRegisteredFarmerId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await apiClient.post("/employee/farmer/register", {
        name: params.fullName || "Ramesh Kumar",
        phone: params.mobile || "9687846895",
        email: params.email || "rameshkumar@gmail.com",
        village: params.village || "Thottipalayam",
        taluk: params.taluk || "Coimbatore",
        district: params.district || "Coimbatore",
        state: params.state || "Tamilnadu",
        pincode: params.pincode || "641045",
        land_acres: totalLand.replace(/[^0-9.]/g, "") || "5",
        survey_no: surveyNumber,
      });

      setRegisteredFarmerId(response.farmer?.farmer_id || `FM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      showToast({
        title: "Registration Error",
        message: "Failed to register farmer. Please try again.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fbfdfa" }}>
      {/* Header matching Image 2 Screen 5 */}
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
            Step 4 of 4 • Facility & Service Scope
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
          <View className="w-7 h-7 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">✓</Text>
          </View>
          <View className="flex-1 h-0.5 bg-[#0284c7] mx-2" />
          <View className="w-8 h-8 rounded-full bg-[#0284c7] items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">4</Text>
          </View>
        </View>

        {/* SECTION 1: Facility & Site Details */}
        <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-3">
          Facility & Site Details
        </Text>

        <View className="space-y-3 mb-6">
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Facility / Campus Area (Sq. Ft / Acres)
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={totalLand}
              onChangeText={setTotalLand}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Covered / Serviceable Area
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={landForVetiver}
              onChangeText={setLandForVetiver}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Building / Unit Number
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={surveyNumber}
              onChangeText={setSurveyNumber}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Facility Location / Address
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Facility Photos Row */}
          <View className="mt-1 mb-2">
            <Text className="text-slate-500 font-brandon text-xs mb-2">
              Facility & Equipment Photos
            </Text>
            <View className="flex-row items-center">
              <View className="w-16 h-20 rounded-xl overflow-hidden border border-slate-200 mr-2.5">
                <Image
                  source={require("../../../assets/images/image1.jpg")}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="w-16 h-20 rounded-xl overflow-hidden border border-slate-200 mr-2.5">
                <Image
                  source={require("../../../assets/images/image2.jpg")}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                  showToast({
                    title: "Photo Added",
                    message: "Facility photo attached.",
                    type: "success",
                  })
                }
                className="w-16 h-20 rounded-xl bg-sky-50 border border-sky-300 border-dashed items-center justify-center"
              >
                <Plus size={22} color="#0284c7" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 2: Service & Maintenance Scope */}
        <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-3">
          Service & Maintenance Scope
        </Text>

        <View className="space-y-3 mb-8">
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Consumables & Spares Budget
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={seedsBags}
              onChangeText={setSeedsBags}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Annual Contract Value (₹)
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={plannedInvestment}
              onChangeText={setPlannedInvestment}
            />
          </View>

          {/* Service Level Agreement */}
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                SLA Tier
              </Text>
              <Text className="text-base font-brandon-bold text-slate-900">
                Premium 24x7 SLA
              </Text>
            </View>
            <ChevronDown size={18} color="#64748b" />
          </View>

          {/* Primary Facility Type */}
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Facility Category
              </Text>
              <Text className="text-base font-brandon-bold text-slate-900">
                Commercial Office / Tech Park
              </Text>
            </View>
            <ChevronDown size={18} color="#64748b" />
          </View>

          {/* Contract Commencement Date */}
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
                Contract Start Date
              </Text>
              <Text className="text-base font-brandon-bold text-slate-900">
                {plantationDate}
              </Text>
            </View>
            <Calendar size={18} color="#64748b" />
          </View>
        </View>

        {/* Dual Action Buttons matching Design: [Back] and [Next] */}
        <View className="flex-row space-x-3 mb-6">
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
            onPress={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-900/20 ml-2 flex-row"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-brandon-bold text-base tracking-wide">
                Next
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal Confirmation */}
      {registeredFarmerId && (
        <Modal transparent animationType="fade" visible={true}>
          <View className="flex-1 bg-black/60 items-center justify-center px-6">
            <View className="bg-white rounded-[32px] p-6 w-full items-center shadow-2xl border border-emerald-100">
              <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4 border border-emerald-200">
                <CheckCircle2 size={42} color="#059669" />
              </View>

              <Text className="text-slate-900 font-brandon-bold text-2xl text-center mb-1">
                Registration Complete!
              </Text>

              <View className="bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-200 my-2">
                <Text className="text-sky-800 font-brandon-bold text-xs uppercase tracking-wider">
                  Facility ID: {registeredFarmerId}
                </Text>
              </View>

              <Text className="text-slate-600 font-brandon text-center text-sm leading-relaxed my-3">
                {params.fullName || "Facility Client"} has been successfully onboarded into Fieldy Facility Services under the selected service agreement.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setRegisteredFarmerId(null);
                  router.replace("/(employee)/my-farmers" as any);
                }}
                className="w-full bg-[#2f6f36] py-4 rounded-2xl items-center justify-center shadow-md shadow-emerald-900/20 mt-2"
              >
                <Text className="text-white font-brandon-bold text-base">
                  View in Directory
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
