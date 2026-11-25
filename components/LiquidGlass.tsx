import React, { useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { BlurView, BlurViewProps } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

const DEFAULT_GLASS_TINT = "rgba(13, 148, 136, 0.84)";
const DEFAULT_DROPLET = "#0D9488";

const triggerLightHaptic = () => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};

function toRgba(color: string, alpha: number): string {
  const safeAlpha = Math.max(0, Math.min(1, alpha));
  const trimmed = color.trim();

  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
      }
    }
  }

  const rgbMatch = trimmed.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${safeAlpha})`;
  }

  return `rgba(13, 148, 136, ${safeAlpha})`;
}

export type SafeBlurViewProps = Omit<
  BlurViewProps,
  "blurMethod" | "experimentalBlurMethod" | "blurTarget"
>;

/**
 * Cross-platform BlurView wrapper used ONLY for main liquid-glass buttons and menus.
 * - iOS & Web: native BlurView
 * - Android: clean crash-free translucent frosted View
 */
export function SafeBlurView({
  intensity = 72,
  tint = "dark",
  blurReductionFactor = 4,
  style,
  children,
  ...props
}: SafeBlurViewProps) {
  const flatStyle = StyleSheet.flatten(style) || {};

  if (Platform.OS === "android") {
    const isLightTint =
      tint === "light" ||
      tint === "extraLight" ||
      tint === "systemUltraThinMaterialLight" ||
      tint === "systemThinMaterialLight" ||
      tint === "systemMaterialLight" ||
      tint === "systemThickMaterialLight" ||
      tint === "systemChromeMaterialLight";

    return (
      <View
        {...props}
        style={{
          backgroundColor: isLightTint
            ? "rgba(255, 255, 255, 0.88)"
            : "rgba(10, 22, 20, 0.78)",
          ...flatStyle,
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <BlurView
      {...props}
      intensity={intensity}
      tint={tint}
      blurReductionFactor={blurReductionFactor}
      style={flatStyle}
    >
      {children}
    </BlurView>
  );
}

/**
 * Apple Liquid Glass optical sheen — applied ONLY to main buttons and menu controls.
 */
function LiquidButtonSheen({
  isLight,
  dropletColor,
  borderRadius = 999,
}: {
  isLight: boolean;
  dropletColor?: string;
  borderRadius?: number;
}) {
  const inset = Math.min(20, Math.max(10, borderRadius * 0.4));

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius,
        overflow: "hidden",
      }}
    >
      {dropletColor ? (
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            toRgba(dropletColor, 0.24),
          ]}
          start={{ x: 0.1, y: 0.1 }}
          end={{ x: 0.95, y: 0.95 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      ) : null}

      <LinearGradient
        colors={[
          isLight ? "rgba(255, 255, 255, 0.62)" : "rgba(255, 255, 255, 0.30)",
          isLight ? "rgba(255, 255, 255, 0.10)" : "rgba(255, 255, 255, 0.05)",
          "rgba(255, 255, 255, 0)",
        ]}
        locations={[0, 0.48, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "52%",
        }}
      />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: inset,
          right: inset,
          height: 1.5,
          borderRadius: 1,
          backgroundColor: isLight
            ? "rgba(255, 255, 255, 0.96)"
            : "rgba(255, 255, 255, 0.55)",
        }}
      />
    </View>
  );
}

/**
 * Clean high-contrast page backdrop canvas (solid cool-neutral light / deep emerald-slate dark).
 */
export function LiquidGlassBackdrop({
  variant = "light",
  style,
  children,
}: {
  variant?: "light" | "dark";
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const isLight = variant === "light";
  const flatStyle = StyleSheet.flatten(style) || {};

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isLight ? "#F3F6FA" : "#071A14",
        ...flatStyle,
      }}
    >
      {!isLight && (
        <LinearGradient
          pointerEvents="none"
          colors={["#061812", "#0A231B", "#061510"]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      )}
      {children}
    </View>
  );
}

interface LiquidGlassCardProps {
  variant?: "light" | "dark" | "tinted";
  borderRadius?: number;
  intensity?: number;
  tintColor?: string;
  dropletColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

/**
 * Clean, crisp, high-contrast solid card (NO heavy liquidmorphism on regular cards/rows).
 * Ensures razor-sharp text visibility and exact alignment across every screen.
 */
export function LiquidGlassCard({
  variant = "light",
  borderRadius = 20,
  tintColor,
  style,
  contentStyle,
  onPress,
  disabled = false,
  children,
}: LiquidGlassCardProps) {
  const isLight = variant === "light";
  const isDark = variant === "dark";
  const flatStyle = StyleSheet.flatten(style) || {};
  const flatContentStyle = StyleSheet.flatten(contentStyle) || {};
  const hasFlex = flatStyle.flex !== undefined || flatStyle.height !== undefined;

  const surfaceBg =
    variant === "tinted"
      ? tintColor || "#F0FDFA"
      : isLight
      ? "#FFFFFF"
      : "#102820";

  const surfaceBorder = isLight
    ? "#E2E8F0"
    : isDark
    ? "rgba(255, 255, 255, 0.14)"
    : "rgba(13, 148, 136, 0.28)";

  const cardStyle: ViewStyle = {
    borderRadius,
    backgroundColor: surfaceBg,
    borderWidth: 1,
    borderColor: surfaceBorder,
    shadowColor: isLight ? "#0F172A" : "#000000",
    shadowOffset: { width: 0, height: isLight ? 4 : 6 },
    shadowOpacity: isLight ? 0.06 : 0.24,
    shadowRadius: isLight ? 12 : 16,
    elevation: isLight ? 2 : 4,
    overflow: "hidden",
    ...flatStyle,
  };

  const innerStyle: ViewStyle = {
    ...(hasFlex ? { flex: 1 } : {}),
    ...flatContentStyle,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled}
        style={cardStyle}
      >
        <View style={innerStyle}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      <View style={innerStyle}>{children}</View>
    </View>
  );
}

interface LiquidGlassIconButtonProps {
  onPress?: () => void;
  size?: number;
  variant?: "dark" | "light" | "tinted";
  tintColor?: string;
  dropletColor?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeOpacity?: number;
}

/**
 * Header Menu / Back / Notification Liquid Glass Circular Button.
 */
export function LiquidGlassIconButton({
  onPress,
  size = 44,
  variant = "dark",
  tintColor,
  dropletColor,
  style,
  children,
}: LiquidGlassIconButtonProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const isLight = variant === "light";
  const isTinted = variant === "tinted";
  const flatStyle = StyleSheet.flatten(style) || {};

  const bgColor = isTinted
    ? tintColor || DEFAULT_GLASS_TINT
    : isLight
    ? "rgba(255, 255, 255, 0.94)"
    : "rgba(7, 24, 18, 0.62)";

  const borderColor = isLight
    ? "#E2E8F0"
    : "rgba(255, 255, 255, 0.36)";

  const pressIn = () => {
    triggerLightHaptic();
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 42,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        flexShrink: 0,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isLight ? 0.08 : 0.28,
        shadowRadius: 10,
        elevation: 4,
        ...flatStyle,
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: "hidden",
          borderWidth: 1.25,
          borderColor,
          backgroundColor: bgColor,
        }}
      >
        <SafeBlurView
          intensity={isLight ? 60 : 72}
          tint={isLight ? "light" : "dark"}
          style={{
            flex: 1,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LiquidButtonSheen
            isLight={isLight}
            dropletColor={dropletColor}
            borderRadius={size / 2}
          />
          <View
            style={{
              zIndex: 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {children}
          </View>
        </SafeBlurView>
      </Pressable>
    </Animated.View>
  );
}

interface LiquidGlassIconBadgeProps {
  size?: number;
  borderRadius?: number;
  tintColor?: string;
  variant?: "light" | "dark";
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Clean, flat modern tinted icon container for list rows & stat tiles (NO liquid glass clutter).
 */
export function LiquidGlassIconBadge({
  size = 44,
  borderRadius = 14,
  tintColor,
  variant = "light",
  style,
  children,
}: LiquidGlassIconBadgeProps) {
  const isLight = variant === "light";
  const color = tintColor || DEFAULT_DROPLET;
  const flatStyle = StyleSheet.flatten(style) || {};

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        flexShrink: 0,
        backgroundColor: toRgba(color, isLight ? 0.12 : 0.2),
        borderWidth: 1,
        borderColor: toRgba(color, isLight ? 0.22 : 0.32),
        alignItems: "center",
        justifyContent: "center",
        ...flatStyle,
      }}
    >
      {children}
    </View>
  );
}

interface LiquidGlassButtonProps {
  onPress?: () => void;
  tintColor?: string;
  dropletColor?: string;
  variant?: "tinted" | "light" | "dark";
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  activeOpacity?: number;
  disabled?: boolean;
}

/**
 * Apple Liquid Glass MAIN Action Button (kept exclusively for primary CTAs & main actions).
 * Properly sizes to content when inline, or fills width when `width: "100%"` / `flex: 1` is passed.
 */
export function LiquidGlassButton({
  onPress,
  tintColor = DEFAULT_GLASS_TINT,
  dropletColor,
  variant = "tinted",
  style,
  contentStyle,
  children,
  disabled = false,
}: LiquidGlassButtonProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const isLight = variant === "light";
  const isDark = variant === "dark";
  const flatStyle = StyleSheet.flatten(style) || {};
  const flatContentStyle = StyleSheet.flatten(contentStyle) || {};
  const isFullWidth =
    flatStyle.width === "100%" || flatStyle.flex !== undefined;

  const bgColor = isLight
    ? "rgba(255, 255, 255, 0.92)"
    : isDark
    ? "rgba(15, 23, 42, 0.86)"
    : tintColor;

  const borderColor = isLight
    ? "#CBD5E1"
    : "rgba(255, 255, 255, 0.44)";

  const pressIn = () => {
    if (disabled) return;
    triggerLightHaptic();
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 22,
      bounciness: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        opacity: disabled ? 0.55 : 1,
        flexShrink: 0,
        shadowColor: isLight ? "#0F172A" : "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isLight ? 0.1 : 0.28,
        shadowRadius: 14,
        elevation: 6,
        ...flatStyle,
        transform: [{ scale }],
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={{
          borderRadius: 999,
          overflow: "hidden",
          borderWidth: 1.25,
          borderColor,
          backgroundColor: bgColor,
          ...(isFullWidth ? { width: "100%" } : {}),
        }}
      >
        <SafeBlurView
          intensity={isLight ? 68 : 76}
          tint={isLight ? "light" : "dark"}
          style={{
            borderRadius: 999,
            backgroundColor: bgColor,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 22,
            paddingVertical: 13,
            ...flatContentStyle,
          }}
        >
          <LiquidButtonSheen
            isLight={isLight}
            dropletColor={dropletColor}
            borderRadius={999}
          />
          <View
            style={{
              zIndex: 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              ...(isFullWidth ? { width: "100%" } : {}),
            }}
          >
            {children}
          </View>
        </SafeBlurView>
      </Pressable>
    </Animated.View>
  );
}

interface LiquidGlassPillProps {
  onPress?: () => void;
  active?: boolean;
  variant?: "light" | "dark";
  tintColor?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Clean solid Filter / Tab Chip (NO heavy liquid glass clutter on small chips).
 */
export function LiquidGlassPill({
  onPress,
  active = false,
  variant = "light",
  tintColor = "#0D9488",
  style,
  contentStyle,
  children,
}: LiquidGlassPillProps) {
  const isLight = variant === "light";
  const flatStyle = StyleSheet.flatten(style) || {};
  const flatContentStyle = StyleSheet.flatten(contentStyle) || {};

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={{
        flexShrink: 0,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active
          ? "transparent"
          : isLight
          ? "#CBD5E1"
          : "rgba(255, 255, 255, 0.22)",
        backgroundColor: active
          ? tintColor
          : isLight
          ? "#FFFFFF"
          : "#132E25",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 8,
        ...flatStyle,
        ...flatContentStyle,
      }}
    >
      {children}
    </TouchableOpacity>
  );
}
