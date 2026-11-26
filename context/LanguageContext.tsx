import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, Text, View } from "react-native";
import { Globe } from "lucide-react-native";
import { SafeBlurView } from "../components/LiquidGlass";
import { setGlobalFontLanguage } from "../utils/fontSetup";

export type AppLanguage = "en" | "ta";

// English and Tamil-script Tanglish pronunciations
export const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    appName: "Fieldy",
    tagline: "Field Operations & Site App",
    login: "Login",
    logout: "Log Out",
    continue: "Continue",
    home: "Home",
    dashboard: "Home",
    today: "Today",
    onDuty: "On Duty",
    offDuty: "Off Duty",
    efficiency: "Work Score",
    activeWorkOrders: "Active Work Orders",
    ordersUnit: "Orders",
    mySites: "My Project Sites",
    sites: "Sites",
    tasks: "Tasks",
    visits: "Visits",
    todaysVisits: "Today's Visits",
    openLiveMap: "Open Live Map",
    viewAll: "View All",
    viewTasks: "View My Tasks",
    noVisitsQueued: "No Visits Queued Today",
    noVisitsDesc: "All scheduled route visits have been completed or none assigned.",
    noSitesAssigned: "No Project Sites Assigned",
    noSitesDesc: "Sites created or assigned in Web Admin will appear here automatically.",
    emergencySos: "Field Emergency SOS",
    emergencySosSub: "Alert admin with live GPS coordinates",
    attendanceHub: "Attendance Hub",
    attendance: "Attendance",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    myPerformance: "Performance & Stats",
    workQuality: "Work Quality",
    targetQuota: "Completed Work",
    loggedTime: "Logged Hours",
    weeklyOutput: "Weekly Output",
    recentTasks: "Recent Tasks",
    noPendingTasks: "All Tasks Completed",
    myCredentials: "My Credentials",
    username: "Username",
    mobileNumber: "Mobile Number",
    emailAddress: "Email Address",
    saveChanges: "Save Changes",
    notifications: "Notifications",
    recentUpdates: "Recent Updates",
    allCaughtUp: "You're All Caught Up",
    noNotifications: "No unread alerts or broadcast notifications.",
    submitReport: "Submit Report",
    workNotes: "Work Notes",
    menu: "Menu",
    reports: "Reports",
    profile: "Profile",
    calendar: "Work Calendar",
    search: "Search...",
    completed: "Completed",
    pending: "Pending",
    scheduled: "Scheduled",
    active: "In Progress",
    status: "Status",
    all: "All",
    back: "Back",
    open: "Open",
  },
  ta: {
    appName: "ஃபீல்டி",
    tagline: "ஃபீல்ட் ஆபரேஷன்ஸ் & சைட் ஆப்",
    login: "லாகின்",
    logout: "லாக் அவுட்",
    continue: "கன்டினியூ",
    home: "ஹோம்",
    dashboard: "ஹோம்",
    today: "டுடே",
    onDuty: "ஆன் டியூட்டி",
    offDuty: "ஆஃப் டியூட்டி",
    efficiency: "வொர்க் ஸ்கோர்",
    activeWorkOrders: "ஆக்டிவ் வொர்க் ஆர்டர்ஸ்",
    ordersUnit: "ஆர்டர்ஸ்",
    mySites: "மை ப்ராஜெக்ட் சைட்ஸ்",
    sites: "சைட்ஸ்",
    tasks: "டாஸ்க்ஸ்",
    visits: "விசிட்ஸ்",
    todaysVisits: "டுடேஸ் விசிட்ஸ்",
    openLiveMap: "லைவ் மேப் ஓபன்",
    viewAll: "வியூ ஆல்",
    viewTasks: "மை டாஸ்க்ஸ் பாரு",
    noVisitsQueued: "டுடே விசிட்ஸ் இல்ல",
    noVisitsDesc: "எல்லா விசிட்ஸும் கம்ப்ளீட் ஆயிடுச்சு இல்ல அசைன் ஆகல.",
    noSitesAssigned: "சைட்ஸ் அசைன் ஆகல",
    noSitesDesc: "வெப் அட்மின்ல சைட் ஆட் பண்ணா இங்க ஆட்டோமேட்டிக்கா வரும்.",
    emergencySos: "ஃபீல்ட் எமர்ஜென்சி SOS",
    emergencySosSub: "லைவ் GPS ஓட அட்மினுக்கு அலர்ட் அனுப்பு",
    attendanceHub: "அட்டெண்டன்ஸ் ஹப்",
    attendance: "அட்டெண்டன்ஸ்",
    clockIn: "க்ளாக் இன்",
    clockOut: "க்ளாக் அவுட்",
    myPerformance: "பெர்ஃபார்மன்ஸ் & ஸ்டேட்ஸ்",
    workQuality: "வொர்க் குவாலிட்டி",
    targetQuota: "கம்ப்ளீட் வொர்க்",
    loggedTime: "லாக் ஹவர்ஸ்",
    weeklyOutput: "வீக்லி அவுட்புட்",
    recentTasks: "ரீசன்ட் டாஸ்க்ஸ்",
    noPendingTasks: "எல்லா டாஸ்கும் கம்ப்ளீட்",
    myCredentials: "மை கிரெடென்ஷியல்ஸ்",
    username: "யூசர்நேம்",
    mobileNumber: "மொபைல் நம்பர்",
    emailAddress: "ஈமெயில் அட்ரஸ்",
    saveChanges: "சேவ் சேஞ்சஸ்",
    notifications: "நோட்டிஃபிகேஷன்ஸ்",
    recentUpdates: "ரீசன்ட் அப்டேட்ஸ்",
    allCaughtUp: "எல்லாம் பார்த்தாச்சு",
    noNotifications: "புது அலர்ட்ஸ் எதுவும் இல்ல.",
    submitReport: "ரிப்போர்ட் சப்மிட்",
    workNotes: "வொர்க் நோட்ஸ்",
    menu: "மெனு",
    reports: "ரிப்போர்ட்ஸ்",
    profile: "ப்ரொஃபைல்",
    calendar: "வொர்க் காலண்டர்",
    search: "சர்ச்...",
    completed: "கம்ப்ளீட்டட்",
    pending: "பெண்டிங்",
    scheduled: "ஷெட்யூல்ட்",
    active: "இன் ப்ராக்ரஸ்",
    status: "ஸ்டேட்டஸ்",
    all: "ஆல்",
    back: "பேக்",
    open: "ஓபன்",
  },
};

