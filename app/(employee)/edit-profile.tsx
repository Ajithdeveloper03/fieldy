import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, Camera, Save, Mail, Phone } from "lucide-react-native";
import { api, getAuthUser } from "../../services/api";
import { emitLiveSync } from "../../utils/liveSyncBus";
import { pickImageAsset, uploadProfilePhotoAsset } from "../../services/media";
import { useLanguage } from "../../context/LanguageContext";
import { useLiveRefresh } from "../../hooks/useLiveRefresh";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";
import { PageHeroBanner } from "../../components/PageHeroBanner";

export default function EditProfileScreen() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [displayName, setDisplayName] = useState("Field Officer");
  const [form, setForm] = useState({
    mobile: "",
    email: "",
  });

  const loadProfile = useCallback(async () => {
    const authUser = await getAuthUser();
    if (authUser?.name) setDisplayName(authUser.name);

    setForm((prev) => ({
      mobile: prev.mobile || authUser?.phone || "",
      email: prev.email || authUser?.email || "",
    }));
    try {
      const dash = await api.get("/employee/dashboard");
      const emp = dash?.data?.employee ?? dash?.employee;
      if (emp) {
        if (emp.name) setDisplayName(emp.name);
        setForm({
          mobile: emp.phone || "",
          email: emp.email || "",
        });
        const serverPhoto = emp.avatar_url || emp.photo_url || null;
        setAvatarLoadError(false);
        setAvatarUri(serverPhoto);
        if (serverPhoto) {
          await AsyncStorage.setItem("@user_avatar_uri", serverPhoto);
        } else {
          await AsyncStorage.removeItem("@user_avatar_uri");
        }
        return;
      }
    } catch {
      // Offline fallback uses stored values
    }
    const storedAvatar = await AsyncStorage.getItem("@user_avatar_uri");
    if (storedAvatar) setAvatarUri(storedAvatar);
    else if (authUser?.avatar_url) setAvatarUri(authUser.avatar_url);
  }, []);

  useLiveRefresh(loadProfile, 10000);

  const handleChangePhoto = () => {
    const runPick = async (source: "camera" | "library") => {
      try {
        const picked = await pickImageAsset(source);
        if (!picked) return;
        setAvatarLoadError(false);
        setAvatarUri(picked.uri);
        setUploadingPhoto(true);
        try {
          const uploaded = await uploadProfilePhotoAsset(picked);
          const finalUrl = uploaded.avatar_url || uploaded.photo_url || picked.uri;
          setAvatarLoadError(false);
          setAvatarUri(finalUrl);
          await AsyncStorage.setItem("@user_avatar_uri", finalUrl);
          const existing = await getAuthUser();
          if (existing) {
            const nextUser = { ...existing, avatar_url: finalUrl, photo_url: finalUrl };
            await AsyncStorage.setItem("@auth_user", JSON.stringify(nextUser));
          }
          emitLiveSync("profile");
          Alert.alert("Photo Updated", "Your profile image has been synced to Mobile & Web Admin.");
        } catch (err: any) {
          Alert.alert("Upload Failed", err?.message || "Could not upload profile photo to server. Check connection.");
        } finally {
          setUploadingPhoto(false);
        }
      } catch {
        Alert.alert("Permission Needed", "Please allow camera or photo library access to change your profile photo.");
      }
    };

    if (Platform.OS === "web") {
      void runPick("library");
      return;
    }

    Alert.alert("Update Profile Photo", "Choose an option", [
      { text: "Take Photo", onPress: () => void runPick("camera") },
      { text: "Choose from Gallery", onPress: () => void runPick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.post("/employee/profile", {
        phone: form.mobile.trim(),
        email: form.email.trim() || null,
        ...(avatarUri && avatarUri.startsWith("http") ? { photo_path: avatarUri } : {}),
      });
      const updated = res?.data?.user ?? res?.user;
      const existing = await getAuthUser();
      const mergedUser = {
        ...(existing || {}),
        ...(updated || {}),
        phone: updated?.phone || form.mobile.trim(),
        email: updated?.email ?? form.email.trim(),
        avatar_url: avatarUri || existing?.avatar_url,
      };
      await AsyncStorage.setItem("@auth_user", JSON.stringify(mergedUser));
      await AsyncStorage.setItem("@fieldy_user", JSON.stringify(mergedUser));
      emitLiveSync("profile");

      Alert.alert(
        "Profile Updated",
        "Your contact details have been synced with Web Admin.",
        [
          {
            text: "OK",
            onPress: () =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/profile"),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Update Failed", err?.message || "Could not sync profile changes right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <LiquidGlassBackdrop variant="light">
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 22,
              paddingTop: 16,
              paddingBottom: 24,
            }}
          >
            <LiquidGlassIconButton
              onPress={() =>
                router.canGoBack()
                  ? router.back()
                  : router.replace("/(employee)/profile")
              }
              variant="light"
              size={44}
            >
              <ChevronLeft size={26} color="#0f172a" />
            </LiquidGlassIconButton>
            <Text
              style={{
                color: "#0f172a",
                fontFamily: "Brandon-Bold",
                fontSize: 24,
              }}
            >
              {t("myCredentials", "My Credentials")}
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <PageHeroBanner
            badge="PROFILE SYNC"
            title={t("myCredentials", "My Credentials")}
            subtitle="Changes sync directly with Web Admin"
            colors={["#059669", "#0f766e"]}
            personIndex={3}
          />

          <ScrollView
            style={{ flex: 1, paddingHorizontal: 22 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 150 }}
          >
            {/* AVATAR */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 4,
                  borderColor: "rgba(255, 255, 255, 0.94)",
                  shadowColor: "#1A1D24",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.14,
                  shadowRadius: 16,
                  elevation: 6,
                }}
              >
                {avatarUri && !avatarLoadError ? (
                  <Image
                    source={{ uri: avatarUri }}
                    onError={() => setAvatarLoadError(true)}
                    style={{ width: "100%", height: "100%", borderRadius: 56 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 56,
                      backgroundColor: "#0f766e",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ffffff",
                        fontFamily: "Brandon-Bold",
                        fontSize: 36,
                      }}
                    >
                      {displayName
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase() || "FO"}
                    </Text>
                  </View>
                )}
                <LiquidGlassIconButton
                  onPress={handleChangePhoto}
                  variant="tinted"
                  tintColor="rgba(21, 128, 61, 0.84)"
                  dropletColor="#4ade80"
                  size={40}
                  style={{ position: "absolute", bottom: -4, right: -4 }}
                >
                  {uploadingPhoto ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Camera size={18} color="#ffffff" />
                  )}
                </LiquidGlassIconButton>
              </View>
            </View>

            {/* FORM */}
            <View style={{ gap: 20 }}>
              <View>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                    marginLeft: 4,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {t("mobileNumber", "Mobile Number")}
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 60 }}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                  }}
                >
                  <Phone size={22} color="#15803d" />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontFamily: "Brandon-Bold",
                      fontSize: 18,
                      color: "#0f172a",
                    }}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#94a3b8"
                    value={form.mobile}
                    onChangeText={(val) => setForm({ ...form, mobile: val })}
                    keyboardType="phone-pad"
                  />
                </LiquidGlassCard>
              </View>

              <View>
                <Text
                  style={{
                    color: "#64748b",
                    fontFamily: "Brandon-Bold",
                    fontSize: 13,
                    marginLeft: 4,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {t("emailAddress", "Email Address")}
                </Text>
                <LiquidGlassCard
                  variant="light"
                  borderRadius={18}
                  style={{ height: 60 }}
                  contentStyle={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 18,
                  }}
                >
                  <Mail size={22} color="#15803d" />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontFamily: "Brandon-Bold",
                      fontSize: 18,
                      color: "#0f172a",
                    }}
                    placeholder="Enter email address"
                    placeholderTextColor="#94a3b8"
                    value={form.email}
                    onChangeText={(val) => setForm({ ...form, email: val })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </LiquidGlassCard>
              </View>
            </View>

            {/* SAVE BUTTON */}
            <LiquidGlassButton
              onPress={handleSave}
              disabled={saving}
              variant="tinted"
              tintColor="rgba(21, 128, 61, 0.84)"
              dropletColor="#4ade80"
              style={{ marginTop: 36 }}
              contentStyle={{ paddingVertical: 18 }}
            >
              {saving ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Save size={22} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 18,
                    }}
                  >
                    {t("saveChanges", "Save Changes")}
                  </Text>
                </>
              )}
            </LiquidGlassButton>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
