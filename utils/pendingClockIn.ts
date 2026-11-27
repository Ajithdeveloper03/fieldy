import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

const PENDING_CLOCK_IN_KEY = "@fieldy_pending_clock_in";
const RECOVERED_CLOCK_IN_KEY = "@fieldy_recovered_clock_in";
const MAX_PENDING_AGE_MS = 5 * 60 * 1000; // 5 minutes

export interface PendingClockInMeta {
  startedAt: number;
  latitude: number;
  longitude: number;
  locationLabel: string;
}

export interface RecoveredClockInPayload {
  selfieUri: string | null;
  latitude: number;
  longitude: number;
  locationLabel: string;
  recoveredAt: number;
  autoSubmit: boolean;
  canceled?: boolean;
}

export async function markPendingClockInCamera(
  coords: { latitude: number; longitude: number },
  locationLabel: string
): Promise<void> {
  const payload: PendingClockInMeta = {
    startedAt: Date.now(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    locationLabel,
  };
  await AsyncStorage.setItem(PENDING_CLOCK_IN_KEY, JSON.stringify(payload));
  await AsyncStorage.removeItem(RECOVERED_CLOCK_IN_KEY);
}

export async function clearPendingClockInCamera(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_CLOCK_IN_KEY);
}

export async function consumeRecoveredClockIn(): Promise<RecoveredClockInPayload | null> {
  const raw = await AsyncStorage.getItem(RECOVERED_CLOCK_IN_KEY);
  if (!raw) return null;
  await AsyncStorage.removeItem(RECOVERED_CLOCK_IN_KEY);
  try {
    const parsed = JSON.parse(raw) as RecoveredClockInPayload;
    if (Date.now() - (parsed.recoveredAt || 0) > MAX_PENDING_AGE_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function extractUriFromPendingResult(result: any): { uri: string | null; canceled: boolean } {
  if (!result) return { uri: null, canceled: false };
  const item = Array.isArray(result) ? result[0] : result;
  if (!item || typeof item !== "object") return { uri: null, canceled: false };
  if (item.canceled === true) return { uri: null, canceled: true };
  if (Array.isArray(item.assets) && item.assets[0]?.uri) {
    return { uri: String(item.assets[0].uri), canceled: false };
  }
  return { uri: null, canceled: false };
}

/**
 * Android (especially Xiaomi/MIUI/HyperOS and low-RAM devices) frequently kills MainActivity
 * while the external Camera app captures a selfie. On restart, this recovers the captured
 * selfie via ImagePicker.getPendingResultAsync() and signals the router to return directly
 * to the Clock-In screen instead of restarting at /intro.
 */
export async function checkAndRecoverPendingClockIn(): Promise<{
  shouldRedirectToClockIn: boolean;
  payload: RecoveredClockInPayload | null;
}> {
  const rawPending = await AsyncStorage.getItem(PENDING_CLOCK_IN_KEY);
  if (!rawPending) {
    return { shouldRedirectToClockIn: false, payload: null };
  }

  let pending: PendingClockInMeta | null = null;
  try {
    pending = JSON.parse(rawPending) as PendingClockInMeta;
  } catch {
    await AsyncStorage.removeItem(PENDING_CLOCK_IN_KEY);
    return { shouldRedirectToClockIn: false, payload: null };
  }

  if (!pending || Date.now() - (pending.startedAt || 0) > MAX_PENDING_AGE_MS) {
    await AsyncStorage.removeItem(PENDING_CLOCK_IN_KEY);
    return { shouldRedirectToClockIn: false, payload: null };
  }

  // Clear pending immediately so a second launch cannot loop
  await AsyncStorage.removeItem(PENDING_CLOCK_IN_KEY);

  let recoveredUri: string | null = null;
  let wasCanceled = false;

  if (Platform.OS === "android") {
    try {
      const pendingResult = await ImagePicker.getPendingResultAsync();
      const extracted = extractUriFromPendingResult(pendingResult);
      recoveredUri = extracted.uri;
      wasCanceled = extracted.canceled;
    } catch {
      // Fall through cleanly if OEM dropped the pending activity result
    }
  }

  const recovered: RecoveredClockInPayload = {
    selfieUri: recoveredUri,
    latitude: Number.isFinite(pending.latitude) ? pending.latitude : 13.0827,
    longitude: Number.isFinite(pending.longitude) ? pending.longitude : 80.2707,
    locationLabel: pending.locationLabel || "GPS Verified",
    recoveredAt: Date.now(),
    // Auto-mark attendance when Android returns the captured selfie URI after process death
    autoSubmit: Boolean(recoveredUri) && !wasCanceled,
    canceled: wasCanceled,
  };

  await AsyncStorage.setItem(RECOVERED_CLOCK_IN_KEY, JSON.stringify(recovered));
  return { shouldRedirectToClockIn: true, payload: recovered };
}
