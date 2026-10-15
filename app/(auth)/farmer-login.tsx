import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  TextInput,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight
} from "lucide-react-native";
import { api } from "../../services/api";

export default function FarmerLoginScreen() {
  const [mobile, setMobile] = useState("9876543210");
  const [password, setPassword] = useState("Farmer@1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!mobile.trim()) {
      setError("Please enter your mobile number");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // DUMMY LOGIN BYPASS
      if (mobile === "9876543210" || password === "123456" || password === "Farmer@1234") {
        await AsyncStorage.setItem("token", "dummy-farmer-token-123");
        await AsyncStorage.setItem("userName", "Farmer Dummy");
        await AsyncStorage.setItem("userRole", "farmer");
        await AsyncStorage.setItem("userPhone", mobile);

        router.replace("/(farmer)/dashboard");
        return;
      }

      const res = await api.post("/auth/login", { phone: mobile, password });
      if (res.status === "success" && res.token) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("userName", res.user?.name || "Farmer");
        await AsyncStorage.setItem("userRole", "farmer");
        await AsyncStorage.setItem("userPhone", res.user?.phone || mobile);

        router.replace("/(farmer)/dashboard");
      }
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* FULL-SCREEN IMMERSIVE BACKGROUND */}
      <ImageBackground 
        source={require("../../assets/images/image14.jpg")} // Slightly different image for farmer
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.8)", "rgba(234,88,12,0.5)", "rgba(0,0,0,0.9)"]} // Orange/Earth tint for farmers
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            
            {/* TOP BAR */}
            <View style={{ flexDirection: "row", paddingHorizontal: 24, paddingTop: 16 }}>
              <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 999, backdropFilter: "blur(10px)" }}>
                <ChevronLeft size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}>
              
              <View style={{ alignItems: "center", marginBottom: 40 }}>
                <View style={{ width: 160, height: 75, borderRadius: 20, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)", marginBottom: 24, paddingHorizontal: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                  <Image source={require("../../assets/images/logo.png")} style={{ width: 135, height: 55 }} resizeMode="contain" />
                </View>
                <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 36, textAlign: "center", letterSpacing: 1 }}>
                  Farmer Login
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Medium", fontSize: 16, marginTop: 8 }}>
                  Access your farm metrics and yield data
                </Text>
              </View>

              {/* GLASSMORPHISM FORM CARD */}
              <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 32, padding: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)", shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24 }}>
                
                {error ? (
                  <View style={{ backgroundColor: "rgba(239,68,68,0.2)", padding: 12, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: "rgba(239,68,68,0.4)" }}>
                    <Text style={{ color: "#fca5a5", fontFamily: "Brandon-Medium", fontSize: 14, textAlign: "center" }}>{error}</Text>
                  </View>
                ) : null}

                {/* Mobile Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>PHONE NUMBER</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Phone size={20} color="#ea580c" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#ffffff" }}
                      placeholder="Enter mobile number"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="phone-pad"
                      value={mobile}
                      onChangeText={setMobile}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={{ marginBottom: 32 }}>
                  <Text style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Brandon-Bold", fontSize: 12, letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>PASSWORD</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 16, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" }}>
                    <Lock size={20} color="#ea580c" />
                    <TextInput
                      style={{ flex: 1, marginLeft: 12, fontFamily: "Brandon-Bold", fontSize: 18, color: "#ffffff" }}
                      placeholder="Enter password"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                      {showPassword ? <EyeOff size={20} color="rgba(255,255,255,0.5)" /> : <Eye size={20} color="rgba(255,255,255,0.5)" />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity 
                  onPress={handleLogin}
                  disabled={loading}
                  style={{ backgroundColor: "#ea580c", borderRadius: 16, height: 60, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#ea580c", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={{ color: "#ffffff", fontFamily: "Brandon-Bold", fontSize: 18, marginRight: 8 }}>Sign In</Text>
                      <ArrowRight size={20} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>

              </View>
              
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
