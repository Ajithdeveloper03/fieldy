import React from "react";
import * as ReactNative from "react-native";
import { StyleSheet, Platform } from "react-native";

let currentAppLanguage: "en" | "ta" = "en";
const languageListeners = new Set<() => void>();

export const setGlobalFontLanguage = (lang: "en" | "ta") => {
  if (currentAppLanguage !== lang) {
    currentAppLanguage = lang;
    languageListeners.forEach((cb) => cb());
  }
};

export const getGlobalFontLanguage = (): "en" | "ta" => {
  return currentAppLanguage;
};

// Tamil-script Tanglish pronunciation dictionary for automatic UI translation
const TANGLISH_PHRASES: [RegExp, string][] = [
  [/\bActive Work Orders\b/gi, "ஆக்டிவ் வொர்க் ஆர்டர்ஸ்"],
  [/\bWork Orders\b/gi, "வொர்க் ஆர்டர்ஸ்"],
  [/\bWork Order\b/gi, "வொர்க் ஆர்டர்"],
  [/\bMy Project Sites\b/gi, "மை ப்ராஜெக்ட் சைட்ஸ்"],
  [/\bProject Sites\b/gi, "ப்ராஜெக்ட் சைட்ஸ்"],
  [/\bProject Site\b/gi, "ப்ராஜெக்ட் சைட்"],
  [/\bQuality Audits\b/gi, "குவாலிட்டி ஆடிட்ஸ்"],
  [/\bQuality Audit\b/gi, "குவாலிட்டி ஆடிட்"],
  [/\bOpen Live Map\b/gi, "லைவ் மேப் ஓபன்"],
  [/\bLive GPS Map\b/gi, "லைவ் GPS மேப்"],
  [/\bLive Tracking\b/gi, "லைவ் டிராக்கிங்"],
  [/\bLive Sync\b/gi, "லைவ் சிங்க்"],
  [/\bView All\b/gi, "வியூ ஆல்"],
  [/\bView My Tasks\b/gi, "மை டாஸ்க்ஸ் பாரு"],
  [/\bField Emergency SOS\b/gi, "ஃபீல்ட் எமர்ஜென்சி SOS"],
  [/\bEmergency SOS\b/gi, "எமர்ஜென்சி SOS"],
  [/\bAttendance Hub\b/gi, "அட்டெண்டன்ஸ் ஹப்"],
  [/\bAttendance & Clock-In\b/gi, "அட்டெண்டன்ஸ் & க்ளாக்-இன்"],
  [/\bAttendance & Selfie\b/gi, "அட்டெண்டன்ஸ் & செல்ஃபி"],
  [/\bClock In\b/gi, "க்ளாக் இன்"],
  [/\bClock Out\b/gi, "க்ளாக் அவுட்"],
  [/\bCheck In\b/gi, "செக் இன்"],
  [/\bCheck Out\b/gi, "செக் அவுட்"],
  [/\bOn Duty\b/gi, "ஆன் டியூட்டி"],
  [/\bOff Duty\b/gi, "ஆஃப் டியூட்டி"],
  [/\bPerformance & Stats\b/gi, "பெர்ஃபார்மன்ஸ் & ஸ்டேட்ஸ்"],
  [/\bMy Performance\b/gi, "மை பெர்ஃபார்மன்ஸ்"],
  [/\bWork Quality Score\b/gi, "வொர்க் குவாலிட்டி ஸ்கோர்"],
  [/\bWork Quality\b/gi, "வொர்க் குவாலிட்டி"],
  [/\bWork Score\b/gi, "வொர்க் ஸ்கோர்"],
  [/\bWork Calendar\b/gi, "வொர்க் காலண்டர்"],
  [/\bVisit Logs & Proof\b/gi, "விசிட் லாக்ஸ் & ப்ரூஃப்"],
  [/\bVisit History\b/gi, "விசிட் ஹிஸ்டரி"],
  [/\bSite Visits\b/gi, "சைட் விசிட்ஸ்"],
  [/\bSite Visit\b/gi, "சைட் விசிட்"],
  [/\bMy Credentials\b/gi, "மை கிரெடென்ஷியல்ஸ்"],
  [/\bMy Profile Details\b/gi, "மை ப்ரொஃபைல் டீடெய்ல்ஸ்"],
  [/\bMobile Number\b/gi, "மொபைல் நம்பர்"],
  [/\bEmail Address\b/gi, "ஈமெயில் அட்ரஸ்"],
  [/\bSave Changes\b/gi, "சேவ் சேஞ்சஸ்"],
  [/\bSubmit Report\b/gi, "ரிப்போர்ட் சப்மிட்"],
  [/\bWork Notes\b/gi, "வொர்க் நோட்ஸ்"],
  [/\bRecent Tasks\b/gi, "ரீசன்ட் டாஸ்க்ஸ்"],
  [/\bRecent Updates\b/gi, "ரீசன்ட் அப்டேட்ஸ்"],
  [/\bWeekly Output\b/gi, "வீக்லி அவுட்புட்"],
  [/\bCompleted Work\b/gi, "கம்ப்ளீட் வொர்க்"],
  [/\bLogged Hours\b/gi, "லாக் ஹவர்ஸ்"],
  [/\bReal-Time Score\b/gi, "ரியல்-டைம் ஸ்கோர்"],
  [/\bLog Out\b/gi, "லாக் அவுட்"],
  [/\bToday's\b/gi, "டுடேஸ்"],
  [/\bToday\b/gi, "டுடே"],
  [/\bHome\b/gi, "ஹோம்"],
  [/\bTasks\b/gi, "டாஸ்க்ஸ்"],
  [/\bTask\b/gi, "டாஸ்க்"],
  [/\bVisits\b/gi, "விசிட்ஸ்"],
  [/\bVisit\b/gi, "விசிட்"],
  [/\bSites\b/gi, "சைட்ஸ்"],
  [/\bSite\b/gi, "சைட்"],
  [/\bReports\b/gi, "ரிப்போர்ட்ஸ்"],
  [/\bReport\b/gi, "ரிப்போர்ட்"],
  [/\bProfile\b/gi, "ப்ரொஃபைல்"],
  [/\bMenu\b/gi, "மெனு"],
  [/\bNotifications\b/gi, "நோட்டிஃபிகேஷன்ஸ்"],
  [/\bAttendance\b/gi, "அட்டெண்டன்ஸ்"],
  [/\bPerformance\b/gi, "பெர்ஃபார்மன்ஸ்"],
  [/\bCalendar\b/gi, "காலண்டர்"],
  [/\bCompleted\b/gi, "கம்ப்ளீட்டட்"],
  [/\bIn Progress\b/gi, "இன் ப்ராக்ரஸ்"],
  [/\bPending\b/gi, "பெண்டிங்"],
  [/\bScheduled\b/gi, "ஷெட்யூல்ட்"],
  [/\bOrders\b/gi, "ஆர்டர்ஸ்"],
  [/\bPoints\b/gi, "பாயின்ட்ஸ்"],
  [/\bPts\b/g, "பாயின்ட்ஸ்"],
  [/\bOpen\b/gi, "ஓபன்"],
  [/\bSearch\b/gi, "சர்ச்"],
  [/\bUpload\b/gi, "அப்லோட்"],
  [/\bDownload\b/gi, "டவுன்லோட்"],
  [/\bPhoto\b/gi, "ஃபோட்டோ"],
  [/\bVideo\b/gi, "வீடியோ"],
  [/\bGallery\b/gi, "கேலரி"],
  [/\bCamera\b/gi, "கேமரா"],
  [/\bActive\b/gi, "ஆக்டிவ்"],
  [/\bStatus\b/gi, "ஸ்டேட்டஸ்"],
  [/\bAccount\b/gi, "அக்கவுண்ட்"],
  [/\bSafety\b/gi, "சேஃப்டி"],
  [/\bSettings\b/gi, "செட்டிங்ஸ்"],
  [/\bMedia\b/gi, "மீடியா"],
];

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

const translateTextToTamilTanglish = (value: string): string => {
  if (!value || currentAppLanguage !== "ta") return value;
  if (/[\u0B80-\u0BFF]/.test(value)) return value;
  // Skip emails, URLs, pure numbers, or codes like EMP-0001
  if (/^[\d\s.,:%+\-/@]+$/.test(value) || value.includes("@") || value.startsWith("http")) {
    return value;
  }
  let out = value;
  for (const [pattern, replacement] of TANGLISH_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out;
};

const transformChildren = (children: any): any => {
  if (currentAppLanguage !== "ta" || children == null) return children;
  if (typeof children === "string") {
    return translateTextToTamilTanglish(children);
  }
  if (Array.isArray(children)) {
    return children.map((child) => transformChildren(child));
  }
  return children;
};

export const resolveFontFamily = (
  style: any,
  _children?: any,
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

const useLanguageTick = () => {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    languageListeners.add(listener);
    return () => {
      languageListeners.delete(listener);
    };
  }, []);
};

const OriginalText = ReactNative.Text;
if (OriginalText && !(OriginalText as any).__infinityPatched) {
  (OriginalText as any).__infinityPatched = true;
  const PatchedText = React.forwardRef<any, any>((props, ref) => {
    useLanguageTick();
    const { style, className, children, allowFontScaling = false, ...rest } = props;
    const font = resolveFontFamily(style, children, className);
    const renderedChildren = transformChildren(children);

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
      renderedChildren
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
    useLanguageTick();
    const { style, className, placeholder, value, allowFontScaling = false, ...rest } = props;
    const font = resolveFontFamily(style, placeholder || value, className);
    const renderedPlaceholder =
      typeof placeholder === "string"
        ? translateTextToTamilTanglish(placeholder)
        : placeholder;

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
      placeholder: renderedPlaceholder,
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
