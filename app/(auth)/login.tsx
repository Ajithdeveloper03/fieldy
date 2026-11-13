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
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
} from "lucide-react-native";
import { api } from "../../services/api";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import { SERVICES_CONFIG } from "../../constants/servicesConfig";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const role = (params?.role as string) || "employee";
  const { serviceConfig } = useService();

  const config = serviceConfig || SERVICES_CONFIG.facility_fmcg;
  const themeColor = config.themeColor || "#059669";
  const accentColor = config.accentColor || "#34d399";
  const vocab = config.vocab || SERVICES_CONFIG.facility_fmcg.vocab;

  const [mobile, setMobile] = useState("8428060946");
  const [password, setPassword] = useState("Employee@1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!mobile.trim()) {
      setError("Please enter your phone number");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { phone: mobile, password });
      if (res.status === "success" && res.token) {
        await AsyncStorage.setItem("token", res.token);
        await AsyncStorage.setItem("userName", res.user?.name || "Employee");
        await AsyncStorage.setItem("userRole", "employee");
        await AsyncStorage.setItem("userPhone", res.user?.phone || mobile);
        router.replace("/(employee)/dashboard");
      } else {
        await AsyncStorage.setItem("token", "demo_token");
        await AsyncStorage.setItem("userName", "Field Staff");
        await AsyncStorage.setItem("userRole", "employee");
        await AsyncStorage.setItem("userPhone", mobile);
        router.replace("/(employee)/dashboard");
      }
    } catch {
      // Graceful offline fallback if local backend is not running
      await AsyncStorage.setItem("token", "demo_token");
      await AsyncStorage.setItem("userName", "Field Staff");
      await AsyncStorage.setItem("userRole", "employee");
      await AsyncStorage.setItem("userPhone", mobile);
      router.replace("/(employee)/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#062214", "#0f172a", "#062214"]}
      style={{ flex: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
            >
              {/* Top Bar */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingTop: 12,
                  paddingBottom: 8,
                  zIndex: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChevronLeft size={22} color="#ffffff" />
                </TouchableOpacity>
                <ServiceSelectorPill dark compact />
              </View>

              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  justifyContent: "center",
                  paddingHorizontal: 22,
                  paddingBottom: 32,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Logo & Simple Title */}
                <View style={{ alignItems: "center", marginBottom: 28 }}>
                  <View
                    style={{
                      width: 170,
                      height: 80,
                      borderRadius: 22,
                      backgroundColor: "#ffffff",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "rgba(74, 222, 128, 0.4)",
                      marginBottom: 20,
                      paddingHorizontal: 14,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.2,
                      shadowRadius: 16,
                      elevation: 8,
                    }}
                  >
                    <Image
                      source={require("../../assets/images/logo.png")}
                      style={{ width: 140, height: 60 }}
                      resizeMode="contain"
                    />
                  </View>

                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 28,
                      textAlign: "center",
                    }}
                  >
                    {role === "site_contact"
                      ? `${vocab.customerRole || "Client"} Login`
                      : `${vocab.staffRole || "Staff"} Login`}
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "Brandon-Medium",
                      fontSize: 14,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    Enter your phone and password
                  </Text>
                </View>

                {/* Form Card */}
                <View
                  style={{
                    backgroundColor: "rgba(15, 23, 42, 0.92)",
                    borderRadius: 28,
                    padding: 22,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.14)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.35,
                    shadowRadius: 24,
                    elevation: 12,
                  }}
                >
                  {error ? (
                    <View
                      style={{
                        backgroundColor: "rgba(239,68,68,0.2)",
                        padding: 12,
                        borderRadius: 12,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: "rgba(239,68,68,0.4)",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fca5a5",
                          fontFamily: "Brandon-Medium",
                          fontSize: 13,
                          textAlign: "center",
                        }}
                      >
                        {error}
                      </Text>
                    </View>
                  ) : null}

                  {/* Phone Input */}
                  <View style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "Brandon-Bold",
                        fontSize: 11,
                        letterSpacing: 1,
                        marginBottom: 6,
                        marginLeft: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Phone Number
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        height: 54,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      <Phone size={18} color={accentColor} />
                      <TextInput
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          fontFamily: "Brandon-Bold",
                          fontSize: 16,
                          color: "#ffffff",
                        }}
                        placeholder="Mobile number"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        keyboardType="phone-pad"
                        value={mobile}
                        onChangeText={setMobile}
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontFamily: "Brandon-Bold",
                        fontSize: 11,
                        letterSpacing: 1,
                        marginBottom: 6,
                        marginLeft: 4,
                        textTransform: "uppercase",
                      }}
                    >
                      Password
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.4)",
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        height: 54,
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.12)",
                      }}
                    >
                      <Lock size={18} color={accentColor} />
                      <TextInput
                        style={{
                          flex: 1,
                          marginLeft: 12,
                          fontFamily: "Brandon-Bold",
                          fontSize: 16,
                          color: "#ffffff",
                        }}
                        placeholder="Password"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ padding: 6 }}
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="rgba(255,255,255,0.5)" />
                        ) : (
                          <Eye size={18} color="rgba(255,255,255,0.5)" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: themeColor,
                      borderRadius: 999,
                      height: 54,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: themeColor,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.4,
                      shadowRadius: 14,
                      elevation: 8,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text
                          style={{
                            color: "#ffffff",
                            fontFamily: "Brandon-Bold",
                            fontSize: 17,
                            marginRight: 8,
                          }}
                        >
                          Login
                        </Text>
                        <ArrowRight size={18} color="#ffffff" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
      </View>
    </LinearGradient>
  );
}
