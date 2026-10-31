import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  Share2,
  Download,
  Star,
  Sprout,
  Droplets,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react-native";
import { showToast } from "../../../components/ui/ToastMessage";

const reportsData: Record<string, any> = {
  "101": {
    id: "101",
    date: "Aug 12, 2026 • 10:30 AM",
    officer: "Harish",
    officerRole: "Certified Delta Agronomist",
    officerPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    status: "Optimal Growth",
    statusColor: "#34d399",
    statusBg: "bg-emerald-500/20",
    farm: "Kuppusamy Organic Estate",
    block: "Block A • Vetiver Plantation",
    cropCondition: "Excellent Rhizosphere Vigor",
    rootLength: "45 cm (Deep Root Formation)",
    soilMoisture: "38% Optimal",
    soilPh: "6.8 (Neutral Alkaline Balance)",
    recommendation:
      "Rhizosphere development is in prime condition. Continue standard drip cycle of 45 mins every morning. Bio-tonic applied successfully. Prepare for sector 2 mulch layer next week.",
    fertilizerDosing: "50kg Bio-Compost + 5L Neem Cake extract",
    photos: [
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=300&auto=format&fit=crop&q=80",
    ],
  },
  "102": {
    id: "102",
    date: "Jul 28, 2026 • 11:15 AM",
    officer: "Hemath",
    officerRole: "Senior Agronomy Inspector",
    officerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    status: "Action Suggested",
    statusColor: "#fbbf24",
    statusBg: "bg-amber-500/20",
    farm: "Kuppusamy Organic Estate",
    block: "Block B • Vetiver Field",
    cropCondition: "Moderate Weed Density",
    rootLength: "32 cm (Healthy Growth)",
    soilMoisture: "32% Normal",
    soilPh: "6.6 (Optimal)",
    recommendation:
      "Minor broadleaf weed density observed along the southern boundary ridge. Recommended organic manual inter-row weeding before next drip cycle to avoid nitrogen competition.",
    fertilizerDosing: "Organic Panchagavya spray (3% concentration)",
    photos: [
      "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=300&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=300&auto=format&fit=crop&q=80",
    ],
  },
};

