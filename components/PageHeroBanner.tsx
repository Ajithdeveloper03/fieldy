import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PERSON_IMAGES = [
  require("../assets/images/person1.png"),
  require("../assets/images/person2.png"),
  require("../assets/images/person3.png"),
  require("../assets/images/person4.png"),
  require("../assets/images/person5.png"),
  require("../assets/images/person6.png"),
  require("../assets/images/person7.png"),
];

export interface PageHeroBannerProps {
  badge?: string;
  title: string;
  subtitle: string;
  colors?: [string, string];
  personIndex?: number;
}

export function PageHeroBanner({
  badge = "LIVE SYNC",
  title,
  subtitle,
  colors = ["#0284c7", "#1d4ed8"],
  personIndex = 0,
}: PageHeroBannerProps) {
  const personImg = PERSON_IMAGES[personIndex % PERSON_IMAGES.length];

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View pointerEvents="none" style={styles.ringLarge} />
        <View pointerEvents="none" style={styles.ringSmall} />

        <View style={styles.leftCol}>
          <View style={styles.badgeRow}>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          </View>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <View style={styles.subPill}>
            <Text numberOfLines={1} style={styles.subText}>
              {subtitle}
            </Text>
          </View>
        </View>

        <Image
          source={personImg}
          style={styles.personImg}
          resizeMode="contain"
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 16,
  },
  banner: {
    width: "100%",
    minHeight: 118,
    paddingHorizontal: 18,
    paddingVertical: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ringLarge: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    left: -40,
    top: -70,
  },
  ringSmall: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    right: 20,
    bottom: -40,
  },
  leftCol: {
    flex: 1,
    paddingRight: 108,
    zIndex: 2,
  },
  badgeRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  badgePill: {
    backgroundColor: "#facc15",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 10,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  title: {
    color: "#ffffff",
    fontFamily: "Brandon-Bold",
    fontSize: 23,
    lineHeight: 28,
    marginBottom: 8,
  },
  subPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  subText: {
    color: "#0f172a",
    fontFamily: "Brandon-Bold",
    fontSize: 12,
  },
  personImg: {
    position: "absolute",
    right: -4,
    bottom: -14,
    width: 118,
    height: 132,
    zIndex: 2,
  },
});


export default PageHeroBanner;
