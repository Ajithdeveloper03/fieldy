import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeBlurView } from "../components/LiquidGlass";
import {
  Check,
  ChevronDown,
  Layers,
  Sparkles,
  X,
} from "lucide-react-native";
import {
  SERVICES_CONFIG,
  ServiceDefinition,
  ServiceKey,
} from "../constants/servicesConfig";

export const ALL_SERVICE_KEYS: ServiceKey[] = [
  "facility_fmcg",
  "real_estate",
  "construction",
  "security",
  "cleaning",
  "maintenance",
  "solar",
  "pest_control",
  "logistics",
];

export const getSafeServiceConfig = (key?: any): ServiceDefinition => {
  if (
    key &&
    typeof key === "string" &&
    Object.prototype.hasOwnProperty.call(SERVICES_CONFIG, key) &&
    SERVICES_CONFIG[key as ServiceKey]
  ) {
    return SERVICES_CONFIG[key as ServiceKey];
  }
  return SERVICES_CONFIG.facility_fmcg;
};

interface ServiceContextProps {
  currentService: ServiceKey;
  serviceConfig: ServiceDefinition;
  setService: (key: ServiceKey) => Promise<void>;
  services: ServiceKey[];
  openSwitcher: () => void;
  closeSwitcher: () => void;
  isSwitcherOpen: boolean;
}

const ServiceContext = createContext<ServiceContextProps>({
  currentService: "facility_fmcg",
  serviceConfig: getSafeServiceConfig("facility_fmcg"),
  setService: async () => {},
  services: ALL_SERVICE_KEYS,
  openSwitcher: () => {},
  closeSwitcher: () => {},
  isSwitcherOpen: false,
});

export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentService, setCurrentServiceState] =
    useState<ServiceKey>("facility_fmcg");
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("@fieldy_active_service");
        if (
          saved &&
          typeof saved === "string" &&
          Object.prototype.hasOwnProperty.call(SERVICES_CONFIG, saved)
        ) {
          setCurrentServiceState(saved as ServiceKey);
        }
      } catch (e) {
        console.log("Service load error:", e);
      }
    })();
  }, []);

  const setService = async (key: ServiceKey) => {
    if (Object.prototype.hasOwnProperty.call(SERVICES_CONFIG, key)) {
      setCurrentServiceState(key);
      try {
        await AsyncStorage.setItem("@fieldy_active_service", key);
      } catch (e) {
        console.log("Service save error:", e);
      }
    }
  };

  const openSwitcher = () => setIsSwitcherOpen(true);
  const closeSwitcher = () => setIsSwitcherOpen(false);

  const serviceConfig = useMemo(
    () => getSafeServiceConfig(currentService),
    [currentService]
  );

  return (
    <ServiceContext.Provider
      value={{
        currentService,
        serviceConfig,
        setService,
        services: ALL_SERVICE_KEYS,
        openSwitcher,
        closeSwitcher,
        isSwitcherOpen,
      }}
    >
      {children}
      <ServiceSwitcherModal
        visible={isSwitcherOpen}
        onClose={closeSwitcher}
        currentService={currentService}
        onSelect={async (key) => {
          await setService(key);
          closeSwitcher();
        }}
      />
    </ServiceContext.Provider>
  );
};

export const useService = () => useContext(ServiceContext);

/**
 * Sleek UI Pill button to switch services dynamically.
 */
