import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  CalendarDays,
  MapPin,
  Navigation,
} from "lucide-react-native";
import { useLanguage } from "../../context/LanguageContext";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";

export default function EmployeeVisitsScreen() {
  const { t, language } = useLanguage();
  const { serviceConfig } = useService();

  const fallbackImages = [
    require("../../assets/images/image1.jpg"),
    require("../../assets/images/image2.jpg"),
    require("../../assets/images/image5.jpg"),
    require("../../assets/images/image6.jpg"),
  ];

  const visits = (serviceConfig.sampleVisits && serviceConfig.sampleVisits.length > 0)
    ? serviceConfig.sampleVisits.map((v, i) => ({
        id: v.id,
        type: v.type.toUpperCase(),
        site_contact: v.site,
        time: v.time,
        status: v.status,
        image: fallbackImages[i % fallbackImages.length],
      }))
    : [
        {
          id: 1,
          type: `${serviceConfig.label.toUpperCase()} PROTOCOL`,
          site_contact: "Sector Station Alpha",
          time: "09:00 AM",
          status: "Completed",
          image: fallbackImages[0],
        },
        {
          id: 2,
          type: `${serviceConfig.label.toUpperCase()} DISPATCH`,
          site_contact: "Central Hub Beta",
          time: "11:30 AM",
          status: "In Progress",
          image: fallbackImages[1],
        },
      ];

  return (
    <View style={{ flex: 1, backgroundColor: "#062214" }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={["#062214", "#0a331c", "#04140b"]}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        >
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={{ alignItems: "center", flex: 1, minWidth: 0, paddingHorizontal: 8 }}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={{
                color: "#ffffff",
                fontFamily: "Brandon-Bold",
                fontSize: 23,
                maxWidth: "100%",
              }}
            >
              Daily {serviceConfig.vocab.visits}
            </Text>
            <View style={{ marginTop: 2 }}>
              <ServiceSelectorPill compact dark />
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(employee)/calendar")}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.1)",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.15)",
            }}
          >
            <CalendarDays size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 24,
            paddingHorizontal: 16,
            alignItems: "center",
            paddingBottom: 240,
          }}
        >
          <View style={{ width: "100%", alignItems: "center" }}>
            <View
              style={{
                position: "absolute",
                top: 40,
                bottom: 40,
                width: 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                left: "50%",
                marginLeft: -1,
                zIndex: 0,
              }}
            />
            {visits.map((visit) => (
              <TouchableOpacity
                key={visit.id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push(`/(employee)/visit/${visit.id}` as any)
                }
                style={{
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 32,
                  zIndex: 10,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-end",
                    paddingRight: 46,
                    minWidth: 0,
                  }}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontFamily: "Brandon-Bold",
                      fontSize: 12,
                      letterSpacing: 1,
                      marginBottom: 4,
                      maxWidth: "100%",
                      textAlign: "right",
                    }}
                  >
                    {visit.type}
                  </Text>
                  <Text
                    style={{
                      color:
                        visit.status === "Completed"
                          ? "#4ade80"
                          : visit.status === "In Progress"
                          ? "#fbbf24"
                          : "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 18,
                    }}
                  >
                    {visit.status}
                  </Text>
                </View>

                <View
                  style={{
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    backgroundColor: "#062214",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    left: "50%",
                    marginLeft: -43,
                    zIndex: 10,
                    borderWidth: visit.status === "Completed" ? 2.5 : 1.5,
                    borderColor:
                      visit.status === "Completed"
                        ? "#4ade80"
                        : "rgba(255,255,255,0.3)",
                  }}
                >
                  <Image
                    source={visit.image}
                    style={{ width: 76, height: 76, borderRadius: 38 }}
                  />
                </View>

                <View
                  style={{
                    flex: 1,
                    alignItems: "flex-start",
                    paddingLeft: 54,
                    minWidth: 0,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontFamily: "Brandon-Bold",
                      fontSize: 21,
                    }}
                  >
                    {visit.time}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <MapPin size={14} color="rgba(255,255,255,0.65)" />
                    <Text
                    style={{
                        color: "rgba(255,255,255,0.8)",
                        fontFamily: "Brandon-Medium",
                      fontSize: 15,
                        marginLeft: 5,
                      flex: 1,
                      flexShrink: 1,
                      }}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    >
                      {visit.site_contact}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/(employee)/map")}
          style={{
            position: "absolute",
            bottom: 100,
            left: 20,
            right: 20,
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            borderRadius: 30,
            padding: 22,
            borderWidth: 1,
            borderColor: "rgba(74, 222, 128, 0.3)",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 150 }}>
              <Navigation size={20} color="#4ade80" />
              <Text
                style={{
                  color: "#ffffff",
                  fontFamily: "Brandon-Bold",
                  fontSize: 17,
                  marginLeft: 8,
                  flexShrink: 1,
                }}
              >
                Open Live GPS Map
              </Text>
            </View>
            <View
              style={{
                backgroundColor: "rgba(74,222,128,0.2)",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 999,
              }}
            >
              <Text
                style={{
                  color: "#4ade80",
                  fontFamily: "Brandon-Bold",
                  fontSize: 12,
                  letterSpacing: 1,
                }}
              >
                GPS SYNCED
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontFamily: "Brandon-Medium",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Your {serviceConfig.label} itinerary has been optimized for the fastest
            transit and SLA response times today.
          </Text>
        </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
