import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";

import {
  ChevronLeft,
  MapPin,
  MoreHorizontal,
  Navigation,
  ShieldAlert,
  X,
} from "lucide-react-native";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { showToast } from "../../../components/ui/ToastMessage";
import { employeeProfile, getVisitWithFarmer } from "../../../data/mockData";

export default function TrackingScreen() {
  const { id } = useLocalSearchParams();
  const visit = getVisitWithFarmer((id as string) || "v1");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [duration, setDuration] = useState(0);

  const [showStopModal, setShowStopModal] = useState(false);
  const [stopReason, setStopReason] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [submittingStop, setSubmittingStop] = useState(false);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (location) => {
          setCurrentLocation(location);
          setRouteCoordinates((prev) => [
            ...prev,
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            },
          ]);
          setSpeed(location.coords.speed || 0);


        },
      );

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    })();

    return () => {
      if (locationSubscription) locationSubscription.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAttemptStop = () => setShowStopModal(true);
  const confirmStop = () => {
    setSubmittingStop(true);
    setTimeout(() => {
      setSubmittingStop(false);
      setShowStopModal(false);
      showToast({
        title: "Tracking Stopped",
        message: "Tracking disable authorized.",
        type: "success",
      });
      router.push({
        pathname: "/(employee)/visit/report",
        params: { id },
      } as any);
    }, 1000);
  };

  if (!visit || !visit.farmer) return null;

  const displaySpeed = (speed * 3.6).toFixed(1);
  const displayDistance = totalDistanceKm.toFixed(2);
  const endLocation = {
    latitude: visit.farmer.latitude || 11.6643,
    longitude: visit.farmer.longitude || 78.146,
  };

  return (
    <View className="flex-1 bg-white">
      <View className="absolute inset-0 bg-[#f9fafb] items-center justify-center pt-20 pb-40">
        <View className="w-32 h-32 bg-green-500/10 rounded-full items-center justify-center mb-6 border-4 border-green-500/20">
          <Navigation size={48} color="#15803d" />
          <View className="absolute w-32 h-32 rounded-full border-2 border-green-500/30 animate-ping" />
        </View>
        <Text className="text-gray-900 font-brandon-bold text-2xl mb-2">Recording Visit Route</Text>
        <Text className="text-gray-500 font-brandon text-center px-10">
          Your location is being recorded in the background. Keep this app running while you complete the visit.
        </Text>
      </View>

      <SafeAreaView className="flex-1 justify-between" pointerEvents="box-none">
        <View pointerEvents="box-none">
          <View className="px-6 pt-2 pb-4 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <ChevronLeft
                size={24}
                className="text-gray-900"
              />
            </TouchableOpacity>
            <Text className="font-brandon-bold text-lg text-gray-900 bg-white/90 px-4 py-1.5 rounded-full shadow-sm">
              {" "}
              Live Tracking{" "}
            </Text>
            <View className="w-10 h-10 bg-transparent" />
          </View>
          <View className="px-4 mt-2">
            <Card className="flex-row items-center justify-between py-4 shadow-md bg-white/95">
              <View className="flex-row items-center flex-1">
                <View className="bg-[#e8e8fc] p-3 rounded-full mr-4">
                  <Navigation size={24} color="#15803d" />
                </View>
                <View className="flex-1">
                  <Text className="font-brandon-bold text-gray-900 text-base">
                    {visit.farmer.name}
                  </Text>
                  <Text
                    className="text-gray-500 text-xs font-brandon"
                    numberOfLines={1}
                  >
                    {visit.farmer.address}
                  </Text>
                </View>
              </View>
              <View className="bg-orange-100 px-3 py-1.5 rounded-full ml-2 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-ping" />
                <Text className="text-[#ea580c] font-brandon-bold text-xs">
                  LIVE
                </Text>
              </View>
            </Card>
          </View>
        </View>

        <View className="px-4 pb-8" pointerEvents="box-none">
          <Card className="rounded-[32px] pt-6 pb-6 shadow-xl bg-white/95">
            <View className="items-center mb-6">
              <Text className="text-gray-500 text-sm font-brandon mb-1">
                Tracking Duration
              </Text>
              <Text className="text-[#15803d] font-brandon-bold text-4xl">
                {formatDuration(duration)}
              </Text>
            </View>
            <View className="flex-row justify-between px-4 mb-8">
              <View className="items-center w-1/3">
                <Text className="text-gray-900 font-brandon-bold text-lg">
                  {displayDistance}
                </Text>
                <Text className="text-gray-900 font-brandon-bold text-xs mb-1">
                  km
                </Text>
                <Text className="text-gray-400 text-xs font-brandon">
                  Distance
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="items-center w-1/3">
                <Text className="text-gray-900 font-brandon-bold text-lg">
                  {displaySpeed}
                </Text>
                <Text className="text-gray-900 font-brandon-bold text-xs mb-1">
                  km/h
                </Text>
                <Text className="text-gray-400 text-xs font-brandon">
                  Speed
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="items-center w-1/3">
                <Text className="text-gray-900 font-brandon-bold text-lg">
                  {visit.time.split(" ")[0]}
                </Text>
                <Text className="text-gray-900 font-brandon-bold text-xs mb-1">
                  {visit.time.split(" ")[1]}
                </Text>
                <Text className="text-gray-400 text-xs font-brandon">
                  Start
                </Text>
              </View>
            </View>
            <Button
              title="End Trip & View Report"
              onPress={handleAttemptStop}
              className="bg-[#ea580c]"
            />
          </Card>
        </View>
      </SafeAreaView>

      <Modal visible={showStopModal} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[32px] p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <ShieldAlert size={28} color="#ef4444" className="mr-3" />
                <Text className="text-gray-900 font-brandon-bold text-xl">
                  Stop Tracking?
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowStopModal(false)}
                className="p-2 bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </TouchableOpacity>
            </View>
            <Text className="text-gray-600 font-brandon text-base mb-6">
              You are attempting to end tracking before arriving. Please provide
              a valid reason or Admin Override PIN.
            </Text>

            <Text className="text-gray-900 font-brandon-bold mb-2 ml-1">
              Reason for stopping early
            </Text>
            <View className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 h-24 mb-4">
              <TextInput
                className="flex-1 text-gray-900 font-brandon"
                multiline
                textAlignVertical="top"
                placeholder="Vehicle broke down, emergency, etc."
                placeholderTextColor="#9ca3af"
                value={stopReason}
                onChangeText={setStopReason}
              />
            </View>

            <Text className="text-gray-900 font-brandon-bold mb-2 ml-1">
              Admin Override OTP (Optional)
            </Text>
            <View className="border border-gray-200 rounded-xl px-4 py-4 bg-gray-50 mb-8">
              <TextInput
                className="text-gray-900 font-brandon-bold"
                placeholder="Enter 4-digit PIN (1234)"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                secureTextEntry
                value={adminOtp}
                onChangeText={setAdminOtp}
              />
            </View>
            <Button
              title="Confirm & End Trip"
              onPress={confirmStop}
              loading={submittingStop}
              className="bg-red-500 py-4"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