interface LanguageContextProps {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    (async () => {
      try {
        const savedLang = await AsyncStorage.getItem("app_language");
        if (savedLang === "en" || savedLang === "ta") {
          setLanguageState(savedLang as AppLanguage);
          setGlobalFontLanguage(savedLang as AppLanguage);
        } else {
          setGlobalFontLanguage("en");
        }
      } catch (e) {
        console.log("Language load error:", e);
      }
    })();
  }, []);

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang);
    setGlobalFontLanguage(lang);
    try {
      await AsyncStorage.setItem("app_language", lang);
    } catch (e) {
      console.log("Language save error:", e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === "en" ? "ta" : "en";
    void setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    if (dict[key]) {
      return dict[key];
    }
    const enDict = translations.en;
    if (enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// Pre-built Language Toggle Pill Component
export const LanguageTogglePill: React.FC<{
  dark?: boolean;
  className?: string;
}> = ({ dark = false, className = "" }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleLanguage}
      style={{
        height: 30,
        borderRadius: 999,
        overflow: "hidden",
        borderWidth: 1.4,
        borderColor: dark ? "rgba(255,255,255,0.44)" : "rgba(255,255,255,0.90)",
        shadowColor: "#1F1917",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: dark ? 0.3 : 0.14,
        shadowRadius: 12,
        elevation: 5,
      }}
      className={className}
    >
      <SafeBlurView
        intensity={76}
        tint={dark ? "dark" : "light"}
        style={{
          flex: 1,
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 11,
          backgroundColor: dark
            ? "rgba(8, 22, 18, 0.74)"
            : "rgba(255, 255, 255, 0.92)",
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 10,
            right: 10,
            height: 1.5,
            backgroundColor: dark
              ? "rgba(255,255,255,0.65)"
              : "rgba(255,255,255,0.96)",
          }}
        />
        <View style={{ marginRight: 5 }}>
          <Globe size={13} color={dark ? "#ffffff" : "#C8553D"} />
        </View>
        <Text
          style={{
            fontFamily: "Brandon-Bold",
            fontSize: 11,
            letterSpacing: 0.6,
            color: dark ? "#ffffff" : "#1F1917",
          }}
        >
          {language === "en" ? "EN" : "தமிழ்"}
        </Text>
      </SafeBlurView>
    </TouchableOpacity>
  );
};