export default function FarmerReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = reportsData[id as string] || reportsData["101"];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Infinity Organics Agronomy Audit #${report.id}\nFarm: ${report.farm}\nInspector: ${report.officer}\nCondition: ${report.cropCondition}\npH: ${report.soilPh}\nStatus: ${report.status}`,
      });
    } catch (e) {
      console.log("Share error", e);
    }
  };

  const handleDownload = () => {
    showToast({
      title: "PDF Dossier Downloaded",
      message: `Agronomy Audit Certificate #${report.id} saved to device.`,
      type: "success",
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Background image subtle overlay */}
      <Image
        source={require("../../../assets/images/image4.jpg")}
        style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%", opacity: 0.1 }]}
        resizeMode="cover"
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* Header - Transparent */}
        <View
          style={{ backgroundColor: "transparent" }}
          className="px-5 pt-2 pb-3 flex-row items-center justify-between z-10"
        >
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/95 items-center justify-center border border-slate-200 shadow-sm"
            activeOpacity={0.7}
          >
            <ChevronLeft size={22} color="#0f172a" />
          </TouchableOpacity>

          <Text className="text-slate-900 text-lg font-brandon-bold">
            Audit Dossier #{report.id}
          </Text>

          <TouchableOpacity
            onPress={handleShare}
            className="w-10 h-10 rounded-full bg-white/95 items-center justify-center border border-slate-200 shadow-sm"
            activeOpacity={0.7}
          >
            <Share2 size={18} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 6 }}
        >
          {/* Top Hero Banner */}
          <View className="px-5 mb-5">
            <View className="rounded-3xl overflow-hidden shadow-sm border border-emerald-800/20 bg-slate-900">
              <View className="w-full h-44">
                <Image
                  source={require("../../../assets/images/image6.jpg")}
                  style={[StyleSheet.absoluteFillObject, { width: "100%", height: "100%" }]}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(6,44,30,0.92)"]}
                  style={StyleSheet.absoluteFill}
                />
                <View className="absolute bottom-4 left-5 right-5 flex-row justify-between items-end">
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center mb-1">
                      <Sprout size={15} color="#86efac" className="mr-1.5" />
                      <Text className="text-emerald-300 font-brandon-bold text-xs uppercase tracking-widest">
                        {report.block}
                      </Text>
                    </View>
                    <Text className="text-white font-brandon-bold text-xl drop-shadow-sm">
                      {report.cropCondition}
                    </Text>
                  </View>
                  <View
                    className={`px-3 py-1 rounded-full border flex-row items-center ${report.statusBg}`}
                    style={{ borderColor: `${report.statusColor}60` }}
                  >
                    <CheckCircle2 size={12} color={report.statusColor} className="mr-1" />
                    <Text
                      style={{ color: report.statusColor }}
                      className="text-[10px] font-brandon-bold uppercase tracking-wider"
                    >
                      {report.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Inspector Officer Card */}
          <View className="px-5 mb-4">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/40 mr-3 shadow-xs">
                  <Image
                    source={{ uri: report.officerPhoto }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-slate-900 font-brandon-bold text-base">
                      {report.officer}
                    </Text>
                    <BadgeCheck size={16} color="#10b981" className="ml-1" />
                  </View>
                  <Text className="text-emerald-800 font-brandon-medium text-xs">
                    {report.officerRole}
                  </Text>
                  <Text className="text-slate-400 font-brandon-medium text-[10px] mt-0.5">
                    Inspected: {report.date}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Soil & Agronomy Metric Tiles */}
          <View className="px-5 mb-4">
            <Text className="text-slate-900 font-brandon-bold text-base mb-3">
              Field Observations & Biomass
            </Text>
            <View className="flex-row gap-3 mb-3">
              <View className="flex-1 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-3.5 items-center">
                <Text className="text-emerald-950 font-brandon-bold text-lg">
                  {report.rootLength.split(" ")[0]} cm
                </Text>
                <Text className="text-emerald-800 text-[10px] uppercase font-brandon-bold tracking-widest mt-0.5">
                  Root Depth
                </Text>
              </View>

              <View className="flex-1 bg-sky-50/80 border border-sky-200/90 rounded-2xl p-3.5 items-center">
                <Text className="text-sky-950 font-brandon-bold text-lg">
                  {report.soilMoisture.split(" ")[0]}
                </Text>
                <Text className="text-sky-800 text-[10px] uppercase font-brandon-bold tracking-widest mt-0.5">
                  Soil Moisture
                </Text>
              </View>

              <View className="flex-1 bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 items-center">
                <Text className="text-amber-950 font-brandon-bold text-lg">
                  {report.soilPh.split(" ")[0]}
                </Text>
                <Text className="text-amber-800 text-[10px] uppercase font-brandon-bold tracking-widest mt-0.5">
                  Rhizosphere pH
                </Text>
              </View>
            </View>
          </View>

          {/* Scientific Agronomy Protocol Card */}
          <View className="px-5 mb-4">
            <View className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
              <Text className="text-emerald-800 font-brandon-bold text-xs uppercase tracking-wider mb-2">
                Prescribed Agronomy Protocol
              </Text>
              <Text className="text-slate-800 font-brandon-medium text-xs leading-relaxed mb-4">
                {report.recommendation}
              </Text>

              <View className="bg-emerald-50/80 rounded-xl p-3 border border-emerald-200/80">
                <Text className="text-emerald-950 font-brandon-bold text-xs mb-0.5">
                  Allocated Organic Inputs:
                </Text>
                <Text className="text-emerald-800 font-brandon-medium text-xs">
                  {report.fertilizerDosing}
                </Text>
              </View>
            </View>
          </View>

          {/* Inspection Photos Gallery */}
          <View className="px-5 mb-6">
            <Text className="text-slate-900 font-brandon-bold text-base mb-3">
              Inspection Photos ({report.photos.length})
            </Text>
            <View className="flex-row gap-3">
              {report.photos.map((uri: string, i: number) => (
                <View
                  key={i}
                  className="flex-1 h-28 rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100"
                >
                  <Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Action CTAs */}
          <View className="px-5 gap-3">
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDownload}
              className="rounded-2xl overflow-hidden shadow-sm"
            >
              <LinearGradient
                colors={["#15803d", "#047857"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" }}
              >
                <Download size={18} color="#fff" className="mr-2" />
                <Text className="text-white font-brandon-bold text-sm tracking-wide">
                  Download Official PDF Dossier
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push("/(farmer)/rate/v1" as any)}
              className="bg-white border border-slate-200 py-3.5 rounded-2xl items-center flex-row justify-center shadow-xs"
            >
              <Star size={17} color="#d97706" fill="#f59e0b" className="mr-2" />
              <Text className="text-slate-800 font-brandon-bold text-xs uppercase tracking-wider">
                Rate Field Officer Experience
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