export const ServiceSelectorPill: React.FC<{
  dark?: boolean;
  compact?: boolean;
}> = ({ dark = false, compact = false }) => {
  const { serviceConfig, openSwitcher } = useService();
  const safeConfig = serviceConfig || getSafeServiceConfig();
  const themeColor = safeConfig.themeColor || "#059669";
  const label = compact
    ? safeConfig.shortName || safeConfig.badge || safeConfig.name || "Vertical"
    : safeConfig.name || "Vertical";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={openSwitcher}
      style={{
        borderRadius: 999,
        overflow: "hidden",
        borderWidth: 1.4,
        borderColor: dark ? "rgba(255, 255, 255, 0.46)" : "rgba(255, 255, 255, 0.92)",
        shadowColor: "#1F1917",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: dark ? 0.3 : 0.15,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      <SafeBlurView
        intensity={64}
        tint={dark ? "dark" : "light"}
        style={{
          borderRadius: 999,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: dark
            ? "rgba(8, 22, 18, 0.74)"
            : "rgba(255, 255, 255, 0.92)",
          paddingHorizontal: compact ? 10 : 13,
          paddingVertical: compact ? 5 : 7,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 12,
            right: 12,
            height: 1.5,
            backgroundColor: dark
              ? "rgba(255, 255, 255, 0.65)"
              : "rgba(255, 255, 255, 0.96)",
          }}
        />
        <View
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: themeColor,
            marginRight: 5,
          }}
        />
        <Text
          numberOfLines={1}
          style={{
            color: dark ? "#ffffff" : "#1F1917",
            fontFamily: "Brandon-Bold",
            fontSize: compact ? 11 : 12,
            letterSpacing: 0.4,
            maxWidth: compact ? 96 : 150,
          }}
        >
          {label}
        </Text>
        <View style={{ marginLeft: 3 }}>
          <ChevronDown
            size={13}
            color={dark ? "rgba(255,255,255,0.8)" : "#574D48"}
          />
        </View>
      </SafeBlurView>
    </TouchableOpacity>
  );
};

/**
 * Modal to pick any of the 9 Services with full branding previews.
 */
export const ServiceSwitcherModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  currentService: ServiceKey;
  onSelect: (key: ServiceKey) => void;
}> = ({ visible, onClose, currentService, onSelect }) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(3, 12, 10, 0.55)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
            overflow: "hidden",
            maxHeight: "88%",
            borderWidth: 1.5,
            borderBottomWidth: 0,
            borderColor: "rgba(255,255,255,0.28)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -12 },
            shadowOpacity: 0.45,
            shadowRadius: 30,
            elevation: 24,
          }}
        >
          <SafeBlurView
            intensity={82}
            tint="dark"
            style={{
              borderTopLeftRadius: 36,
              borderTopRightRadius: 36,
              backgroundColor: "rgba(8, 20, 18, 0.86)",
              paddingTop: 24,
              paddingBottom: 40,
            }}
          >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.08)",
            }}
          >
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ marginRight: 6 }}>
                  <Sparkles size={16} color="#4ade80" />
                </View>
                <Text
                  style={{
                    color: "#ffffff",
                    fontFamily: "Brandon-Bold",
                    fontSize: 20,
                  }}
                >
                  Select Your Service
                </Text>
              </View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "Brandon-Medium",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Choose the industry for your field tasks
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* List of 9 Services */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              gap: 12,
            }}
          >
            {ALL_SERVICE_KEYS.map((key) => {
              const def = SERVICES_CONFIG[key];
              if (!def) return null;
              const isSelected = currentService === key;

              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={0.85}
                  onPress={() => onSelect(key)}
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(255, 255, 255, 0.12)"
                      : "rgba(255, 255, 255, 0.04)",
                    borderRadius: 22,
                    padding: 16,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected
                      ? def.themeColor
                      : "rgba(255, 255, 255, 0.08)",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      marginRight: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 14,
                        backgroundColor: `${def.themeColor}25`,
                        borderWidth: 1,
                        borderColor: def.themeColor,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 14,
                      }}
                    >
                      <Layers size={22} color={def.themeColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontFamily: "Brandon-Bold",
                            fontSize: 16,
                          }}
                        >
                          {def.name}
                        </Text>
                        <View
                          style={{
                            backgroundColor: `${def.themeColor}30`,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: def.accentColor,
                              fontFamily: "Brandon-Bold",
                              fontSize: 9,
                              letterSpacing: 0.5,
                            }}
                          >
                            {def.badge}
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "Brandon-Medium",
                          fontSize: 12,
                          marginTop: 4,
                          lineHeight: 16,
                        }}
                      >
                        {def.tagline}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: isSelected
                        ? def.themeColor
                        : "transparent",
                      borderWidth: 2,
                      borderColor: isSelected
                        ? def.themeColor
                        : "rgba(255,255,255,0.25)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <Check size={14} color="#ffffff" strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          </SafeBlurView>
        </View>
      </View>
    </Modal>
  );
};
