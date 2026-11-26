import React from "react";
import * as ReactNative from "react-native";
import { StyleSheet, Platform } from "react-native";

let currentAppLanguage: "en" | "ta" = "en";

export const setGlobalFontLanguage = (lang: "en" | "ta") => {
  currentAppLanguage = lang;
};

export const getGlobalFontLanguage = (): "en" | "ta" => {
  return currentAppLanguage;
};

export const hasTamilGlyphs = (children: any): boolean => {
  if (typeof children === "string") {
    return /[\u0B80-\u0BFF]/.test(children);
  }
  if (typeof children === "number") {
    return false;
  }
  if (Array.isArray(children)) {
    return children.some(hasTamilGlyphs);
  }
  if (children && typeof children === "object" && children.props?.children) {
    return hasTamilGlyphs(children.props.children);
  }
  return false;
};

export const resolveFontFamily = (
  style: any,
  children?: any,
  className?: string
): { fontFamily: string; fontWeight?: "normal" | "400" | "500" | "600" | "700" | "bold" } => {
  const flat = StyleSheet.flatten(style) || {};

  const existingFont = flat.fontFamily;
  if (
    existingFont &&
    (existingFont.includes("Spectral") || existingFont.includes("DMSans"))
  ) {
    return {
      fontFamily: existingFont,
      fontWeight: Platform.OS === "android" ? "normal" : flat.fontWeight,
    };
  }

  const isBold =
    flat.fontWeight === "bold" ||
    flat.fontWeight === "700" ||
    flat.fontWeight === "800" ||
    flat.fontWeight === "900" ||
    (className && /font-(bold|extrabold|gotham-bold|brandon-bold)/.test(className));
  const isMedium =
    flat.fontWeight === "500" ||
    flat.fontWeight === "600" ||
    (className && /font-(medium|semibold|gotham-medium|gotham-semibold|brandon-medium|brandon-semibold)/.test(className));

  // Consistent DMSans font family across all devices (iOS & Android)
  if (existingFont?.includes("Bold") || isBold) {
    return {
      fontFamily: "DMSans_700Bold",
      fontWeight: Platform.OS === "android" ? "normal" : "700",
    };
  }

  if (existingFont?.includes("Medium") || isMedium) {
    return {
      fontFamily: "DMSans_500Medium",
      fontWeight: Platform.OS === "android" ? "normal" : "500",
    };
  }

  return {
    fontFamily: "DMSans_400Regular",
    fontWeight: Platform.OS === "android" ? "normal" : "400",
  };
};
const OriginalText = ReactNative.Text;
if (OriginalText && !(OriginalText as any).__infinityPatched) {
  (OriginalText as any).__infinityPatched = true;
  const PatchedText = React.forwardRef<any, any>((props, ref) => {
    const { style, className, children, allowFontScaling = false, ...rest } = props;
    const font = resolveFontFamily(style, children, className);

    const mergedStyle = [
      style,
      {
        fontFamily: font.fontFamily,
        includeFontPadding: false,
        ...(Platform.OS === "android" ? { fontWeight: font.fontWeight } : {}),
      },
    ];
    return React.createElement(
      OriginalText,
      {
        ref,
        allowFontScaling,
        maxFontSizeMultiplier: 1.0,
        style: mergedStyle,
        ...rest,
      },
      children
    );
  });
  PatchedText.displayName = "Text";
  try {
    Object.defineProperty(ReactNative, "Text", {
      get() {
        return PatchedText;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    console.warn("Could not patch ReactNative.Text:", e);
  }
}

const OriginalTextInput = ReactNative.TextInput;
if (OriginalTextInput && !(OriginalTextInput as any).__infinityPatched) {
  (OriginalTextInput as any).__infinityPatched = true;

  const PatchedTextInput = React.forwardRef<any, any>((props, ref) => {
    const { style, className, placeholder, value, allowFontScaling = false, ...rest } = props;
    const font = resolveFontFamily(style, placeholder || value, className);

    const mergedStyle = [
      style,
      {
        fontFamily: font.fontFamily,
        includeFontPadding: false,
        ...(Platform.OS === "android" ? { fontWeight: font.fontWeight } : {}),
      },
    ];

    return React.createElement(OriginalTextInput, {
      ref,
      allowFontScaling,
      maxFontSizeMultiplier: 1.0,
      style: mergedStyle,
      placeholder,
      value,
      ...rest,
    });
  });

  PatchedTextInput.displayName = "TextInput";

  try {
    Object.defineProperty(ReactNative, "TextInput", {
      get() {
        return PatchedTextInput;
      },
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    console.warn("Could not patch ReactNative.TextInput:", e);
  }
}