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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
} from "lucide-react-native";
import { api, resolveApiBaseUrl, setAuthSession } from "../../services/api";
import { useService, ServiceSelectorPill, ALL_SERVICE_KEYS } from "../../context/ServiceContext";
import { SERVICES_CONFIG } from "../../constants/servicesConfig";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
  SafeBlurView,
} from "../../components/LiquidGlass";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const role = (params?.role as string) || "employee";
  const { serviceConfig, setService } = useService();

  const config = serviceConfig || SERVICES_CONFIG.facility_fmcg;
  const accentColor = config.accentColor || "#34d399";
  const vocab = config.vocab || SERVICES_CONFIG.facility_fmcg.vocab;

  const [mobile, setMobile] = useState("8428060946");
  const [password, setPassword] = useState("Employee@1234");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    const trimmed = mobile.trim();
    if (!trimmed) {
      setError("Please enter your phone number or email");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        identifier: trimmed,
        phone: trimmed,
        password,
      });
      if (res?.status === "success" && res?.token) {
        await setAuthSession(res.token, res.user);
        await AsyncStorage.setItem("userName", res.user?.name || "Field Executive");
        await AsyncStorage.setItem("userRole", res.user?.role || "employee");
        await AsyncStorage.setItem("userPhone", res.user?.phone || trimmed);
        if (res.user?.industry && ALL_SERVICE_KEYS.includes(res.user.industry)) {
          await setService(res.user.industry);
        }
        router.replace("/(employee)/dashboard");
      } else {
        setError(res?.message || "Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      const msg = err?.message || "";
      const lower = msg.toLowerCase();
      const isNetworkFailure =
        err instanceof TypeError ||
        lower.includes("network") ||
        lower.includes("failed to fetch") ||
        lower.includes("fetch failed") ||
        lower.includes("connectexception");
      if (isNetworkFailure) {
        setError(
          `Cannot reach backend (${resolveApiBaseUrl()}). Start Laravel with: php artisan serve --host=0.0.0.0 --port=8000`
        );
      } else {
        setError(msg || "Unable to sign in. Check server connection and credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidGlassBackdrop variant="dark">
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
            <LiquidGlassIconButton
              onPress={() => router.back()}
              size={42}
              variant="dark"
            >
              <ChevronLeft size={22} color="#ffffff" />
            </LiquidGlassIconButton>
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
              <LiquidGlassCard
                variant="light"
                borderRadius={24}
                dropletColor={accentColor}
                style={{ width: 176, height: 86, marginBottom: 20 }}
                contentStyle={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: 144, height: 58 }}
                  resizeMode="contain"
                />
              </LiquidGlassCard>

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
                  color: "rgba(255,255,255,0.72)",
                  fontFamily: "Brandon-Medium",
                  fontSize: 14,
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                Enter your phone or email and password
              </Text>
            </View>

            {/* Frosted Apple Liquid Glass Form Card */}
            <LiquidGlassCard
              variant="dark"
              borderRadius={30}
              intensity={76}
              dropletColor={accentColor}
              contentStyle={{ padding: 22 }}
            >
              {error ? (
                <View
                  style={{
                    backgroundColor: "rgba(239,68,68,0.22)",
                    padding: 12,
                    borderRadius: 14,
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "rgba(248,113,113,0.45)",
                  }}
                >
                  <Text
                    style={{
                      color: "#fecaca",
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
                    color: "rgba(255,255,255,0.76)",
                    fontFamily: "Brandon-Bold",
                    fontSize: 11,
                    letterSpacing: 1,
                    marginBottom: 6,
                    marginLeft: 4,
                    textTransform: "uppercase",
                  }}
                >
                  Phone or Username / Email
                </Text>
                <View
                  style={{
                    borderRadius: 16,
                    height: 54,
                    overflow: "hidden",
                    borderWidth: 1.4,
                    borderColor: "rgba(255,255,255,0.22)",
                  }}
                >
                  <SafeBlurView
                    intensity={46}
                    tint="dark"
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      paddingHorizontal: 16,
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
                      placeholder="Phone number or email"
                      placeholderTextColor="rgba(255,255,255,0.38)"
                      keyboardType="default"
                      autoCapitalize="none"
                      value={mobile}
                      onChangeText={setMobile}
                    />
                  </SafeBlurView>
                </View>
              </View>

              {/* Password Input */}
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.76)",
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
                    borderRadius: 16,
                    height: 54,
                    overflow: "hidden",
                    borderWidth: 1.4,
                    borderColor: "rgba(255,255,255,0.22)",
                  }}
                >
                  <SafeBlurView
                    intensity={46}
                    tint="dark"
                    style={{
                      flex: 1,
                      borderRadius: 16,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(255,255,255,0.08)",
                      paddingHorizontal: 16,
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
                      placeholderTextColor="rgba(255,255,255,0.38)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ padding: 6 }}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color="rgba(255,255,255,0.65)" />
                      ) : (
                        <Eye size={18} color="rgba(255,255,255,0.65)" />
                      )}
                    </TouchableOpacity>
                  </SafeBlurView>
                </View>
              </View>

              {/* Apple Liquid Glass Login CTA */}
              <LiquidGlassButton
                onPress={handleLogin}
                disabled={loading}
                variant="tinted"
                tintColor="rgba(13, 148, 136, 0.74)"
                dropletColor={accentColor}
                style={{ width: "100%" }}
                contentStyle={{ height: 54, paddingVertical: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
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
                  </View>
                )}
              </LiquidGlassButton>
            </LiquidGlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </LiquidGlassBackdrop>
  );
}
