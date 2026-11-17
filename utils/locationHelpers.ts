import { api } from '../services/api';

export interface LatLngPoint {
  latitude: number;
  longitude: number;
}

export const LIGHT_MAP_TILE_URL =
  'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';

export function haversineDistanceKm(a: LatLngPoint, b: LatLngPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

let lastPingSentAt = 0;

export async function sendLiveLocationPing(coords: {
  latitude: number;
  longitude: number;
  speed?: number | null;
  heading?: number | null;
}) {
  const now = Date.now();
  if (now - lastPingSentAt < 2500) {
    return;
  }
  lastPingSentAt = now;

  try {
    await api.post('/employee/location-ping', {
      latitude: coords.latitude,
      longitude: coords.longitude,
      is_gps_enabled: true,
      battery_level: 92,
      speed: coords.speed && coords.speed > 0 ? Number((coords.speed * 3.6).toFixed(1)) : 0,
      heading: coords.heading && coords.heading >= 0 ? Math.round(coords.heading) : 0,
    });
  } catch {
    // Offline queue handles delayed telemetry sync
  }
}
