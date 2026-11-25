import React from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ChevronLeft,
  CalendarDays,
  MapPin,
  Navigation,
  Clock,
  ChevronRight,
} from "lucide-react-native";
import { useService, ServiceSelectorPill } from "../../context/ServiceContext";
import {
  LiquidGlassBackdrop,
  LiquidGlassButton,
  LiquidGlassCard,
  LiquidGlassIconButton,
} from "../../components/LiquidGlass";

export default function EmployeeVisitsScreen() {
  const { serviceConfig } = useService();

  const fallbackImages = [
    require("../../assets/images/image1.jpg"),
    require("../../assets/images/image2.jpg"),
    require("../../assets/images/image5.jpg"),
    require("../../assets/images/image6.jpg"),
  ];

  const visits =
    serviceConfig.sampleVisits && serviceConfig.sampleVisits.length > 0
      ? serviceConfig.sampleVisits.map((v, i) => ({
          id: v.id,
          type: v.type,
          site_contact: v.site || v.entityName,
          time: v.time,
          status: v.status,
          image: v.image || fallbackImages[i % fallbackImages.length],
        }))
      : [
          {
            id: 1,
            type: `${serviceConfig.shortName} Protocol`,
            site_contact: "Sector Station Alpha",
            time: "09:00 AM",
            status: "Completed",
            image: fallbackImages[0],
          },
          {
            id: 2,
            type: `${serviceConfig.shortName} Dispatch`,
            site_contact: "Central Hub Beta",
            time: "11:30 AM",
            status: "In Progress",
            image: fallbackImages[1],
          },
        ];

  return (
    <LiquidGlassBackdrop variant="dark">
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* CLEAN ALIGNED HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            gap: 10,
          }}
        >
          <LiquidGlassIconButton
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(employee)/dashboard")
            }
            size={42}
            variant="dark"
          >
            <ChevronLeft size={22} color="#FFFFFF" />
          </LiquidGlassIconButton>

          <View style={{ alignItems: "center", flex: 1, minWidth: 0 }}>
            <Text
              numberOfLines={1}
              style={{
                color: "#FFFFFF",
                fontFamily: "Brandon-Bold",
                fontSize: 20,
              }}
            >
              Daily {serviceConfig.vocab.visits}
            </Text>
            <View style={{ marginTop: 4 }}>
              <ServiceSelectorPill compact dark />
            </View>
          </View>

          <LiquidGlassIconButton
            onPress={() => router.push("/(employee)/calendar")}
            size={42}
            variant="dark"
          >
            <CalendarDays size={19} color="#FFFFFF" />
          </LiquidGlassIconButton>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 18,
            paddingTop: 6,
            paddingBottom: 150,
          }}
        >
          {/* CLEAN LEFT-RAIL TIMELINE — ZERO OVERLAP ON ANY PHONE WIDTH */}
          <View style={{ gap: 12, marginBottom: 20 }}>
            {visits.map((visit, idx) => {
              const isCompleted = visit.status === "Completed";
              const isInProgress = visit.status === "In Progress";
              const statusColor = isCompleted
                ? "#34D399"
                : isInProgress
                ? "#FBBF24"
                : "#94A3B8";

              return (
                <View
                  key={visit.id}
                  style={{ flexDirection: "row", alignItems: "stretch" }}
                >
                  {/* Timeline rail */}
                  <View
                    style={{
                      width: 22,
                      alignItems: "center",
                      marginRight: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: statusColor,
                        marginTop: 22,
                      }}
                    />
                    {idx < visits.length - 1 && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: "rgba(255,255,255,0.14)",
                          marginTop: 6,
                        }}
                      />
                    )}
                  </View>

                  {/* Visit Card */}
                  <LiquidGlassCard
                    variant="dark"
                    borderRadius={18}
                    onPress={() =>
                      router.push(`/(employee)/visit/${visit.id}` as any)
                    }
                    style={{ flex: 1 }}
                    contentStyle={{
                      padding: 13,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={visit.image}
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 14,
                        marginRight: 12,
                        flexShrink: 0,
                      }}
                      resizeMode="cover"
                    />
                    <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                          marginBottom: 4,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flexShrink: 1,
                          }}
                        >
                          <Clock size={12} color="#34D399" />
                          <Text
                            numberOfLines={1}
                            style={{
                              color: "#E2E8F0",
                              fontFamily: "Brandon-Bold",
                              fontSize: 12,
                              marginLeft: 4,
                            }}
                          >
                            {visit.time}
                          </Text>
                        </View>
                        <View
                          style={{
                            backgroundColor: isCompleted
                              ? "rgba(52, 211, 153, 0.2)"
                              : isInProgress
                              ? "rgba(251, 191, 36, 0.2)"
                              : "rgba(148, 163, 184, 0.2)",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 999,
                          }}
                        >
                          <Text
                            style={{
                              color: statusColor,
                              fontFamily: "Brandon-Bold",
                              fontSize: 10,
                            }}
                          >
                            {visit.status}
                          </Text>
                        </View>
                      </View>

                      <Text
                        numberOfLines={1}
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "Brandon-Bold",
                          fontSize: 15,
                        }}
                      >
                        {visit.site_contact}
                      </Text>

                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 3,
                        }}
                      >
                        <MapPin size={12} color="#94A3B8" />
                        <Text
                          numberOfLines={1}
                          style={{
                            color: "#94A3B8",
                            fontFamily: "Brandon-Medium",
                            fontSize: 12,
                            marginLeft: 4,
                            flex: 1,
                          }}
                        >
                          {visit.type}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={17} color="#64748B" />
                  </LiquidGlassCard>
                </View>
              );
            })}
          </View>

          {/* MAIN LIQUID GLASS CTA BUTTON FOR LIVE MAP */}
          <LiquidGlassButton
            onPress={() => router.push("/(employee)/map")}
            variant="tinted"
            tintColor="rgba(13, 148, 136, 0.88)"
            dropletColor="#2DD4BF"
            style={{ width: "100%" }}
            contentStyle={{ paddingVertical: 14, paddingHorizontal: 20 }}
          >
            <Navigation size={17} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text
              style={{
                color: "#FFFFFF",
                fontFamily: "Brandon-Bold",
                fontSize: 15,
              }}
            >
              Open Live GPS Map
            </Text>
          </LiquidGlassButton>
        </ScrollView>
      </SafeAreaView>
    </LiquidGlassBackdrop>
  );
}
