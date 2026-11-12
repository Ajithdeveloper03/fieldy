import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Dashboard": "Dashboard",
      "Visits": "Visits",
      "Reports": "Reports",
      "Profile": "Profile",
      "Home": "Home",
      "Register New Site Contact": "Register New Site Contact",
      "Existing Site Contact Visit & Inspection": "Existing Site Contact Visit & Inspection",
      "Monthly Target": "Monthly Target",
      "My Reports": "My Reports",
      "Today's Schedule": "Today's Schedule",
      "Total": "Total",
      "Completed": "Completed",
      "Pending": "Pending",
      "Up Next": "Up Next",
      "Start Visit": "Start Visit",
      "Quick Actions": "Quick Actions",
      "Good Morning": "Good Morning",
      "Good Afternoon": "Good Afternoon",
      "Good Evening": "Good Evening",
      "Customer Category": "Customer Category",
      "Project": "Project",
      "Fertilizer": "Materials",
      "Both": "Both",
      "Working Hours": "Working Hours",
      "Target: 9h": "Target: 9h",
      "Toggle Language": "Toggle Language",
      "Farm": "Farm",
      "Documents": "Documents"
    }
  },
  ta: {
    translation: {
      "Dashboard": "கட்டுப்பாட்டு அறை",
      "Visits": "பார்வைகள்",
      "Reports": "அறிக்கைகள்",
      "Profile": "சுயவிவரம்",
      "Home": "முகப்பு",
      "Register New Site Contact": "புதிய விவசாயி பதிவு",
      "Existing Site Contact Visit & Inspection": "தற்போதைய விவசாயி பார்வை & ஆய்வு",
      "Monthly Target": "மாதாந்திர இலக்கு",
      "My Reports": "என் அறிக்கைகள்",
      "Today's Schedule": "இன்றைய அட்டவணை",
      "Total": "மொத்தம்",
      "Completed": "முடிந்தது",
      "Pending": "நிலுவையில்",
      "Up Next": "அடுத்து",
      "Start Visit": "பார்வையைத் தொடங்கு",
      "Quick Actions": "விரைவான செயல்கள்",
      "Good Morning": "காலை வணக்கம்",
      "Good Afternoon": "மதிய வணக்கம்",
      "Good Evening": "மாலை வணக்கம்",
      "Customer Category": "வாடிக்கையாளர் வகை",
      "Project": "பயிர்",
      "Fertilizer": "கட்டுமானப் பொருட்கள்",
      "Both": "இரண்டும்",
      "Working Hours": "வேலை நேரங்கள்",
      "Target: 9h": "இலக்கு: 9 மணி",
      "Toggle Language": "மொழியை மாற்று",
      "Farm": "பண்ணை",
      "Documents": "ஆவணங்கள்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Set default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
