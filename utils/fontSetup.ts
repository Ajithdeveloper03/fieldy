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

  // If a serif font was specifically requested via class or existing style, or it's a title
  if (
    existingFont?.includes("serif") ||
    existingFont?.includes("lora") ||
    (className && /font-(serif|lora)/.test(className)) ||
    (className && /text-(lg|xl|2xl|3xl|4xl|5xl|6xl)/.test(className))
  ) {
    return {
      fontFamily: "Spectral_700Bold",
      fontWeight: Platform.OS === "android" ? "normal" : "bold",
    };
  }

  // Bold cases
  if (
    existingFont?.includes("Bold") ||
    isBold
  ) {
    return {
      fontFamily: "DMSans_700Bold",
      fontWeight: Platform.OS === "android" ? "normal" : "bold",
    };
  }

  // Medium/SemiBold cases
  if (
    existingFont?.includes("Medium") ||
    isMedium
  ) {
    return {
      fontFamily: "DMSans_500Medium",
      fontWeight: Platform.OS === "android" ? "normal" : "500",
    };
  }

  return {
    fontFamily: "DMSans_400Regular",
    fontWeight: Platform.OS === "android" ? "normal" : "normal",
  };
};
const OriginalText = ReactNative.Text;
if (OriginalText && !(OriginalText as any).__infinityPatched) {
  (OriginalText as any).__infinityPatched = true;
  const PatchedText = React.forwardRef<any, any>((props, ref) => {
    const { style, className, children, ...rest } = props;
    const font = resolveFontFamily(style, children, className);
    const isTamil = currentAppLanguage === "ta" || hasTamilGlyphs(children);

    const mergedStyle = [
      style,
      {
        fontFamily: font.fontFamily,
        ...(isTamil
          ? { fontWeight: "normal" as const }
          : Platform.OS === "android"
          ? { fontWeight: font.fontWeight }
          : {}),
      },
    ];
    return React.createElement(
      OriginalText,
      {
        ref,
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
    const { style, className, placeholder, value, ...rest } = props;
    const isTamil =
      currentAppLanguage === "ta" ||
      hasTamilGlyphs(placeholder) ||
      hasTamilGlyphs(value);

    const font = isTamil
      ? { fontFamily: "TiroTamil_400Regular", fontWeight: "normal" as const }
      : resolveFontFamily(style, placeholder || value, className);

    const mergedStyle = [
      style,
      {
        fontFamily: font.fontFamily,
        ...(Platform.OS === "android" ? { fontWeight: font.fontWeight } : {}),
      },
    ];

    return React.createElement(OriginalTextInput, {
      ref,
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