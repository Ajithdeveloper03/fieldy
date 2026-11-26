import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, Text, View } from "react-native";
import { Globe } from "lucide-react-native";
import { SafeBlurView } from "../components/LiquidGlass";
import { setGlobalFontLanguage } from "../utils/fontSetup";

export type AppLanguage = "en" | "ta";

// Simple, everyday words for English and easy-to-understand Tanglish
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
    appName: "Fieldy",
    tagline: "Field Work & Site App",
    login: "Login Pannu",
    logout: "Log Out",
    continue: "Next Po",
    home: "Home",
    dashboard: "Home",
    today: "Innaiku",
    onDuty: "Duty-la Irukken",
    offDuty: "Off Duty",
    efficiency: "Work Score",
    activeWorkOrders: "Active Work Orders",
    ordersUnit: "Orders",
    mySites: "Ennoda Sites",
    sites: "Sites",
    tasks: "Tasks",
    visits: "Visits",
    todaysVisits: "Innaiku Visits",
    openLiveMap: "Live Map Open",
    viewAll: "Ellam Paaru",
    viewTasks: "Tasks Paaru",
    noVisitsQueued: "Innaiku Visits Illa",
    noVisitsDesc: "Ella visits-um mudinchiduchu illa assign aagala.",
    noSitesAssigned: "Sites Assign Aagala",
    noSitesDesc: "Admin site add panna udane inga automatic-ah kaatum.",
    emergencySos: "Emergency SOS",
    emergencySosSub: "Live GPS oda Admin-ku alert anuppu",
    attendanceHub: "Attendance Hub",
    attendance: "Attendance",
    clockIn: "Clock In Pannu",
    clockOut: "Clock Out Pannu",
    myPerformance: "Ennoda Performance",
    workQuality: "Work Quality",
    targetQuota: "Mudicha Work",
    loggedTime: "Work Hours",
    weeklyOutput: "Indha Vaaram Work",
    recentTasks: "Recent Tasks",
    noPendingTasks: "Pending Tasks Illa",
    myCredentials: "Ennoda Details",
    username: "Username",
    mobileNumber: "Mobile Number",
    emailAddress: "Email Address",
    saveChanges: "Save Pannu",
    notifications: "Alerts & Updates",
    recentUpdates: "Pudhu Updates",
    allCaughtUp: "Ellam Paathachu",
    noNotifications: "Pudhu alerts edhuvum illa.",
    submitReport: "Report Anuppu",
    workNotes: "Work Notes",
    menu: "Menu",
    reports: "Reports",
    profile: "Profile",
    calendar: "Work Calendar",
    search: "Search pannu...",
    completed: "Mudinchiduchu",
    pending: "Pending",
    scheduled: "Scheduled",
    active: "Nadakkudhu",
    status: "Status",
    all: "Ellam",
    back: "Back",
    open: "Open Pannu",
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
        }
        setGlobalFontLanguage("en");
      } catch (e) {
        console.log("Language load error:", e);
      }
    })();
  }, []);

  const setLanguage = async (lang: AppLanguage) => {
    setLanguageState(lang);
    setGlobalFontLanguage("en");
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
            letterSpacing: 0.8,
            color: dark ? "#ffffff" : "#1F1917",
            textTransform: "uppercase",
          }}
        >
          {language === "en" ? "EN" : "TANGLISH"}
        </Text>
      </SafeBlurView>
    </TouchableOpacity>
  );
};
