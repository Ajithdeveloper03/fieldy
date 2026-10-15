import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity, Text, View } from "react-native";
import { Globe } from "lucide-react-native";
import { setGlobalFontLanguage } from "../utils/fontSetup";

export type AppLanguage = "en" | "ta";

// Simple, everyday words for both English and Tamil
export const translations: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Top & Brand
    appName: "Fieldy",
    tagline: "Facility Management Services",
    manifesto1: "Smart Facilities.",
    manifesto2: "Rapid Response.",
    manifesto3: "Total Compliance.",
    
    // Auth & Roles
    login: "Login",
    register: "Join",
    logout: "Logout",
    continue: "Next",
    chooseRole: "Who are you?",
    farmer: "Facility Client",
    facilityClient: "Facility / Client",
    fieldOfficer: "Facility Officer",
    fieldOfficerRole: "Facility Officer",
    farmerRole: "Client",
    employeeId: "Officer ID",
    farmerId: "Facility ID",

    // Navigation & Headers
    home: "Home",
    dashboard: "Home",
    visits: "Visits",
    reports: "Reports",
    profile: "Profile",
    farm: "Facility",
    orders: "Service Orders",
    support: "Help & SLA",
    history: "Service History",
    notifications: "Alerts",
    directory: "Facilities",
    back: "Back",
    viewAll: "See All",
    viewDetails: "Details",
    viewDossier: "File",
    viewReport: "Report",
    viewProtocol: "SLA Rules",

    // Facility & Client Types
    dualClient: "Hard & Soft FM",
    cropCultivator: "Technical FM",
    fertilizerCustomer: "Soft Services",
    bioInputClient: "Specialized FM",
    assignedFarmers: "Assigned Facilities",
    mingleSubtext: "All your assigned facility locations",

    // Statuses
    all: "All",
    status: "Status",
    completed: "Done",
    pending: "Wait",
    scheduled: "Soon",
    active: "Live",
    optimal: "Good",
    processing: "Packing",
    delivered: "Given",
    dispatched: "Sent",

    // Farm & Soil Metrics
    soilHealth: "Soil",
    soilPh: "pH",
    moisture: "Water",
    rootDepth: "Root",
    acres: "Acres",
    cropType: "Crop",
    primaryCrop: "Main Crop",
    irrigation: "Watering",
    dripIrrigation: "Drip",
    organicCertified: "Organic",

    // Common Crops & Inputs
    vetiver: "Vetiver",
    turmeric: "Turmeric",
    pepper: "Pepper",
    paddy: "Paddy",
    vermicompost: "Compost",
    bioFertilizer: "Bio-Fertilizer",
    neemCake: "Neem Cake",
    panchagavya: "Panchagavya",

    // Actions & Tools
    search: "Search...",
    clockIn: "Clock In",
    clockOut: "Clock Out",
    startVisit: "Start",
    logVisit: "Log Visit",
    checkIn: "Check In",
    rateOfficer: "Rate Us",
    submitRating: "Send Rating",
    howWasExperience: "How was it?",
    callFarmer: "Call",
    whatsapp: "WhatsApp",
    downloadPdf: "Get PDF",
    addNote: "Note",

    // Quick Advisory Card
    activeAdvisory: "Tips • Growing",
    dueIn3Days: "In 3 Days",
    bioFertilizerTitle: "Soil Food",
    bioFertilizerDesc: "Put 50kg compost and neem cake near the roots.",

    // Menu & Sub-screens
    menu: "Menu",
    workflow: "Work",
    attendance: "Time",
    myVisits: "Visits",
    accountPreferences: "Settings",
    myProfile: "Profile",
    appSettings: "App",
    systemSupport: "Help",
    offlineData: "Offline",
    storageUsage: "Storage",
    emergencyContact: "Emergency",
    secureLogout: "Logout",

    // Profile Screen
    fieldOfficerId: "Staff ID",
    verifiedOfficer: "Real Staff • EMP-2026",
    visitsLogged: "Visits Done",
    farmers: "Farmers",
    rating: "Stars",
    officialInfo: "Work Info",
    contactMobile: "Phone",
    corporateEmail: "Email",
    hqOffice: "Office",
    attendanceHistoryTimesheets: "Time History",
    inspectionReportsSignoffs: "Past Reports",
    signOutFieldDuty: "Stop Work",

    // Attendance Screen
    dutyAttendance: "Time & Work",
    dailyTimeTracker: "Time Tracker",
    onDuty: "● Working",
    clockedOut: "○ Stopped",
    todaysShiftHours: "Hours Today",
    shiftDuration: "Shift Time",
    geofence: "Area",
    verified: "True",
    recentAttendanceHistory: "Past Time",
    today: "Today",
    yesterday: "Yesterday",
    present: "Here",
    activeShift: "Now",
    time: "Time",
    hours: "Hrs",

    // Dashboard & Actions
    nextScheduledVisit: "Up Next",
    priorityFieldVisit: "Urgent Visit",
    quickActions: "Quick Tools",
    dutyLogs: "Logs",
    fieldReports: "Reports",
    gpsLive: "GPS",
    more: "More",
    todayFieldRoute: "Today's Path",
    startInspection: "Check Now",
    upcomingVisit: "Next Visit",
    todaysVisits: "Today's Visits",

    // Farmer Specific Keys
    docs: "Docs",
    myFarm: "Farm",
    crops: "Crops",
    fertilizers: "Fertilizer",
    farmOverview: "Farm Details",
    registeredFarmDetails: "Farm Info",
    farmName: "Farm Name",
    village: "Village",
    district: "District",
    soilType: "Soil Type",
    totalArea: "Area",
    verifiedOrganicLand: "Organic Land",
    farmerProfile: "Farmer Info",
    personal: "Personal",
    kycBank: "Bank",
    landDetails: "Land",
    contactNumber: "Phone",
    email: "Email",
    aadhaarNo: "Aadhaar",
    panNo: "PAN",
    bankAccount: "A/C No",
    ifscCode: "IFSC",
    branch: "Branch",
    farmingAgreement: "Agreement",
    landDocument: "Land Doc",
    aadhaarCard: "Aadhaar",
    bankDetails: "Bank Details",
    uploadDoc: "Upload",
    download: "Download",
    recentOrders: "Recent Orders",
    myOrders: "Orders",
    allOrders: "All Orders",
    orderStatus: "Status",
    farmingTips: "Farm Tips",
    visitHistory: "Past Visits",
    visitReports: "Past Reports",
    supportFaq: "Help & FAQ",
    feedback: "Feedback",
    referEarn: "Refer & Earn",
    shareInvite: "Share",
    referralDesc: "Bring friends, get points!",
  },

  ta: {
    // Top & Brand
    appName: "இன்பினிட்டி",
    tagline: "நல்ல விவசாயம்",
    manifesto1: "விவசாயிக்கு உதவி.",
    manifesto2: "நல்ல மண்.",
    manifesto3: "நல்ல எதிர்காலம்.",
    
    // Auth & Roles
    login: "உள்ளே செல்",
    register: "சேர்",
    logout: "வெளியேறு",
    continue: "அடுத்து",
    chooseRole: "நீங்கள் யார்?",
    farmer: "விவசாயி",
    fieldOfficer: "ஊழியர்",
    fieldOfficerRole: "ஊழியர் • டெல்டா",
    farmerRole: "விவசாயி",
    employeeId: "ஊழியர் எண்",
    farmerId: "விவசாயி எண்",

    // Navigation & Headers
    home: "முகப்பு",
    dashboard: "முகப்பு",
    visits: "பார்வை",
    reports: "ரிப்போர்ட்",
    profile: "சுயவிவரம்",
    farm: "பண்ணை",
    orders: "ஆர்டர்",
    support: "உதவி",
    history: "முன்பு",
    notifications: "தகவல்",
    directory: "ஆட்கள்",
    back: "பின்",
    viewAll: "எல்லாம்",
    viewDetails: "விவரம்",
    viewDossier: "பைல்",
    viewReport: "ரிப்போர்ட்",
    viewProtocol: "விதி",

    // Farmer & Client Types (Mingle)
    dualClient: "பண்ணை & கடை",
    cropCultivator: "பண்ணை மட்டும்",
    fertilizerCustomer: "கடை மட்டும்",
    bioInputClient: "பயோ கடை",
    assignedFarmers: "என் விவசாயிகள்",
    mingleSubtext: "அனைத்து ஆட்கள்",

    // Statuses
    all: "எல்லாம்",
    status: "நிலை",
    completed: "முடிந்தது",
    pending: "காத்திரு",
    scheduled: "விரைவில்",
    active: "செயலில்",
    optimal: "நல்லது",
    processing: "பேக்கிங்",
    delivered: "கொடுத்தாச்சு",
    dispatched: "அனுப்பியாச்சு",

    // Farm & Soil Metrics
    soilHealth: "மண்",
    soilPh: "pH",
    moisture: "தண்ணீர்",
    rootDepth: "வேர்",
    acres: "ஏக்கர்",
    cropType: "பயிர்",
    primaryCrop: "முக்கிய பயிர்",
    irrigation: "பாசனம்",
    dripIrrigation: "சொட்டு நீர்",
    organicCertified: "ஆர்கானிக்",

    // Common Crops & Inputs
    vetiver: "வெட்டிவேர்",
    turmeric: "மஞ்சள்",
    pepper: "மிளகு",
    paddy: "நெல்",
    vermicompost: "மண்புழு உரம்",
    bioFertilizer: "பயோ உரம்",
    neemCake: "வேப்பம் பிண்ணாக்கு",
    panchagavya: "பஞ்சகாவ்யா",

    // Actions & Tools
    search: "தேடு...",
    clockIn: "வேலை தொடங்கு",
    clockOut: "வேலை முடி",
    startVisit: "தொடங்கு",
    logVisit: "பார்வை பதிவு",
    checkIn: "பதிவு",
    rateOfficer: "மதிப்பிடு",
    submitRating: "அனுப்பு",
    howWasExperience: "எப்படி இருந்தது?",
    callFarmer: "கால் செய்",
    whatsapp: "வாட்ஸ்அப்",
    downloadPdf: "PDF எடு",
    addNote: "குறிப்பு",

    // Quick Advisory Card
    activeAdvisory: "டிப்ஸ் • வளரும் நிலை",
    dueIn3Days: "3 நாளில்",
    bioFertilizerTitle: "மண் உணவு",
    bioFertilizerDesc: "50 கிலோ உரம் வேரில் போடு.",

    // Menu & Sub-screens
    menu: "பட்டி",
    workflow: "வேலை",
    attendance: "நேரம்",
    myVisits: "என் பார்வை",
    accountPreferences: "செட்டிங்ஸ்",
    myProfile: "சுயவிவரம்",
    appSettings: "ஆப்",
    systemSupport: "உதவி",
    offlineData: "ஆஃப்லைன்",
    storageUsage: "ஸ்டோரேஜ்",
    emergencyContact: "அவசரம்",
    secureLogout: "வெளியேறு",

    // Profile Screen
    fieldOfficerId: "ஊழியர் எண்",
    verifiedOfficer: "உண்மை ஊழியர் • EMP-2026",
    visitsLogged: "பார்த்தது",
    farmers: "விவசாயிகள்",
    rating: "ஸ்டார்",
    officialInfo: "வேலை விவரம்",
    contactMobile: "போன்",
    corporateEmail: "ஈமெயில்",
    hqOffice: "ஆபீஸ்",
    attendanceHistoryTimesheets: "பழைய நேரம்",
    inspectionReportsSignoffs: "பழைய ரிப்போர்ட்",
    signOutFieldDuty: "வேலை நிறுத்து",

    // Attendance Screen
    dutyAttendance: "நேரம் & வேலை",
    dailyTimeTracker: "நேரம்",
    onDuty: "● வேலையில்",
    clockedOut: "○ முடிந்தது",
    todaysShiftHours: "இன்று நேரம்",
    shiftDuration: "வேலை நேரம்",
    geofence: "இடம்",
    verified: "உண்மை",
    recentAttendanceHistory: "பழைய நேரம்",
    today: "இன்று",
    yesterday: "நேற்று",
    present: "வந்தேன்",
    activeShift: "இப்போது",
    time: "நேரம்",
    hours: "மணி",

    // Dashboard & Actions
    nextScheduledVisit: "அடுத்து",
    priorityFieldVisit: "முக்கிய பார்வை",
    quickActions: "உடனடி செயல்கள்",
    dutyLogs: "லாக்",
    fieldReports: "ரிப்போர்ட்",
    gpsLive: "GPS",
    more: "மேலும்",
    todayFieldRoute: "இன்றைய வழி",
    startInspection: "ஆய்வு செய்",
    upcomingVisit: "அடுத்த பார்வை",
    todaysVisits: "இன்றைய பார்வை",

    // Farmer Specific Keys
    docs: "ஆவணம்",
    myFarm: "பண்ணை",
    crops: "பயிர்",
    fertilizers: "உரம்",
    farmOverview: "பண்ணை விவரம்",
    registeredFarmDetails: "பண்ணை தகவல்",
    farmName: "பண்ணை பெயர்",
    village: "ஊர்",
    district: "மாவட்டம்",
    soilType: "மண் வகை",
    totalArea: "பரப்பளவு",
    verifiedOrganicLand: "ஆர்கானிக் நிலம்",
    farmerProfile: "விவசாயி விவரம்",
    personal: "சொந்தம்",
    kycBank: "வங்கி",
    landDetails: "நிலம்",
    contactNumber: "போன்",
    email: "ஈமெயில்",
    aadhaarNo: "ஆதார்",
    panNo: "பான்",
    bankAccount: "கணக்கு எண்",
    ifscCode: "IFSC",
    branch: "கிளை",
    farmingAgreement: "ஒப்பந்தம்",
    landDocument: "நில ஆவணம்",
    aadhaarCard: "ஆதார்",
    bankDetails: "வங்கி விவரம்",
    uploadDoc: "அப்லோட்",
    download: "டவுன்லோட்",
    recentOrders: "புது ஆர்டர்",
    myOrders: "ஆர்டர்",
    allOrders: "எல்லா ஆர்டர்",
    orderStatus: "நிலை",
    farmingTips: "டிப்ஸ்",
    visitHistory: "பழைய பார்வை",
    visitReports: "பழைய ரிப்போர்ட்",
    supportFaq: "உதவி",
    feedback: "கருத்து",
    referEarn: "பரிந்துரை செய்",
    shareInvite: "பகிர்",
    referralDesc: "நண்பரை சேர், பாயிண்ட் பெறு!",
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
    setLanguage(nextLang);
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
      className={`flex-row items-center justify-center w-14 h-8 rounded-full border shadow-xs ${
        dark
          ? "bg-slate-900/80 border-slate-700/80"
          : "bg-white/95 border-slate-200"
      } ${className}`}
    >
      <Globe size={14} color={dark ? "#34d399" : "#059669"} className="mr-1.5" />
      <Text
        className={`font-brandon-bold text-[11px] uppercase tracking-wider ${
          dark ? "text-white" : "text-slate-900"
        }`}
      >
        {language === "en" ? "EN" : "TA"}
      </Text>
    </TouchableOpacity>
  );
};
