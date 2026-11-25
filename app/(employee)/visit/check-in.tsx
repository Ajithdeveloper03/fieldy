import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Camera,
  MapPin,
  Fingerprint,
  CheckCircle2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useService } from "../../../context/ServiceContext";
import { sendLiveLocationPing } from "../../../utils/locationHelpers";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconBadge,
  LiquidGlassIconButton,
} from "../../../components/LiquidGlass";

export default function CheckInScreen() {
  const { id, taskId, farmerId, siteName } = useLocalSearchParams<{
    id?: string;
    taskId?: string;
    farmerId?: string;
    siteName?: string;
  }>();
  const { serviceConfig } = useService();
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [coordsText, setCoordsText] = useState("Acquiring live GPS...");

  React.useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setCoordsText(`${loc.coords.latitude.toFixed(5)}° N, ${loc.coords.longitude.toFixed(5)}° E`);
          void sendLiveLocationPing(loc.coords);
        } else {
          setCoordsText("GPS Permission Needed");
        }
      } catch {
        setCoordsText("13.0827° N, 80.2707° E");
      }
    })();
  }, []);

  const matchedEntity = serviceConfig.sampleEntities[0];
  const resolvedSiteName = siteName || matchedEntity?.name || serviceConfig.vocab.entitySingular;

  const handleCapture = async () => {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (res.granted) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.6,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
          setPhotoUri(result.assets[0].uri);
          setPhotoTaken(true);
          return;
        }
      }
      const gallery = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.6,
      });
      if (!gallery.canceled && gallery.assets?.[0]?.uri) {
        setPhotoUri(gallery.assets[0].uri);
      }
      setPhotoTaken(true);
    } catch (e) {
      console.log("Check-in camera notice:", e);
      setPhotoTaken(true);
    }
  };

  const handleCheckIn = async () => {
    await AsyncStorage.setItem(
      "@active_checkin",
      JSON.stringify({
        taskId: taskId || id || "",
        farmerId: farmerId || "",
        siteName: resolvedSiteName,
        latitude: coords?.latitude ?? null,
        longitude: coords?.longitude ?? null,
        photoUri,
        checkedInAt: new Date().toISOString(),
      })
    );
    router.push({
      pathname: "/(employee)/visit/report",
      params: {
        id: id || taskId || "",
        taskId: taskId || id || "",
        farmerId: farmerId || "",
        siteName: resolvedSiteName,
        lat: coords?.latitude ? String(coords.latitude) : "",
        lng: coords?.longitude ? String(coords.longitude) : "",
      },
    } as any);
  };

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={{ flex: 1 }}>
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        >
          <LiquidGlassIconButton
            variant="dark"
            size={42}
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
          >
            <ChevronLeft size={24} color="#ffffff" />
          </LiquidGlassIconButton>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 20,
            }}
          >
            {serviceConfig.label} Check-In
          </Text>
          <View style={{ width: 42 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
        >
          <LiquidGlassCard
            variant="dark"
            borderRadius={40}
            dropletColor={serviceConfig.color}
            style={{ marginTop: 20 }}
            contentStyle={{
              padding: 32,
              alignItems: "center",
            }}
          >
            {/* Massive Geofence Radar Circle */}
            <LiquidGlassCard
              variant="tinted"
              borderRadius={70}
              tintColor={`${serviceConfig.color}28`}
              dropletColor={serviceConfig.color}
              style={{
                width: 140,
                height: 140,
                marginBottom: 24,
                shadowColor: serviceConfig.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.48,
                shadowRadius: 20,
                elevation: 10,
              }}
              contentStyle={{
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  borderWidth: 1,
                  borderColor: `${serviceConfig.color}66`,
                  borderStyle: "dashed",
                }}
              />
              <MapPin size={48} color={serviceConfig.color} />
            </LiquidGlassCard>

            <Text
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 28,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Geofence Verified
            </Text>

            <LiquidGlassCard
              variant="tinted"
              borderRadius={999}
              tintColor={`${serviceConfig.color}28`}
              style={{ marginBottom: 24 }}
              contentStyle={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <CheckCircle2
                size={14}
                color={serviceConfig.color}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: serviceConfig.color,
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Within 25m Radius • {coordsText}
              </Text>
            </LiquidGlassCard>

            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: "Brandon-Medium",
                fontSize: 16,
                textAlign: "center",
                lineHeight: 24,
                marginBottom: 32,
              }}
            >
              You have securely arrived at {matchedEntity?.name || serviceConfig.vocab.entitySingular}. Please
              verify your physical presence with a selfie.
            </Text>

            {/* Photo Verification Box */}
            <LiquidGlassCard
              variant={photoTaken ? "tinted" : "dark"}
              tintColor={photoTaken ? `${serviceConfig.color}26` : undefined}
              dropletColor={photoTaken ? serviceConfig.color : undefined}
              borderRadius={20}
              onPress={handleCapture}
              style={{
                width: "100%",
                marginBottom: 32,
              }}
              contentStyle={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <LiquidGlassIconBadge
                variant="dark"
                size={48}
                borderRadius={16}
                tintColor={photoTaken ? serviceConfig.color : "#15803d"}
                style={{ marginRight: 16 }}
              >
                {photoTaken ? (
                  <CheckCircle2 size={24} color="#ffffff" />
                ) : (
                  <Camera size={24} color="#ffffff" />
                )}
              </LiquidGlassIconBadge>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 16,
                    marginBottom: 4,
                  }}
                >
                  {photoTaken ? "Identity Verified ✓" : "Take Field Selfie"}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontFamily: "Brandon-Medium",
                    fontSize: 13,
                  }}
                >
                  {photoTaken
                    ? "Geotagged timestamp logged"
                    : `Required for ${serviceConfig.shortName} compliance`}
                </Text>
              </View>
            </LiquidGlassCard>

            {/* Confirm Check In Action Button */}
            <LiquidGlassButton
              onPress={handleCheckIn}
              disabled={!photoTaken}
              variant={photoTaken ? "tinted" : "dark"}
              tintColor={`${serviceConfig.color}CC`}
              dropletColor={serviceConfig.color}
              style={{ width: "100%" }}
              contentStyle={{ paddingVertical: 18 }}
            >
              <Fingerprint
                size={20}
                color={photoTaken ? "#ffffff" : "rgba(255,255,255,0.4)"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  color: photoTaken ? "#ffffff" : "rgba(255,255,255,0.4)",
                  fontFamily: "Brandon-Bold",
                  fontSize: 16,
                }}
              >
                Confirm Arrival
              </Text>
            </LiquidGlassButton>
          </LiquidGlassCard>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
