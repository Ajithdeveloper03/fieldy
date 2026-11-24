import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Marker } from './MapView';
import Svg, { Circle, Path } from 'react-native-svg';

interface FieldEmployeeMarkerProps {
  coordinate: { latitude: number; longitude: number };
  name?: string;
  accentColor?: string;
}

export function FieldEmployeeMarker({
  coordinate,
  name,
  accentColor = '#F26A10',
}: FieldEmployeeMarkerProps) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.45,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.pulseRing,
            {
              backgroundColor: accentColor,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.45],
                outputRange: [0.35, 0],
              }),
            },
          ]}
        />
        <View style={styles.iconWrap}>
          <Svg width={36} height={36} viewBox="0 0 44 44" fill="none">
            <Path
              d="M13 17C13 11.477 17.029 7 22 7C26.971 7 31 11.477 31 17H13Z"
              fill={accentColor}
              stroke="#0F172A"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <Path d="M22 7V15" stroke="#FFF7ED" strokeWidth={2} strokeLinecap="round" />
            <Path d="M10.5 17.5H33.5" stroke="#0F172A" strokeWidth={2.4} strokeLinecap="round" />
            <Path
              d="M15.5 18.5C15.5 22.09 18.41 25 22 25C25.59 25 28.5 22.09 28.5 18.5"
              fill="#FDE68A"
              stroke="#0F172A"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path
              d="M9 36C9 29.925 13.925 26 20 26H24C30.075 26 35 29.925 35 36"
              fill="#0F172A"
              stroke="#0F172A"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Path d="M15.5 26.5L18.5 36" stroke={accentColor} strokeWidth={3} strokeLinecap="round" />
            <Path d="M28.5 26.5L25.5 36" stroke={accentColor} strokeWidth={3} strokeLinecap="round" />
            <Circle cx={22} cy={31.5} r={2} fill="#22C55E" stroke="#FFFFFF" strokeWidth={1.2} />
          </Svg>
        </View>
        {name ? (
          <View style={styles.labelPill}>
            <Text style={styles.labelText} numberOfLines={1}>
              {name}
            </Text>
          </View>
        ) : null}
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  pulseRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  iconWrap: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelPill: {
    marginTop: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    maxWidth: 110,
  },
});
