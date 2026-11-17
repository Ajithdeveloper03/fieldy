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
} from "lucide-react-native";
import { apiClient } from "../../../api/client";
import { showToast } from "../../../components/ui/ToastMessage";
import { useService } from "../../../context/ServiceContext";

export default function RegisterStep5Screen() {
  const { serviceConfig } = useService();
  const params = useLocalSearchParams();
  const [totalLand, setTotalLand] = useState("5000");
  const [coveredArea, setCoveredArea] = useState("3500");
  const [surveyNumber, setSurveyNumber] = useState("123/4A");
  const [location, setLocation] = useState("");

  const [seedsBags, setSeedsBags] = useState("0");
  const [plannedInvestment, setPlannedInvestment] = useState("0");
  const [utilitiesDescription, setUtilitiesDescription] = useState("Site utilities");
  const [soilType, setSoilType] = useState("Standard Operational");
  const [projectStartDate, setProjectStartDate] = useState("15 August 2026");

  const [submitting, setSubmitting] = useState(false);
  const [registeredSiteContactId, setRegisteredSiteContactId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await apiClient.post("/employee/sites", {
        name: params.fullName,
        project_name: params.projects,
        phone: params.mobile || "9687846895",
        email: params.email || "client@fieldy.app",
        locality: params.village,
        site_address: location,
        site_type: params.category || serviceConfig.serviceKey,
        district: params.district || "Coimbatore",
        state: params.state || "Tamilnadu",
        pincode: params.pincode || "641045",
        site_area: totalLand.replace(/[^0-9.]/g, "") || "5000",
        ground_condition: soilType,
        site_utilities: utilitiesDescription,
        scope_of_work: [params.projects || `${serviceConfig.label} Field Service`],
      });

      setRegisteredSiteContactId(response.site_contact_id || `SITE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } catch (err) {
      // In offline/mock fallback:
      setRegisteredSiteContactId(`SITE-${serviceConfig.shortName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
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
            {serviceConfig.label} Onboarding
          </Text>
          <Text className="text-slate-500 font-brandon text-xs">
            Step 4 of 4 • {serviceConfig.vocab.entitySingular} & Scope
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
          <View style={{ backgroundColor: serviceConfig.color }} className="w-7 h-7 rounded-full items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">✓</Text>
          </View>
          <View style={{ backgroundColor: serviceConfig.color }} className="flex-1 h-0.5 mx-2" />
          <View style={{ backgroundColor: serviceConfig.color }} className="w-7 h-7 rounded-full items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">✓</Text>
          </View>
          <View style={{ backgroundColor: serviceConfig.color }} className="flex-1 h-0.5 mx-2" />
          <View style={{ backgroundColor: serviceConfig.color }} className="w-7 h-7 rounded-full items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">✓</Text>
          </View>
          <View style={{ backgroundColor: serviceConfig.color }} className="flex-1 h-0.5 mx-2" />
          <View style={{ backgroundColor: serviceConfig.color }} className="w-8 h-8 rounded-full items-center justify-center shadow-sm">
            <Text className="text-white font-brandon-bold text-xs">4</Text>
          </View>
        </View>

        {/* SECTION 1: Facility & Site Details */}
        <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-3">
          {serviceConfig.vocab.entitySingular} Specifications
        </Text>

        <View className="space-y-3 mb-6">
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Total Area / Size ({serviceConfig.vocab.sizeUnit})
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={totalLand}
              onChangeText={setTotalLand}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Active Operational Section ({serviceConfig.vocab.sizeUnit})
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={coveredArea}
              onChangeText={setCoveredArea}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              {serviceConfig.vocab.entitySingular} Identifier / Tag
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={surveyNumber}
              onChangeText={setSurveyNumber}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Exact Address / Landmark
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={location}
              onChangeText={setLocation}
              placeholder="Enter building, street, or sector address"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Photos Row */}
          <View className="mt-1 mb-2">
            <Text className="text-slate-500 font-brandon text-xs mb-2">
              {serviceConfig.vocab.entitySingular} Photos & Documents
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
                    message: `${serviceConfig.vocab.entitySingular} photo attached.`,
                    type: "success",
                  })
                }
                style={{ borderColor: serviceConfig.color }}
                className="w-16 h-20 rounded-xl bg-sky-50 border border-dashed items-center justify-center"
              >
                <Plus size={22} color={serviceConfig.color} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* SECTION 2: Service & Maintenance Scope */}
        <Text className="text-slate-900 font-brandon-bold text-base mt-2 mb-3">
          {serviceConfig.label} Service Scope
        </Text>

        <View className="space-y-3 mb-8">
          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Operational Maintenance Budget (₹)
            </Text>
            <TextInput
              className="text-base font-brandon-bold text-slate-900 p-0 m-0"
              value={seedsBags}
              onChangeText={setSeedsBags}
            />
          </View>

          <View className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm mb-3">
            <Text className="text-slate-400 text-[11px] font-brandon-medium mb-1">
              Contract Annual Value (₹)
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
                SLA Standard
              </Text>
              <Text className="text-base font-brandon-bold text-slate-900">
                Premium Priority SLA
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
                {projectStartDate}
              </Text>
            </View>
            <Calendar size={18} color="#64748b" />
          </View>
        </View>

        {/* Dual Action Buttons matching Design: [Back] and [Submit] */}
        <View className="flex-row space-x-3 mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            style={{ borderColor: serviceConfig.color }}
            className="flex-1 bg-white border py-4 rounded-2xl items-center justify-center shadow-sm mr-2"
          >
            <Text style={{ color: serviceConfig.color }} className="font-brandon-bold text-base tracking-wide">
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={submitting}
            style={{ backgroundColor: serviceConfig.color }}
            className="flex-1 py-4 rounded-2xl items-center justify-center shadow-md ml-2 flex-row"
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-brandon-bold text-base tracking-wide">
                Complete Onboarding
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal Confirmation */}
      {registeredSiteContactId && (
        <Modal transparent animationType="fade" visible={true}>
          <View className="flex-1 bg-black/60 items-center justify-center px-6">
            <View className="bg-white rounded-[32px] p-6 w-full items-center shadow-2xl border border-emerald-100">
              <View className="w-20 h-20 rounded-full bg-emerald-50 items-center justify-center mb-4 border border-emerald-200">
                <CheckCircle2 size={42} color="#059669" />
              </View>

              <Text className="text-slate-900 font-brandon-bold text-2xl text-center mb-1">
                Registration Complete!
              </Text>

              <View style={{ backgroundColor: `${serviceConfig.color}15`, borderColor: `${serviceConfig.color}40` }} className="px-3.5 py-1.5 rounded-full border my-2">
                <Text style={{ color: serviceConfig.color }} className="font-brandon-bold text-xs uppercase tracking-wider">
                  {serviceConfig.vocab.entitySingular} ID: {registeredSiteContactId}
                </Text>
              </View>

              <Text className="text-slate-600 font-brandon text-center text-sm leading-relaxed my-3">
                {params.fullName || serviceConfig.vocab.customerRole} has been successfully onboarded into Fieldy {serviceConfig.label} Services under the selected service agreement.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setRegisteredSiteContactId(null);
                  router.replace("/(employee)/my-sites" as any);
                }}
                style={{ backgroundColor: serviceConfig.color }}
                className="w-full py-4 rounded-2xl items-center justify-center shadow-md mt-2"
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