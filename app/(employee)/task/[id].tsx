import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, TextInput, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { 
  ChevronLeft, CheckCircle2, Clock, MapPin, AlertCircle, 
  Upload, Camera, Sparkles, ShieldCheck, KeyRound, Award, Check
} from "lucide-react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const [otpValue, setOtpValue] = useState("4821");
  const [otpVerified, setOtpVerified] = useState(false);
  const [safetyChecklist, setSafetyChecklist] = useState([
    { id: 1, text: "Wear high-visibility reflective vest & safety boots", checked: true },
    { id: 2, text: "Verify electrical power isolated & lock-out tag placed", checked: true },
    { id: 3, text: "Check area ventilation and clear obstacles", checked: false },
  ]);
  const [beforePhotoTaken, setBeforePhotoTaken] = useState(true);
  const [afterPhotoTaken, setAfterPhotoTaken] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Mock task data for multi-industry field workforce
  const task = {
    id: id || "WO-0891",
    workOrderCode: `WO-${String(id || '10482')}`,
    industry: "Facility Management",
    title: "Air Handling Unit (AHU-4) Preventive Maintenance & Valve Service",
    facility: "Metro City Centre • Block B Floor 3",
    status: completed ? "Completed" : "In Progress",
    priority: "High Priority",
    due: "Today at 4:30 PM",
    points: 40,
    aiSuggestions: "AI Diagnostic: Clean condenser coils, replace MERV-13 air filter, verify actuator 0-10V signal response, and inspect primary drain pan for standing water.",
    description: "Conduct comprehensive scheduled maintenance on AHU-4. Inspect chilled water inlet/outlet temperatures, record refrigerant pressures, check belt tension, and ensure emergency trip triggers work properly.",
  };

  const toggleSafetyItem = (itemId: number) => {
    setSafetyChecklist(prev => 
      prev.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
    );
  };

  const handleVerifyOtp = () => {
    if (otpValue === "4821") {
      setOtpVerified(true);
    }
  };

  const handleMarkCompleted = () => {
    setCompleted(true);
    setTimeout(() => {
      router.push("/(employee)/visit/success" as any);
    }, 600);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9", backgroundColor: "#ffffff" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, backgroundColor: "#f8fafc", borderRadius: 999, borderWidth: 1, borderColor: "#e2e8f0" }}>
            <ChevronLeft size={22} color="#0f172a" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18 }}>Work Order Details</Text>
            <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 11, letterSpacing: 1 }}>{task.workOrderCode}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
          
          {/* TITLE & FACILITY CARD */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#fee2e2" }}>
                <Text style={{ color: "#ef4444", fontFamily: "Brandon-Bold", fontSize: 11 }}>{task.priority}</Text>
              </View>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#e0f2fe" }}>
                <Text style={{ color: "#0284c7", fontFamily: "Brandon-Bold", fontSize: 11 }}>{task.industry}</Text>
              </View>
              <View style={{ flex: 1 }} />
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Clock size={14} color="#64748b" />
                <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginLeft: 4 }}>{task.due}</Text>
              </View>
            </View>

            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 8, lineHeight: 26 }}>{task.title}</Text>
            
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={15} color="#0284c7" />
              <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14, marginLeft: 6 }}>{task.facility}</Text>
            </View>

            {/* Performance Reward Badge */}
            <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Award size={18} color="#16a34a" style={{ marginRight: 6 }} />
                <Text style={{ color: "#16a34a", fontFamily: "Brandon-Bold", fontSize: 13 }}>+{task.points} Performance Points</Text>
              </View>
              <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12 }}>On Verified Completion</Text>
            </View>
          </View>

          {/* AI ADVISORY BOX */}
          <View style={{ backgroundColor: "#fefce8", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#fef08a", marginBottom: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <Sparkles size={18} color="#ca8a04" style={{ marginRight: 6 }} />
              <Text style={{ color: "#854d0e", fontFamily: "Brandon-Bold", fontSize: 14 }}>Fieldy AI Diagnostics (Advisory)</Text>
            </View>
            <Text style={{ color: "#713f12", fontFamily: "Brandon-Medium", fontSize: 13, lineHeight: 20 }}>
              {task.aiSuggestions}
            </Text>
            <Text style={{ color: "#a16207", fontFamily: "Brandon-Medium", fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
              AI suggestions are advisory. A qualified technician must confirm safety-critical steps.
            </Text>
          </View>

          {/* MANDATORY SAFETY & PPE CHECKLIST */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
              <ShieldCheck size={20} color="#0284c7" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Mandatory Safety & PPE Checklist</Text>
            </View>
            <View style={{ gap: 10 }}>
              {safetyChecklist.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => toggleSafetyItem(item.id)}
                  style={{ flexDirection: "row", alignItems: "center", backgroundColor: item.checked ? "#f0fdf4" : "#f8fafc", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: item.checked ? "#bbf7d0" : "#e2e8f0" }}
                >
                  <View style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: item.checked ? "#16a34a" : "#ffffff", borderWidth: item.checked ? 0 : 2, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                    {item.checked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                  <Text style={{ flex: 1, color: item.checked ? "#166534" : "#475569", fontFamily: "Brandon-Bold", fontSize: 13 }}>{item.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* BEFORE & AFTER PHOTO EVIDENCE */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16, marginBottom: 14 }}>Before & After Work Evidence</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity 
                onPress={() => setBeforePhotoTaken(true)}
                style={{ flex: 1, backgroundColor: beforePhotoTaken ? "#f0fdf4" : "#f8fafc", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: beforePhotoTaken ? "#bbf7d0" : "#e2e8f0", borderStyle: beforePhotoTaken ? "solid" : "dashed" }}
              >
                <Camera size={26} color={beforePhotoTaken ? "#16a34a" : "#64748b"} style={{ marginBottom: 6 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12 }}>Before Work</Text>
                <Text style={{ color: beforePhotoTaken ? "#16a34a" : "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10, marginTop: 2 }}>{beforePhotoTaken ? "1 Photo Attached" : "Tap to capture"}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setAfterPhotoTaken(true)}
                style={{ flex: 1, backgroundColor: afterPhotoTaken ? "#f0fdf4" : "#f8fafc", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: afterPhotoTaken ? "#bbf7d0" : "#e2e8f0", borderStyle: afterPhotoTaken ? "solid" : "dashed" }}
              >
                <Camera size={26} color={afterPhotoTaken ? "#16a34a" : "#64748b"} style={{ marginBottom: 6 }} />
                <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 12 }}>After Work</Text>
                <Text style={{ color: afterPhotoTaken ? "#16a34a" : "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 10, marginTop: 2 }}>{afterPhotoTaken ? "1 Photo Attached" : "Tap to capture"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* CUSTOMER OTP VERIFICATION */}
          <View style={{ backgroundColor: "#ffffff", borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <KeyRound size={20} color="#ea580c" style={{ marginRight: 8 }} />
              <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 16 }}>Customer OTP Verification</Text>
            </View>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 12, marginBottom: 14 }}>
              Ask the client representative for the verification code (Testing Dummy Code: 4821)
            </Text>

            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <View style={{ flex: 1, backgroundColor: "#f8fafc", borderRadius: 14, borderWidth: 1, borderColor: otpVerified ? "#10b981" : "#e2e8f0", paddingHorizontal: 16, paddingVertical: 12 }}>
                <TextInput
                  value={otpValue}
                  onChangeText={setOtpValue}
                  placeholder="Enter 4-digit OTP"
                  keyboardType="numeric"
                  maxLength={4}
                  style={{ fontSize: 18, fontFamily: "Brandon-Bold", color: "#0f172a", letterSpacing: 4, textAlign: "center" }}
                />
              </View>
              <TouchableOpacity 
                onPress={handleVerifyOtp}
                style={{ backgroundColor: otpVerified ? "#16a34a" : "#0f172a", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 13 }}>
                  {otpVerified ? "Verified ✓" : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* COMPLETE / CLOSE WORK ORDER BUTTON */}
          <TouchableOpacity 
            onPress={handleMarkCompleted}
            style={{ width: "100%", backgroundColor: completed ? "#0f172a" : "#16a34a", borderRadius: 16, paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", shadowColor: "#16a34a", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }}
          >
            <CheckCircle2 size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>
              {completed ? "Work Order Completed" : "Submit & Complete Work Order"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
