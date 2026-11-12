import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  Star,
  CheckCircle2,
  ThumbsUp
} from "lucide-react-native";

export default function RateOfficerScreen() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <StatusBar barStyle="light-content" />
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <ThumbsUp size={48} color="#ffffff" />
        </View>
        <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 32, textAlign: "center", marginBottom: 12 }}>Thank You!</Text>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Brandon-Medium", fontSize: 16, textAlign: "center", marginBottom: 40, lineHeight: 24 }}>
          Your feedback helps us maintain the highest standard of agronomy support.
        </Text>
        <TouchableOpacity onPress={() => router.replace("/(site-contact)/dashboard")} style={{ backgroundColor: "#ffffff", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 999 }}>
          <Text style={{ color: "#10b981", fontFamily: "Brandon-Bold", fontSize: 16 }}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingTop: 10, marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10, backgroundColor: "#ffffff", borderRadius: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 }}>
            <ChevronLeft size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
          
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 32, lineHeight: 38, marginBottom: 32 }}>
            Rate Your{"\n"}Last Visit
          </Text>

          <View style={{ backgroundColor: "#ffffff", borderRadius: 32, padding: 24, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 5, marginBottom: 32, borderWidth: 1, borderColor: "#f1f5f9" }}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=project&q=80" }} 
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }} 
            />
            <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 20, marginBottom: 4 }}>Robert Walker</Text>
            <Text style={{ color: "#64748b", fontFamily: "Brandon-Medium", fontSize: 14, marginBottom: 32 }}>Routine Inspection • Oct 2, 2026</Text>

            {/* STAR RATING */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star 
                    size={40} 
                    color={star <= rating ? "#f59e0b" : "#e2e8f0"} 
                    fill={star <= rating ? "#f59e0b" : "transparent"} 
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ color: "#94a3b8", fontFamily: "Brandon-Medium", fontSize: 13 }}>
              {rating === 0 ? "Tap a star to rate" : rating === 5 ? "Excellent service!" : rating > 2 ? "Good service" : "Needs improvement"}
            </Text>
          </View>

          {/* FEEDBACK NOTES */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>Additional Notes</Text>
          <View style={{ backgroundColor: "#ffffff", borderRadius: 24, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 32 }}>
            <TextInput
              style={{ fontFamily: "Brandon-Medium", fontSize: 16, color: "#0f172a", minHeight: 120, textAlignVertical: "top" }}
              placeholder="How did the officer help you today? Any suggestions?"
              placeholderTextColor="#94a3b8"
              multiline
              value={feedback}
              onChangeText={setFeedback}
            />
          </View>

          {/* TAGS */}
          <Text style={{ color: "#0f172a", fontFamily: "Brandon-Bold", fontSize: 18, marginBottom: 16 }}>What stood out?</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
            {["Punctual", "Very Knowledgeable", "Friendly", "Solved my issue"].map((tag, idx) => (
              <TouchableOpacity key={idx} style={{ backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: "#e2e8f0" }}>
                <Text style={{ color: "#475569", fontFamily: "Brandon-Medium", fontSize: 14 }}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            onPress={() => setSubmitted(true)}
            disabled={rating === 0}
            style={{ backgroundColor: rating === 0 ? "#cbd5e1" : "#10b981", borderRadius: 20, paddingVertical: 18, alignItems: "center", shadowColor: rating === 0 ? "transparent" : "#10b981", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 }}
          >
            <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 16 }}>Submit Rating</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
