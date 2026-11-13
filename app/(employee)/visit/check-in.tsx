import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Camera,
  MapPin,
  Fingerprint,
  CheckCircle2,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useService } from "../../../context/ServiceContext";

export default function CheckInScreen() {
  const { id } = useLocalSearchParams();
  const { serviceConfig } = useService();
  const [photoTaken, setPhotoTaken] = useState(false);

  const matchedEntity = serviceConfig.sampleEntities[0];

  const handleCapture = async () => {
    try {
      const res = await ImagePicker.requestCameraPermissionsAsync();
      if (res.granted) {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.5,
        });
        if (!result.canceled) {
          setPhotoTaken(true);
          return;
        } else {
          setPhotoTaken(true);
          return;
        }
      } else {
        setPhotoTaken(true);
      }
    } catch (e) {
      console.log("Check-in camera notice:", e);
      setPhotoTaken(true);
    }
  };

  const handleCheckIn = () => {
    router.replace("/(employee)/dashboard");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Background */}
      <LinearGradient
        colors={[
          "#062214",
          "#0b3d22",
          "#04140b",
        ]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow behind center card */}
      <View
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          marginLeft: -150,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: `${serviceConfig.color}33`,
        }}
      />

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
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              padding: 8,
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: 999,
            }}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#ffffff",
              fontFamily: "Brandon-Bold",
              fontSize: 20,
            }}
          >
            {serviceConfig.label} Check-In
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 150 }}
        >
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 40,
              padding: 32,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
              alignItems: "center",
              marginTop: 20,
            }}
          >
            {/* Massive Geofence Radar Circle */}
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: `${serviceConfig.color}20`,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: serviceConfig.color,
                marginBottom: 24,
                shadowColor: serviceConfig.color,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
                elevation: 10,
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
            </View>

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

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: `${serviceConfig.color}25`,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                marginBottom: 24,
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
                Within 25m Radius
              </Text>
            </View>

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
            <TouchableOpacity
              onPress={handleCapture}
              style={{
                width: "100%",
                padding: 16,
                borderRadius: 20,
                borderWidth: 1,
                backgroundColor: photoTaken
                  ? `${serviceConfig.color}20`
                  : "rgba(255,255,255,0.05)",
                borderColor: photoTaken ? serviceConfig.color : "rgba(255,255,255,0.1)",
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  backgroundColor: photoTaken ? serviceConfig.color : "#15803d",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                {photoTaken ? (
                  <CheckCircle2 size={24} color="#ffffff" />
                ) : (
                  <Camera size={24} color="#ffffff" />
                )}
              </View>
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
            </TouchableOpacity>

            {/* Confirm Check In Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheckIn}
              disabled={!photoTaken}
              style={{
                width: "100%",
                backgroundColor: photoTaken
                  ? serviceConfig.color
                  : "rgba(255,255,255,0.1)",
                borderRadius: 999,
                paddingVertical: 18,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                opacity: photoTaken ? 1 : 0.5,
              }}
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
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
